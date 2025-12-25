// Test on the example
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

let maxArea = 0
let bestPair: [Point, Point] | null = null

for (let i = 0; i < redTiles.length; i++) {
  for (let j = i + 1; j < redTiles.length; j++) {
    const p1 = redTiles[i]
    const p2 = redTiles[j]

    const width = Math.abs(p2.x - p1.x) + 1
    const height = Math.abs(p2.y - p1.y) + 1
    const area = width * height

    if (area > maxArea) {
      maxArea = area
      bestPair = [p1, p2]
    }
  }
}

console.log(`Max area: ${maxArea}`)
console.log(`Expected: 50`)
console.log(
  `Best pair: (${bestPair![0].x},${bestPair![0].y}) and (${bestPair![1].x},${
    bestPair![1].y
  })`
)
console.log(`Match: ${maxArea === 50 ? "✓" : "✗"}`)
