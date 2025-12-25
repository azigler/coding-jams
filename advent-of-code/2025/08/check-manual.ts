// Manually verify the first few connections from the problem description
const boxes = [
  [162,817,812],  // 0
  [57,618,57],    // 1
  [906,360,560],  // 2
  [592,479,940],  // 3
  [352,342,300],  // 4
  [466,668,158],  // 5
  [542,29,236],   // 6
  [431,825,988],  // 7
  [739,650,466],  // 8
  [52,470,668],   // 9
  [216,146,977],  // 10
  [819,987,18],   // 11
  [117,168,530],  // 12
  [805,96,715],   // 13
  [346,949,466],  // 14
  [970,615,88],   // 15
  [941,993,340],  // 16
  [862,61,35],    // 17
  [984,92,344],   // 18
  [425,690,689],  // 19
]

function distance(p1: number[], p2: number[]): number {
  const dx = p1[0] - p2[0]
  const dy = p1[1] - p2[1]
  const dz = p1[2] - p2[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// Check the distances mentioned in the problem
console.log("Distance 0-19:", distance(boxes[0], boxes[19]).toFixed(2))
console.log("Distance 0-7:", distance(boxes[0], boxes[7]).toFixed(2))
console.log("Distance 2-13:", distance(boxes[2], boxes[13]).toFixed(2))
console.log("Distance 7-19:", distance(boxes[7], boxes[19]).toFixed(2))
