// Try counting ALL positions that can be reached, not just end positions
// Maybe "timeline" means any position the particle can be at?
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

// Track ALL positions that can be reached (all timelines)
const allPositions = new Set<string>()
const memo = new Map<string, void>()

function explore(row: number, col: number) {
  const key = `${row},${col}`
  if (memo.has(key)) return
  memo.set(key, undefined)
  
  // Add this position
  allPositions.add(key)
  
  let currentRow = row
  let currentCol = col
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
      allPositions.add(`${currentRow},${currentCol}`)
    } else if (nextChar === "^") {
      // Hit splitter
      allPositions.add(`${nextRow},${currentCol}`)
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1)
      }
      return
    } else {
      allPositions.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  allPositions.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`All positions: ${allPositions.size}`)
console.log(`Expected: 40`)
