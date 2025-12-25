// Key insight: when beam splits, the left/right positions where new beams start
// might also be end positions if they immediately hit something or are at bottom
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
      // Hit splitter: add splitter position
      endPositions.add(`${nextRow},${currentCol}`)
      
      // Check left position: if it's at bottom or hits something immediately, it's an end position
      if (currentCol > 0) {
        const leftRow = nextRow
        const leftCol = currentCol - 1
        // Check if left position is at bottom
        if (leftRow + 1 >= rows) {
          endPositions.add(`${leftRow},${leftCol}`)
        } else {
          // Check what's below left position
          const belowChar = grid[leftRow + 1][leftCol]
          if (belowChar !== ".") {
            // Hits something immediately - this position is an end state
            endPositions.add(`${leftRow},${leftCol}`)
          }
        }
        explore(leftRow, leftCol)
      }
      
      // Check right position similarly
      if (currentCol < cols - 1) {
        const rightRow = nextRow
        const rightCol = currentCol + 1
        if (rightRow + 1 >= rows) {
          endPositions.add(`${rightRow},${rightCol}`)
        } else {
          const belowChar = grid[rightRow + 1][rightCol]
          if (belowChar !== ".") {
            endPositions.add(`${rightRow},${rightCol}`)
          }
        }
        explore(rightRow, rightCol)
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

console.log(`End positions: ${endPositions.size}`)
console.log(`Expected: 40`)
