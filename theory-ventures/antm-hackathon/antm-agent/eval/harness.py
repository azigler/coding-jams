"""Evaluation harness for running agent on questions."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.agent import run_agent


def parse_questions_file(file_path: Path) -> List[Dict[str, Any]]:
    """
    Parse questions from markdown file.

    Args:
        file_path: Path to questions markdown file

    Returns:
        List of question dictionaries with text and expected answers
    """
    if not file_path.exists():
        raise FileNotFoundError(f"Questions file not found: {file_path}")

    content = file_path.read_text(encoding="utf-8")
    questions = []

    # Pattern to match question sections
    # Format: ## title\n\n**Question:** ...\n\n**Observations:**\n\n```json\n{...}\n```
    pattern = r"##\s+(.+?)\n\n\*\*Question:\*\*\s*(.+?)\n\n\*\*Observations:\*\*\s*```json\s*\n(.+?)\n```"
    matches = re.finditer(pattern, content, re.DOTALL)

    for match in matches:
        title = match.group(1).strip()
        question_text = match.group(2).strip()
        observations_json = match.group(3).strip()

        try:
            observations = json.loads(observations_json)
        except json.JSONDecodeError:
            observations = {}

        # Extract expected answers from observations
        # Remove 'question' and 'difficulty' fields
        expected_answers = {
            k: v
            for k, v in observations.items()
            if k not in ("question", "difficulty")
        }

        questions.append({
            "title": title,
            "question": question_text,
            "expected_answers": expected_answers,
            "difficulty": observations.get("difficulty", None),
        })

    # Also handle questions without Observations blocks (test rounds)
    # Pattern: ## title\n\n**Question:** ...
    pattern_no_obs = r"##\s+(.+?)\n\n\*\*Question:\*\*\s*(.+?)(?=\n\n##|\Z)"
    matches_no_obs = re.finditer(pattern_no_obs, content, re.DOTALL)

    for match in matches_no_obs:
        title = match.group(1).strip()
        question_text = match.group(2).strip()

        # Check if we already have this question
        if not any(q["title"] == title for q in questions):
            questions.append({
                "title": title,
                "question": question_text,
                "expected_answers": {},  # No answer key
                "difficulty": None,
            })

    return questions


def run_eval(
    questions_file: Path,
    output_dir: Path,
    max_questions: Optional[int] = None,
    verbose: bool = False,
) -> Dict[str, Any]:
    """
    Run evaluation on questions.

    Args:
        questions_file: Path to questions markdown file
        output_dir: Output directory for results
        max_questions: Maximum number of questions to evaluate (None for all)

    Returns:
        Dictionary with evaluation results
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Parse questions
    questions = parse_questions_file(questions_file)
    if max_questions:
        questions = questions[:max_questions]

    results = []
    correct = 0
    total_with_answers = 0

    for idx, q in enumerate(questions):
        print(f"\n{'='*80}")
        print(f"Question {idx + 1}/{len(questions)}: {q['title']}")
        print(f"{'='*80}")
        print(f"Question: {q['question'][:200]}{'...' if len(q['question']) > 200 else ''}")
        
        if q.get("expected_answers"):
            print(f"Expected answers: {q['expected_answers']}")
        
        if verbose:
            print(f"\n[DEBUG] Running agent...")

        # Run agent
        try:
            agent_result = run_agent(q["question"])
            answer = agent_result.get("answer", {})
            errors = agent_result.get("errors", [])
            
            # Debug output
            if verbose:
                print(f"\n[DEBUG] Agent execution method: {agent_result.get('metadata', {}).get('execution_method', 'unknown')}")
                print(f"[DEBUG] SQL steps planned: {len(agent_result.get('sql_steps', []))}")
                print(f"[DEBUG] Step results: {len(agent_result.get('step_results', []))}")
                
                # Show step results
                for j, step_res in enumerate(agent_result.get('step_results', [])):
                    row_count = step_res.get('row_count', 0)
                    has_error = step_res.get('sql_error') is not None
                    status = "ERROR" if has_error else f"{row_count} rows"
                    desc = step_res.get('step_description', '')[:60]
                    print(f"  Step {j+1}: {status} - {desc}")
                    if has_error:
                        error_msg = step_res.get('sql_error', '')[:100]
                        print(f"    Error: {error_msg}...")
                
                # Show SQL queries
                if agent_result.get('sql_steps'):
                    print(f"\n[DEBUG] SQL Queries Generated:")
                    for j, step in enumerate(agent_result.get('sql_steps', [])):
                        sql = step.get('sql', 'N/A')
                        if sql and sql != 'N/A':
                            print(f"  Step {j+1} SQL: {sql[:150]}{'...' if len(sql) > 150 else ''}")
                
                # Show answer extraction
                raw_answer = agent_result.get('raw_answer', {})
                if raw_answer:
                    print(f"\n[DEBUG] Raw answer data: {raw_answer}")
                
        except Exception as e:
            print(f"Error running agent: {e}")
            if verbose:
                import traceback
                traceback.print_exc()
            answer = {}
            errors = [str(e)]

        # Compare with expected answers if available
        expected = q.get("expected_answers", {})
        is_correct = None
        score_details = {}

        if expected:
            total_with_answers += 1
            # Simple comparison - can be improved
            is_correct = True
            for key, expected_value in expected.items():
                # Try to find matching value in answer
                # This is simplified - real implementation would be smarter
                actual_value = None
                for col in ["col_1", "col_2", "col_3", "col_4", "col_5"]:
                    if answer.get(col) == expected_value:
                        actual_value = answer.get(col)
                        break

                # Compare values
                if actual_value is None:
                    is_correct = False
                    score_details[key] = {
                        "expected": expected_value,
                        "actual": None,
                        "match": False,
                    }
                else:
                    # Type-aware comparison
                    match = False
                    if isinstance(expected_value, (int, float)):
                        # Numeric comparison with tolerance
                        tolerance = abs(expected_value * 0.01)  # 1% tolerance
                        match = abs(actual_value - expected_value) <= tolerance
                    else:
                        # String comparison
                        match = str(actual_value).strip() == str(expected_value).strip()

                    score_details[key] = {
                        "expected": expected_value,
                        "actual": actual_value,
                        "match": match,
                    }

                    if not match:
                        is_correct = False

            if is_correct:
                correct += 1
                print(f"✓ CORRECT!")
            else:
                print(f"✗ INCORRECT")
                if verbose:
                    print(f"[DEBUG] Score details:")
                    for field, details in score_details.items():
                        expected = details.get('expected')
                        actual = details.get('actual')
                        match = details.get('match', False)
                        status = "✓" if match else "✗"
                        print(f"  {status} {field}: expected={expected}, actual={actual}")
        else:
            print(f"(No answer key - cannot score)")
        
        # Show errors if any
        if errors:
            error_count = len(errors)
            print(f"\n[ERRORS] {error_count} error(s) occurred:")
            for j, err in enumerate(errors[:5]):  # Show first 5 errors
                print(f"  {j+1}. {err[:150]}{'...' if len(err) > 150 else ''}")
            if len(errors) > 5:
                print(f"  ... and {len(errors) - 5} more errors")
        
        # Show agent answer
        if answer and any(answer.values()):
            print(f"\n[ANSWER] Agent returned:")
            for col, val in answer.items():
                if val:
                    print(f"  {col}: {val}")
        else:
            print(f"\n[ANSWER] No answer returned (empty)")

        results.append({
            "question_index": idx,
            "title": q["title"],
            "question": q["question"],
            "answer": answer,
            "expected_answers": expected,
            "is_correct": is_correct,
            "score_details": score_details,
            "errors": errors,
            "difficulty": q.get("difficulty"),
        })

    # Calculate metrics
    accuracy = correct / total_with_answers if total_with_answers > 0 else None

    eval_results = {
        "total_questions": len(questions),
        "questions_with_answers": total_with_answers,
        "correct": correct,
        "accuracy": accuracy,
        "results": results,
    }

    # Save results
    report_json = output_dir / "eval_report.json"
    with open(report_json, "w") as f:
        json.dump(eval_results, f, indent=2, default=str)

    # Generate markdown report
    report_md = output_dir / "eval_report.md"
    with open(report_md, "w") as f:
        f.write("# Evaluation Report\n\n")
        f.write(f"**Total Questions:** {len(questions)}\n")
        f.write(f"**Questions with Answers:** {total_with_answers}\n")
        if accuracy is not None:
            f.write(f"**Correct:** {correct}\n")
            f.write(f"**Accuracy:** {accuracy:.2%}\n")
        f.write("\n## Results\n\n")

        for result in results:
            f.write(f"### {result['title']}\n\n")
            f.write(f"**Question:** {result['question']}\n\n")
        if result.get("expected_answers"):
            f.write("**Expected Answers:**\n")
            expected = result["expected_answers"]
            if isinstance(expected, dict):
                for key, value in expected.items():
                    f.write(f"- {key}: {value}\n")
            else:
                f.write(f"- {expected}\n")
                f.write("\n")
            f.write("**Agent Answer:**\n")
            for col in ["col_1", "col_2", "col_3", "col_4", "col_5"]:
                if result["answer"].get(col):
                    f.write(f"- {col}: {result['answer'][col]}\n")
            f.write("\n")
            if result.get("is_correct") is not None:
                status = "✓ Correct" if result["is_correct"] else "✗ Incorrect"
                f.write(f"**Result:** {status}\n\n")
            if result.get("errors"):
                f.write("**Errors:**\n")
                for error in result["errors"]:
                    f.write(f"- {error}\n")
                f.write("\n")
            f.write("---\n\n")

    print(f"\n✓ Evaluation complete!")
    print(f"  Accuracy: {accuracy:.2%}" if accuracy else "  (No answer key available)")
    print(f"  Report saved to: {report_json}")

    return eval_results

