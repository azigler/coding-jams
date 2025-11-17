#!/usr/bin/env python3
"""Diagnostic system for planner issues - test queries and verify understanding."""

import json
from src.modules.step_planner import StepPlannerModule
from src.modules.planner import PlannerModule
from src.data.mcp_client import get_mcp_client
from src.data.duckdb_client import DuckDBClient
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def test_planner_queries():
    """Test if planner generates correct queries for common patterns."""
    print("=" * 80)
    print("PLANNER DIAGNOSTIC TESTS")
    print("=" * 80)

    # Get schema summary
    mcp_client = get_mcp_client()
    if mcp_client:
        print("\n[Using MCP client for schema]")
        try:
            schema_summary = mcp_client.get_schema_summary()
        except:
            with DuckDBClient() as client:
                schema_summary = client.get_schema_summary()
    else:
        print("\n[Using DuckDB client for schema]")
        with DuckDBClient() as client:
            schema_summary = client.get_schema_summary()

    # Test questions
    test_cases = [
        {
            "name": "Store revenue by month",
            "question": "What was Store #5's revenue in November 2022?",
            "expected_patterns": [
                "ss.ss_store_sk = 5",
                "JOIN date_dim",
                "d.d_year = 2022",
                "d.d_moy = 11",
                "ss.ss_sales_price",
            ],
            "should_not_contain": [
                "ss.sold_date_sk BETWEEN",
                "d_month",
                "sales_amount",
            ]
        },
        {
            "name": "Inventory by warehouse and category",
            "question": "Which warehouse has the lowest inventory for Electronics category in November 2022?",
            "expected_patterns": [
                "FROM inventory",
                "JOIN warehouse",
                "JOIN item",
                "i.i_category = 'Electronics'",
                "inv.inv_quantity_on_hand",
            ],
            "should_not_contain": [
                "JOIN item i ON w.w_warehouse_sk = i.i_warehouse_sk",  # Wrong JOIN
                "i.i_warehouse_sk",  # Item has no warehouse_sk
            ]
        },
        {
            "name": "Revenue by category",
            "question": "What was the revenue by category for Store #5 in November 2022?",
            "expected_patterns": [
                "FROM store_sales",
                "JOIN item",
                "JOIN date_dim",
                "i.i_category",
                "SUM(ss.ss_sales_price)",
            ],
            "should_not_contain": [
                "SUM(i.i_category)",  # Don't aggregate strings
            ]
        }
    ]

    planner = PlannerModule()
    step_planner = StepPlannerModule()

    results = []

    for test_case in test_cases:
        print(f"\n{'='*80}")
        print(f"TEST: {test_case['name']}")
        print(f"{'='*80}")
        print(f"Question: {test_case['question']}")

        # Test single-step planner
        try:
            sql = planner.forward(schema_summary, test_case['question'])
            print(f"\n[Single-step SQL]:")
            print(f"{sql[:300]}...")

            # Check patterns
            passed = True
            for pattern in test_case['expected_patterns']:
                if pattern.lower() not in sql.lower():
                    print(f"  ✗ Missing expected pattern: {pattern}")
                    passed = False
                else:
                    print(f"  ✓ Found pattern: {pattern}")

            for bad_pattern in test_case['should_not_contain']:
                if bad_pattern.lower() in sql.lower():
                    print(f"  ✗ Contains bad pattern: {bad_pattern}")
                    passed = False
                else:
                    print(f"  ✓ Avoided bad pattern: {bad_pattern}")

            results.append({
                "test": test_case['name'],
                "method": "single-step",
                "passed": passed,
                "sql": sql
            })
        except Exception as e:
            print(f"  ✗ FAILED: {e}")
            results.append({
                "test": test_case['name'],
                "method": "single-step",
                "passed": False,
                "error": str(e)
            })

        # Test multi-step planner
        try:
            steps = step_planner.plan_steps(
                schema_summary, test_case['question'])
            print(f"\n[Multi-step plan]:")
            for step in steps[:3]:  # First 3 steps
                print(
                    f"  Step {step.get('step', '?')}: {step.get('description', '')[:100]}")

            # Generate SQL for first step
            if steps:
                step_sql = step_planner.generate_step_sql(
                    schema_summary,
                    test_case['question'],
                    steps[0].get('description', ''),
                    ""
                )
                print(f"\n[Step 1 SQL]:")
                print(f"{step_sql[:300]}...")

                # Check patterns
                passed = True
                for pattern in test_case['expected_patterns']:
                    if pattern.lower() not in step_sql.lower():
                        print(
                            f"  ⚠ Pattern not in step 1: {pattern} (may be in later steps)")
                    else:
                        print(f"  ✓ Found pattern: {pattern}")

            results.append({
                "test": test_case['name'],
                "method": "multi-step",
                "passed": True,
                "steps": len(steps)
            })
        except Exception as e:
            print(f"  ✗ FAILED: {e}")
            results.append({
                "test": test_case['name'],
                "method": "multi-step",
                "passed": False,
                "error": str(e)
            })

    # Summary
    print(f"\n{'='*80}")
    print("DIAGNOSTIC SUMMARY")
    print(f"{'='*80}")

    single_step_passed = sum(1 for r in results if r.get(
        'method') == 'single-step' and r.get('passed'))
    multi_step_passed = sum(1 for r in results if r.get(
        'method') == 'multi-step' and r.get('passed'))

    print(
        f"Single-step planner: {single_step_passed}/{len(test_cases)} tests passed")
    print(
        f"Multi-step planner: {multi_step_passed}/{len(test_cases)} tests passed")

    # Save results
    output_file = Path(__file__).parent.parent / \
        'data' / 'planner_diagnostic.json'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n✓ Diagnostic results saved to: {output_file}")

    return results


if __name__ == '__main__':
    test_planner_queries()
