// Test with the example from the problem
const example = `123 328  51 64
 45 64  387 23
  6 98  215 314
*   +   *   +
`

const lines = example.trim().split("\n")

// Find the operation line
let opLineIndex = lines.length - 1
for (let i = lines.length - 1; i >= 0; i--) {
  if (/^[\s+*]+$/.test(lines[i])) {
    opLineIndex = i
    break
  }
}

const numberLines = lines.slice(0, opLineIndex)
const opLine = lines[opLineIndex]

const width = Math.max(...lines.map((l) => l.length))

// Build grid
const grid: string[][] = []
for (const line of numberLines) {
  const row: string[] = []
  for (let i = 0; i < width; i++) {
    row.push(line[i] || " ")
  }
  grid.push(row)
}

const opRow: string[] = []
for (let i = 0; i < width; i++) {
  opRow.push(opLine[i] || " ")
}

// Find column boundaries
const columnBoundaries: number[] = [0]
for (let col = 0; col < width; col++) {
  let allSpaces = true
  for (let row = 0; row < numberLines.length; row++) {
    if (grid[row][col] !== " ") {
      allSpaces = false
      break
    }
  }
  if (opRow[col] === " ") {
    if (allSpaces && col > 0) {
      columnBoundaries.push(col + 1)
    }
  }
}
columnBoundaries.push(width)

console.log("Column boundaries:", columnBoundaries)
console.log("\nDebugging column groups:")
for (let i = 0; i < columnBoundaries.length - 1; i++) {
  const startCol = columnBoundaries[i]
  const endCol = columnBoundaries[i + 1]
  console.log(`\nGroup ${i}: columns ${startCol}-${endCol}`)
  for (let row = 0; row < numberLines.length; row++) {
    const segment = numberLines[row].substring(startCol, endCol)
    console.log(`  Row ${row}: "${segment}"`)
  }
  const opSegment = opLine.substring(startCol, endCol)
  console.log(`  Op: "${opSegment}"`)
}

// Extract problems
const problems: Array<{ numbers: number[]; op: string }> = []

for (let i = 0; i < columnBoundaries.length - 1; i++) {
  const startCol = columnBoundaries[i]
  const endCol = columnBoundaries[i + 1]

  const numbers: number[] = []
  for (let row = 0; row < numberLines.length; row++) {
    const segment = numberLines[row].substring(startCol, endCol).trim()
    const numberMatch = segment.match(/\d+/)
    if (numberMatch) {
      const num = parseInt(numberMatch[0], 10)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }

  let op = ""
  for (let col = startCol; col < endCol; col++) {
    if (opRow[col] === "+" || opRow[col] === "*") {
      op = opRow[col]
      break
    }
  }

  if (numbers.length > 0 && op) {
    problems.push({ numbers, op })
  }
}

console.log("\nProblems:")
let grandTotal = 0
for (const problem of problems) {
  let result: number
  if (problem.op === "+") {
    result = problem.numbers.reduce((sum, n) => sum + n, 0)
  } else {
    result = problem.numbers.reduce((prod, n) => prod * n, 1)
  }
  console.log(`  ${problem.numbers.join(" " + problem.op + " ")} = ${result}`)
  grandTotal += result
}

console.log(`\nGrand total: ${grandTotal}, expected: 4277556`)
console.log(`Test: ${grandTotal === 4277556 ? "✓" : "✗"}`)
