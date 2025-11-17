#!/usr/bin/env python3
"""Run evaluation on questions."""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from eval.harness import run_eval
from eval.submission import generate_submission


def main():
    """Main evaluation function."""
    parser = argparse.ArgumentParser(description="Run evaluation on questions")
    parser.add_argument(
        "--round",
        type=str,
        help="Path to questions file (e.g., rounds/training-questions.md)",
    )
    parser.add_argument(
        "--questions",
        type=str,
        help="Path to questions file (alias for --round)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="submissions/",
        help="Output directory (default: submissions/)",
    )
    parser.add_argument(
        "--generate-submission",
        action="store_true",
        help="Generate submission CSV file",
    )
    parser.add_argument(
        "--max-questions",
        type=int,
        default=None,
        help="Maximum number of questions to evaluate",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose debug output",
    )

    args = parser.parse_args()

    # Determine questions file
    if args.round:
        questions_file = Path(args.round)
    elif args.questions:
        questions_file = Path(args.questions)
    else:
        # Default to training questions
        project_root = Path(__file__).resolve().parents[2]
        questions_file = project_root.parent / "rounds" / "training-questions.md"

    if not questions_file.exists():
        print(f"Error: Questions file not found: {questions_file}")
        return

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Run evaluation
    print(f"Running evaluation on: {questions_file}")
    eval_results = run_eval(questions_file, output_dir, max_questions=args.max_questions, verbose=args.verbose)

    # Generate submission CSV if requested
    if args.generate_submission:
        submission_path = output_dir / "submission.csv"
        generate_submission(questions_file, submission_path, max_questions=args.max_questions)

    # Print summary
    print("\n=== Summary ===")
    print(f"Total questions: {eval_results['total_questions']}")
    if eval_results.get("accuracy") is not None:
        print(f"Accuracy: {eval_results['accuracy']:.2%}")
        print(f"Correct: {eval_results['correct']}/{eval_results['questions_with_answers']}")


if __name__ == "__main__":
    main()

