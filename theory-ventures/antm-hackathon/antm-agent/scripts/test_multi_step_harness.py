#!/usr/bin/env python3
"""Multi-step test harness to debug logic for each training question."""

import sys
import json
from pathlib import Path
from typing import Dict, Any, List

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.agent.workflow import build_workflow
from src.agent.state import AgentState
from src.data.mcp_client import get_mcp_client
from src.data.duckdb_client import DuckDBClient


def parse_questions_file(questions_file: Path) -> List[Dict[str, Any]]:
    """Parse questions from markdown file."""
    questions = []
    current_q = None
    in_json = False
    json_lines = []
    
    with open(questions_file, 'r') as f:
        content = f.read()
    
    # Split by question headers
    sections = content.split('## ')
    
    for section in sections[1:]:  # Skip first empty section
        lines = section.split('\n')
        title = lines[0].strip()
        
        # Find question and observations
        question_text = ""
        observations_text = ""
        in_question = False
        in_observations = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line.startswith('**Question:**'):
                in_question = True
                question_text = line.replace('**Question:**', '').strip()
            elif line.startswith('**Observations:**'):
                in_observations = True
                in_question = False
            elif in_question and line and not line.startswith('**'):
                if question_text:
                    question_text += " " + line
                else:
                    question_text = line
            elif in_observations and line.startswith('```json'):
                # Start of JSON block
                json_lines = []
            elif in_observations and line.startswith('```'):
                # End of JSON block
                if json_lines:
                    try:
                        json_text = '\n'.join(json_lines)
                        expected = json.loads(json_text)
                        # Remove question field from expected (it's redundant)
                        expected.pop('question', None)
                        expected.pop('difficulty', None)
                    except:
                        expected = {}
                else:
                    expected = {}
            elif in_observations and json_lines is not None:
                json_lines.append(line)
        
        if question_text:
            questions.append({
                "id": len(questions) + 1,
                "question": question_text,
                "expected": expected if 'expected' in locals() else {}
            })
    
    return questions


def test_question(question_data: Dict[str, Any], verbose: bool = True) -> Dict[str, Any]:
    """Test a single question through the full workflow."""
    question = question_data["question"]
    expected = question_data.get("expected", {})
    q_id = question_data.get("id", 0)
    
    print(f"\n{'='*80}")
    print(f"TESTING QUESTION {q_id}")
    print(f"{'='*80}")
    print(f"Question: {question}")
    print(f"Expected: {expected}")
    
    # Build workflow
    workflow = build_workflow()
    
    # Initialize state
    state: AgentState = {
        "question": question,
        "needs_sql": True,
        "needs_pdfs": False,
        "sql_query": None,
        "sql_result": None,
        "sql_columns": None,
        "sql_error": None,
        "retry_count": 0,
        "pdf_context": [],
        "raw_answer": {},
        "answer": {},
        "step": "start",
        "errors": [],
        "metadata": {},
        "sql_steps": None,
        "current_step_index": 0,
        "step_results": [],
        "step_plan": None,
    }
    
    # Run workflow
    try:
        final_state = workflow.invoke(state)
        
        # Extract results
        result = {
            "question_id": q_id,
            "question": question,
            "expected": expected,
            "raw_answer": final_state.get("raw_answer", {}),
            "formatted_answer": final_state.get("answer", {}),
            "errors": final_state.get("errors", []),
            "step_results": final_state.get("step_results", []),
            "sql_steps": final_state.get("sql_steps", []),
        }
        
        # Check correctness
        if expected:
            result["correctness"] = {}
            all_correct = True
            
            for key, expected_val in expected.items():
                # Try to find in formatted answer
                actual_val = None
                
                # Check formatted answer columns
                formatted = final_state.get("answer", {})
                for col in ["col_1", "col_2", "col_3", "col_4", "col_5"]:
                    val = formatted.get(col, "")
                    if val:
                        # Try to match
                        try:
                            if isinstance(expected_val, (int, float)):
                                actual_val = float(val)
                            else:
                                actual_val = str(val)
                        except:
                            actual_val = str(val)
                        
                        # Check if matches
                        if isinstance(expected_val, (int, float)) and isinstance(actual_val, (int, float)):
                            if abs(actual_val - expected_val) < 0.01:  # Float tolerance
                                result["correctness"][key] = True
                                break
                        elif str(actual_val).lower() == str(expected_val).lower():
                            result["correctness"][key] = True
                            break
                
                # Also check raw_answer
                if key not in result["correctness"] or not result["correctness"][key]:
                    raw = final_state.get("raw_answer", {})
                    all_steps = raw.get("all_steps", {})
                    
                    # Try various field name variations
                    field_variations = [
                        key,
                        key.lower(),
                        f"step_5_{key}",
                        f"step_4_{key}",
                        f"step_3_{key}",
                    ]
                    
                    for field_var in field_variations:
                        if field_var in all_steps:
                            actual_val = all_steps[field_var]
                            # Check match
                            if isinstance(expected_val, (int, float)) and isinstance(actual_val, (int, float)):
                                if abs(actual_val - expected_val) < 0.01:
                                    result["correctness"][key] = True
                                    break
                            elif str(actual_val).lower() == str(expected_val).lower():
                                result["correctness"][key] = True
                                break
                
                if key not in result["correctness"]:
                    result["correctness"][key] = False
                    all_correct = False
            
            result["all_correct"] = all_correct
        
        # Print results
        if verbose:
            print(f"\n[RAW ANSWER]")
            print(json.dumps(result["raw_answer"], indent=2, default=str))
            
            print(f"\n[FORMATTED ANSWER]")
            print(json.dumps(result["formatted_answer"], indent=2))
            
            if result.get("correctness"):
                print(f"\n[CORRECTNESS]")
                for key, is_correct in result["correctness"].items():
                    status = "✓" if is_correct else "✗"
                    print(f"  {status} {key}: expected={expected.get(key)}, actual={result['formatted_answer']}")
            
            if result["errors"]:
                print(f"\n[ERRORS]")
                for err in result["errors"]:
                    print(f"  - {err}")
            
            print(f"\n[STEP RESULTS]")
            for i, step_result in enumerate(result["step_results"]):
                print(f"  Step {i+1}: {step_result.get('row_count', 0)} rows")
                if step_result.get("columns"):
                    print(f"    Columns: {', '.join(step_result['columns'][:5])}")
                if step_result.get("result") and len(step_result["result"]) > 0:
                    print(f"    First row: {step_result['result'][0][:3]}")
            
            print(f"\n[SQL STEPS]")
            for i, step in enumerate(result.get("sql_steps", [])):
                print(f"  Step {i+1}: {step.get('description', '')[:80]}")
            
            print(f"\n[SQL QUERIES]")
            for i, step_result in enumerate(result["step_results"]):
                if step_result.get("sql_query"):
                    sql = step_result["sql_query"]
                    print(f"\n  Step {i+1} SQL (full):")
                    print(f"    {sql}")
                elif step_result.get("sql_error"):
                    print(f"\n  Step {i+1} ERROR: {step_result.get('sql_error', 'Unknown error')[:200]}")
        
        return result
        
    except Exception as e:
        print(f"\n[ERROR] Workflow failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            "question_id": q_id,
            "question": question,
            "error": str(e),
            "correctness": {},
            "all_correct": False,
        }


def main():
    """Run multi-step test harness."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test multi-step questions")
    parser.add_argument("--questions", type=str, default="../rounds/training-questions.md",
                       help="Path to questions file")
    parser.add_argument("--max-questions", type=int, default=None,
                       help="Maximum number of questions to test")
    parser.add_argument("--verbose", action="store_true",
                       help="Verbose output")
    parser.add_argument("--output", type=str, default="data/test_results.json",
                       help="Output file for results")
    
    args = parser.parse_args()
    
    questions_file = Path(args.questions)
    if not questions_file.exists():
        print(f"Error: Questions file not found: {questions_file}")
        return
    
    # Parse questions
    questions = parse_questions_file(questions_file)
    
    if args.max_questions:
        questions = questions[:args.max_questions]
    
    print(f"Found {len(questions)} questions to test")
    
    # Test each question
    results = []
    for q_data in questions:
        result = test_question(q_data, verbose=args.verbose)
        results.append(result)
    
    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    
    total = len(results)
    correct = sum(1 for r in results if r.get("all_correct", False))
    print(f"Total questions: {total}")
    print(f"Correct: {correct}")
    print(f"Accuracy: {correct/total*100:.1f}%")
    
    # Save results
    output_file = Path(args.output)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nResults saved to: {output_file}")


if __name__ == '__main__':
    main()

