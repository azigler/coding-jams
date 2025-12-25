// Day 6 Part 1 - Fresh approach
// Key insight: "Problems are separated by a full column of only spaces"
// This means ALL rows (including the operation row) must be spaces for a separator

const input = await Deno.readTextFile("input.txt")
const lines = input.split("\n").filter((line) => line.length > 0)

// Last line is the operation line
const opLine = lines[lines.length - 1]
const numberLines = lines.slice(0, lines.length - 1)

// Find the maximum width
const width = Math.max(...lines.map((l) => l.length))

// Pad all lines to the same width
const paddedNumberLines = numberLines.map((line) => line.padEnd(width, " "))
const paddedOpLine = opLine.padEnd(width, " ")

// Find separator columns: ALL rows (including op row) must be spaces
const separatorCols: number[] = []
for (let col = 0; col < width; col++) {
  let isSeparator = true

  // Check all number lines
  for (const line of paddedNumberLines) {
    if (line[col] !== " ") {
      isSeparator = false
      break
    }
  }

  // Check operation line
  if (isSeparator && paddedOpLine[col] !== " ") {
    isSeparator = false
  }

  if (isSeparator) {
    separatorCols.push(col)
  }
}

// Create column groups from separators
// Groups are ranges between consecutive separators
// We need to handle: start of line, separators, end of line
interface ColumnGroup {
  start: number
  end: number
}

const groups: ColumnGroup[] = []
let groupStart = 0

// First, skip leading separator columns
while (groupStart < width && separatorCols.includes(groupStart)) {
  groupStart++
}

for (const sepCol of separatorCols) {
  if (sepCol > groupStart) {
    // Found a group from groupStart to sepCol
    groups.push({ start: groupStart, end: sepCol })
  }
  groupStart = sepCol + 1
  // Skip consecutive separators
  while (groupStart < width && separatorCols.includes(groupStart)) {
    groupStart++
  }
}

// Handle final group (after last separator)
if (groupStart < width) {
  groups.push({ start: groupStart, end: width })
}

// For each group, extract numbers and operation, then calculate
let grandTotal = 0
let problemCount = 0

for (const group of groups) {
  // Extract numbers from each number line within this group
  const numbers: number[] = []
  for (const line of paddedNumberLines) {
    const segment = line.substring(group.start, group.end)
    const match = segment.match(/\d+/)
    if (match) {
      numbers.push(parseInt(match[0], 10))
    }
  }

  // Find operation in this group
  const opSegment = paddedOpLine.substring(group.start, group.end)
  let op = ""
  if (opSegment.includes("+")) {
    op = "+"
  } else if (opSegment.includes("*")) {
    op = "*"
  }

  // Skip if no numbers or no operation
  if (numbers.length === 0 || !op) {
    continue
  }

  // Calculate result
  let result: number
  if (op === "+") {
    result = numbers.reduce((sum, n) => sum + n, 0)
  } else {
    result = numbers.reduce((prod, n) => prod * n, 1)
  }

  grandTotal += result
  problemCount++
}

console.log(`Found ${separatorCols.length} separator columns`)
console.log(`Found ${groups.length} column groups`)
console.log(`Solved ${problemCount} problems`)
console.log(`Part 1: ${grandTotal}`)
