// Test on the example from the challenge

const example = `0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2
`

type Shape = boolean[][]

// Parse shapes
function parseShapes(input: string): Shape[] {
  const shapes: Shape[] = []
  const sections = input.split(/\n(?=\d+:)/)

  for (const section of sections) {
    const lines = section.trim().split("\n")
    if (lines.length === 0 || !lines[0].includes(":")) continue

    const shape: Shape = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        shape.push(lines[i].split("").map((c) => c === "#"))
      }
    }
    if (shape.length > 0) {
      shapes.push(shape)
    }
  }

  return shapes
}

// Rotate shape 90 degrees clockwise
function rotate(shape: Shape): Shape {
  const rows = shape.length
  const cols = shape[0].length
  const rotated: Shape = []

  for (let c = 0; c < cols; c++) {
    const row: boolean[] = []
    for (let r = rows - 1; r >= 0; r--) {
      row.push(shape[r][c])
    }
    rotated.push(row)
  }

  return rotated
}

// Flip shape horizontally
function flip(shape: Shape): Shape {
  return shape.map((row) => [...row].reverse())
}

// Generate all unique rotations and flips of a shape
function generateVariants(shape: Shape): Shape[] {
  const variants = new Set<string>()
  const result: Shape[] = []

  function addIfNew(s: Shape) {
    const key = s
      .map((row) => row.map((b) => (b ? "#" : ".")).join(""))
      .join("\n")
    if (!variants.has(key)) {
      variants.add(key)
      result.push(s)
    }
  }

  let current = shape
  for (let i = 0; i < 4; i++) {
    addIfNew(current)
    addIfNew(flip(current))
    current = rotate(current)
  }

  return result
}

const shapes = parseShapes(example)
console.log(`Parsed ${shapes.length} shapes`)
for (let i = 0; i < shapes.length; i++) {
  const variants = generateVariants(shapes[i])
  console.log(`Shape ${i}: ${variants.length} variants`)
}
