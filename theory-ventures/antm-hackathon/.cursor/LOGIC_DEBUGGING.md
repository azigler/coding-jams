# Logic Debugging Summary

## Problem Statement
The agent is successfully:
- ✅ Generating SQL queries (syntax is correct)
- ✅ Executing queries and getting results
- ✅ Extracting answers from results

But the **logic is wrong** - it's finding the wrong warehouse/category/revenue_impact.

## Example: Question 1

### Expected Answer
```json
{
  "warehouse_sk": 3,
  "category": "Electronics",
  "revenue_impact": -17958.170000000042
}
```

### Actual Answer
```json
{
  "warehouse_sk": 5,
  "category": "Children",
  "revenue_impact": 14161055.25
}
```

### Generated SQL Steps
1. ✅ Calculate October revenue for Store #5
2. ✅ Calculate November revenue for Store #5
3. ❌ Check inventory for warehouse_sk=2 (where did 2 come from?)
4. ❌ Check category='Music' (wrong category)
5. ❌ Calculate revenue_impact with wrong category

## Root Cause Analysis

### Issue 1: Step Planning Logic
The step planner doesn't understand:
- **"Inventory shortage"** means LOW inventory compared to what's needed
- Need to **compare** inventory levels between months
- Need to **link** items sold at store → warehouses that supply those items
- Need to **identify** which warehouse-category combination had the biggest impact

### Issue 2: Missing Causal Chain
The planner should trace:
```
Revenue Drop (Oct→Nov)
  ↓
Items sold at Store #5
  ↓
Warehouses that supply those items
  ↓
Inventory levels (compare Oct vs Nov)
  ↓
Identify shortages (low inventory)
  ↓
Calculate revenue impact per warehouse-category
```

### Issue 3: Wrong JOINs
- Step 3: Using warehouse_sk=2 (where did this come from?)
- Step 4: Using category='Music' (not from previous steps)
- Step 5: JOINing store_sales.store_sk to warehouse.warehouse_sk (WRONG!)

## Solutions Implemented

### 1. Enhanced Step Planner Prompts
- Added SQL syntax rules (SELECT → FROM → JOIN → WHERE)
- Added logic rules for "inventory shortage" questions
- Added causality tracing instructions
- Added explicit warnings about wrong JOINs

### 2. SQL Syntax Validation
- Added basic validation in `generate_step_sql()`
- Checks for SELECT, FROM, proper order
- Warns about JOIN in SELECT clause

### 3. Multi-Step Test Harness
- Created `scripts/test_multi_step_harness.py`
- Tests each question individually
- Shows SQL queries, results, and correctness
- Helps identify exactly where logic breaks

## Next Steps

### Immediate Fixes Needed
1. **Improve Step Planning Logic**:
   - Make step planner explicitly trace the causal chain
   - Add deterministic checks (e.g., "shortage" = inventory decreased)
   - Use previous step results correctly (don't use random values)

2. **Fix JOIN Logic**:
   - Never join store_sales.store_sk to warehouse.warehouse_sk
   - Always use inventory table as bridge
   - Verify all JOINs match schema relationships

3. **Add Deterministic Validation**:
   - Check that "shortage" queries compare inventory levels
   - Check that revenue_impact is calculated as difference
   - Validate that warehouse/category come from inventory queries

### DSPy Optimization
Once deterministic logic is correct:
1. Create training examples with correct step plans
2. Use BootstrapFewShot or MIPRO to optimize prompts
3. Validate on test questions

## Test Results

### Question 1
- **Status**: ❌ Incorrect
- **Issue**: Wrong warehouse (5 vs 3), wrong category (Children vs Electronics), wrong impact (positive vs negative)
- **Root Cause**: Step planning doesn't correctly identify shortages

### Next Questions to Test
- Question 2: "the state that has return spikes"
- Question 3: "the item that loses revenue"
- etc.

## Files Modified
- `src/modules/step_planner.py` - Enhanced prompts
- `src/agent/workflow.py` - Added SQL validation, fixed answer extraction
- `scripts/test_multi_step_harness.py` - New test harness
- `.cursor/DEVLOG.md` - Updated status

