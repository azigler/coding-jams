"""Agent state management for LangGraph workflow."""

from __future__ import annotations

from typing import Any, Dict, List, Optional, TypedDict


class AgentState(TypedDict):
    """
    Agent state for LangGraph workflow.

    State transitions:
    1. START -> route_question -> (plan_sql | search_pdfs | both)
    2. plan_sql -> execute_sql -> (repair_sql if error | synthesize_answer)
    3. search_pdfs -> synthesize_answer
    4. synthesize_answer -> format_answer -> END
    """

    # Input
    question: str  # Natural language question

    # Routing
    step: str  # Current step: "route", "plan", "execute", "search", "synthesize", "format"
    needs_sql: bool  # Whether question needs SQL query
    needs_pdfs: bool  # Whether question needs PDF search

    # SQL execution (single query - legacy)
    sql_query: Optional[str]  # Generated SQL query
    sql_result: Optional[List[tuple]]  # SQL query results
    sql_columns: Optional[List[str]]  # SQL result column names
    sql_error: Optional[str]  # SQL execution error if any
    
    # Multi-step SQL planning
    sql_steps: List[Dict[str, Any]]  # List of planned SQL steps with descriptions
    current_step_index: int  # Current step being executed (0-indexed)
    step_results: List[Dict[str, Any]]  # Results from each completed step
    step_plan: Optional[str]  # High-level plan describing the steps

    # PDF search
    pdf_context: Optional[List[Dict[str, Any]]]  # PDF search results
    pdf_query: Optional[str]  # PDF search query (may differ from question)

    # Answer synthesis
    raw_answer: Optional[Dict[str, Any]]  # Raw answer before formatting
    answer: Optional[Dict[str, Any]]  # Final formatted answer

    # Error handling
    errors: List[str]  # List of error messages
    retry_count: int  # Number of retries attempted

    # Metadata
    metadata: Dict[str, Any]  # Additional metadata

