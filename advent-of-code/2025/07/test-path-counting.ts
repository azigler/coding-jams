// Try counting unique paths (sequences of choices) that lead to end positions
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

// Count unique end positions reachable through any path
// Use DFS with memoization to avoid infinite loops
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
      // Hit splitter: end position, explore both paths
      endPositions.add(`${nextRow},${currentCol}`)
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1)
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1)
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

// Maybe I need to also count positions where beams are "active"?
// Or maybe count all positions that can be reached as intermediate states?
