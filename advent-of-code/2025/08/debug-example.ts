// Debug the example to see what's happening
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

type Edge = { i: number; j: number; dist: number }
const edges: Edge[] = []

for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const dist = distance(boxes[i], boxes[j])
    edges.push({ i, j, dist })
  }
}

edges.sort((a, b) => a.dist - b.dist)

console.log("First 15 edges:")
for (let i = 0; i < 15; i++) {
  const e = edges[i]
  console.log(`${i+1}. Box ${e.i} (${boxes[e.i].join(",")}) <-> Box ${e.j} (${boxes[e.j].join(",")}) = ${e.dist.toFixed(2)}`)
}
