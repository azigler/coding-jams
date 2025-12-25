const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")

// Find the operation line (last line with only + and * and spaces)
let opLineIndex = lines.length - 1
for (let i = lines.length - 1; i >= 0; i--) {
  if (/^[\s+*]+$/.test(lines[i])) {
    opLineIndex = i
    break
  }
}

const numberLines = lines.slice(0, opLineIndex)
const opLine = lines[opLineIndex]

// Parse columns - problems are separated by full columns of spaces
const width = Math.max(...lines.map((l) => l.length))

// Build a grid of characters
const grid: string[][] = []
for (const line of numberLines) {
  const row: string[] = []
  for (let i = 0; i < width; i++) {
    row.push(line[i] || " ")
  }
  grid.push(row)
}

// Also parse the operation line
const opRow: string[] = []
for (let i = 0; i < width; i++) {
  opRow.push(opLine[i] || " ")
}

// Find separator columns: ALL rows (including operation line) must be spaces
const isSeparatorColumn = (col: number): boolean => {
  // Check all number lines - must all be spaces
  for (let row = 0; row < numberLines.length; row++) {
    if (grid[row][col] !== " ") {
      return false
    }
  }
  // Also check operation line - must be space
  if (opRow[col] !== " ") {
    return false
  }
  return true
}

// Build list of separator column positions
const separatorCols: number[] = []
for (let col = 0; col < width; col++) {
  if (isSeparatorColumn(col)) {
    separatorCols.push(col)
  }
}

// Find all operations and create a problem for each
// Each operation defines a problem - find the column boundaries for that problem
const columnGroups: Array<{ start: number; end: number; op: string }> = []

for (let col = 0; col < width; col++) {
  if (opRow[col] === "+" || opRow[col] === "*") {
    // Find the start of this problem's column group (previous separator or start)
    let start = 0
    for (const sepCol of separatorCols) {
      if (sepCol < col) {
        start = sepCol + 1
      } else {
        break
      }
    }

    // Find the end of this problem's column group (next separator or end)
    let end = width
    for (const sepCol of separatorCols) {
      if (sepCol > col) {
        end = sepCol
        break
      }
    }

    columnGroups.push({ start, end, op: opRow[col] })
  }
}

// Extract problems from each column group
const problems: Array<{ numbers: number[]; op: string }> = []

for (const group of columnGroups) {
  const startCol = group.start
  const endCol = group.end

  // Extract numbers from this column group
  const numbers: number[] = []

  for (let row = 0; row < numberLines.length; row++) {
    const line = numberLines[row]
    const segment = line.substring(startCol, endCol)

    // Extract the first number from this segment
    const numberMatch = segment.match(/\d+/)
    if (numberMatch) {
      const num = parseInt(numberMatch[0], 10)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }

  // Get operation from the operation line
  let op = ""
  const opSegment = opLine.substring(startCol, endCol)
  if (opSegment.includes("+")) {
    op = "+"
  } else if (opSegment.includes("*")) {
    op = "*"
  }

  if (numbers.length > 0 && op) {
    problems.push({ numbers, op })
  }
}

// Calculate results
let grandTotal = 0
for (const problem of problems) {
  let result: number
  if (problem.op === "+") {
    result = problem.numbers.reduce((sum, n) => sum + n, 0)
  } else {
    result = problem.numbers.reduce((prod, n) => prod * n, 1)
  }
  grandTotal += result
}

console.log(`Part 1: ${grandTotal}`)
