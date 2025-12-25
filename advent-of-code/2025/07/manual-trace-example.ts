// Manually trace through the example to find all 40 end positions
// This will help us understand what we're missing

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
const rows = grid.length
const cols = grid[0].length

// Let's trace through and print all positions we visit
const allVisited = new Set<string>()
const endPositions = new Set<string>()

function explore(row: number, col: number, path: string = "") {
  const key = `${row},${col}`
  if (allVisited.has(key)) return
  allVisited.add(key)
  
  let currentRow = row
  let currentCol = col
  let currentPath = path
  
  while (currentRow + 1 < rows) {
    const nextRow = currentRow + 1
    const nextChar = grid[nextRow][currentCol]
    
    if (nextChar === ".") {
      currentRow = nextRow
      currentPath += "D"
    } else if (nextChar === "^") {
      // Hit splitter
      endPositions.add(`${nextRow},${currentCol}`)
      console.log(`End at splitter: (${nextRow},${currentCol}) path: ${currentPath}`)
      
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1, currentPath + "L")
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1, currentPath + "R")
      }
      return
    } else {
      endPositions.add(`${currentRow},${currentCol}`)
      console.log(`End at obstacle: (${currentRow},${currentCol}) path: ${currentPath}`)
      return
    }
  }
  
  endPositions.add(`${currentRow},${currentCol}`)
  console.log(`End at bottom: (${currentRow},${currentCol}) path: ${currentPath}`)
}

console.log("Tracing all paths from start (0,7):")
explore(0, 7)

console.log(`\nTotal end positions found: ${endPositions.size}`)
console.log(`Expected: 40`)
console.log(`\nAll end positions:`)
const sorted = Array.from(endPositions).sort()
for (const pos of sorted) {
  console.log(`  ${pos}`)
}
