// Day 9: Movie Theater - Largest Rectangle with Red Tiles at Opposite Corners

const input = await Deno.readTextFile("input.txt")
const lines = input
  .trim()
  .split("\n")
  .filter((line) => line.length > 0)

// Parse red tile positions
type Point = { x: number; y: number }
const redTiles: Point[] = lines.map((line) => {
  const [x, y] = line.split(",").map(Number)
  return { x, y }
})

// Find largest rectangle with red tiles at opposite corners
// For any two red tiles at (x1, y1) and (x2, y2), they form opposite corners
// Area = |x2 - x1| * |y2 - y1|
let maxArea = 0

for (let i = 0; i < redTiles.length; i++) {
  for (let j = i + 1; j < redTiles.length; j++) {
    const p1 = redTiles[i]
    const p2 = redTiles[j]

    // Calculate rectangle area (including both endpoints)
    const width = Math.abs(p2.x - p1.x) + 1
    const height = Math.abs(p2.y - p1.y) + 1
    const area = width * height

    if (area > maxArea) {
      maxArea = area
    }
  }
}

console.log(`Part 1: ${maxArea}`)

// Part 2: Rectangle must only contain red or green tiles
// Green tiles form a loop connecting consecutive red tiles, and fill the interior

// Build set of red tile positions
const redTileSet = new Set<string>()
for (const tile of redTiles) {
  redTileSet.add(`${tile.x},${tile.y}`)
}

// Store edges for perimeter checking
type Edge = { p1: Point; p2: Point }
const edges: Edge[] = []
for (let i = 0; i < redTiles.length; i++) {
  edges.push({ p1: redTiles[i], p2: redTiles[(i + 1) % redTiles.length] })
}

// Check if a point is on a perimeter edge (green)
function isOnEdge(x: number, y: number): boolean {
  for (const edge of edges) {
    const { p1, p2 } = edge
    if (p1.x === p2.x && p1.x === x) {
      // Vertical edge
      const minY = Math.min(p1.y, p2.y)
      const maxY = Math.max(p1.y, p2.y)
      if (y >= minY && y <= maxY) {
        // On the edge, but not at endpoints (those are red)
        if (!(y === p1.y && x === p1.x) && !(y === p2.y && x === p2.x)) {
          return true
        }
      }
    } else if (p1.y === p2.y && p1.y === y) {
      // Horizontal edge
      const minX = Math.min(p1.x, p2.x)
      const maxX = Math.max(p1.x, p2.x)
      if (x >= minX && x <= maxX) {
        // On the edge, but not at endpoints (those are red)
        if (!(x === p1.x && y === p1.y) && !(x === p2.x && y === p2.y)) {
          return true
        }
      }
    }
  }
  return false
}

// Use point-in-polygon (ray casting) to determine if a point is inside the loop
// Don't cache - it overflows for large rectangles
function isInsideLoop(x: number, y: number): boolean {
  let inside = false
  for (let i = 0, j = redTiles.length - 1; i < redTiles.length; j = i++) {
    const xi = redTiles[i].x,
      yi = redTiles[i].y
    const xj = redTiles[j].x,
      yj = redTiles[j].y

    // Skip horizontal edges (they don't intersect a horizontal ray)
    if (yi === yj) continue

    // Avoid division by zero
    const denom = yj - yi
    if (denom === 0) continue

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / denom + xi
    if (intersect) inside = !inside
  }
  return inside
}

// Check if a tile is valid (red or green)
function isValidTile(x: number, y: number): boolean {
  const key = `${x},${y}`
  if (redTileSet.has(key)) return true // Red tile
  if (isOnEdge(x, y)) return true // Green tile on perimeter
  if (isInsideLoop(x, y)) return true // Green tile inside loop
  return false
}

// Find largest rectangle with red corners and only red/green tiles inside
// Optimization: Check if rectangle is entirely contained in polygon
// A rectangle is valid if all corners are valid AND rectangle doesn't cross polygon boundary

function rectangleIsValid(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): boolean {
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  const totalTiles = width * height

  // Skip extremely large rectangles (unlikely to be valid and very slow)
  if (totalTiles > 2000000000) {
    return false
  }

  // Check boundary first for early exit
  for (let x = minX; x <= maxX; x++) {
    if (!isValidTile(x, minY) || !isValidTile(x, maxY)) return false
  }
  for (let y = minY + 1; y < maxY; y++) {
    if (!isValidTile(minX, y) || !isValidTile(maxX, y)) return false
  }

  // For large rectangles, use dense sampling; for small ones, check all tiles
  if (totalTiles > 5000000) {
    // Sample interior for very large rectangles
    const gridSize = Math.min(
      100,
      Math.max(20, Math.floor(Math.sqrt(totalTiles) / 100))
    )
    for (let gx = 0; gx <= gridSize; gx++) {
      for (let gy = 0; gy <= gridSize; gy++) {
        const x = minX + Math.floor((gx * (maxX - minX)) / gridSize)
        const y = minY + Math.floor((gy * (maxY - minY)) / gridSize)
        if (!isValidTile(x, y)) return false
      }
    }
  } else {
    // Check all tiles for smaller rectangles
    for (let x = minX + 1; x < maxX; x++) {
      for (let y = minY + 1; y < maxY; y++) {
        if (!isValidTile(x, y)) return false
      }
    }
  }

  return true
}

// Generate all candidates and sort by area (largest first)
// This allows us to find the answer faster and stop early
type Candidate = { i: number; j: number; area: number }
const candidates: Candidate[] = []

for (let i = 0; i < redTiles.length; i++) {
  for (let j = i + 1; j < redTiles.length; j++) {
    const p1 = redTiles[i]
    const p2 = redTiles[j]
    const width = Math.abs(p2.x - p1.x) + 1
    const height = Math.abs(p2.y - p1.y) + 1
    const area = width * height
    candidates.push({ i, j, area })
  }
}

candidates.sort((a, b) => b.area - a.area)

let maxArea2 = 0
let checked = 0

for (const cand of candidates) {
  checked++
  if (checked % 10000 === 0) {
    console.error(
      `Checked ${checked}/${candidates.length}, max: ${maxArea2}, current: ${cand.area}`
    )
  }

  // Skip if this rectangle is smaller than our current max
  if (cand.area <= maxArea2) {
    continue
  }

  const p1 = redTiles[cand.i]
  const p2 = redTiles[cand.j]
  const minX = Math.min(p1.x, p2.x)
  const maxX = Math.max(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const maxY = Math.max(p1.y, p2.y)

  if (rectangleIsValid(minX, maxX, minY, maxY)) {
    maxArea2 = cand.area
    console.error(
      `✓ Found valid rectangle: ${maxArea2} at candidate ${checked}`
    )
  }
}

console.log(`Part 2: ${maxArea2}`)
