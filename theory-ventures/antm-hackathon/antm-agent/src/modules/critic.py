"""Single-pass critic module for repairing SQL outputs."""

from __future__ import annotations

from typing import Optional

import dspy

from .config import get_default_lm


class RepairSQLSignature(dspy.Signature):
    """Signature for SQL repair."""

    failed_sql = dspy.InputField(
        desc="Original SQL query that failed validation or execution."
    )
    error_message = dspy.InputField(
        desc="Validation or execution error encountered. Pay attention to column name errors - use EXACT names from schema."
    )
    schema_summary = dspy.InputField(
        default="",
        desc="Database schema with exact column names and types. Use these EXACT names when fixing the query.",
    )
    repaired_sql = dspy.OutputField(
        desc="Corrected SQL query that should satisfy validation and execute successfully. "
        "CRITICAL: Use EXACT column names from schema_summary. For date_dim, use d_moy (1-12) not d_month."
    )


class CriticModule(dspy.Module):
    """Baseline critic that attempts a single repair pass using DSPy."""

    def __init__(self, lm: Optional[dspy.LM] = None) -> None:
        """
        Initialize the critic module.

        Args:
            lm: Language model to use. If None, uses default from config.
        """
        super().__init__()
        self.lm = lm or get_default_lm()
        self.program = dspy.ChainOfThought(signature=RepairSQLSignature)
        self.program.predict.lm = self.lm

    def forward(
        self, failed_sql: str, error_message: str, schema_summary: str = ""
    ) -> str:
        """
        Repair a failed SQL query.

        Args:
            failed_sql: The SQL query that failed
            error_message: The error message from execution
            schema_summary: Optional schema summary for context

        Returns:
            Repaired SQL query string
        """
        result = self.program(
            failed_sql=failed_sql,
            error_message=error_message,
            schema_summary=schema_summary,
        )
        repaired = result.repaired_sql.strip()
        
        # Ensure semicolon at end
        if not repaired.endswith(";"):
            repaired = f"{repaired};"
        
        return repaired

