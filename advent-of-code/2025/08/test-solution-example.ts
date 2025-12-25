// Test the solution on the example
const example = `162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689`

const lines = example.trim().split("\n").filter(line => line.length > 0)

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
let edgesProcessed = 0

for (const edge of edges) {
  if (edgesProcessed >= 10) break
  
  uf.union(edge.i, edge.j)
  edgesProcessed++
}

const componentSizes = uf.getComponentSizes()
componentSizes.sort((a, b) => b - a)

if (componentSizes.length < 3) {
  console.error(`Only ${componentSizes.length} components`)
  Deno.exit(1)
}

const product = componentSizes[0] * componentSizes[1] * componentSizes[2]
console.log(`Product: ${product}`)
console.log(`Expected: 40`)
