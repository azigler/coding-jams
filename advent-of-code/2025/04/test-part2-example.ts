// Test Part 2 with the example
const example = [
  "..@@.@@@@.",
  "@@@.@.@.@@",
  "@@@@@.@.@@",
  "@.@@@@..@.",
  "@@.@@@@.@@",
  ".@@@@@@@.@",
  ".@.@.@.@@@",
  "@.@@@.@@@@",
  ".@@@@@@@@.",
  "@.@.@@@.@.",
]

let grid = example.map((line) => line.split(""))
const rows = grid.length
const cols = grid[0].length

function countAdjacentRollsInGrid(
  grid: string[][],
  row: number,
  col: number
): number {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
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

let totalRemoved = 0
let removedAny = true
let iteration = 0

while (removedAny) {
  removedAny = false
  const toRemove: Array<[number, number]> = []

  // Find all accessible rolls in current state
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === "@") {
        const adjacentCount = countAdjacentRollsInGrid(grid, row, col)
        if (adjacentCount < 4) {
          toRemove.push([row, col])
        }
      }
    }
  }

  // Remove all accessible rolls at once
  if (toRemove.length > 0) {
    iteration++
    console.log(`Iteration ${iteration}: Removing ${toRemove.length} rolls`)
    for (const [row, col] of toRemove) {
      grid[row][col] = "."
      totalRemoved++
      removedAny = true
    }
  }
}

console.log(`\nTotal removed: ${totalRemoved}, expected: 43`)
console.log(`Test: ${totalRemoved === 43 ? "✓" : "✗"}`)
