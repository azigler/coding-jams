// Try counting ALL positions that can be reached, not just explicit end positions
// Maybe "timeline" means any position the particle can be at when journeys complete?
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

// Track ALL positions that can be reached (all possible end states)
const allEndPositions = new Set<string>()
const memo = new Map<string, void>()

function explore(row: number, col: number) {
  const key = `${row},${col}`
  if (memo.has(key)) return
  memo.set(key, undefined)
  
  let currentRow = row
  let currentCol = col
  
  // Add starting position
  allEndPositions.add(`${currentRow},${currentCol}`)
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
      // Add position as we move through it
      allEndPositions.add(`${currentRow},${currentCol}`)
    } else if (nextChar === "^") {
      // Hit splitter: add splitter position, then explore both paths
      allEndPositions.add(`${nextRow},${currentCol}`)
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1)
      }
      return
    } else {
      // Hit obstacle: add current position
      allEndPositions.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  // Reached bottom: add final position
  allEndPositions.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`All reachable positions: ${allEndPositions.size}`)
console.log(`Expected: 40`)
