# Challenge 18: 🎄 Lights in line with diagonals - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `hasFourInARow`

Extension of Challenge 17 - now also check diagonals (↘ and ↙) for 4 consecutive lights of the same color. Check horizontal, vertical, and both diagonal directions.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 4/5 quality) - Complexity 70, needs diagonal optimization

### TypeScript

- ✅ Completed (6 stars, 3/5 quality) - Complexity 60, needs refactoring

### Python

- ✅ Completed (6 stars, 3/5 quality) - Complexity 60, needs refactoring

## Approach

1. **Use helper function**: `checkLine` to check if any sequence has 4 consecutive same-color lights
2. **Use direction vectors**: `getLine` helper to extract cells in a given direction
3. **Check all directions**: Horizontal, vertical, and both diagonals from starting points
4. **Early return**: Return true as soon as 4 consecutive found

### Algorithm

```javascript
const checkLine = (cells) => {
  let count = 0, color = null;
  for (const cell of cells) {
    if (cell === '.') count = 0, color = null;
    else if (cell === color) count++;
    else count = 1, color = cell;
    if (count >= 4) return true;
  }
  return false;
};

// Check horizontal, vertical, and diagonals from starting points
```

## Key Insights

- **Diagonal complexity**: Checking diagonals inherently adds complexity - need to check from multiple starting points
- **Helper functions**: Using `getLine` and `checkLine` reduces repetition but still has multiple loops
- **Starting points**: For ↘ diagonal, start from left edge (r, 0) and top edge (0, c>0). For ↙, start from right edge (r, cols-1) and top edge (0, c<cols-1)
- **Complexity trade-off**: Some problems (like grid traversal with multiple directions) have inherent complexity that's hard to reduce below 4/5
- **Pattern**: Using direction vectors (dr, dc) makes code more maintainable but doesn't always reduce cyclomatic complexity score
