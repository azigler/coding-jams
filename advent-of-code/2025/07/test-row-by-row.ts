// Try row-by-row BFS: track all possible positions at each row
// Count all positions that can be "active" when all journeys complete
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

// Track all positions that can be final states row by row
const finalStates = new Set<string>()

// Process row by row, tracking all possible positions
let currentPositions = new Set<number>()
currentPositions.add(startCol)

for (let row = startRow + 1; row < rows; row++) {
  const nextPositions = new Set<number>()
  
  for (const col of currentPositions) {
    const char = grid[row][col]
    
    if (char === ".") {
      nextPositions.add(col)
    } else if (char === "^") {
      // Splitter: add splitter position and left/right positions
      finalStates.add(`${row},${col}`)
      if (col > 0) {
        finalStates.add(`${row},${col - 1}`)
        nextPositions.add(col - 1)
      }
      if (col < cols - 1) {
        finalStates.add(`${row},${col + 1}`)
        nextPositions.add(col + 1)
      }
    } else {
      // Obstacle: add current position
      finalStates.add(`${row - 1},${col}`)
    }
  }
  
  // Propagate beams through empty space
  const propagated = new Set<number>()
  for (const col of nextPositions) {
    let beamRow = row
    while (beamRow + 1 < rows && grid[beamRow + 1][col] === ".") {
      beamRow++
    }
    if (beamRow + 1 >= rows) {
      finalStates.add(`${beamRow},${col}`)
    } else {
      propagated.add(col)
    }
  }
  
  if (propagated.size === 0) break
  currentPositions = propagated
}

// Add any remaining positions at bottom
for (const col of currentPositions) {
  finalStates.add(`${rows - 1},${col}`)
}

console.log(`Final states: ${finalStates.size}`)
console.log(`Expected: 40`)
