const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")

const grid = lines.map((line) => line.split(""))
const rows = grid.length
const cols = grid[0].length

// Part 1: Count rolls accessible by forklift
// A roll is accessible if it has fewer than 4 rolls in the 8 adjacent positions
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

let accessibleCount = 0
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

console.log(`Part 1: ${accessibleCount}`)

// Part 2: Cascading removal
// Once a roll is removed, check if more become accessible
// Keep removing until no more can be removed
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

// Start with a fresh copy of the grid
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

console.log(`Part 2: ${totalRemoved}`)
