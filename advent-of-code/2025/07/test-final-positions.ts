// Try a different interpretation: count all positions where particles can be
// when all journeys are complete (final state positions)
const example = `.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`

const grid = example.trim().split("\n")

let startRow = -1
let startCol = -1
for (let r = 0; r < grid.length; r++) {
  const col = grid[r].indexOf("S")
  if (col !== -1) {
    startRow = r
    startCol = col
    break
  }
}

const rows = grid.length
const cols = grid[0].length

// Track all final positions: where particles can end up
// This includes: bottom row, splitters (where they stop), and obstacles
const finalPositions = new Set<string>()
const memo = new Map<string, void>()

function explore(row: number, col: number) {
  const key = `${row},${col}`
  if (memo.has(key)) return
  memo.set(key, undefined)
  
  let currentRow = row
  let currentCol = col
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
    } else if (nextChar === "^") {
      // Hit splitter: this position is a final position (particle stops here)
      finalPositions.add(`${nextRow},${currentCol}`)
      // Also, the left and right positions where new particles start are potential final positions
      // if they don't continue (but they do continue, so we explore them)
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1)
      }
      return
    } else {
      // Hit obstacle: final position
      finalPositions.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  // Reached bottom: final position
  finalPositions.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`Final positions: ${finalPositions.size}`)
console.log(`Expected: 40`)

// Let's also check what positions we have
const sorted = Array.from(finalPositions).sort()
console.log(`\nPositions found (${sorted.length}):`)
for (const pos of sorted) {
  console.log(`  ${pos}`)
}
