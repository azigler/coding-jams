# Challenge 14: 🗃️ Find the gift path - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `findGiftPath`

Find the path of keys through a nested object to reach a specific value. The object has at most 3 levels of depth, and each value appears only once. Return an array of keys, or empty array if value not found.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Recursive search**: Traverse the object recursively
2. **Base case**: If current value matches target, return current path
3. **Recursive case**: If current value is an object, search each property
4. **Path tracking**: Build path array as we traverse deeper
5. **Early return**: Return immediately when value is found

### Algorithm

```javascript
function search(obj, target, path) {
  if (obj === target) return path;
  if (typeof obj !== 'object' || obj === null) return null;
  
  for (each key in obj) {
    const result = search(obj[key], target, [...path, key]);
    if (result !== null) return result;
  }
  
  return null;
}
```

## Key Insights

- **Recursive DFS**: Depth-first search through nested structure
- **Path building**: Accumulate keys in path array as we go deeper
- **Type checking**: Must check if value is object before recursing
- **Null handling**: Return null for not found, convert to empty array at top level
- **Early termination**: Return immediately when target found (no need to search rest)
- **Value comparison**: Use strict equality (===) to match primitive values
