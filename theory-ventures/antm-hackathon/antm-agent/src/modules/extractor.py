"""Extraction module for mapping unstructured data to structured fields."""

from __future__ import annotations

from typing import Any, Dict, Optional
import dspy
import json
import logging

from .config import get_default_lm

logger = logging.getLogger(__name__)


class ExtractFieldsSignature(dspy.Signature):
    """Signature for extracting structured fields from data."""

    text = dspy.InputField(
        desc="Data summary with available fields and values."
    )
    schema_hint = dspy.InputField(
        default="",
        desc="Hint about expected fields and their types."
    )
    extracted_fields = dspy.OutputField(
        desc="JSON object with extracted field values. "
        "Map the available data to expected fields based on the schema_hint. "
        "Example: {\"warehouse_sk\": 3, \"category\": \"Electronics\", \"revenue_impact\": -17958.17}"
    )


class ExtractionModule(dspy.Module):
    """Module for extracting structured fields from data."""

    def __init__(self, lm: Optional[dspy.LM] = None) -> None:
        super().__init__()
        self.lm = lm or get_default_lm()
        self.extractor = dspy.ChainOfThought(signature=ExtractFieldsSignature)
        self.extractor.predict.lm = self.lm

    def extract(self, text: str, schema_hint: str = "") -> Dict[str, Any]:
        """
        Extract structured fields from text/data.

        Args:
            text: Data summary or text to extract from
            schema_hint: Hint about expected fields

        Returns:
            Dictionary with extracted field values
        """
        try:
            result = self.extractor(text=text, schema_hint=schema_hint)
            
            # Parse JSON
            extracted_text = result.extracted_fields.strip()
            if extracted_text.startswith("```"):
                lines = extracted_text.split("\n")
                extracted_text = "\n".join(lines[1:-1]) if len(lines) > 2 else extracted_text
            
            extracted = json.loads(extracted_text)
            if not isinstance(extracted, dict):
                return {}
            
            return extracted
        except Exception as e:
            logger.warning(f"Extraction failed: {e}")
            return {}

