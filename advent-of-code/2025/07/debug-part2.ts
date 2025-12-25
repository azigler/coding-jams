// Debug Part 2 to understand what's happening
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

const endPositions = new Set<string>()
const memo = new Map<string, void>()
let debugCount = 0

function explore(row: number, col: number, depth: number = 0) {
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
      // Hit splitter
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1, depth + 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1, depth + 1)
      }
      return
    } else {
      endPositions.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  endPositions.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`End positions found: ${endPositions.size}`)
console.log(`End positions:`, Array.from(endPositions).sort().join(", "))
console.log(`Expected: 40`)
