// Day 7 Part 1: Tachyon Manifold
// Simulate beam propagation and count splits

const input = await Deno.readTextFile("input.txt")
const grid = input.trim().split("\n")

// Find starting position
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

if (startRow === -1) {
  console.error("No starting position found!")
  Deno.exit(1)
}

const rows = grid.length
const cols = grid[0].length

// Track active beams: each beam has a row and column
// Use a Set to avoid duplicate beams at the same position
type Beam = { row: number; col: number }
let activeBeams = new Set<string>()
activeBeams.add(`${startRow},${startCol}`)

let splitCount = 0

// Simulate step by step
while (activeBeams.size > 0) {
  const nextBeams = new Map<string, Beam>()

  // Process all current beams
  for (const beamKey of activeBeams) {
    const [row, col] = beamKey.split(",").map(Number)

    // Move beam downward
    const nextRow = row + 1

    // Check if beam exits the grid
    if (nextRow >= rows) {
      continue // Beam exits, don't add to next generation
    }

    const nextChar = grid[nextRow][col]

    if (nextChar === ".") {
      // Beam continues through empty space
      const key = `${nextRow},${col}`
      if (!nextBeams.has(key)) {
        nextBeams.set(key, { row: nextRow, col })
      }
    } else if (nextChar === "^") {
      // Beam hits a splitter - split into left and right
      splitCount++

      // Left beam
      if (col > 0) {
        const leftKey = `${nextRow},${col - 1}`
        if (!nextBeams.has(leftKey)) {
          nextBeams.set(leftKey, { row: nextRow, col: col - 1 })
        }
      }

      // Right beam
      if (col < cols - 1) {
        const rightKey = `${nextRow},${col + 1}`
        if (!nextBeams.has(rightKey)) {
          nextBeams.set(rightKey, { row: nextRow, col: col + 1 })
        }
      }
    }
    // If nextChar is something else (like '|'), the beam stops (do nothing)
  }

  // Update active beams for next iteration
  activeBeams = new Set(nextBeams.keys())
}

console.log(`Part 1: ${splitCount}`)

// Part 2: Count timelines (distinct paths), not unique positions.
// In many-worlds, timelines do NOT merge when paths converge. We must keep multiplicities.
// Because beams only move downward, we can propagate counts row by row.

function solvePart2(): bigint {
  type ColCount = Map<number, bigint>
  let current: ColCount = new Map()
  current.set(startCol, 1n)
  let timelinesEnded = 0n

  for (let row = startRow; row < rows; row++) {
    const next: ColCount = new Map()

    for (const [col, count] of current.entries()) {
      const nextRow = row + 1

      // If leaving the grid, this timeline ends.
      if (nextRow >= rows) {
        timelinesEnded += count
        continue
      }

      const below = grid[nextRow][col]

      if (below === ".") {
        // Continue straight down
        next.set(col, (next.get(col) ?? 0n) + count)
      } else if (below === "^") {
        // Split: original stops, two new timelines start left/right
        const leftCol = col - 1
        const rightCol = col + 1

        if (leftCol >= 0) {
          next.set(leftCol, (next.get(leftCol) ?? 0n) + count)
        } else {
          // Off-grid to the left counts as ending
          timelinesEnded += count
        }

        if (rightCol < cols) {
          next.set(rightCol, (next.get(rightCol) ?? 0n) + count)
        } else {
          // Off-grid to the right counts as ending
          timelinesEnded += count
        }
      } else {
        // Any other character stops the timeline here
        timelinesEnded += count
      }
    }

    current = next
  }

  // Any timelines still in the last row have exited the grid
  for (const count of current.values()) {
    timelinesEnded += count
  }

  return timelinesEnded
}

console.log(`Part 2: ${solvePart2()}`)
