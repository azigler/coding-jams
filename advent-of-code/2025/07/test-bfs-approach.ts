// Try BFS approach: track all possible positions at each row
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

// Track all positions that can be end positions
// Use a map: row -> set of columns that can be end positions at that row
const endPositionsByRow = new Map<number, Set<number>>()

// Track all possible positions at each row (for BFS)
let currentRowPositions = new Set<number>()
currentRowPositions.add(startCol)

for (let row = startRow + 1; row < rows; row++) {
  const nextRowPositions = new Set<number>()
  
  // Process each position from previous row
  for (const col of currentRowPositions) {
    const char = grid[row][col]
    
    if (char === ".") {
      // Beam continues down
      nextRowPositions.add(col)
    } else if (char === "^") {
      // Splitter: beam stops here (end position), two new beams start
      if (!endPositionsByRow.has(row)) {
        endPositionsByRow.set(row, new Set())
      }
      endPositionsByRow.get(row)!.add(col)
      
      // Two new beams start at left and right
      if (col > 0) {
        nextRowPositions.add(col - 1)
      }
      if (col < cols - 1) {
        nextRowPositions.add(col + 1)
      }
    } else {
      // Obstacle: end position
      if (!endPositionsByRow.has(row - 1)) {
        endPositionsByRow.set(row - 1, new Set())
      }
      endPositionsByRow.get(row - 1)!.add(col)
    }
  }
  
  // Beams at nextRowPositions continue moving down through empty space
  // Propagate them down
  const finalPositions = new Set<number>()
  for (const col of nextRowPositions) {
    let beamRow = row
    while (beamRow + 1 < rows && grid[beamRow + 1][col] === ".") {
      beamRow++
    }
    
    if (beamRow + 1 >= rows) {
      // Reached bottom: end position
      if (!endPositionsByRow.has(beamRow)) {
        endPositionsByRow.set(beamRow, new Set())
      }
      endPositionsByRow.get(beamRow)!.add(col)
    } else {
      finalPositions.add(col)
    }
  }
  
  if (finalPositions.size === 0) break
  currentRowPositions = finalPositions
}

// Count all end positions
let total = 0
for (const [row, cols] of endPositionsByRow) {
  total += cols.size
}

console.log(`End positions: ${total}`)
console.log(`Expected: 40`)
