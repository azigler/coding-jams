# Challenge 15: ✏️ Drawing tables - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `drawTable`

Convert an array of objects into a formatted text table with column headers (A, B, C...), sorted by a specified field. Values must be left-aligned with proper spacing. Table has borders using `+` and `-`.

## Final Scores

### JavaScript

- ✅ Completed (6 stars, 5/5 quality)

### TypeScript

- ✅ Completed (6 stars, 5/5 quality)

### Python

- ✅ Completed (5 stars, 5/5 quality) - IMPROVED via function extraction

## Quality Optimization Journey

### Original Python Approach (4/5)

Used inline lambdas and complex comprehensions:

```python
fmt = lambda v: str(v).lower() if isinstance(v, bool) else '' if v is None else str(v)
sorted_data = sorted(data, key=lambda x: (isinstance(x[sortBy], str), x[sortBy]))
widths = [max(1, max(len(fmt(r[k])) for r in sorted_data)) for k in keys]
rows = ['| ' + ' | '.join(fmt(r[k]).ljust(w) for k, w in zip(keys, widths)) + ' |' for r in sorted_data]
```

**Issue:** Nested lambdas and complex comprehensions increased cyclomatic complexity.

### Improved Python Approach (5/5) ✨

Extracted helper functions and used `map`:

```python
def fmt(v):
    if type(v) is bool:
        return str(v).lower()
    if v is None:
        return ''
    return str(v)

def make_row(vals, ws):
    cells = map(lambda vw: vw[0].ljust(vw[1]), zip(vals, ws))
    return '| ' + ' | '.join(cells) + ' |'

rows = sorted(data, key=lambda r: (type(r[sortBy]) is str, r[sortBy]))
keys = list(data[0].keys())
ws = [max(1, *map(lambda r: len(fmt(r[k])), rows)) for k in keys]
body = [make_row([fmt(r[k]) for k in keys], ws) for r in rows]
```

### Key Refactoring Insights

1. **Extract nested lambdas into named functions**: `fmt` and `make_row` are now proper functions
2. **Use `map` instead of inline comprehensions**: `map(lambda vw: ..., zip(vals, ws))` is cleaner
3. **Prefer `type(v) is bool` over `isinstance`**: More explicit type checking
4. **Use early returns**: Replace chained ternary with if/return statements

## Key Problem-Solving Insights

- **Sorting logic**: Numbers sort before strings - use `(isinstance(val, str), val)` tuple
- **Width calculation**: Must account for header letters and all data values
- **Boolean handling**: Convert booleans to lowercase strings ("true", "false")
- **Padding**: Use `ljust()` to left-align values with proper spacing
- **Table structure**: Separator, header, separator, data rows, separator
- **Column letters**: Use `chr(65 + i)` to generate A, B, C...
- **Null/undefined**: Handle missing values by converting to empty string
