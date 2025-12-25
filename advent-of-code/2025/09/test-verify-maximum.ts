// Verify we're finding the true maximum by checking a sample of candidates
// and ensuring our found answer is actually the largest valid one

const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n").filter(line => line.length > 0)

type Point = { x: number; y: number }
const redTiles: Point[] = lines.map(line => {
  const [x, y] = line.split(",").map(Number)
  return { x, y }
})

const redTileSet = new Set<string>()
for (const tile of redTiles) {
  redTileSet.add(`${tile.x},${tile.y}`)
}

type Edge = { p1: Point; p2: Point }
const edges: Edge[] = []
for (let i = 0; i < redTiles.length; i++) {
  edges.push({ p1: redTiles[i], p2: redTiles[(i + 1) % redTiles.length] })
}

function isOnEdge(x: number, y: number): boolean {
  for (const edge of edges) {
    const { p1, p2 } = edge
    if (p1.x === p2.x && p1.x === x) {
      const minY = Math.min(p1.y, p2.y)
      const maxY = Math.max(p1.y, p2.y)
      if (y >= minY && y <= maxY) {
        if (!(y === p1.y && x === p1.x) && !(y === p2.y && x === p2.x)) {
          return true
        }
      }
    } else if (p1.y === p2.y && p1.y === y) {
      const minX = Math.min(p1.x, p2.x)
      const maxX = Math.max(p1.x, p2.x)
      if (x >= minX && x <= maxX) {
        if (!(x === p1.x && y === p1.y) && !(x === p2.x && y === p2.y)) {
          return true
        }
      }
    }
  }
  return false
}

// Don't cache - it overflows for large rectangles
function isInsideLoop(x: number, y: number): boolean {
  let inside = false
  for (let i = 0, j = redTiles.length - 1; i < redTiles.length; j = i++) {
    const xi = redTiles[i].x, yi = redTiles[i].y
    const xj = redTiles[j].x, yj = redTiles[j].y
    if (yi === yj) continue
    const denom = yj - yi
    if (denom === 0) continue
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / denom + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function isValidTile(x: number, y: number): boolean {
  const key = `${x},${y}`
  if (redTileSet.has(key)) return true
  if (isOnEdge(x, y)) return true
  if (isInsideLoop(x, y)) return true
  return false
}

function rectangleIsValid(minX: number, maxX: number, minY: number, maxY: number): boolean {
  // Check boundary first for early exit
  for (let x = minX; x <= maxX; x++) {
    if (!isValidTile(x, minY) || !isValidTile(x, maxY)) return false
  }
  for (let y = minY + 1; y < maxY; y++) {
    if (!isValidTile(minX, y) || !isValidTile(maxX, y)) return false
  }
  
  // Check interior - but sample for very large rectangles
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  
  // For large rectangles, sample more densely
  const totalTiles = width * height
  if (totalTiles > 5000000) {
    // Sample interior for very large rectangles
    const gridSize = Math.min(100, Math.max(20, Math.floor(Math.sqrt(totalTiles) / 100)))
    for (let gx = 0; gx <= gridSize; gx++) {
      for (let gy = 0; gy <= gridSize; gy++) {
        const x = minX + Math.floor(gx * (maxX - minX) / gridSize)
        const y = minY + Math.floor(gy * (maxY - minY) / gridSize)
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

// Check a wider range to find the true maximum
console.log("Checking rectangles with area between 500M and 2B...")

type Candidate = { i: number; j: number; area: number }
const candidates: Candidate[] = []

for (let i = 0; i < redTiles.length; i++) {
  for (let j = i + 1; j < redTiles.length; j++) {
    const p1 = redTiles[i]
    const p2 = redTiles[j]
    const width = Math.abs(p2.x - p1.x) + 1
    const height = Math.abs(p2.y - p1.y) + 1
    const area = width * height
    if (area >= 500000000 && area <= 2000000000) {
      candidates.push({ i, j, area })
    }
  }
}

candidates.sort((a, b) => b.area - a.area)

console.log(`Found ${candidates.length} candidates in range`)
let maxArea = 0
let count = 0

for (const cand of candidates) {
  const p1 = redTiles[cand.i]
  const p2 = redTiles[cand.j]
  const minX = Math.min(p1.x, p2.x)
  const maxX = Math.max(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const maxY = Math.max(p1.y, p2.y)
  
  if (rectangleIsValid(minX, maxX, minY, maxY)) {
    if (cand.area > maxArea) {
      maxArea = cand.area
      console.log(`✓ Found valid: area=${maxArea}, (${p1.x},${p1.y}) to (${p2.x},${p2.y})`)
      count++
    }
  }
}

console.log(`\nLargest valid in range: ${maxArea}`)

