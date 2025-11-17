"""Natural language to SQL planner module using DSPy."""

from __future__ import annotations

from typing import Optional

import dspy

from .config import get_default_lm


class NLToSQLSignature(dspy.Signature):
    """Signature for natural language to SQL conversion."""

    schema_summary = dspy.InputField(
        desc="Database schema with CRITICAL RULES section at the top. Read the CRITICAL SCHEMA RULES first! "
        "The schema includes table relationships, mandatory JOINs, date handling rules, and common mistakes to avoid. "
        "Pay special attention to: date_sk columns are INTEGER (not DATE), items link to warehouses via inventory table, "
        "and all columns have table prefixes (ss_, i_, d_, w_, inv_, s_)."
    )
    question = dspy.InputField(desc="Natural language analytics question.")
    sql = dspy.OutputField(
        desc="Valid DuckDB SQL query. FOLLOW THESE RULES IN ORDER: "
        "STEP 1: Identify which tables you need based on the question. "
        "STEP 2: Check the CRITICAL SCHEMA RULES for mandatory JOINs (e.g., store_sales ALWAYS needs date_dim JOIN for dates). "
        "STEP 3: Use EXACT column names from schema with full prefixes (ss_store_sk, NOT store_sk). "
        "STEP 4: For date filtering: JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk WHERE d.d_year = YYYY AND d.d_moy IN (MM, MM). "
        "STEP 5: For linking items to warehouses: Use inventory table! FROM inventory inv JOIN item i ON inv.inv_item_sk = i.i_item_sk JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk. "
        "STEP 6: Prefix ALL column references with table alias (ss.ss_sold_date_sk, i.i_category, w.w_warehouse_sk). "
        "STEP 7: Use single quotes for strings ('Electronics', '5'), d_moy for month (NOT d_month), ss_sales_price for revenue. "
        "STEP 8: Never aggregate VARCHAR columns (w_city, i_category) - use them in SELECT or GROUP BY only. "
        "STEP 9: Verify all JOINs match the relationship patterns in CRITICAL SCHEMA RULES. "
        "STEP 10: Test your logic: If question asks about 'warehouse inventory', you MUST use inventory table, not try to JOIN warehouse→item directly."
    )


class PlannerModule(dspy.Module):
    """Baseline NL→SQL module leveraging DSPy's BootstrapFewShot with examples."""

    def __init__(
        self,
        lm: Optional[dspy.LM] = None,
        enforce_limit: bool = True,
        default_limit: int = 200,
        use_examples: bool = True,
    ) -> None:
        """
        Initialize the planner module.

        Args:
            lm: Language model to use. If None, uses default from config.
            enforce_limit: Whether to automatically add LIMIT clause
            default_limit: Default limit value if enforce_limit is True
            use_examples: Whether to use BootstrapFewShot with examples
        """
        super().__init__()
        self.lm = lm or get_default_lm()
        self.enforce_limit = enforce_limit
        self.default_limit = default_limit

        if use_examples:
            try:
                # Create example showing correct SQL pattern
                example = dspy.Example(
                    schema_summary="Database with store_sales, item, date_dim tables. CRITICAL: store_sales needs date_dim JOIN for dates.",
                    question="What was the total revenue for Store #5 in October 2022?",
                    sql="""SELECT SUM(ss.ss_sales_price) as total_revenue
FROM store_sales ss
JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
WHERE ss.ss_store_sk = 5 
  AND d.d_year = 2022 
  AND d.d_moy = 10"""
                ).with_inputs("schema_summary", "question")

                # Use ChainOfThought with example directly
                self.program = dspy.ChainOfThought(signature=NLToSQLSignature)
                self.program.predict.lm = self.lm
                # Add the example to the predictor's demos
                if hasattr(self.program.predict, 'demos'):
                    self.program.predict.demos = [example]
                else:
                    # Try setting it on the predictor directly
                    self.program.predict = self.program.predict.copy(demos=[
                                                                     example])
                import logging
                logging.getLogger(__name__).info(
                    "✓ Using ChainOfThought with example for SQL generation")
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    f"Could not use examples, falling back to ChainOfThought: {e}")
                self.program = dspy.ChainOfThought(signature=NLToSQLSignature)
                self.program.predict.lm = self.lm
        else:
            self.program = dspy.ChainOfThought(signature=NLToSQLSignature)
            self.program.predict.lm = self.lm

    def forward(self, schema_summary: str, question: str) -> str:
        """
        Generate SQL query from natural language question.

        Args:
            schema_summary: Summary of database schema
            question: Natural language question

        Returns:
            SQL query string
        """
        result = self.program(schema_summary=schema_summary, question=question)
        sql = result.sql.strip() if hasattr(result, 'sql') else str(result).strip()

        # Remove markdown code blocks if present
        if sql.startswith("```"):
            # Remove ```sql or ``` at start
            lines = sql.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            # Remove ``` at end
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            sql = "\n".join(lines).strip()

        # Fix common reserved keyword issues in aliases
        # Replace "is" alias with "inv" for inventory
        sql = sql.replace(" AS is ", " AS inv ").replace(
            " AS is\n", " AS inv\n").replace(" AS is,", " AS inv,")
        sql = sql.replace(" is ON ", " inv ON ").replace(
            " is.", " inv.").replace(" is,", " inv,")

        # Fix string literals: DuckDB uses single quotes, not double quotes
        import re
        # Replace double-quoted strings with single quotes (but preserve comments)
        # Match: "text" but not in comments (-- or /* */)
        # Simple approach: replace all "text" patterns

        def replace_quotes(match):
            content = match.group(1)
            # Don't replace if it's a comment
            if '--' in content or '/*' in content:
                return match.group(0)
            return f"'{content}'"

        # Replace double quotes with single quotes for string literals
        # Pattern: "..." that's not in a comment
        sql = re.sub(r'"([^"]+)"', r"'\1'", sql)

        # Remove trailing semicolon if present (we'll add it back)
        sql = sql.rstrip(";").strip()

        # Enforce LIMIT clause for safety
        if self.enforce_limit and "limit" not in sql.lower():
            sql = f"{sql} LIMIT {self.default_limit}"

        # Ensure semicolon at end
        if not sql.endswith(";"):
            sql = f"{sql};"

        return sql
