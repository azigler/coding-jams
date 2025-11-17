"""Multi-step SQL planning module using DSPy."""

from __future__ import annotations

from typing import List, Dict, Any, Optional
import dspy
import json
import logging

from .config import get_default_lm

logger = logging.getLogger(__name__)


class MultiStepPlanSignature(dspy.Signature):
    """Signature for breaking questions into multiple SQL steps."""

    schema_summary = dspy.InputField(
        desc="Database schema with CRITICAL SCHEMA RULES. Read the rules first! "
        "Key points: date_sk columns are INTEGER (use date_dim JOIN), items link to warehouses via inventory table, "
        "all columns have prefixes (ss_, i_, d_, w_, inv_)."
    )
    question = dspy.InputField(desc="Natural language analytics question.")
    plan = dspy.OutputField(
            desc="High-level plan breaking the question into 3-5 simple steps. "
            "Each step should be a simple SQL query that can be executed independently. "
            "CRITICAL LOGIC RULES: "
            "1. For 'returns' questions mentioning 'state': "
            "   ALWAYS use CUSTOMER STATE (customer_address.ca_state), NOT store state (store.s_state)! "
            "   Many states (like CA) exist as customer states but not store states. "
            "   Join: store_returns sr JOIN customer_address ca ON sr.sr_addr_sk = ca.ca_address_sk "
            "   Then group by ca.ca_state, NOT s.s_state! "
            "2. For 'inventory shortage' questions asking for 'most impacted category': "
        "   a) Step 1: START WITH inventory table, NOT store table! "
        "      FROM inventory inv_oct JOIN warehouse w ON inv_oct.inv_warehouse_sk = w.w_warehouse_sk "
        "      Compare inventory levels by warehouse and category between months (Oct vs Nov) using CTEs and FULL OUTER JOIN "
        "      NEVER join store.s_store_sk to inventory.inv_warehouse_sk - they are different entities! "
        "   b) Step 2: Identify ALL warehouses/categories with shortages (inventory decreased: nov_qty < oct_qty) "
        "      Return ALL combinations, not just the largest shortage! "
        "   c) Step 3: For EACH warehouse-category combination with shortage, find items that had shortages "
        "      (items where inventory decreased Oct→Nov at that warehouse in that category) "
        "   d) Step 4: For EACH warehouse-category combination, calculate revenue impact at the affected store "
        "      Join shortage items to store_sales: FROM store_sales ss JOIN item i ON ss.ss_item_sk = i.i_item_sk "
        "      Calculate (Oct revenue - Nov revenue) for items that had shortages in that warehouse-category "
        "      This gives revenue impact PER warehouse-category combination "
        "   e) Step 5: Select the warehouse-category with the MOST NEGATIVE revenue impact (largest absolute loss) "
        "      NOT the one with largest inventory shortage - the one with worst revenue impact! "
        "2. For 'revenue impact' questions: Calculate the difference between periods FOR AFFECTED ITEMS ONLY, "
        "   not total revenue change. Link items to root cause (warehouse shortage) first. "
        "3. KEY INSIGHT: 'Most impacted' means WORST REVENUE IMPACT, not largest inventory shortage! "
        "   You must calculate revenue impact for ALL categories with shortages, then pick the worst one. "
        "4. If question involves warehouse + item, use inventory table as bridge (not warehouse→item directly). "
        "5. If question involves dates, each step that needs date filtering must JOIN date_dim. "
        "6. Think about CAUSALITY: If revenue dropped, what caused it? Trace: warehouse shortage → items affected → store sales → revenue impact. "
        "7. ALWAYS compare inventory between months using: WITH oct_inv AS (...), nov_inv AS (...), then FULL OUTER JOIN to find shortages. "
        "Format as JSON array: [{\"step\": 1, \"description\": \"...\", \"goal\": \"...\"}, ...]"
    )


class StepSQLSignature(dspy.Signature):
    """Signature for generating SQL for a single step."""

    schema_summary = dspy.InputField(desc="Database schema.")
    question = dspy.InputField(desc="Original question.")
    step_description = dspy.InputField(desc="Description of this step's goal.")
    previous_results = dspy.InputField(
        default="",
        desc="JSON summary of previous step results with actual values in 'values' and 'all_rows' fields. "
        "CRITICAL: Extract the ACTUAL VALUES from previous steps and use them directly in SQL. "
        "Example: If step_1 returned {'category': 'Electronics'} in values, use: WHERE i.i_category = 'Electronics' "
        "NOT WHERE i.i_category = [category] or WHERE i.i_category = category. "
        "Look at the 'values' field for single values, 'all_rows' for multiple rows. "
        "Use the exact values found, not variable names."
    )
    sql = dspy.OutputField(
        desc="Simple, focused SQL query for this step only. "
        "CRITICAL SQL SYNTAX RULES: "
        "1. ALWAYS start with SELECT, then FROM, then JOINs, then WHERE. "
        "2. SELECT clause: List columns with table aliases (SELECT ss.ss_store_sk, i.i_category). "
        "3. FROM clause: Start with one table and alias (FROM store_sales ss). "
        "4. JOIN clause: Each JOIN on separate line, format: JOIN table_name alias ON alias1.column1 = alias2.column2. "
        "5. NEVER put JOIN in SELECT clause! JOINs go AFTER FROM, not in SELECT. "
        "6. WHERE clause: Filter conditions after all JOINs. "
            "CRITICAL LOGIC RULES: "
            "7. Check CRITICAL SCHEMA RULES in schema_summary for mandatory JOINs and table relationships. "
            "8. If step involves dates: JOIN date_dim d ON [table].[date_sk] = d.d_date_sk WHERE d.d_year = YYYY AND d.d_moy IN (MM, MM). "
            "9. If step involves warehouse + item: Use inventory table! FROM inventory inv JOIN item i ON inv.inv_item_sk = i.i_item_sk JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk. "
            "10. NEVER join store_sales.store_sk to warehouse.warehouse_sk - they are different entities! "
            "11. NEVER join store.s_store_sk to inventory.inv_warehouse_sk - store_sk and warehouse_sk are DIFFERENT! "
            "12. If you reference warehouse.w_warehouse_sk in SELECT, you MUST have 'FROM warehouse w' or 'JOIN warehouse w' in the query! "
            "13. **CRITICAL FOR RETURNS**: If question mentions 'state' for returns, use CUSTOMER STATE (ca.ca_state), NOT store state! "
            "    Join: FROM store_returns sr JOIN customer_address ca ON sr.sr_addr_sk = ca.ca_address_sk "
            "    Then: GROUP BY ca.ca_state (NOT s.s_state) "
            "    Many states like CA exist as customer states but not store states! "
            "14. **CRITICAL FOR PRODUCTS**: If question asks about a 'product' or 'item', ALWAYS include i.i_item_sk in SELECT! "
            "    Even if question asks for 'name', include item_sk: SELECT i.i_item_sk, i.i_product_name, ... "
            "    This is needed for answer formatting and validation. "
            "15. **CRITICAL FOR PROFIT**: If question asks about 'net profit' or 'profit', use ss.ss_net_profit column directly! "
            "    DO NOT calculate profit as revenue - returns! The ss_net_profit column already accounts for all costs. "
            "    Example: SELECT SUM(ss.ss_net_profit) FROM store_sales ss JOIN date_dim d ON ... WHERE d.d_year = YYYY "
            "16. Use EXACT column names with full prefixes: ss.ss_store_sk, ss.ss_net_profit, i.i_item_sk, i.i_category, w.w_warehouse_sk, inv.inv_quantity_on_hand, ca.ca_state. "
            "15. If using values from previous_results, extract ACTUAL VALUES and embed directly (WHERE i.i_category = 'Electronics', NOT [category]). "
            "16. Use single quotes for strings, d_moy for month (NOT d_month), table aliases (ss, i, d, w, inv, s, ca). "
            "17. Never aggregate VARCHAR columns (w_city, i_category) - use in SELECT/GROUP BY only. "
        "17. For revenue impact calculation: Calculate (Oct revenue - Nov revenue) for items that had shortages. "
        "    Revenue impact = money lost, so negative values mean revenue dropped. "
        "    Most impacted = most negative (worst) revenue impact, NOT largest inventory shortage! "
        "18. If step asks to 'calculate revenue impact for each warehouse-category', you must: "
        "    a) Find items with shortages at that warehouse-category (from inventory comparison) "
        "    b) Join those items to store_sales to get sales at the affected store "
        "    c) Calculate revenue difference (Oct - Nov) for those specific items "
        "    d) Group by warehouse_sk and category to get impact per combination "
        "19. CRITICAL: Each SQL query must be COMPLETE and STANDALONE. "
        "    You CANNOT reference previous step results as tables (e.g., 'FROM step_3_results' is WRONG!). "
        "    Instead, use CTEs (WITH ... AS) to recalculate the data you need, or embed the logic directly. "
        "    Example: If step 3 calculated oct_revenue, step 5 should recalculate it using CTEs, not reference 'step_3_results'. "
        "20. Keep it simple - one query, one goal, verify all JOINs match schema rules."
    )


class StepPlannerModule(dspy.Module):
    """Module for multi-step SQL planning."""

    def __init__(self, lm: Optional[dspy.LM] = None, use_examples: bool = True) -> None:
        super().__init__()
        self.lm = lm or get_default_lm()
        
        # Plan program - still use ChainOfThought for high-level planning
        self.plan_program = dspy.ChainOfThought(signature=MultiStepPlanSignature)
        self.plan_program.predict.lm = self.lm
        
        # SQL generation program - use BootstrapFewShot with examples
        if use_examples:
            try:
                # Create examples showing correct patterns
                examples = []
                
                # Example 1: Inventory comparison with CTEs and FULL OUTER JOIN
                example1 = dspy.Example(
                    schema_summary="Database with inventory, warehouse, item, date_dim tables. CRITICAL: items link to warehouses via inventory table.",
                    question="Find inventory shortages by comparing October vs November inventory levels",
                    step_description="Compare inventory levels by warehouse and category between months (Oct vs Nov) using CTEs and FULL OUTER JOIN",
                    previous_results="",
                    sql="""WITH oct_inv AS (
    SELECT 
        w.w_warehouse_sk,
        i.i_category,
        SUM(inv.inv_quantity_on_hand) as oct_qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    JOIN item i ON inv.inv_item_sk = i.i_item_sk
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE d.d_year = 2022 AND d.d_moy = 10
    GROUP BY w.w_warehouse_sk, i.i_category
),
nov_inv AS (
    SELECT 
        w.w_warehouse_sk,
        i.i_category,
        SUM(inv.inv_quantity_on_hand) as nov_qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    JOIN item i ON inv.inv_item_sk = i.i_item_sk
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE d.d_year = 2022 AND d.d_moy = 11
    GROUP BY w.w_warehouse_sk, i.i_category
)
SELECT 
    COALESCE(o.w_warehouse_sk, n.w_warehouse_sk) as warehouse_sk,
    COALESCE(o.i_category, n.i_category) as category,
    COALESCE(o.oct_qty, 0) as oct_inventory,
    COALESCE(n.nov_qty, 0) as nov_inventory,
    (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) as shortage
FROM oct_inv o
FULL OUTER JOIN nov_inv n ON o.w_warehouse_sk = n.w_warehouse_sk 
                           AND o.i_category = n.i_category
WHERE (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) < 0
ORDER BY shortage ASC"""
                ).with_inputs("schema_summary", "question", "step_description", "previous_results")
                
                # Example 2: Calculate revenue impact for ALL warehouse-category combinations with shortages
                example2 = dspy.Example(
                    schema_summary="Database with inventory, warehouse, item, store_sales, date_dim tables. CRITICAL: items link to warehouses via inventory table.",
                    question="Calculate revenue impact for Store #5 for ALL warehouse-category combinations with inventory shortages, then find the most impacted",
                    step_description="Calculate revenue impact as (Oct revenue - Nov revenue) for ALL warehouse-category combinations with shortages, grouped by warehouse_sk and category, then select the one with worst impact",
                    previous_results='{"step_1": {"all_rows": [{"warehouse_sk": 3, "category": "Electronics"}, {"warehouse_sk": 3, "category": "Music"}]}}',
                    sql="""WITH oct_inv AS (
    SELECT 
        w.w_warehouse_sk,
        i.i_category,
        inv.inv_item_sk,
        SUM(inv.inv_quantity_on_hand) as qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    JOIN item i ON inv.inv_item_sk = i.i_item_sk
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE d.d_year = 2022 AND d.d_moy = 10
    GROUP BY w.w_warehouse_sk, i.i_category, inv.inv_item_sk
),
nov_inv AS (
    SELECT 
        w.w_warehouse_sk,
        i.i_category,
        inv.inv_item_sk,
        SUM(inv.inv_quantity_on_hand) as qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    JOIN item i ON inv.inv_item_sk = i.i_item_sk
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE d.d_year = 2022 AND d.d_moy = 11
    GROUP BY w.w_warehouse_sk, i.i_category, inv.inv_item_sk
),
shortages AS (
    SELECT 
        COALESCE(o.w_warehouse_sk, n.w_warehouse_sk) as warehouse_sk,
        COALESCE(o.i_category, n.i_category) as category,
        COALESCE(o.inv_item_sk, n.inv_item_sk) as item_sk
    FROM oct_inv o
    FULL OUTER JOIN nov_inv n ON o.w_warehouse_sk = n.w_warehouse_sk 
                               AND o.i_category = n.i_category 
                               AND o.inv_item_sk = n.inv_item_sk
    WHERE (COALESCE(n.qty, 0) - COALESCE(o.qty, 0)) < 0
),
oct_revenue AS (
    SELECT 
        s.warehouse_sk,
        s.category,
        SUM(ss.ss_sales_price) as revenue
    FROM store_sales ss
    JOIN item i ON ss.ss_item_sk = i.i_item_sk
    JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
    JOIN shortages s ON ss.ss_item_sk = s.item_sk AND i.i_category = s.category
    WHERE ss.ss_store_sk = 5 
      AND d.d_year = 2022 
      AND d.d_moy = 10
    GROUP BY s.warehouse_sk, s.category
),
nov_revenue AS (
    SELECT 
        s.warehouse_sk,
        s.category,
        SUM(ss.ss_sales_price) as revenue
    FROM store_sales ss
    JOIN item i ON ss.ss_item_sk = i.i_item_sk
    JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
    JOIN shortages s ON ss.ss_item_sk = s.item_sk AND i.i_category = s.category
    WHERE ss.ss_store_sk = 5 
      AND d.d_year = 2022 
      AND d.d_moy = 11
    GROUP BY s.warehouse_sk, s.category
)
SELECT 
    COALESCE(o.warehouse_sk, n.warehouse_sk) as warehouse_sk,
    COALESCE(o.category, n.category) as category,
    COALESCE(o.revenue, 0) as oct_revenue,
    COALESCE(n.revenue, 0) as nov_revenue,
    (COALESCE(o.revenue, 0) - COALESCE(n.revenue, 0)) as revenue_impact
FROM oct_revenue o
FULL OUTER JOIN nov_revenue n ON o.warehouse_sk = n.warehouse_sk 
                               AND o.category = n.category
ORDER BY revenue_impact ASC
LIMIT 1"""
                ).with_inputs("schema_summary", "question", "step_description", "previous_results")
                
                examples = [example1, example2]
                
                # Use ChainOfThought with examples directly
                self.sql_program = dspy.ChainOfThought(signature=StepSQLSignature)
                self.sql_program.predict.lm = self.lm
                # Add the examples to the predictor's demos
                if hasattr(self.sql_program.predict, 'demos'):
                    self.sql_program.predict.demos = examples
                else:
                    # Try setting it on the predictor directly
                    self.sql_program.predict = self.sql_program.predict.copy(demos=examples)
                logger.info(f"✓ Using ChainOfThought with {len(examples)} examples for step SQL generation")
            except Exception as e:
                logger.warning(f"Could not use examples, falling back to ChainOfThought: {e}")
                self.sql_program = dspy.ChainOfThought(signature=StepSQLSignature)
                self.sql_program.predict.lm = self.lm
        else:
            self.sql_program = dspy.ChainOfThought(signature=StepSQLSignature)
            self.sql_program.predict.lm = self.lm

    def plan_steps(self, schema_summary: str, question: str) -> List[Dict[str, Any]]:
        """
        Break question into multiple SQL steps.

        Args:
            schema_summary: Database schema
            question: Natural language question

        Returns:
            List of step dictionaries with step number, description, and goal
        """
        result = self.plan_program(schema_summary=schema_summary, question=question)
        
        # Parse JSON plan
        try:
            # Extract JSON from markdown code blocks if present
            plan_text = result.plan.strip()
            if plan_text.startswith("```"):
                lines = plan_text.split("\n")
                plan_text = "\n".join(lines[1:-1]) if len(lines) > 2 else plan_text
            
            steps = json.loads(plan_text)
            if not isinstance(steps, list):
                steps = [steps]
            return steps
        except json.JSONDecodeError:
            # Fallback: create a single step
            return [{
                "step": 1,
                "description": question,
                "goal": "Answer the question"
            }]

    def generate_step_sql(
        self,
        schema_summary: str,
        question: str,
        step_description: str,
        previous_results: str = "",
    ) -> str:
        """
        Generate SQL for a single step.

        Args:
            schema_summary: Database schema
            question: Original question
            step_description: Description of this step
            previous_results: JSON summary of previous step results with actual values

        Returns:
            SQL query string
        """
        result = self.sql_program(
            schema_summary=schema_summary,
            question=question,
            step_description=step_description,
            previous_results=previous_results,
        )
        
        sql = result.sql.strip()
        
        # Remove markdown code blocks
        if sql.startswith("```"):
            lines = sql.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            sql = "\n".join(lines).strip()
        
        # Fix string literals: double quotes to single quotes
        import re
        sql = re.sub(r'"([^"]+)"', r"'\1'", sql)
        
        # Fix reserved keyword aliases
        sql = sql.replace(" AS is ", " AS inv ")
        sql = sql.replace(" is ON ", " inv ON ").replace(" is.", " inv.")
        
        # Fix placeholder syntax - replace [variable] or {variable} with actual values from previous_results
        if previous_results:
            try:
                prev_data = json.loads(previous_results)
                # Extract values from previous steps - collect all values from all steps
                all_values = {}
                for step_key, step_data in prev_data.items():
                    if "values" in step_data:
                        all_values.update(step_data["values"])
                    # Also check all_rows for additional values
                    if "all_rows" in step_data:
                        for row in step_data["all_rows"]:
                            all_values.update({k: v for k, v in row.items() if v is not None})
                
                # Replace placeholders with actual values
                for col, val in all_values.items():
                    # Replace [column] or {column} or [column_name] patterns
                    if isinstance(val, str):
                        # Escape single quotes in string values
                        val_escaped = val.replace("'", "''")
                        sql = re.sub(rf'\[{re.escape(col)}\]', f"'{val_escaped}'", sql, flags=re.IGNORECASE)
                        sql = re.sub(rf'\{{{re.escape(col)}\}}', f"'{val_escaped}'", sql, flags=re.IGNORECASE)
                    else:
                        sql = re.sub(rf'\[{re.escape(col)}\]', str(val), sql, flags=re.IGNORECASE)
                        sql = re.sub(rf'\{{{re.escape(col)}\}}', str(val), sql, flags=re.IGNORECASE)
            except (json.JSONDecodeError, KeyError, Exception) as e:
                logger.warning(f"Could not parse previous_results for placeholder replacement: {e}")
        
        # Fix common SQL issues
        # Fix d_month → d_moy
        sql = re.sub(r'\bd_month\b', 'd_moy', sql, flags=re.IGNORECASE)
        
        # Ensure semicolon
        if not sql.endswith(";"):
            sql = f"{sql};"
        
        return sql

