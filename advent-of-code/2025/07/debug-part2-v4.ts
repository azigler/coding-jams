// Maybe "timeline" means any position that can be reached as an end state
// This includes: bottom row positions, positions where beam stops at obstacle, AND positions at splitters where a beam stops
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
// A position is an end position if: it's at the bottom, or a beam can stop there
const endPositions = new Set<string>()
const visited = new Set<string>()

function explore(row: number, col: number) {
  const key = `${row},${col}`
  if (visited.has(key)) return
  visited.add(key)
  
  let currentRow = row
  let currentCol = col
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
    } else if (nextChar === "^") {
      // Hit splitter: beam stops here (end position), two new beams start
      endPositions.add(`${nextRow},${currentCol}`)
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1)
      }
      return
    } else {
      // Hit obstacle: end position
      endPositions.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  // Bottom row: end position
  endPositions.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`End positions: ${endPositions.size}`)
console.log(`Expected: 40`)
console.log(`Positions:`, Array.from(endPositions).sort().slice(0, 20).join(", "))
