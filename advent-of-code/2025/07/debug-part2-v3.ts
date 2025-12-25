// Try a different interpretation: count all unique positions where a timeline can "end"
// A timeline ends when: 1) reaches bottom, 2) hits a non-splitter obstacle, 3) hits a splitter (the beam stops there)
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

// Track all end positions: where timelines can end
const endPositions = new Set<string>()
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
      // Hit splitter: this timeline ends here, but two new timelines start
      endPositions.add(`${nextRow},${currentCol}`) // Splitter position is an end
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1)
      }
      return
    } else {
      // Hit something else - end position
      endPositions.add(`${currentRow},${currentCol}`)
      return
    }
  }
  
  // Reached bottom - end position
  endPositions.add(`${currentRow},${currentCol}`)
}

explore(startRow, startCol)

console.log(`End positions: ${endPositions.size}`)
console.log(`Expected: 40`)
