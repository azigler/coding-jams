// Day 12: Christmas Tree Farm - Pack presents into regions

const input = Deno.readTextFileSync("input.txt").trim()

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

function countCells(shape: Shape): number {
  return shape.reduce(
    (sum, row) => sum + row.reduce((s, cell) => s + (cell ? 1 : 0), 0),
    0
  )
}

function canPack(
  width: number,
  height: number,
  shapeVariants: Shape[][],
  requirements: number[]
): boolean {
  // Quick check: does total area fit?
  let totalArea = 0
  for (let i = 0; i < requirements.length; i++) {
    const cellCount = countCells(shapeVariants[i][0])
    totalArea += requirements[i] * cellCount
  }
  if (totalArea > width * height) {
    return false
  }

  const grid: boolean[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false))

  // Create presents list sorted by size (largest first) for better pruning
  type Present = { shapeIdx: number; size: number }
  const presents: Present[] = []
  for (let shapeIdx = 0; shapeIdx < requirements.length; shapeIdx++) {
    const size = countCells(shapeVariants[shapeIdx][0])
    for (let count = 0; count < requirements[shapeIdx]; count++) {
      presents.push({ shapeIdx, size })
    }
  }
  presents.sort((a, b) => b.size - a.size)

  function backtrack(presentIdx: number): boolean {
    if (presentIdx >= presents.length) {
      return true
    }

    const shapeIdx = presents[presentIdx].shapeIdx
    const variants = shapeVariants[shapeIdx]

    for (const variant of variants) {
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
const parts = input.split(/\n(?=\d+x\d+:)/)
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

let count = 0
for (let i = 0; i < regions.length; i++) {
  if ((i + 1) % 10 === 0) {
    console.error(`Processing region ${i + 1}/${regions.length}...`)
  }
  const { width, height, requirements } = regions[i]
  if (canPack(width, height, shapeVariants, requirements)) {
    count++
  }
}

console.log(`Part 1: ${count}`)

// Part 2: Narrative completion - Advent calendar is complete!
// All 24 stars collected (days 1-12, both parts)
console.log(`Part 2: COMPLETE`)
