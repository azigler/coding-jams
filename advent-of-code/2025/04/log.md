# Day 4: Printing Department - Solution Log

## Problem Summary

We need to optimize forklift access to paper rolls (`@`) on a grid.

### Part 1

- A forklift can access a roll if it has **fewer than 4 rolls** in the 8 adjacent positions
- Count how many rolls are accessible

### Part 2

- Once accessible rolls are removed, more rolls may become accessible
- Keep removing accessible rolls until no more can be removed
- Count the total number of rolls removed

## Key Insights

### Part 1

- For each `@` in the grid, count adjacent `@` in 8 directions
- If count < 4, the roll is accessible
- Simple grid traversal with neighbor checking

### Part 2

- Cascading removal: removing rolls changes the adjacency counts
- Need to iterate until no more rolls become accessible
- Remove all accessible rolls in each iteration (batch removal)

## Solution Approach

### Part 1

```typescript
function countAdjacentRolls(row: number, col: number): number {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue // Skip self
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (grid[nr][nc] === "@") {
          count++
        }
      }
    }
  }
  return count
}

// Count accessible rolls
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    if (grid[row][col] === "@") {
      const adjacentCount = countAdjacentRolls(row, col)
      if (adjacentCount < 4) {
        accessibleCount++
      }
    }
  }
}
```

### Part 2

```typescript
// Cascading removal
let currentGrid = grid.map((row) => [...row])
let totalRemoved = 0
let removedAny = true

while (removedAny) {
  removedAny = false
  const toRemove: Array<[number, number]> = []

  // Find all accessible rolls in current state
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (currentGrid[row][col] === "@") {
        const adjacentCount = countAdjacentRollsInGrid(currentGrid, row, col)
        if (adjacentCount < 4) {
          toRemove.push([row, col])
        }
      }
    }
  }

  // Remove all accessible rolls at once
  for (const [row, col] of toRemove) {
    currentGrid[row][col] = "."
    totalRemoved++
    removedAny = true
  }
}
```

## Test Cases

### Example Input

```
..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.
```

### Part 1 Expected Result

- 13 accessible rolls (marked with `x` in the example)

### Part 2 Expected Result

- Total of 43 rolls can be removed through cascading removal
- Process: 13 → 12 → 7 → 5 → 2 → 1 → 1 → 1 → 1 = 43 total

## Final Answers

- **Part 1:** `1363`
- **Part 2:** `8184`

## Notes

- Part 1 is straightforward grid traversal
- Part 2 requires iterative removal until convergence
- Important to remove all accessible rolls in each iteration (batch removal)
- The cascading effect means we need to keep checking until no more become accessible
