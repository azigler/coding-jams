"""Submission CSV generator."""

from __future__ import annotations

import csv
import sys
from pathlib import Path
from typing import Any, Dict, List

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from eval.harness import parse_questions_file
from src.agent import run_agent


def generate_submission(
    questions_file: Path,
    output_path: Path,
    max_questions: int | None = None,
) -> None:
    """
    Generate submission CSV file.

    Args:
        questions_file: Path to questions markdown file
        output_path: Path to output CSV file
        max_questions: Maximum number of questions to process (None for all)
    """
    # Parse questions
    questions = parse_questions_file(questions_file)
    if max_questions:
        questions = questions[:max_questions]

    # Run agent on each question
    answers = []
    for idx, q in enumerate(questions):
        print(f"Processing question {idx + 1}/{len(questions)}: {q['title']}")

        try:
            agent_result = run_agent(q["question"])
            answer = agent_result.get("answer", {})
        except Exception as e:
            print(f"Error: {e}")
            answer = {}

        # Extract values for columns
        row = {
            "row_index": idx,
            "col_1": answer.get("col_1", ""),
            "col_2": answer.get("col_2", ""),
            "col_3": answer.get("col_3", ""),
            "col_4": answer.get("col_4", ""),
            "col_5": answer.get("col_5", ""),
        }
        answers.append(row)

    # Write CSV
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["row_index", "col_1", "col_2", "col_3", "col_4", "col_5"])
        writer.writeheader()
        writer.writerows(answers)

    print(f"\n✓ Submission CSV saved to: {output_path}")

