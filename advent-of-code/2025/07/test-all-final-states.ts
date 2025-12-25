// Maybe we need to count ALL positions that can be "final states"
// including positions where beams are active when all journeys complete?
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

// Track all positions that can be final states
// This includes: bottom row, splitters, obstacles, AND positions where beams
// are active when all journeys complete (not just where they stop)
const finalStates = new Set<string>()
const memo = new Map<string, void>()

function explore(row: number, col: number) {
  const key = `${row},${col}`
  if (memo.has(key)) return
  memo.set(key, undefined)
  
  let currentRow = row
  let currentCol = col
  
  // Add starting position as potential final state
  finalStates.add(`${currentRow},${currentCol}`)
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
      // Add position as we pass through (maybe this counts?)
      finalStates.add(`${currentRow},${currentCol}`)
    } else if (nextChar === "^") {
      // Hit splitter: add splitter position
      finalStates.add(`${nextRow},${currentCol}`)
      // Also add left/right positions where new beams start?
      if (currentCol > 0) {
        finalStates.add(`${nextRow},${currentCol - 1}`)
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        finalStates.add(`${nextRow},${currentCol + 1}`)
        explore(nextRow, currentCol + 1)
      }
      return
    } else {
      // Hit obstacle: add current position
      finalStates.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  // Reached bottom: add final position
  finalStates.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`Final states: ${finalStates.size}`)
console.log(`Expected: 40`)
