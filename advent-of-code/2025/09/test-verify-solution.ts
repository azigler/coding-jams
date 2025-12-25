// Test to verify the solution's found rectangle is actually valid
// This helps debug why we're getting wrong answers

const input = await Deno.readTextFile("input.txt")
const lines = input
  .trim()
  .split("\n")
  .filter((line) => line.length > 0)

type Point = { x: number; y: number }
const redTiles: Point[] = lines.map((line) => {
  const [x, y] = line.split(",").map(Number)
  return { x, y }
})

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

// Point-in-polygon (ray casting)
const insideCache = new Map<string, boolean>()
function isInsideLoop(x: number, y: number): boolean {
  const key = `${x},${y}`
  if (insideCache.has(key)) {
    return insideCache.get(key)!
  }

  let inside = false
  for (let i = 0, j = redTiles.length - 1; i < redTiles.length; j = i++) {
    const xi = redTiles[i].x,
      yi = redTiles[i].y
    const xj = redTiles[j].x,
      yj = redTiles[j].y

    if (yi === yj) continue

    const denom = yj - yi
    if (denom === 0) continue

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / denom + xi
    if (intersect) inside = !inside
  }

  insideCache.set(key, inside)
  return inside
}

// Check if a tile is valid (red or green)
function isValidTile(x: number, y: number): boolean {
  const key = `${x},${y}`
  if (redTileSet.has(key)) return true
  if (isOnEdge(x, y)) return true
  if (isInsideLoop(x, y)) return true
  return false
}

function rectangleIsValid(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): boolean {
  const width = maxX - minX + 1
  const height = maxY - minY + 1

  // Check boundary first
  for (let x = minX; x <= maxX; x++) {
    if (!isValidTile(x, minY) || !isValidTile(x, maxY)) return false
  }
  for (let y = minY + 1; y < maxY; y++) {
    if (!isValidTile(minX, y) || !isValidTile(maxX, y)) return false
  }

  // Check interior
  for (let x = minX + 1; x < maxX; x++) {
    for (let y = minY + 1; y < maxY; y++) {
      if (!isValidTile(x, y)) return false
    }
  }

  return true
}

// Test the rectangle that our solution found (area 4995773)
// We need to find which rectangle this is
console.log("Finding rectangles with area around 4995773...")

let found = false
for (let i = 0; i < redTiles.length && !found; i++) {
  for (let j = i + 1; j < redTiles.length; j++) {
    const p1 = redTiles[i]
    const p2 = redTiles[j]
    const width = Math.abs(p2.x - p1.x) + 1
    const height = Math.abs(p2.y - p1.y) + 1
    const area = width * height

    if (area === 4995773) {
      const minX = Math.min(p1.x, p2.x)
      const maxX = Math.max(p1.x, p2.x)
      const minY = Math.min(p1.y, p2.y)
      const maxY = Math.max(p1.y, p2.y)

      const valid = rectangleIsValid(minX, maxX, minY, maxY)
      console.log(`Found rectangle with area 4995773:`)
      console.log(`  Corners: (${p1.x},${p1.y}) to (${p2.x},${p2.y})`)
      console.log(`  Valid: ${valid}`)
      found = true
      break
    }
  }
}

if (!found) {
  console.log("Could not find exact rectangle. Checking nearby areas...")
  // Check a range
  const targetArea = 4995773
  const tolerance = 1000

  for (let i = 0; i < Math.min(100, redTiles.length); i++) {
    for (let j = i + 1; j < Math.min(100, redTiles.length); j++) {
      const p1 = redTiles[i]
      const p2 = redTiles[j]
      const width = Math.abs(p2.x - p1.x) + 1
      const height = Math.abs(p2.y - p1.y) + 1
      const area = width * height

      if (Math.abs(area - targetArea) < tolerance) {
        const minX = Math.min(p1.x, p2.x)
        const maxX = Math.max(p1.x, p2.x)
        const minY = Math.min(p1.y, p2.y)
        const maxY = Math.max(p1.y, p2.y)
        const valid = rectangleIsValid(minX, maxX, minY, maxY)
        if (valid) {
          console.log(
            `Area ${area}: (${p1.x},${p1.y}) to (${p2.x},${p2.y}) - Valid: ${valid}`
          )
        }
      }
    }
  }
}
