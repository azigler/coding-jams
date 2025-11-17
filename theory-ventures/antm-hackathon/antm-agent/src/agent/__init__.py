"""Agent orchestration module."""

from __future__ import annotations

from src.agent.state import AgentState
from src.agent.workflow import build_workflow


def run_agent(question: str) -> dict:
    """
    Run the agent on a question.

    Args:
        question: Natural language question

    Returns:
        Dictionary with answer and metadata
    """
    # Initialize workflow
    workflow = build_workflow()

    # Create initial state
    initial_state: AgentState = {
        "question": question,
        "step": "start",
        "needs_sql": False,
        "needs_pdfs": False,
        "sql_query": None,
        "sql_result": None,
        "sql_columns": None,
        "sql_error": None,
        "sql_steps": [],
        "current_step_index": 0,
        "step_results": [],
        "step_plan": None,
        "pdf_context": None,
        "pdf_query": None,
        "raw_answer": None,
        "answer": None,
        "errors": [],
        "retry_count": 0,
        "metadata": {},
    }

    # Run workflow
    final_state = workflow.invoke(initial_state)

    # Return answer with debugging info
    return {
        "answer": final_state.get("answer", {}),
        "raw_answer": final_state.get("raw_answer", {}),
        "sql_query": final_state.get("sql_query"),
        "sql_result": final_state.get("sql_result"),
        "sql_columns": final_state.get("sql_columns"),
        "sql_error": final_state.get("sql_error"),
        "sql_steps": final_state.get("sql_steps", []),
        "step_results": final_state.get("step_results", []),
        "errors": final_state.get("errors", []),
        "metadata": final_state.get("metadata", {}),
    }
