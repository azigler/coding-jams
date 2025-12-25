// Check how many edges we need to process to make 1000 connections
const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n").filter(line => line.length > 0)

type Point = [number, number, number]
const boxes: Point[] = lines.map(line => {
  const [x, y, z] = line.split(",").map(Number)
  return [x, y, z]
})

function distance(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0]
  const dy = p1[1] - p2[1]
  const dz = p1[2] - p2[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

class UnionFind {
  private parent: number[]
  private rank: number[]
  
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }
  
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])
    }
    return this.parent[x]
  }
  
  union(x: number, y: number): boolean {
    const rootX = this.find(x)
    const rootY = this.find(y)
    
    if (rootX === rootY) {
      return false
    }
    
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

type Edge = { i: number; j: number; dist: number }
const edges: Edge[] = []

for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const dist = distance(boxes[i], boxes[j])
    edges.push({ i, j, dist })
  }
}

edges.sort((a, b) => a.dist - b.dist)

const uf = new UnionFind(boxes.length)
let connectionsMade = 0
let edgesProcessed = 0

for (const edge of edges) {
  edgesProcessed++
  if (connectionsMade >= 1000) break
  
  if (uf.union(edge.i, edge.j)) {
    connectionsMade++
    if (connectionsMade % 100 === 0) {
      const sizes = uf.getComponentSizes()
      console.log(`After ${connectionsMade} connections: ${sizes.length} components`)
    }
  }
}

const componentSizes = uf.getComponentSizes()
componentSizes.sort((a, b) => b - a)

console.log(`\nTotal edges processed: ${edgesProcessed}`)
console.log(`Total connections made: ${connectionsMade}`)
console.log(`Component sizes:`, componentSizes.slice(0, 10))
