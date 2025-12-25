// Test the updated solution on the example
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
      endPositions.add(`${nextRow},${currentCol}`)
      
      if (currentCol > 0) {
        const leftRow = nextRow
        const leftCol = currentCol - 1
        if (leftRow + 1 >= rows || grid[leftRow + 1][leftCol] !== ".") {
          endPositions.add(`${leftRow},${leftCol}`)
        }
        explore(leftRow, leftCol)
      }
      if (currentCol < cols - 1) {
        const rightRow = nextRow
        const rightCol = currentCol + 1
        if (rightRow + 1 >= rows || grid[rightRow + 1][rightCol] !== ".") {
          endPositions.add(`${rightRow},${rightCol}`)
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
