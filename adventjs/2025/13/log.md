# Challenge 13: 🏭 The assembly line - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `runFactory`

Simulate a gift moving through a factory grid. The gift starts at (0,0) and follows directions in cells: `>`, `<`, `^`, `v`. Return 'completed' if it reaches `.`, 'loop' if it visits a position twice, or 'broken' if it goes outside the board.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Initialize**: Start at position (0, 0), track visited positions
2. **Simulate movement**: While true:
   - Check if current position was visited → return 'loop'
   - Mark current position as visited
   - Check boundaries → return 'broken' if out of bounds
   - Check if current cell is '.' → return 'completed'
   - Move according to direction in current cell
3. **Direction handling**: Update row/col based on `>`, `<`, `^`, `v`

### Algorithm

```javascript
let row = 0, col = 0;
const visited = new Set();

while (true) {
  if (visited.has(`${row},${col}`)) return 'loop';
  visited.add(`${row},${col}`);
  
  if (out of bounds) return 'broken';
  if (cell === '.') return 'completed';
  
  move according to direction
}
```

## Key Insights

- **Loop detection**: Use Set to track visited positions (as string "row,col")
- **Boundary checking**: Must check before accessing grid cells
- **Three outcomes**: completed (reaches '.'), loop (revisits position), broken (out of bounds)
- **Infinite loop**: The while(true) loop is safe because one of the three conditions will always be met
- **Position tracking**: String format "row,col" works well for Set membership
