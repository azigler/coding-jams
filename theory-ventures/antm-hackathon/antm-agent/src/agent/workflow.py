"""LangGraph workflow for the ANTM hackathon agent."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Literal

from langgraph.graph import END, START, StateGraph

from src.agent.state import AgentState
from src.data.duckdb_client import DuckDBClient
from src.data.mcp_client import get_mcp_client, MCPClient
from src.data.lancedb_client import LanceDBClient
from src.modules.critic import CriticModule
from src.modules.planner import PlannerModule
from src.modules.step_planner import StepPlannerModule
from src.modules.schema_matcher import SchemaMatcherModule
from src.data.duckdb_client import DuckDBClient
from src.utils.config import Config
import json

logger = logging.getLogger(__name__)


def route_question(state: AgentState) -> AgentState:
    """
    Route question to determine if it needs SQL, PDF search, or both.

    Args:
        state: Current agent state

    Returns:
        Updated state with routing decisions
    """
    question = state["question"].lower()

    # Simple heuristics for routing
    # Keywords that suggest SQL queries
    sql_keywords = [
        "revenue",
        "profit",
        "sales",
        "quantity",
        "count",
        "sum",
        "total",
        "average",
        "store",
        "warehouse",
        "item",
        "customer",
        "inventory",
        "return",
    ]

    # Keywords that suggest PDF content
    pdf_keywords = [
        "report",
        "catalog",
        "policy",
        "contract",
        "invoice",
        "receipt",
        "manifest",
        "order",
        "flyer",
        "annual",
        "quarterly",
    ]

    needs_sql = any(keyword in question for keyword in sql_keywords)
    needs_pdfs = any(keyword in question for keyword in pdf_keywords)

    # If no clear signal, default to SQL (most questions are SQL-based)
    if not needs_sql and not needs_pdfs:
        needs_sql = True

    state["needs_sql"] = needs_sql
    state["needs_pdfs"] = needs_pdfs
    state["step"] = "route"

    return state


def plan_steps(state: AgentState) -> AgentState:
    """
    Break question into multiple SQL steps.

    Args:
        state: Current agent state

    Returns:
        Updated state with planned steps
    """
    try:
        # Try MCP server first for schema, fallback to DuckDB
        mcp_client = get_mcp_client()
        if mcp_client and mcp_client.is_available():
            try:
                schema_summary = mcp_client.get_schema_summary()
                logger.info("Using schema from MCP server")
            except Exception:
                logger.warning("MCP schema failed, using DuckDB")
                with DuckDBClient() as client:
                    schema_summary = client.get_schema_summary()
        else:
            with DuckDBClient() as client:
                schema_summary = client.get_schema_summary()

        step_planner = StepPlannerModule()
        steps = step_planner.plan_steps(
            schema_summary=schema_summary,
            question=state["question"]
        )

        state["sql_steps"] = steps
        state["current_step_index"] = 0
        state["step_results"] = []
        state["step"] = "plan_steps"
        logger.info(f"Planned {len(steps)} SQL steps")
    except Exception as e:
        logger.error(f"Error planning steps: {e}")
        state["errors"].append(f"Step planning failed: {str(e)}")
        # Fallback to single-step
        state["sql_steps"] = [{"step": 1, "description": state["question"], "goal": "Answer question"}]
        state["current_step_index"] = 0
        state["step_results"] = []

    return state


def plan_sql(state: AgentState) -> AgentState:
    """
    Plan SQL query from natural language question (legacy single-step).

    Args:
        state: Current agent state

    Returns:
        Updated state with SQL query
    """
    try:
        with DuckDBClient() as client:
            schema_summary = client.get_schema_summary()

        planner = PlannerModule()
        sql = planner(schema_summary=schema_summary, question=state["question"])

        state["sql_query"] = sql
        state["step"] = "plan"
    except Exception as e:
        logger.error(f"Error planning SQL: {e}")
        state["errors"].append(f"SQL planning failed: {str(e)}")
        state["sql_query"] = None

    return state


def generate_step_sql(state: AgentState) -> AgentState:
    """
    Generate SQL for the current step.

    Args:
        state: Current agent state

    Returns:
        Updated state with SQL for current step
    """
    if not state.get("sql_steps") or state["current_step_index"] >= len(state["sql_steps"]):
        state["errors"].append("No more steps to execute")
        return state

    try:
        # Try MCP server first for schema, fallback to DuckDB
        mcp_client = get_mcp_client()
        if mcp_client and mcp_client.is_available():
            try:
                schema_summary = mcp_client.get_schema_summary()
                logger.info("Using schema from MCP server for step SQL generation")
            except Exception:
                logger.warning("MCP schema failed, using DuckDB")
                with DuckDBClient() as client:
                    schema_summary = client.get_schema_summary()
        else:
            with DuckDBClient() as client:
                schema_summary = client.get_schema_summary()

        step_planner = StepPlannerModule()
        current_step = state["sql_steps"][state["current_step_index"]]
        
        # Summarize previous results with actual values
        previous_results = ""
        if state.get("step_results"):
            results_summary = {}
            for i, r in enumerate(state["step_results"]):
                step_data = {
                    "description": r.get("step_description", ""),
                    "rows": len(r.get("result", [])),
                    "columns": r.get("columns", []),
                }
                
                # Include actual data values, not just structure
                if r.get("result") and len(r.get("result", [])) > 0:
                    # Get first row as example values
                    first_row = r.get("result", [])[0]
                    columns = r.get("columns", [])
                    step_data["values"] = {
                        col: val for col, val in zip(columns, first_row) if val is not None
                    }
                    # Include all rows if small enough
                    if len(r.get("result", [])) <= 10:
                        step_data["all_rows"] = [
                            {col: val for col, val in zip(columns, row)}
                            for row in r.get("result", [])
                        ]
                
                results_summary[f"step_{i+1}"] = step_data
            
            previous_results = json.dumps(results_summary, indent=2, default=str)

        sql = step_planner.generate_step_sql(
            schema_summary=schema_summary,
            question=state["question"],
            step_description=current_step.get("description", current_step.get("goal", "")),
            previous_results=previous_results,
        )

        # Basic SQL syntax validation
        sql_upper = sql.upper()
        if "SELECT" not in sql_upper:
            raise ValueError("SQL must start with SELECT")
        if "FROM" not in sql_upper:
            raise ValueError("SQL must have FROM clause")
        # Check for common syntax errors
        if "SELECT" in sql_upper and "FROM" in sql_upper:
            select_pos = sql_upper.find("SELECT")
            from_pos = sql_upper.find("FROM")
            if from_pos < select_pos:
                raise ValueError("FROM cannot come before SELECT")
            # Check for JOIN in SELECT clause (common error)
            select_clause = sql[select_pos:from_pos].upper()
            if "JOIN" in select_clause:
                logger.warning("JOIN found in SELECT clause - this is a syntax error!")
                # Try to fix: move JOINs after FROM
                # This is a simple heuristic fix
                parts = sql.split("FROM", 1)
                if len(parts) == 2:
                    select_part = parts[0]
                    from_part = parts[1]
                    # Extract JOINs from SELECT
                    if "JOIN" in select_part.upper():
                        logger.warning("Attempting to fix JOIN in SELECT clause")
                        # This is complex - log warning and let repair tools handle it
                        pass
        
        # Sanity check: Verify JOINs make sense
        sql_upper = sql.upper()
        if "JOIN" in sql_upper:
            # Check for common JOIN errors
            if "JOIN WAREHOUSE" in sql_upper and "SS.SS_STORE_SK = W.W_WAREHOUSE_SK" in sql_upper:
                logger.error("❌ SANITY CHECK FAILED: Joining store_sales.store_sk to warehouse.warehouse_sk is WRONG!")
                logger.error("   These are different entities! Use inventory table as bridge.")
                logger.error(f"   Problematic SQL: {sql[:300]}...")
            if "JOIN ITEM I ON W.W_WAREHOUSE_SK = I.I_WAREHOUSE_SK" in sql_upper:
                logger.error("❌ SANITY CHECK FAILED: Items don't have warehouse_sk! Use inventory table.")
                logger.error(f"   Problematic SQL: {sql[:300]}...")
            # Check for correct inventory JOIN pattern
            if "FROM INVENTORY" in sql_upper or "FROM STORE_SALES" in sql_upper:
                if "JOIN WAREHOUSE" in sql_upper and "JOIN ITEM" in sql_upper:
                    if "INV.INV_WAREHOUSE_SK = W.W_WAREHOUSE_SK" in sql_upper and "INV.INV_ITEM_SK = I.I_ITEM_SK" in sql_upper:
                        logger.info("✓ JOIN pattern looks correct: inventory → warehouse, inventory → item")
        
        # Print debugging info
        logger.info(f"Generated SQL for step {state['current_step_index'] + 1}/{len(state['sql_steps'])}")
        logger.info(f"Step description: {current_step.get('description', '')[:100]}")
        logger.info(f"SQL query (first 300 chars): {sql[:300]}...")
        if previous_results:
            logger.debug(f"Previous results available: {len(previous_results)} chars")
        
        state["sql_query"] = sql
        state["step"] = "generate_step_sql"
    except Exception as e:
        logger.error(f"Error generating step SQL: {e}")
        state["errors"].append(f"Step SQL generation failed: {str(e)}")
        state["sql_query"] = None

    return state


def execute_sql(state: AgentState) -> AgentState:
    """
    Execute SQL query via MCP server (if available) or DuckDB fallback.
    Includes repair loop that uses error context to fix and retry.

    Args:
        state: Current agent state

    Returns:
        Updated state with SQL results or error
    """
    if not state.get("sql_query"):
        state["errors"].append("No SQL query to execute")
        return state

    # Try MCP server first if available
    mcp_client = get_mcp_client()
    use_mcp = mcp_client is not None and state.get("metadata", {}).get("prefer_mcp", True)
    
    sql_query = state["sql_query"]
    max_repair_attempts = 5  # Increased for more repair attempts
    repair_attempt = 0
    last_error = None
    
    while repair_attempt <= max_repair_attempts:
        try:
            if use_mcp:
                logger.info(f"Executing SQL via MCP server (attempt {repair_attempt + 1})")
                rows, columns = mcp_client.execute_query(sql_query)
                state["metadata"]["execution_method"] = "mcp"
            else:
                logger.info("Executing SQL via DuckDB (MCP not available or disabled)")
                with DuckDBClient() as client:
                    rows, columns = client.execute_query(sql_query)
                state["metadata"]["execution_method"] = "duckdb"

            state["sql_result"] = rows
            state["sql_columns"] = columns
            state["sql_query"] = sql_query  # Store the working query
            state["sql_error"] = None
            state["step"] = "execute"
            
            # Log result count for debugging
            if rows:
                logger.info(f"✓ SQL returned {len(rows)} rows with columns: {columns}")
                if len(rows) > 0:
                    logger.info(f"  First row sample: {dict(zip(columns, rows[0][:5]))}")
            else:
                logger.warning(f"⚠ SQL executed successfully but returned 0 rows")
                logger.warning(f"  Query: {sql_query[:200]}...")
                state["errors"].append("Query returned no results - may need to adjust filters or joins")
            
            # If this is a multi-step execution, save results
            if state.get("sql_steps") is not None:
                state["step_results"].append({
                    "step_index": state.get("current_step_index", 0),
                    "step_description": state["sql_steps"][state["current_step_index"]].get("description", ""),
                    "result": rows,
                    "columns": columns,
                    "row_count": len(rows),
                    "sql_query": sql_query,
                })
                # Print SQL for debugging
                logger.info(f"Step {state.get('current_step_index', 0) + 1} SQL saved: {sql_query[:500]}...")
            
            # Success - break out of repair loop
            break
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"SQL execution error (attempt {repair_attempt + 1}): {error_msg}")
            
            # If this is the last attempt, give up
            if repair_attempt >= max_repair_attempts:
                state["sql_error"] = error_msg
                state["sql_result"] = None
                state["errors"].append(f"SQL execution failed after {max_repair_attempts + 1} attempts: {error_msg}")
                
                # If this is a multi-step execution, still save the error
                if state.get("sql_steps") is not None:
                    state["step_results"].append({
                        "step_index": state.get("current_step_index", 0),
                        "step_description": state["sql_steps"][state["current_step_index"]].get("description", ""),
                        "result": [],
                        "columns": [],
                        "row_count": 0,
                        "sql_query": sql_query,
                        "sql_error": error_msg,
                    })
                    # Print error SQL for debugging
                    logger.error(f"Step {state.get('current_step_index', 0) + 1} SQL ERROR: {error_msg[:200]}")
                    logger.error(f"Failed SQL (first 500 chars): {sql_query[:500]}...")
                    # Save full SQL to file for debugging
                    debug_dir = Path(__file__).parent.parent.parent / "data" / "debug_sql"
                    debug_dir.mkdir(parents=True, exist_ok=True)
                    sql_file = debug_dir / f"step_{state.get('current_step_index', 0) + 1}_failed.sql"
                    with open(sql_file, 'w') as f:
                        f.write(f"-- Step {state.get('current_step_index', 0) + 1}: {state['sql_steps'][state['current_step_index']].get('description', '')}\n")
                        f.write(f"-- Error: {error_msg}\n")
                        f.write(sql_query)
                    logger.error(f"Full SQL saved to: {sql_file}")
                break
            
            # Try to repair the SQL using error context
            repaired = _repair_sql_from_error(sql_query, error_msg, state)
            if repaired and repaired != sql_query:
                logger.info(f"🔧 Repaired SQL based on error context, retrying...")
                logger.info(f"   Original: {sql_query[:200]}...")
                logger.info(f"   Repaired: {repaired[:200]}...")
                sql_query = repaired
                repair_attempt += 1
                continue
            else:
                logger.warning(f"⚠ No repair applied for error: {error_msg[:150]}")
            
            # If repair didn't work, try DuckDB as fallback (only on first attempt)
            if use_mcp and repair_attempt == 0:
                logger.info("MCP execution failed, trying DuckDB fallback")
                try:
                    with DuckDBClient() as client:
                        rows, columns = client.execute_query(sql_query)
                    state["sql_result"] = rows
                    state["sql_columns"] = columns
                    state["sql_query"] = sql_query
                    state["sql_error"] = None
                    state["metadata"]["execution_method"] = "duckdb_fallback"
                    logger.info(f"DuckDB fallback succeeded: {len(rows)} rows")
                    
                    # Save results
                    if state.get("sql_steps") is not None:
                        state["step_results"].append({
                            "step_index": state.get("current_step_index", 0),
                            "step_description": state["sql_steps"][state["current_step_index"]].get("description", ""),
                            "result": rows,
                            "columns": columns,
                            "row_count": len(rows),
                            "sql_query": sql_query,
                        })
                    break
                except Exception as fallback_error:
                    logger.warning(f"DuckDB fallback also failed: {fallback_error}")
                    # Continue to repair loop
                    repaired = _repair_sql_from_error(sql_query, str(fallback_error), state)
                    if repaired and repaired != sql_query:
                        sql_query = repaired
                        repair_attempt += 1
                        continue
            
            # If we can't repair, increment and try again (might get different error)
            repair_attempt += 1

    return state


def _repair_sql_from_error(sql: str, error_msg: str, state: AgentState) -> str:
    """
    Repair SQL query using deterministic repair tools and error context.
    
    Args:
        sql: The SQL query that failed
        error_msg: Error message from database
        state: Agent state for context
        
    Returns:
        Repaired SQL query, or original if repair not possible
    """
    from src.utils.sql_repair_tools import SQLRepairTool
    
    # Try deterministic repair tools first
    repaired = SQLRepairTool.repair_all(sql, error_msg)
    
    if repaired and repaired != sql:
        logger.info(f"[REPAIR] Deterministic repair succeeded")
        return repaired
    
    # Fallback to schema matcher for complex cases (if deterministic tools didn't help)
    if repaired == sql and ("Binder Error" in error_msg or ("column" in error_msg.lower() and "not found" in error_msg.lower())):
        try:
            schema_matcher = SchemaMatcherModule()
            mcp_client = get_mcp_client()
            
            # Try MCP for schema if available, else DuckDB
            if mcp_client:
                try:
                    schema_summary = mcp_client.get_schema_summary()
                except:
                    with DuckDBClient() as client:
                        schema_summary = client.get_schema_summary()
            else:
                with DuckDBClient() as client:
                    schema_summary = client.get_schema_summary()
            
            mapping = schema_matcher.match_fields(
                error_message=error_msg,
                attempted_query=sql,
                schema_summary=schema_summary,
                question_context=state.get("question", ""),
            )
            
            if mapping:
                repaired = schema_matcher.apply_mapping(sql, mapping)
                logger.info(f"[REPAIR] Schema matcher repaired SQL with {len(mapping)} field mappings")
        except Exception as e:
            logger.warning(f"Schema matcher repair failed: {e}")
    
    return repaired


def match_schema(state: AgentState) -> AgentState:
    """
    Try to match schemas/fields when SQL fails due to column/table errors.

    Args:
        state: Current agent state

    Returns:
        Updated state with schema-matched SQL query
    """
    if not state.get("sql_error") or not state.get("sql_query"):
        return state

    # Only try schema matching for column/table not found errors
    error_msg = state.get("sql_error", "").lower()
    if "not found" not in error_msg and "referenced column" not in error_msg:
        # Not a schema error, skip to regular repair
        return repair_sql(state)

    try:
        with DuckDBClient() as client:
            schema_summary = client.get_schema_summary()

        matcher = SchemaMatcherModule()
        mapping = matcher.match_fields(
            error_message=state["sql_error"],
            attempted_query=state["sql_query"],
            schema_summary=schema_summary,
            question_context=state.get("question", ""),
        )

        if mapping:
            # Apply mapping to fix the query
            corrected_sql = matcher.apply_mapping(state["sql_query"], mapping)
            state["sql_query"] = corrected_sql
            state["step"] = "match_schema"
            state["sql_error"] = None
            state["retry_count"] = state.get("retry_count", 0) + 1
            
            logger.info(f"Applied schema mapping, retrying query")
            # Try executing again
            return execute_sql(state)
        else:
            # No mapping found, fall back to regular repair
            return repair_sql(state)
            
    except Exception as e:
        logger.error(f"Error matching schema: {e}")
        # Fall back to regular repair
        return repair_sql(state)


def repair_sql(state: AgentState) -> AgentState:
    """
    Repair failed SQL query using critic module.

    Args:
        state: Current agent state

    Returns:
        Updated state with repaired SQL query
    """
    if not state.get("sql_error") or not state.get("sql_query"):
        return state

    if state.get("retry_count", 0) >= 2:
        state["errors"].append("Max retry count reached for SQL repair")
        return state

    try:
        with DuckDBClient() as client:
            schema_summary = client.get_schema_summary()

        critic = CriticModule()
        # Include more context in error message
        full_error = f"{state['sql_error']}\n\nOriginal SQL:\n{state['sql_query']}"
        repaired_sql = critic(
            failed_sql=state["sql_query"],
            error_message=full_error,
            schema_summary=schema_summary,
        )

        state["sql_query"] = repaired_sql
        state["retry_count"] = state.get("retry_count", 0) + 1
        state["step"] = "repair"
        state["sql_error"] = None  # Clear error before retry

        # Try executing again
        return execute_sql(state)
    except Exception as e:
        logger.error(f"Error repairing SQL: {e}")
        state["errors"].append(f"SQL repair failed: {str(e)}")

    return state


def discover_and_ingest_pdfs(state: AgentState) -> AgentState:
    """
    Discover relevant PDFs and ingest them on-demand.
    
    Args:
        state: Current agent state
        
    Returns:
        Updated state with PDF discovery results
    """
    from pathlib import Path
    from src.ingestion.pdf_discovery import discover_relevant_pdfs, ingest_pdfs_on_demand
    
    try:
        # Determine dataset root (assume it's 2 levels up from antm-agent)
        project_root = Path(__file__).resolve().parents[3]
        dataset_root = project_root / "dataset"
        
        # Discover relevant PDFs
        logger.info("Discovering relevant PDFs for question...")
        relevant_pdfs = discover_relevant_pdfs(
            question=state["question"],
            dataset_root=dataset_root,
            max_pdfs=10,
        )
        
        if not relevant_pdfs:
            logger.info("No relevant PDFs found")
            state["pdf_context"] = []
            state["step"] = "discover_pdfs"
            return state
        
        logger.info(f"Found {len(relevant_pdfs)} relevant PDFs")
        for pdf_info in relevant_pdfs[:3]:
            logger.info(f"  - {Path(pdf_info['path']).name}: {pdf_info['reason']}")
        
        # Ingest selected PDFs on-demand
        data_dir = Path(__file__).resolve().parents[2] / "data"
        lancedb_path = data_dir / "lancedb"
        parsed_output_dir = data_dir / "parsed_pdfs"
        
        logger.info("Ingesting selected PDFs into LanceDB...")
        total_chunks = ingest_pdfs_on_demand(
            pdf_paths=relevant_pdfs,
            lancedb_path=lancedb_path,
            parsed_output_dir=parsed_output_dir,
        )
        
        logger.info(f"Ingested {total_chunks} chunks from {len(relevant_pdfs)} PDFs")
        state["metadata"]["pdfs_discovered"] = len(relevant_pdfs)
        state["metadata"]["pdf_chunks_ingested"] = total_chunks
        
        # Now search the ingested PDFs
        return search_pdfs(state)
        
    except Exception as e:
        logger.error(f"Error in PDF discovery/ingestion: {e}")
        state["errors"].append(f"PDF discovery failed: {str(e)}")
        state["pdf_context"] = []
        state["step"] = "discover_pdfs"
        return state


def search_pdfs(state: AgentState) -> AgentState:
    """
    Search PDFs using LanceDB vector search.

    Args:
        state: Current agent state

    Returns:
        Updated state with PDF search results
    """
    try:
        client = LanceDBClient()
        results = client.search(query=state["question"], top_k=5)

        state["pdf_context"] = results
        state["pdf_query"] = state["question"]
        state["step"] = "search"
        
        if results:
            logger.info(f"Found {len(results)} relevant PDF chunks")
        else:
            logger.warning("No PDF results found")
            
    except Exception as e:
        logger.error(f"Error searching PDFs: {e}")
        state["errors"].append(f"PDF search failed: {str(e)}")
        state["pdf_context"] = []

    return state


def synthesize_answer(state: AgentState) -> AgentState:
    """
    Synthesize final answer from SQL results and/or PDF context.
    For multi-step queries, aggregates all step results.

    Args:
        state: Current agent state

    Returns:
        Updated state with synthesized answer
    """
    answer = {}
    all_steps_data = {}  # Aggregate all fields from all steps
    step_summaries = []

    # If multi-step, aggregate all step results
    if state.get("step_results"):
        for step_result in state["step_results"]:
            step_idx = step_result.get("step_index", 0)
            step_desc = step_result.get("step_description", "")
            rows = step_result.get("result", [])
            columns = step_result.get("columns", [])
            
            # Create step summary
            step_summaries.append({
                "step": step_idx + 1,
                "description": step_desc,
                "columns": columns,
                "row_count": len(rows),
            })
            
            # Aggregate all column values from all rows
            if rows and columns:
                # For each column, collect all values (or just first row if single value expected)
                for col in columns:
                    col_idx = columns.index(col) if col in columns else None
                    if col_idx is not None:
                        # Take first row's value for this column (or aggregate if needed)
                        if len(rows) > 0 and col_idx < len(rows[0]):
                            value = rows[0][col_idx]
                            # Store with column name as key
                            all_steps_data[col] = value
                            # Also store with step prefix for disambiguation
                            all_steps_data[f"step_{step_idx + 1}_{col}"] = value
                
                # Store raw values from first row
                if len(rows) > 0:
                    answer["_raw_values"] = list(rows[0])
        
        # Store aggregated data
        answer["all_steps"] = all_steps_data
        answer["step_summaries"] = step_summaries
        
        # Also extract from last step (for backward compatibility)
        if state.get("step_results"):
            last_result = state["step_results"][-1]
            last_rows = last_result.get("result", [])
            last_columns = last_result.get("columns", [])
            if last_rows and last_columns:
                first_row = last_rows[0]
                for i, col in enumerate(last_columns):
                    if i < len(first_row):
                        answer[col] = first_row[i]

    # Legacy single-step: Extract answer from SQL results if available
    elif state.get("sql_result") and state.get("sql_columns"):
        rows = state["sql_result"]
        columns = state["sql_columns"]

        # Take the first row's values and map to answer dict
        if rows:
            first_row = rows[0]
            # Store all column values
            for i, col in enumerate(columns):
                if i < len(first_row):
                    answer[col] = first_row[i]
            
            # Also store raw values for formatting
            answer["_raw_values"] = list(first_row)

    # Add PDF context if available
    if state.get("pdf_context"):
        answer["pdf_sources"] = [
            {
                "source": r.get("source_name", ""),
                "category": r.get("category", ""),
                "content_preview": r.get("content", "")[:200],
            }
            for r in state["pdf_context"][:3]  # Top 3 results
        ]

    state["raw_answer"] = answer
    state["step"] = "synthesize"

    return state


def format_answer(state: AgentState) -> AgentState:
    """
    Format answer into submission format (5 columns) using all available data.

    Args:
        state: Current agent state

    Returns:
        Updated state with formatted answer
    """
    raw_answer = state.get("raw_answer", {})
    values = []

    # If multi-step, extract from all_steps data using intelligent matching
    if raw_answer.get("all_steps"):
        all_data = raw_answer["all_steps"]
        
        # Use LLM to extract and map fields intelligently based on question context
        # This handles messy data where field names vary across steps
        try:
            from src.modules.extractor import ExtractionModule
            extractor = ExtractionModule()
            
            # Create a comprehensive summary of all available data
            # Include step summaries to help LLM understand context
            step_summaries = raw_answer.get("step_summaries", [])
            data_summary = {
                "question": state.get("question", ""),
                "available_fields": list(all_data.keys())[:100],  # More fields for better matching
                "sample_values": {k: str(v)[:100] for k, v in list(all_data.items())[:30]},  # Truncate long values
                "step_summaries": [
                    {
                        "step": s.get("step"),
                        "description": s.get("description"),
                        "columns": s.get("columns", []),
                    }
                    for s in step_summaries
                ],
            }
            
            # Extract answer fields based on question context
            extracted = extractor.extract(
                text=json.dumps(data_summary, indent=2, default=str),
                schema_hint=f"Question: {state.get('question', '')}\n"
                           f"Extract: warehouse_sk (integer), category (string), revenue_impact (float), "
                           f"item_sk (integer), state (string) - map from available_fields to these expected fields."
            )
            
            # Use extracted values if available
            if isinstance(extracted, dict) and extracted:
                # Look for expected fields in extracted data
                for field in ["warehouse_sk", "category", "revenue_impact", "item_sk", "state"]:
                    if field in extracted and extracted[field] is not None:
                        values.append(str(extracted[field]))
                logger.info(f"Extracted {len(values)} values using LLM extraction")
        except Exception as e:
            logger.warning(f"Extraction failed, using fallback: {e}")
        
        # Fallback: Try to find expected answer fields in the combined data
        if len(values) < 3:
            field_mappings = {
                "warehouse_sk": ["warehouse_sk", "w_warehouse_sk", "inv_warehouse_sk", "w_warehouse"],
                "category": ["category", "i_category", "category_name", "cat"],
                "revenue_impact": ["revenue_impact", "impact", "difference", "change", "delta"],
                "item_sk": ["item_sk", "i_item_sk", "inv_item_sk"],
                "state": ["state", "s_state", "ca_state"],
            }
            
            # Extract values using flexible matching
            for field_group, possible_names in field_mappings.items():
                found = False
                for name in possible_names:
                    # Check all step data for this field (case-insensitive, partial match)
                    for key, val in all_data.items():
                        key_lower = key.lower()
                        name_lower = name.lower()
                        if (name_lower in key_lower or key_lower.endswith(f"_{name_lower}") or 
                            key_lower.startswith(f"{name_lower}_")):
                            if val is not None and str(val).strip():
                                values.append(str(val))
                                found = True
                                break
                    if found:
                        break
        
        # If we still didn't find enough, use raw values from last step
        if len(values) < 3 and raw_answer.get("_raw_values"):
            values = [str(v) if v is not None else "" for v in raw_answer["_raw_values"][:5]]
    
    # Fallback to single SQL result
    elif state.get("sql_result") and state.get("sql_columns"):
        rows = state["sql_result"]
        if rows:
            first_row = rows[0]
            values = [str(val) if val is not None else "" for val in first_row[:5]]
    
    # Pad to 5 columns
    while len(values) < 5:
        values.append("")

    formatted = {
        "col_1": values[0] if len(values) > 0 else "",
        "col_2": values[1] if len(values) > 1 else "",
        "col_3": values[2] if len(values) > 2 else "",
        "col_4": values[3] if len(values) > 3 else "",
        "col_5": values[4] if len(values) > 4 else "",
    }

    state["answer"] = formatted
    state["step"] = "format"

    return state


def route_after_plan(state: AgentState) -> Literal["execute_sql", "search_pdfs", "synthesize_answer"]:
    """Route after planning based on needs."""
    if state.get("needs_sql") and state.get("sql_query"):
        return "execute_sql"
    elif state.get("needs_pdfs"):
        return "search_pdfs"
    else:
        return "synthesize_answer"


def route_after_execute(state: AgentState) -> Literal["match_schema", "repair_sql", "validate_step", "synthesize_answer"]:
    """Route after SQL execution - try schema matching first, then repair, then validate."""
    # If there's an error, try schema matching first (for column/table errors)
    if state.get("sql_error") and state.get("retry_count", 0) < 2:
        error_msg = state.get("sql_error", "").lower()
        if "not found" in error_msg or "referenced column" in error_msg or "referenced table" in error_msg:
            return "match_schema"
        return "repair_sql"
    
    # If multi-step, validate and potentially continue
    if state.get("sql_steps") is not None:
        return "validate_step"
    
    # Legacy single-step flow
    return "synthesize_answer"


def validate_step(state: AgentState) -> AgentState:
    """
    Validate current step results and decide next action.

    Args:
        state: Current agent state

    Returns:
        Updated state
    """
    current_idx = state.get("current_step_index", 0)
    total_steps = len(state.get("sql_steps", []))
    
    # Check if we got results
    last_result = state["step_results"][-1] if state.get("step_results") else None
    has_results = last_result and last_result.get("row_count", 0) > 0
    
    if not has_results:
        logger.warning(f"Step {current_idx + 1} returned no results")
        state["errors"].append(f"Step {current_idx + 1} returned no results")
    
    # Move to next step if available (prepare for next iteration)
    if current_idx + 1 < total_steps:
        state["current_step_index"] = current_idx + 1
        state["metadata"]["has_more_steps"] = True
    else:
        state["metadata"]["has_more_steps"] = False
    
    state["step"] = "validate_step"
    return state


def route_after_validate(state: AgentState) -> Literal["generate_step_sql", "synthesize_answer"]:
    """Route after validation - continue to next step or synthesize."""
    # Check if there are more steps to execute
    if state.get("metadata", {}).get("has_more_steps", False):
        return "generate_step_sql"
    
    # All steps done, synthesize answer
    return "synthesize_answer"


def route_after_plan_steps(state: AgentState) -> Literal["generate_step_sql", "synthesize_answer"]:
    """Route after planning steps - start executing first step."""
    if state.get("sql_steps") and len(state["sql_steps"]) > 0:
        return "generate_step_sql"
    return "synthesize_answer"


def route_after_search(state: AgentState) -> Literal["synthesize_answer"]:
    """Route after PDF search."""
    return "synthesize_answer"


def build_workflow() -> StateGraph:
    """
    Build the LangGraph workflow.

    Returns:
        Compiled StateGraph
    """
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("route_question", route_question)
    graph.add_node("plan_steps", plan_steps)  # Multi-step planning
    graph.add_node("generate_step_sql", generate_step_sql)  # Generate SQL for current step
    graph.add_node("validate_step", validate_step)  # Validate step results
    graph.add_node("plan_sql", plan_sql)  # Legacy single-step
    graph.add_node("execute_sql", execute_sql)
    graph.add_node("match_schema", match_schema)  # Schema/field matching for messy data
    graph.add_node("repair_sql", repair_sql)
    graph.add_node("discover_pdfs", discover_and_ingest_pdfs)
    graph.add_node("search_pdfs", search_pdfs)
    graph.add_node("synthesize_answer", synthesize_answer)
    graph.add_node("format_answer", format_answer)

    # Add edges from START
    graph.add_edge(START, "route_question")

    # Conditional edge from route_question - use multi-step planning for SQL
    graph.add_conditional_edges(
        "route_question",
        lambda s: "plan_steps" if s.get("needs_sql") else "discover_pdfs" if s.get("needs_pdfs") else "plan_steps",
    )
    
    # Edge from plan_steps to generate first step SQL
    graph.add_conditional_edges(
        "plan_steps",
        route_after_plan_steps,
        {
            "generate_step_sql": "generate_step_sql",
            "synthesize_answer": "synthesize_answer",
        },
    )
    
    # Edge from generate_step_sql to execute
    graph.add_edge("generate_step_sql", "execute_sql")
    
    # Conditional edge from execute_sql (multi-step aware, with schema matching)
    graph.add_conditional_edges(
        "execute_sql",
        route_after_execute,
        {
            "match_schema": "match_schema",  # Try schema matching first for column errors
            "repair_sql": "repair_sql",
            "validate_step": "validate_step",
            "synthesize_answer": "synthesize_answer",
        },
    )
    
    # Edge from match_schema back to execute_sql (to retry with corrected fields)
    graph.add_edge("match_schema", "execute_sql")
    
    # Conditional edge from validate_step - continue or synthesize
    graph.add_conditional_edges(
        "validate_step",
        route_after_validate,
        {
            "generate_step_sql": "generate_step_sql",  # Loop back for next step
            "synthesize_answer": "synthesize_answer",
        },
    )

    # Legacy single-step flow (kept for backward compatibility)
    graph.add_conditional_edges(
        "plan_sql",
        route_after_plan,
        {
            "execute_sql": "execute_sql",
            "search_pdfs": "search_pdfs",
            "synthesize_answer": "synthesize_answer",
        },
    )

    # Edge from repair_sql back to execute_sql
    graph.add_edge("repair_sql", "execute_sql")

    # Edge from discover_pdfs (it calls search_pdfs internally, then goes to synthesize)
    graph.add_edge("discover_pdfs", "synthesize_answer")
    
    # Edge from search_pdfs (legacy, for direct PDF search)
    graph.add_conditional_edges(
        "search_pdfs",
        route_after_search,
        {
            "synthesize_answer": "synthesize_answer",
        },
    )

    # Edge from synthesize_answer
    graph.add_edge("synthesize_answer", "format_answer")

    # Edge from format_answer to END
    graph.add_edge("format_answer", END)

    return graph.compile()

