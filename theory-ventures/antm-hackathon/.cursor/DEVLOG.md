# Development Log

## 2024-11-15: Multi-Step Test Harness & Logic Debugging

### Created Multi-Step Test Harness

- **File**: `scripts/test_multi_step_harness.py`
- **Purpose**: Test each training question individually with full debugging output
- **Features**:
  - Parses questions from markdown file
  - Runs full workflow for each question
  - Shows SQL queries, step results, raw answers, formatted answers
  - Compares against expected answers
  - Saves results to JSON

### Fixed Answer Extraction

- **Issue**: Agent was getting data but not extracting answers correctly
- **Fix**: Updated `synthesize_answer()` to aggregate all step results into `all_steps` dictionary
- **Result**: Now correctly extracts values from all steps (warehouse_sk, category, revenue_impact)

### Enhanced Step Planner Prompts

- **Added**: SQL syntax rules (SELECT → FROM → JOIN → WHERE order)
- **Added**: Logic rules for "inventory shortage" questions
- **Added**: Causality tracing (revenue → items → inventory → warehouse)
- **Added**: Explicit warning about wrong JOINs (store_sk ≠ warehouse_sk)

### Current Problem: Logic Errors in Step Planning

**Status**: SQL syntax is correct, but logic is wrong

**Example from Question 1**:

- Expected: warehouse_sk=3, category='Electronics', revenue_impact=-17958.17
- Actual: warehouse_sk=5, category='Children', revenue_impact=14161055.25

**Root Cause**: Step planner doesn't correctly:

1. Identify which items Store #5 sells
2. Find which warehouses supply those items
3. Compare inventory levels between months to find SHORTAGES
4. Calculate revenue impact correctly

**Next Steps**:

1. Improve step planning to explicitly trace: store → items sold → warehouses → inventory comparison
2. Add deterministic logic checks (e.g., "shortage" means inventory decreased)
3. Use DSPy optimization with correct examples to train the planner

## Current Status (2025-01-XX - Initial Run)

**Last Updated**: After schema summary and planner improvements

### ✅ What's Working

- **Data Ingestion**: Parquet files successfully loaded into DuckDB (16 tables)
- **Agent Workflow**: LangGraph workflow runs end-to-end without crashes
- **Error Handling**: SQL errors are caught and repair attempts are made
- **OpenRouter Integration**: Successfully using OPENROUTER_API_KEY for LLM calls
- **Evaluation Harness**: Runs questions and generates reports
- **Multi-Round Support**: System accepts any questions file path

### ❌ Current Problems

#### 1. SQL Generation Issues (IMPROVING)

**Problem**: Planner generates SQL with various issues

- ✅ FIXED: Markdown code blocks in SQL output
- ✅ IMPROVED: Column name errors reduced (schema summary improvements working)
- ⚠️ NEW: SQL logic errors (scalar subqueries returning multiple rows)
- ⚠️ Still some column name mismatches on complex queries
- ⚠️ Doesn't consistently use table aliases correctly in all cases

**Impact**: SQL now executes more often, but logic errors prevent correct answers

**Root Cause**:

- Schema summary may be too verbose/long for LLM to parse correctly
- Planner prompt doesn't emphasize exact column name matching strongly enough
- LLM is inferring column names instead of using exact names from schema

#### 2. SQL Repair Not Effective

**Problem**: Critic module attempts repairs but often fails to fix column name issues

- Multiple retry attempts (up to 2) but still produces invalid SQL
- Error messages include "Candidate bindings" but critic doesn't use them effectively

**Impact**: Failed queries don't get repaired, leading to empty answers

#### 3. Answer Extraction Issues (PARTIALLY WORKING)

**Problem**: Even when SQL succeeds, answer formatting doesn't match expected fields

- Values are extracted from SQL results but not mapped to expected answer fields
- No logic to match SQL result columns to question-specific answer fields (warehouse_sk, category, revenue_impact, etc.)
- Example: Got `["Electronics", "270594.67", "189363.36", "81231.31"]` - category is correct but in wrong column
- Expected: `warehouse_sk=3, category="Electronics", revenue_impact=-17958.17`
- Got: category="Electronics" (correct!) but missing warehouse_sk and revenue_impact

**Impact**: Even when SQL executes successfully, answers don't match expected format
**Progress**: Category extraction working, but need proper field mapping

#### 4. Schema Summary Too Verbose

**Problem**: Schema summary includes all columns with types, making it very long

- May exceed context window or confuse LLM
- Harder for LLM to find exact column names

**Impact**: Planner struggles to use correct column names

## Next Steps to Improve

### Priority 1: Fix SQL Generation (IMMEDIATE)

#### Step 1.1: Improve Schema Summary Format

- [x] Create a more concise schema summary format
- [x] Group by table with clear prefixes
- [x] Add examples of correct column usage
- [x] Highlight common patterns (ss_prefix for store_sales, i_for item, d_ for date_dim)

#### Step 1.2: Enhance Planner Prompt

- [x] Add explicit examples of correct vs incorrect column names
- [x] Emphasize table prefix patterns (ss_, i_, d_, etc.)
- [x] Add instruction to always use table aliases
- [x] Include common mistakes to avoid
- [x] Fix markdown code block extraction from SQL output

#### Step 1.3: Add Schema Validation

- [ ] Validate generated SQL column names against actual schema before execution
- [ ] Provide better error messages with exact column name suggestions
- [ ] Pre-validate common patterns (date columns, sales columns, etc.)

#### Step 1.4: Fix SQL Logic Errors

- [ ] Handle scalar subquery errors (use aggregation or LIMIT 1)
- [ ] Improve subquery logic in planner prompt
- [ ] Add examples of correct subquery usage
- [ ] Fix subquery to return single row (use MAX, MIN, or LIMIT 1)

### Priority 2: Improve SQL Repair

#### Step 2.1: Enhance Critic with Error Context

- [ ] Parse DuckDB error messages to extract "Candidate bindings"
- [ ] Use candidate bindings in repair prompt
- [ ] Add examples of successful repairs

#### Step 2.2: Add Column Name Mapping

- [ ] Create mapping of common incorrect names to correct names
- [ ] Use mapping in repair logic
- [ ] Learn from successful repairs

### Priority 3: Fix Answer Extraction

#### Step 3.1: Improve Answer Formatting (IN PROGRESS)

- [ ] Map SQL result columns to expected answer fields based on question type
- [ ] Use LLM to extract and format answers from SQL results
- [ ] Handle multiple answer types (numeric, string, boolean, float)
- [ ] Smart column matching: match column names/values to expected fields (e.g., "Electronics" → category field)

#### Step 3.2: Add Answer Validation

- [ ] Validate answer types match expected format
- [ ] Check answer ranges/reasonable values
- [ ] Provide feedback for invalid answers

### Priority 4: Testing & Optimization

#### Step 4.1: Test on Simple Questions

- [ ] Test on questions that only need single table queries
- [ ] Verify basic SQL generation works
- [ ] Build up to complex multi-table queries

#### Step 4.2: DSPy Optimization

- [ ] Collect successful SQL examples
- [ ] Use BootstrapFewShot or MIPRO to optimize planner
- [ ] Optimize critic with error-repair examples

## Implementation Plan

### Phase 1: Quick Wins (Today)

1. ✅ Improve schema summary format - make it more concise and structured
2. ✅ Add explicit column name examples to planner prompt
3. ✅ Fix markdown code block extraction from SQL
4. ✅ Test on single question - SQL now executes (progress!)
5. [x] Fix SQL logic errors (scalar subqueries) - added to planner prompt
6. [x] Fix missing JOINs - added rule to planner prompt
7. [x] Fix SQL reserved keyword issues - added post-processing
8. ✅ Multi-step planning architecture implemented and working!
9. [ ] Improve step planning quality (more focused steps)
10. [ ] Improve answer synthesis to use all step results
11. [ ] Improve answer extraction mapping - category working, need warehouse_sk and revenue_impact

### Phase 2: Core Fixes (Next)

1. Enhance critic to use DuckDB error candidate bindings
2. Improve answer extraction to map SQL results to expected fields
3. Add better error handling and logging

### Phase 3: Optimization (Later)

1. DSPy optimization with training examples
2. Add answer validation
3. Performance tuning

## Metrics to Track

- SQL generation success rate (queries that execute without errors)
- SQL repair success rate (failed queries that get fixed)
- Answer accuracy (correct answers / total questions)
- Average retry count per question
- Time per question

## Notes

- Current accuracy: 0% (0/1 question tested) - but partial matches!
- Progress: SQL execution errors reduced (column names improving)
- Progress: Got correct category "Electronics" but wrong column mapping
- ✅ MAJOR PROGRESS: SQL now executing without errors! (fixed reserved keywords, JOINs, column names, string literals)
- ⚠️ **CURRENT BLOCKER**: SQL logic is wrong - returns 0 rows because query is too complex
- **INSIGHT**: Need step-by-step reasoning, not one complex query
- **NEW STRATEGY**: Use MCP server for SQL execution - may handle complex queries better than direct DuckDB
- ✅ **IMPLEMENTED & WORKING**: Multi-step SQL planning architecture
  - Added `StepPlannerModule` to break questions into steps
  - Modified workflow to support iterative step execution
  - Added validation between steps
  - Graph now supports: plan_steps → generate_step_sql → execute → validate → (next_step | synthesize)
  - **TESTED**: Successfully breaks questions into steps and executes them sequentially
  - Steps are executing and returning results!
  
- ✅ **FIXED**: Multi-hop reasoning - previous step results now properly used
  - Previous results now include actual values (not just structure)
  - Added placeholder replacement: [variable] → actual values
  - Improved prompt to explicitly tell LLM to use actual values
  - Steps can now reference data from previous steps correctly
  - **TESTED**: Complex question breaks into 6 steps, steps execute with data flowing between them

- ✅ **ADDED**: Schema/Field Matching for messy enterprise data
  - Added `SchemaMatcherModule` to intelligently match fields when queries fail
  - Handles typos, language mismatches (e.g., "moy" vs "month")
  - Model intuits mappings rather than prescriptive list
  - Triggers automatically on column/table not found errors
  - Applied before regular SQL repair

- ✅ **IMPROVED**: Answer Synthesis & Extraction Mapping
  - Now combines ALL step results, not just last step
  - Added `ExtractionModule` to intelligently map fields using LLM
  - LLM intuits field mappings from messy data (warehouse_sk, category, revenue_impact, etc.)
  - Flexible fallback matching for common field name variations
  - Handles fragmented schemas across steps
  - **TESTED**: Getting values from steps (e.g., '74329.95' from revenue data)

- ✅ **COMPLETED**: MCP Server Integration
  - Added `MCPClient` for accessing hackathon dataset via MCP server
  - MCP Server: <https://antm-hack-example.fastmcp.app/mcp>
  - Provides direct MotherDuck access which may handle SQL execution better
  - Automatic fallback to DuckDB if MCP unavailable
  - Integrated into workflow: tries MCP first, falls back to DuckDB on error
  - **IMPLEMENTED**: JSON-RPC 2.0 protocol with SSE (Server-Sent Events) parsing
  - **TOOLS**: `query` (execute SQL), `show_tables` (list tables), `get_guide` (SQL syntax)
  - **TESTED**: MCP client working - can list tables (33 tables) and execute queries
  - **BENEFIT**: MCP server provides better error messages with "Candidate bindings" for column errors
  - **ENHANCED**: Schema matcher now extracts candidate bindings from MCP errors automatically
  - **STATUS**: Fully functional, integrated into agent workflow, actively being used
- OpenRouter API working correctly
- DuckDB connection and data loading working correctly
- Some SQL repairs are succeeding (getting numeric values) but answer extraction is wrong

## SOBER ASSESSMENT

**Are we making real progress or just trying random things?**

### What We've Actually Fixed

1. ✅ **Surface-level syntax errors** - markdown code blocks, reserved keywords, missing JOINs
   - These were real bugs that needed fixing
   - But they're symptoms, not root causes

2. ✅ **SQL execution** - queries now run without syntax errors
   - This is real progress
   - But we don't know if the SQL is logically correct

### What We DON'T Know Yet

1. ❓ **Is the SQL actually correct?** - We fixed syntax, but is the logic right?
2. ❓ **Are we getting results?** - SQL runs, but does it return the right data?
3. ❓ **Is the answer extraction broken?** - Or is SQL returning empty/wrong results?

### Better Approach

Instead of adding more prompt rules, we should:

1. **Inspect actual SQL being generated** - see what the LLM is producing
2. **Check if SQL returns results** - verify data is coming back
3. **Test on simpler questions first** - validate basic SQL generation works
4. **Use few-shot examples** - show the LLM correct SQL patterns instead of just rules
5. **Consider DSPy optimization** - BootstrapFewShot with successful examples

### Recommendation

**Pause adding more rules. Instead:**

1. ✅ Debug what SQL is actually being generated - DONE
2. ✅ Test if that SQL returns correct results manually - DONE
3. **Findings:**
   - SQL uses double quotes `"5"` instead of single quotes `'5'` - DuckDB requires single quotes
   - SQL uses `s_store_id = '5'` but should use `ss_store_sk = 5` (numeric)
   - Data exists! Store 5 has revenue data in Oct/Nov 2022
   - SQL logic is overly complex - trying to join inventory incorrectly
4. **Next steps:**
   - ✅ Fix string literal handling (double → single quotes) - DONE
   - ⚠️ SQL still returns 0 rows - the query logic is wrong
   - **ROOT CAUSE**: Planner is trying to solve entire complex question in one query
   - **SOLUTION**: Implement step-by-step reasoning:
     1. Step 1: Get revenue for Store 5 in Oct/Nov 2022 (simple query, validate data exists)
     2. Step 2: Find categories with revenue drops
     3. Step 3: Find warehouses that supply those categories to Store 5
     4. Step 4: Calculate impact
   - Add data validation: check if queries return results before proceeding
   - Handle messy data: add fallback logic when primary lookups fail
   - Use few-shot examples: show correct simple query patterns first

## Recent Changes

### 2025-01-XX - Initial Implementation

- ✅ Created complete agent structure
- ✅ Integrated OpenRouter support
- ✅ Fixed schema summary to include column types
- ✅ Improved planner and critic prompts with explicit column name instructions
- ✅ Enhanced repair function to include more error context
- ✅ Improved schema summary format with column naming rules
- ✅ Enhanced planner prompt with explicit rules and examples
- ✅ Fixed SQL extraction to remove markdown code blocks
- ✅ Fixed markdown code block extraction issue
- ✅ Progress: SQL is now executing (no more column name errors on first try!)
- ✅ Progress: Got correct category "Electronics" in results!
- ⚠️ New issue: SQL logic errors (scalar subquery returning multiple rows) - improved in prompt
- ⚠️ NEW: Missing JOINs - planner references tables (e.g., `i.i_category`) but doesn't JOIN them - improved in prompt
- ✅ Fixed SQL reserved keyword "is" used as alias - fixed with post-processing
- ✅ Fixed string literal handling (double → single quotes)
- ✅ SQL now executing without errors! (no syntax errors, no missing JOINs)
- ⚠️ **NEW PROBLEM**: SQL returns 0 rows - query logic is wrong
- ⚠️ **ROOT CAUSE**: Planner tries to solve entire complex question in one query
- ⚠️ **SOLUTION NEEDED**: Step-by-step reasoning - break into simple queries, validate, then build
- ⚠️ Still need to fix answer extraction mapping (category correct but in wrong column)
