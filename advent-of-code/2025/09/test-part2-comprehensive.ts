// Comprehensive test for Part 2 based on challenge examples
const example = `7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`

const lines = example
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
function isInsideLoop(x: number, y: number): boolean {
  let inside = false
  for (let i = 0, j = redTiles.length - 1; i < redTiles.length; j = i++) {
    const xi = redTiles[i].x,
      yi = redTiles[i].y
    const xj = redTiles[j].x,
      yj = redTiles[j].y

    if (yi === yj) continue // Skip horizontal edges

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
  // Check all tiles
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (!isValidTile(x, y)) return false
    }
  }
  return true
}

// Test specific examples from challenge
console.log("Testing specific rectangles from challenge:")

// Example 1: (7,3) to (11,1) - area 15
const test1 = rectangleIsValid(7, 11, 1, 3)
const area1 = (11 - 7 + 1) * (3 - 1 + 1)
console.log(`(7,3) to (11,1): area=${area1}, valid=${test1}, expected=true`)

// Example 2: (9,7) to (9,5) - area 3
const test2 = rectangleIsValid(9, 9, 5, 7)
const area2 = (9 - 9 + 1) * (7 - 5 + 1)
console.log(`(9,7) to (9,5): area=${area2}, valid=${test2}, expected=true`)

// Example 3: (9,5) to (2,3) - area 24 (largest)
const test3 = rectangleIsValid(2, 9, 3, 5)
const area3 = (9 - 2 + 1) * (5 - 3 + 1)
console.log(`(9,5) to (2,3): area=${area3}, valid=${test3}, expected=true`)

// Find all valid rectangles
let maxArea = 0
let bestPair: [Point, Point] | null = null

for (let i = 0; i < redTiles.length; i++) {
  for (let j = i + 1; j < redTiles.length; j++) {
    const p1 = redTiles[i]
    const p2 = redTiles[j]

    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)
    const maxY = Math.max(p1.y, p2.y)

    if (rectangleIsValid(minX, maxX, minY, maxY)) {
      const width = maxX - minX + 1
      const height = maxY - minY + 1
      const area = width * height
      if (area > maxArea) {
        maxArea = area
        bestPair = [p1, p2]
      }
    }
  }
}

console.log(`\nMax area: ${maxArea}`)
console.log(`Expected: 24`)
console.log(
  `Best pair: (${bestPair![0].x},${bestPair![0].y}) and (${bestPair![1].x},${
    bestPair![1].y
  })`
)
console.log(`Match: ${maxArea === 24 ? "✓" : "✗"}`)
