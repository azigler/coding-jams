# Using Examples Instead of Rules

## What We Changed

### Before (Wrong Approach)
- Added 50+ rules to prompts
- Built repair tools to fix errors after they happen
- Never used the correct SQL we found manually
- Used `ChainOfThought` without examples

### After (Right Approach)
- Use correct SQL from manual traces as **examples**
- Show LLM what correct SQL looks like
- Use `ChainOfThought` with examples in `demos` attribute
- Examples teach better than rules

## Implementation

### Step Planner Example
```python
example = dspy.Example(
    schema_summary="Database with inventory, warehouse, item, date_dim tables...",
    question="Find inventory shortages...",
    step_description="Compare inventory levels by warehouse and category...",
    previous_results="",
    sql="""WITH oct_inv AS (
    SELECT w.w_warehouse_sk, i.i_category, SUM(inv.inv_quantity_on_hand) as oct_qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    ...
    """
)

self.sql_program = dspy.ChainOfThought(signature=StepSQLSignature)
self.sql_program.predict.lm = self.lm
self.sql_program.predict.demos = [example]  # Add example
```

## Key Insight

**Examples > Rules**

The LLM learns better from seeing correct SQL patterns than from reading rules about SQL.

## Next Steps

1. Add more examples from other questions
2. Use DSPy teleprompt optimization to automatically find best examples
3. Test if examples improve SQL generation quality

