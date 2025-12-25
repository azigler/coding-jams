// Test with the example from the problem
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

const grid = example.map((line) => line.split(""))
const rows = grid.length
const cols = grid[0].length

function countAdjacentRolls(row: number, col: number): number {
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

let accessibleCount = 0
const accessiblePositions: string[] = []

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    if (grid[row][col] === "@") {
      const adjacentCount = countAdjacentRolls(row, col)
      if (adjacentCount < 4) {
        accessibleCount++
        accessiblePositions.push(`(${row},${col})`)
      }
    }
  }
}

console.log(`Accessible rolls: ${accessibleCount}, expected: 13`)
console.log(`Positions: ${accessiblePositions.join(", ")}`)
console.log(`Test: ${accessibleCount === 13 ? "✓" : "✗"}`)
