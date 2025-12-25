// Day 8: Playground - Junction Box Circuits
// Connect 1000 shortest pairs, then find product of three largest circuit sizes

const input = await Deno.readTextFile("input.txt")
const lines = input
  .trim()
  .split("\n")
  .filter((line) => line.length > 0)

// Parse junction box positions
type Point = [number, number, number]
const boxes: Point[] = lines.map((line) => {
  const [x, y, z] = line.split(",").map(Number)
  return [x, y, z]
})

// Calculate Euclidean distance between two points
function distance(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0]
  const dy = p1[1] - p2[1]
  const dz = p1[2] - p2[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// Union-Find data structure
class UnionFind {
  private parent: number[]
  private rank: number[]

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]) // Path compression
    }
    return this.parent[x]
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) {
      return false // Already in same component
    }

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX
    } else {
      this.parent[rootY] = rootX
      this.rank[rootX]++
    }

    return true
  }

  getComponentSizes(): number[] {
    const sizes = new Map<number, number>()
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i)
      sizes.set(root, (sizes.get(root) || 0) + 1)
    }
    return Array.from(sizes.values())
  }
}

// Generate all pairs with distances
type Edge = { i: number; j: number; dist: number }
const edges: Edge[] = []

for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const dist = distance(boxes[i], boxes[j])
    edges.push({ i, j, dist })
  }
}

// Sort by distance
edges.sort((a, b) => a.dist - b.dist)

// Connect the 1000 shortest pairs
// Process the first 1000 edges in sorted order
// Some may be skipped if boxes are already in same circuit
const uf = new UnionFind(boxes.length)
let edgesProcessed = 0

for (const edge of edges) {
  if (edgesProcessed >= 1000) break

  // Try to connect, even if it's skipped
  uf.union(edge.i, edge.j)
  edgesProcessed++
}

// Get component sizes and find product of three largest
const componentSizes = uf.getComponentSizes()
componentSizes.sort((a, b) => b - a) // Sort descending

if (componentSizes.length < 3) {
  console.error(
    `Only ${componentSizes.length} components found, need at least 3`
  )
  console.log(`Component sizes:`, componentSizes)
  Deno.exit(1)
}

const product = componentSizes[0] * componentSizes[1] * componentSizes[2]

console.log(`Part 1: ${product}`)

// Part 2: Continue connecting until all boxes are in one circuit
// Find the last connection made and multiply X coordinates
const uf2 = new UnionFind(boxes.length)
let lastConnection: Edge | null = null

for (const edge of edges) {
  // Check if already all connected
  if (uf2.getComponentSizes().length === 1) {
    break
  }

  if (uf2.union(edge.i, edge.j)) {
    lastConnection = edge
  }
}

if (lastConnection) {
  const x1 = boxes[lastConnection.i][0]
  const x2 = boxes[lastConnection.j][0]
  const product2 = x1 * x2
  console.log(`Part 2: ${product2}`)
} else {
  console.log(`Part 2: No last connection found`)
}
