# Challenge 8: 🎁 Find the unique toy - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `findUniqueToy`

Find the first letter in a string that is not repeated (case-insensitive counting), but return the letter as it appears in the original string (preserve case). If all letters are repeated, return empty string.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Count occurrences**: First pass through string, count each letter case-insensitively
2. **Find first unique**: Second pass through string, find first character with count === 1
3. **Preserve case**: Return the character as it appears in the original string

### Algorithm

```javascript
// Count occurrences (case-insensitive)
const counts = {};
for (const char of toy) {
  const lower = char.toLowerCase();
  counts[lower] = (counts[lower] || 0) + 1;
}

// Find first unique character
for (const char of toy) {
  const lower = char.toLowerCase();
  if (counts[lower] === 1) {
    return char; // Return as it appears
  }
}

return ''; // No unique letter
```

## Key Insights

- **Two-pass algorithm**: First pass to count, second pass to find first unique
- **Case-insensitive counting**: Use `toLowerCase()` for counting, but preserve original case in return
- **Order matters**: Must iterate through original string to preserve order and case
- **Simple data structure**: Object/map to track counts by lowercase letter
- **Edge cases**: Empty string, all repeated, single character all handled correctly
