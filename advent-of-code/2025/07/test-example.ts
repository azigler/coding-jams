// Test on the example from the challenge
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

let activeBeams = new Set<string>()
activeBeams.add(`${startRow},${startCol}`)

let splitCount = 0

while (activeBeams.size > 0) {
  const nextBeams = new Map<string, { row: number; col: number }>()
  
  for (const beamKey of activeBeams) {
    const [row, col] = beamKey.split(",").map(Number)
    const nextRow = row + 1
    
    if (nextRow >= rows) {
      continue
    }
    
    const nextChar = grid[nextRow][col]
    
    if (nextChar === ".") {
      const key = `${nextRow},${col}`
      if (!nextBeams.has(key)) {
        nextBeams.set(key, { row: nextRow, col })
      }
    } else if (nextChar === "^") {
      splitCount++
      
      if (col > 0) {
        const leftKey = `${nextRow},${col - 1}`
        if (!nextBeams.has(leftKey)) {
          nextBeams.set(leftKey, { row: nextRow, col: col - 1 })
        }
      }
      
      if (col < cols - 1) {
        const rightKey = `${nextRow},${col + 1}`
        if (!nextBeams.has(rightKey)) {
          nextBeams.set(rightKey, { row: nextRow, col: col + 1 })
        }
      }
    }
  }
  
  activeBeams = new Set(nextBeams.keys())
}

console.log(`Split count: ${splitCount}`)
console.log(`Expected: 21`)
console.log(`Match: ${splitCount === 21 ? '✓' : '✗'}`)
