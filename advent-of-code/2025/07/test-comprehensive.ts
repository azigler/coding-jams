// Try comprehensive approach: count all positions that can be end states
// Maybe we're missing positions because we're not exploring all paths?
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

// Track all end positions - use a more comprehensive exploration
const endPositions = new Set<string>()

// Use BFS to ensure we explore all paths
const queue: Array<[number, number]> = [[startRow, startCol]]
const visited = new Set<string>()

while (queue.length > 0) {
  const [row, col] = queue.shift()!
  const key = `${row},${col}`
  
  if (visited.has(key)) continue
  visited.add(key)
  
  let currentRow = row
  let currentCol = col
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
    } else if (nextChar === "^") {
      // Hit splitter: add as end position, queue both paths
      endPositions.add(`${nextRow},${currentCol}`)
      if (currentCol > 0 && !visited.has(`${nextRow},${currentCol - 1}`)) {
        queue.push([nextRow, currentCol - 1])
      }
      if (currentCol < cols - 1 && !visited.has(`${nextRow},${currentCol + 1}`)) {
        queue.push([nextRow, currentCol + 1])
      }
      break
    } else {
      // Hit obstacle: add as end position
      endPositions.add(`${currentRow},${currentCol}`)
      break
    }
  }
  
  // If we reached bottom, add as end position
  if (currentRow + 1 >= rows) {
    endPositions.add(`${currentRow},${currentCol}`)
  }
}

console.log(`End positions: ${endPositions.size}`)
console.log(`Expected: 40`)
