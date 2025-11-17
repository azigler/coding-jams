"""Schema and field matching module for handling messy enterprise data."""

from __future__ import annotations

from typing import Dict, List, Optional, Any
import dspy
import logging

from .config import get_default_lm

logger = logging.getLogger(__name__)


class SchemaMatchSignature(dspy.Signature):
    """Signature for matching schemas/fields when queries fail."""

    error_message = dspy.InputField(
        desc="SQL error message, especially column/table not found errors."
    )
    attempted_query = dspy.InputField(desc="The SQL query that failed.")
    schema_summary = dspy.InputField(desc="Available database schema.")
    question_context = dspy.InputField(
        default="",
        desc="Context about what the query is trying to accomplish."
    )
    field_mapping = dspy.OutputField(
        desc="JSON object mapping incorrect field names to correct ones. "
        "Example: {\"d_month\": \"d_moy\", \"category_id\": \"i_category_id\"}. "
        "Only include fields that need correction. If no mapping needed, return {}."
    )


class SchemaMatcherModule(dspy.Module):
    """Module for intelligently matching schemas and fields when queries fail."""

    def __init__(self, lm: Optional[dspy.LM] = None) -> None:
        super().__init__()
        self.lm = lm or get_default_lm()
        self.matcher = dspy.ChainOfThought(signature=SchemaMatchSignature)
        self.matcher.predict.lm = self.lm

    def match_fields(
        self,
        error_message: str,
        attempted_query: str,
        schema_summary: str,
        question_context: str = "",
    ) -> Dict[str, str]:
        """
        Intelligently match incorrect field names to correct ones.
        Extracts candidate bindings from MCP error messages when available.

        Args:
            error_message: SQL error message (may include "Candidate bindings" from MCP)
            attempted_query: The query that failed
            schema_summary: Available schema
            question_context: What the query is trying to do

        Returns:
            Dictionary mapping incorrect → correct field names
        """
        # First, try to extract candidate bindings from MCP error messages
        mapping = {}
        
        # MCP provides "Candidate bindings" in error messages
        # Example: "Candidate bindings: \"ss_sales_price\", \"ss_store_sk\""
        import re
        candidate_match = re.search(r'Candidate bindings[:\s]+([^\n]+)', error_message, re.IGNORECASE)
        if candidate_match:
            candidates_str = candidate_match.group(1)
            # Extract column names from candidate bindings
            candidates = re.findall(r'"([^"]+)"', candidates_str)
            
            # Find the incorrect column name in the error
            # Example: "Table \"ss\" does not have a column named \"ss_sales_amount\""
            incorrect_match = re.search(r'column named "([^"]+)"', error_message, re.IGNORECASE)
            if incorrect_match and candidates:
                incorrect = incorrect_match.group(1)
                # Use the first candidate as the correct column
                # Or use LLM to pick the best match
                if len(candidates) > 0:
                    # Simple heuristic: pick candidate that's most similar
                    # For now, use first candidate
                    correct = candidates[0]
                    mapping[incorrect] = correct
                    logger.info(f"Auto-mapped from MCP candidates: {incorrect} → {correct}")
        
        # If we got a mapping from candidates, use it
        if mapping:
            return mapping
        
        # Otherwise, use LLM to match
        try:
            result = self.matcher(
                error_message=error_message,
                attempted_query=attempted_query,
                schema_summary=schema_summary,
                question_context=question_context,
            )
            
            # Parse JSON mapping
            import json
            mapping_text = result.field_mapping.strip()
            
            # Remove markdown code blocks if present
            if mapping_text.startswith("```"):
                lines = mapping_text.split("\n")
                mapping_text = "\n".join(lines[1:-1]) if len(lines) > 2 else mapping_text
            
            llm_mapping = json.loads(mapping_text)
            if isinstance(llm_mapping, dict):
                mapping.update(llm_mapping)
            
            logger.info(f"Schema matcher found {len(mapping)} field mappings: {mapping}")
            return mapping
            
        except Exception as e:
            logger.warning(f"Schema matching failed: {e}")
            return mapping

    def apply_mapping(self, sql: str, mapping: Dict[str, str]) -> str:
        """
        Apply field mapping to SQL query.

        Args:
            sql: SQL query string
            mapping: Dictionary of incorrect → correct field names

        Returns:
            SQL query with corrected field names
        """
        if not mapping:
            return sql
        
        import re
        corrected_sql = sql
        
        for incorrect, correct in mapping.items():
            # Replace whole word matches (to avoid partial replacements)
            # Match field name in various contexts: column references, WHERE clauses, etc.
            pattern = rf'\b{re.escape(incorrect)}\b'
            corrected_sql = re.sub(pattern, correct, corrected_sql, flags=re.IGNORECASE)
        
        if corrected_sql != sql:
            logger.info(f"Applied schema mapping: {mapping}")
        
        return corrected_sql

