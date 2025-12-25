// Verify the rectangle with area 1534043700 passes the solution's validation
const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n").filter(line => line.length > 0)

type Point = { x: number; y: number }
const redTiles: Point[] = lines.map(line => {
  const [x, y] = line.split(",").map(Number)
  return { x, y }
})

// Find the rectangle: (5459,67484) to (94543,50265)
const p1 = { x: 5459, y: 67484 }
const p2 = { x: 94543, y: 50265 }

console.log(`Testing rectangle: (${p1.x},${p1.y}) to (${p2.x},${p2.y})`)
const minX = Math.min(p1.x, p2.x)
const maxX = Math.max(p1.x, p2.x)
const minY = Math.min(p1.y, p2.y)
const maxY = Math.max(p1.y, p2.y)
const width = maxX - minX + 1
const height = maxY - minY + 1
const area = width * height

console.log(`Area: ${area}, expected: 1534043700`)
console.log(`Dimensions: ${width} x ${height} = ${width * height} tiles`)

// Use the same validation logic as solution
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

// Use solution's validation with sampling
const totalTiles = width * height
console.log(`Total tiles: ${totalTiles}`)

// Check boundary
let valid = true
for (let x = minX; x <= maxX; x++) {
  if (!isValidTile(x, minY) || !isValidTile(x, maxY)) {
    console.log(`Invalid boundary at x=${x}`)
    valid = false
    break
  }
}
if (valid) {
  for (let y = minY + 1; y < maxY; y++) {
    if (!isValidTile(minX, y) || !isValidTile(maxX, y)) {
      console.log(`Invalid boundary at y=${y}`)
      valid = false
      break
    }
  }
}

if (valid && totalTiles > 5000000) {
  console.log("Using sampling for interior...")
  const gridSize = Math.min(100, Math.max(20, Math.floor(Math.sqrt(totalTiles) / 100)))
  console.log(`Grid size: ${gridSize}`)
  for (let gx = 0; gx <= gridSize; gx++) {
    for (let gy = 0; gy <= gridSize; gy++) {
      const x = minX + Math.floor(gx * (maxX - minX) / gridSize)
      const y = minY + Math.floor(gy * (maxY - minY) / gridSize)
      if (!isValidTile(x, y)) {
        console.log(`Invalid at sampled point (${x},${y})`)
        valid = false
        break
      }
    }
    if (!valid) break
  }
}

console.log(`\nValid according to solution's logic: ${valid}`)

