# Challenge 10: 📨 Depth of Christmas magic - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `maxDepth`

Find the maximum nesting depth of brackets `[]` in a string. Return -1 if brackets are not properly balanced (closing before opening, extra closing, or missing closing).

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Track depth**: Use a counter that increments on `[` and decrements on `]`
2. **Track maximum**: Update max depth whenever depth increases
3. **Validate**: Return -1 if depth goes negative (closing before opening) or if depth != 0 at end (unbalanced)

### Algorithm

```javascript
let depth = 0;
let maxDepth = 0;

for (const char of s) {
  if (char === '[') {
    depth++;
    maxDepth = Math.max(maxDepth, depth);
  } else if (char === ']') {
    depth--;
    if (depth < 0) return -1; // Closing before opening
  }
}

return depth === 0 ? maxDepth : -1; // Unbalanced
```

## Key Insights

- **Simple counter**: No need for a stack, just track current depth
- **Early validation**: Return -1 immediately if depth goes negative
- **Max tracking**: Update max depth when opening brackets
- **Final check**: Must verify depth is 0 at end to ensure all brackets are closed
