// Test to find if there are larger valid rectangles we're missing
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

const insideCache = new Map<string, boolean>()
function isInsideLoop(x: number, y: number): boolean {
  const key = `${x},${y}`
  if (insideCache.has(key)) return insideCache.get(key)!

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

  for (let x = minX; x <= maxX; x++) {
    if (!isValidTile(x, minY) || !isValidTile(x, maxY)) return false
  }
  for (let y = minY + 1; y < maxY; y++) {
    if (!isValidTile(minX, y) || !isValidTile(maxX, y)) return false
  }
  for (let x = minX + 1; x < maxX; x++) {
    for (let y = minY + 1; y < maxY; y++) {
      if (!isValidTile(x, y)) return false
    }
  }
  return true
}

// Generate candidates sorted by area
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

console.log(`Checking candidates (showing progress every 10k)...`)
let maxArea = 0
let count = 0
let checked = 0

for (const cand of candidates) {
  checked++
  if (checked % 10000 === 0) {
    console.log(
      `Checked ${checked}, current max: ${maxArea}, checking area: ${cand.area}`
    )
  }

  if (cand.area <= maxArea) continue

  const p1 = redTiles[cand.i]
  const p2 = redTiles[cand.j]
  const minX = Math.min(p1.x, p2.x)
  const maxX = Math.max(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const maxY = Math.max(p1.y, p2.y)

  if (rectangleIsValid(minX, maxX, minY, maxY)) {
    maxArea = cand.area
    console.log(
      `✓ Found valid: area=${maxArea}, (${p1.x},${p1.y}) to (${p2.x},${p2.y})`
    )
    count++
    if (count >= 10) break // Show first 10 valid ones
  }
}

console.log(`\nLargest valid rectangle found: ${maxArea}`)
