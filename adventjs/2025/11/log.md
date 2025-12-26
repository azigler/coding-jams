# Challenge 11: 📹 Unwatched gifts - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `findUnsafeGifts`

Count presents (`*`) in a warehouse grid that are not adjacent to any camera (`#`). Only 4 cardinal directions (up, down, left, right) are considered adjacent, not diagonals.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Iterate through grid**: Find all presents (`*`)
2. **Check adjacent cells**: For each present, check 4 cardinal directions for cameras
3. **Count unsafe**: If no camera found in adjacent cells, increment count

### Algorithm

```javascript
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

for (each cell in grid) {
  if (cell === '*') {
    check all 4 adjacent directions
    if (no camera found) {
      unsafeCount++;
    }
  }
}
```

## Key Insights

- **4 directions only**: Up, down, left, right - not diagonals
- **Boundary checking**: Must validate array bounds before accessing adjacent cells
- **Simple iteration**: Just check each present's neighbors
- **Edge cases**: Presents at edges/corners are valid if no adjacent cameras
