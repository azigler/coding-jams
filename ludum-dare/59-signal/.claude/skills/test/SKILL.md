---
description: Test creation workflow converting spec test cases into executable tests
---

# Test Creation Workflow

You are a test-writing agent. Your job is to convert a spec document's test cases
into executable tests, plus add additional edge-case and integration tests discovered
during analysis.

## Your Inputs

1. **Spec number and name** -- which spec you're writing tests for
2. **Bead ID** -- include as `Bead: <id>` in commit trailers (see `/beads` and `/commit`)
3. **Dependencies** -- which modules must exist before these tests can run

## Step 1: Load Context

### Required Reading
1. The spec document you're testing
2. Project design decisions -- especially any resolved open questions
3. The `/spec` skill -- understand the spec format

Also read the specs for any subsystems your tests depend on, so you understand
the interfaces you'll be calling.

## CRITICAL: Test Agents Write ONLY Test Files

**You must NEVER create or modify implementation source files.** Your output is
exclusively test files.

If your tests need types or functions that don't exist yet, use appropriate
placeholders for the language:
- **Rust**: `todo!()` with a clear message and `#[ignore = "needs X"]`
- **TypeScript/JS**: `it.skip('description', ...)` or `test.todo('description')`
- **Python**: `@pytest.mark.skip(reason="needs X")` or `pytest.skip()`
- **Go**: `t.Skip("needs X")`

Do NOT write stubs, scaffolding, or placeholder implementations in source files
to make tests compile. The impl agents handle all source code.

## Step 2: Extract Test Cases from Spec

Read the spec's Section 5 (Test Cases). Each test case has:
```
TEST: [name]
INPUT: [code or API call]
EXPECTED: [output or behavior]
RATIONALE: [what this tests]
```

Convert each to a test. The test should:
1. Set up the necessary state
2. Execute the operation described in INPUT
3. Assert the EXPECTED output
4. Include the RATIONALE as a doc comment

## Step 3: Add Edge Cases and Error Tests

For every spec test case, consider:
- **Boundary values**: empty collections, zero, MAX_INT, nil/null/undefined
- **Error paths**: what happens on invalid input? Does it throw or return error?
- **Concurrency** (if applicable): what if two operations run simultaneously?
- **Persistence** (if applicable): does this survive save/restore?

Add at minimum 5 additional tests beyond what the spec provides.

## Step 4: Write the Test File

### Naming Conventions

These conventions apply regardless of implementation language:

- Test function: `snake_case` matching the spec test name (or `camelCase` per language convention)
- Spec tests: direct from spec, no prefix
- Edge cases: prefix function name with `edge_`
- Error paths: prefix function name with `error_`
- Integration: prefix function name with `integration_`
- Doc comment: always include `TEST:` or `EDGE:` or `ERROR:` label

### Test Structure Example (language-agnostic pattern)

```
// Spec Test Cases
// Each maps 1:1 to a spec Section 5 test case

/// TEST: basic-create (Spec NN, Test Case 01)
/// Verifies that creating an entity returns expected fields.
test basic_create() {
    // setup
    // execute
    // assert
}

// Edge Case Tests
// Additional coverage beyond the spec

/// EDGE: empty-input
/// Tests behavior when input is empty/null.
test edge_empty_input() {
    // setup
    // execute
    // assert
}

// Error Path Tests

/// ERROR: invalid-id
/// Tests that invalid IDs produce a clear error, not a crash.
test error_invalid_id() {
    // setup
    // execute
    // assert error
}
```

### Using Placeholders for Unimplemented Dependencies

When a test depends on infrastructure not yet built, mark it as pending with a
clear reason. Use your language's native skip/pending mechanism:

```
# Rust:    #[ignore = "needs auth module"]
# JS/TS:  it.skip("needs auth module", () => { ... })
# Python:  @pytest.mark.skip(reason="needs auth module")
# Go:      t.Skip("needs auth module")
```

Tests graduate from skipped to active as dependencies are implemented.

## Step 5: Self-Review Checklist

Before committing, verify:

- [ ] Every spec test case (Section 5) has a corresponding test
- [ ] At least 5 additional edge-case/error tests beyond the spec
- [ ] Each test has a doc comment with TEST/EDGE/ERROR label and spec reference
- [ ] Tests compile/parse (even if they use placeholders/skip markers)
- [ ] Dependencies are correct (no imports from modules that don't exist yet)
- [ ] Naming follows conventions (prefixes, language-appropriate case)
- [ ] Integration tests are separated from unit tests
- [ ] **NO implementation source files were created or modified**

## Step 6: Output

Write the test file to its appropriate location per project conventions.

Commit with:
```
:white_check_mark: tests: spec NN [subsystem name]

Bead: <your-bead-id>
```
