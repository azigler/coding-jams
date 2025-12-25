// Test Part 2 on the example
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

let currentPositions = new Set<number>()
currentPositions.add(startCol)

// Process row by row
for (let row = startRow + 1; row < rows; row++) {
  const nextPositions = new Set<number>()
  
  for (const col of currentPositions) {
    const char = grid[row][col]
    
    if (char === ".") {
      nextPositions.add(col)
    } else if (char === "^") {
      if (col > 0) {
        nextPositions.add(col - 1)
      }
      if (col < cols - 1) {
        nextPositions.add(col + 1)
      }
    }
  }
  
  if (nextPositions.size === 0) {
    break
  }
  
  currentPositions = nextPositions
}

console.log(`Timelines: ${currentPositions.size}`)
console.log(`Expected: 40`)
console.log(`Match: ${currentPositions.size === 40 ? '✓' : '✗'}`)
