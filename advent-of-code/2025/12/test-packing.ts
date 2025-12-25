// Test packing algorithm on example

const example = `0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2
`

type Shape = boolean[][]

function parseShapes(input: string): Shape[] {
  const shapes: Shape[] = []
  const sections = input.split(/\n(?=\d+:)/)

  for (const section of sections) {
    const lines = section.trim().split("\n")
    if (lines.length === 0 || !lines[0].includes(":")) continue

    const shape: Shape = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        shape.push(lines[i].split("").map((c) => c === "#"))
      }
    }
    if (shape.length > 0) {
      shapes.push(shape)
    }
  }

  return shapes
}

function rotate(shape: Shape): Shape {
  const rows = shape.length
  const cols = shape[0].length
  const rotated: Shape = []

  for (let c = 0; c < cols; c++) {
    const row: boolean[] = []
    for (let r = rows - 1; r >= 0; r--) {
      row.push(shape[r][c])
    }
    rotated.push(row)
  }

  return rotated
}

function flip(shape: Shape): Shape {
  return shape.map((row) => [...row].reverse())
}

function generateVariants(shape: Shape): Shape[] {
  const variants = new Set<string>()
  const result: Shape[] = []

  function addIfNew(s: Shape) {
    const key = s
      .map((row) => row.map((b) => (b ? "#" : ".")).join(""))
      .join("\n")
    if (!variants.has(key)) {
      variants.add(key)
      result.push(s)
    }
  }

  let current = shape
  for (let i = 0; i < 4; i++) {
    addIfNew(current)
    addIfNew(flip(current))
    current = rotate(current)
  }

  return result
}

// Check if shape can be placed at (r, c) in grid
function canPlace(
  grid: boolean[][],
  shape: Shape,
  r: number,
  c: number
): boolean {
  const rows = grid.length
  const cols = grid[0].length

  for (let sr = 0; sr < shape.length; sr++) {
    for (let sc = 0; sc < shape[sr].length; sc++) {
      if (shape[sr][sc]) {
        const nr = r + sr
        const nc = c + sc
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
          return false
        }
        if (grid[nr][nc]) {
          return false
        }
      }
    }
  }
  return true
}

// Place shape at (r, c) in grid
function placeShape(
  grid: boolean[][],
  shape: Shape,
  r: number,
  c: number
): void {
  for (let sr = 0; sr < shape.length; sr++) {
    for (let sc = 0; sc < shape[sr].length; sc++) {
      if (shape[sr][sc]) {
        grid[r + sr][c + sc] = true
      }
    }
  }
}

// Remove shape at (r, c) from grid
function removeShape(
  grid: boolean[][],
  shape: Shape,
  r: number,
  c: number
): void {
  for (let sr = 0; sr < shape.length; sr++) {
    for (let sc = 0; sc < shape[sr].length; sc++) {
      if (shape[sr][sc]) {
        grid[r + sr][c + sc] = false
      }
    }
  }
}

// Try to pack all presents into a region using backtracking
function canPack(
  width: number,
  height: number,
  shapeVariants: Shape[][],
  requirements: number[]
): boolean {
  const grid: boolean[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false))

  // Create list of shape indices to place (one entry per present)
  const presents: number[] = []
  for (let shapeIdx = 0; shapeIdx < requirements.length; shapeIdx++) {
    for (let count = 0; count < requirements[shapeIdx]; count++) {
      presents.push(shapeIdx)
    }
  }

  function backtrack(presentIdx: number): boolean {
    if (presentIdx >= presents.length) {
      return true
    }

    const shapeIdx = presents[presentIdx]
    const variants = shapeVariants[shapeIdx]

    // Try each variant of this shape
    for (const variant of variants) {
      // Try placing at all valid positions
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (canPlace(grid, variant, r, c)) {
            placeShape(grid, variant, r, c)
            if (backtrack(presentIdx + 1)) {
              return true
            }
            removeShape(grid, variant, r, c)
          }
        }
      }
    }

    return false
  }

  return backtrack(0)
}

// Parse input
const parts = example.trim().split(/\n(?=\d+x\d+:)/)
const shapes = parseShapes(parts[0])
const shapeVariants = shapes.map((s) => generateVariants(s))

// Parse regions
const regions: Array<{
  width: number
  height: number
  requirements: number[]
}> = []
for (let i = 1; i < parts.length; i++) {
  const line = parts[i].trim()
  const match = line.match(/(\d+)x(\d+):\s*(.+)/)
  if (match) {
    const width = parseInt(match[1])
    const height = parseInt(match[2])
    const reqs = match[3].trim().split(/\s+/).map(Number)
    regions.push({ width, height, requirements: reqs })
  }
}

console.log(`Testing ${regions.length} regions:`)
let count = 0
for (let i = 0; i < regions.length; i++) {
  const { width, height, requirements } = regions[i]
  const can = canPack(width, height, shapeVariants, requirements)
  console.log(`Region ${i + 1} (${width}x${height}): ${can ? "YES" : "NO"}`)
  if (can) count++
}

console.log(`\nTotal regions that can fit: ${count}`)
console.log(`Expected: 2`)
