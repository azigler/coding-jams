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
// We need to identify column boundaries
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

// Find separator columns first
// "A full column of only spaces" means ALL rows (including operation line) must be spaces
// This is the correct definition based on the example
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

// Build column groups based on separator columns
// Each group is between two separators (or start/end)
const columnGroups: Array<{ start: number; end: number; op: string }> = []

let groupStart = 0
for (const sepCol of separatorCols) {
  // Group from groupStart to sepCol
  if (groupStart < sepCol) {
    // Find the operation in this group
    let op = ""
    for (let col = groupStart; col < sepCol; col++) {
      if (opRow[col] === "+" || opRow[col] === "*") {
        op = opRow[col]
        break // Each group should have exactly one operation
      }
    }
    if (op) {
      columnGroups.push({ start: groupStart, end: sepCol, op })
    }
  }
  groupStart = sepCol + 1
}

// Handle last group (after last separator)
if (groupStart < width) {
  let op = ""
  for (let col = groupStart; col < width; col++) {
    if (opRow[col] === "+" || opRow[col] === "*") {
      op = opRow[col]
      break
    }
  }
  if (op) {
    columnGroups.push({ start: groupStart, end: width, op })
  }
}

// Extract problems from each column group
// Numbers are arranged vertically - need to extract all numbers from each column group
// "The left/right alignment of numbers within each problem can be ignored"
const problems: Array<{ numbers: number[]; op: string }> = []

for (const group of columnGroups) {
  const startCol = group.start
  const endCol = group.end

  // Extract numbers from this column group
  // Each row in the column group contains one number (may be at different horizontal positions)
  const numbers: number[] = []
  
  for (let row = 0; row < numberLines.length; row++) {
    // Extract the substring for this column group
    const line = numberLines[row]
    const segment = line.substring(startCol, endCol)
    
    // Extract the first number from this segment (numbers are arranged vertically, one per row)
    // "Left/right alignment can be ignored" means we just need to find the number in the segment
    const numberMatch = segment.match(/\d+/)
    if (numberMatch) {
      const num = parseInt(numberMatch[0], 10)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
    // Note: If a row has no number in this column group, we skip it (shouldn't happen per problem description)
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

