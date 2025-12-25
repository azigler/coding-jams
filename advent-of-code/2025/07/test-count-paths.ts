// Maybe "timeline" means a unique path, not a unique end position?
// But that would be exponential... let's try counting unique (path, end_position) pairs
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

// Try counting all unique end positions, but also track if same position
// can be reached through different "timelines" (paths)
const endPositions = new Set<string>()
const pathsToEnd = new Map<string, Set<string>>() // end_pos -> set of path signatures

function explore(row: number, col: number, path: string = "") {
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
      const endKey = `${nextRow},${currentCol}`
      endPositions.add(endKey)
      if (!pathsToEnd.has(endKey)) {
        pathsToEnd.set(endKey, new Set())
      }
      pathsToEnd.get(endKey)!.add(currentPath)
      
      // Explore both paths
      if (currentCol > 0) {
        explore(nextRow, currentCol - 1, currentPath + "L")
      }
      if (currentCol < cols - 1) {
        explore(nextRow, currentCol + 1, currentPath + "R")
      }
      return
    } else {
      const endKey = `${currentRow},${currentCol}`
      endPositions.add(endKey)
      if (!pathsToEnd.has(endKey)) {
        pathsToEnd.set(endKey, new Set())
      }
      pathsToEnd.get(endKey)!.add(currentPath)
      return
    }
  }
  
  const endKey = `${currentRow},${currentCol}`
  endPositions.add(endKey)
  if (!pathsToEnd.has(endKey)) {
    pathsToEnd.set(endKey, new Set())
  }
  pathsToEnd.get(endKey)!.add(currentPath)
}

explore(startRow, startCol)

console.log(`Unique end positions: ${endPositions.size}`)
console.log(`Total paths to ends: ${Array.from(pathsToEnd.values()).reduce((sum, paths) => sum + paths.size, 0)}`)
console.log(`Expected: 40`)

// Check if maybe we need to count positions that can be reached through multiple paths differently?
let totalTimelines = 0
for (const [endPos, paths] of pathsToEnd) {
  totalTimelines += paths.size
}
console.log(`Total unique (path, end) combinations: ${totalTimelines}`)
