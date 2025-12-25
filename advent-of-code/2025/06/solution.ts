// Day 6 - Both Parts
// Part 1: Numbers are read horizontally from each row
// Part 2: Numbers are read vertically from each column (right to left)

const input = await Deno.readTextFile("input.txt")
const lines = input.split("\n").filter((line) => line.length > 0)

const opLine = lines[lines.length - 1]
const numberLines = lines.slice(0, lines.length - 1)
const width = Math.max(...lines.map((l) => l.length))

const paddedNumberLines = numberLines.map((line) => line.padEnd(width, " "))
const paddedOpLine = opLine.padEnd(width, " ")

// Find separator columns: ALL rows (including op row) must be spaces
const separatorCols: number[] = []
for (let col = 0; col < width; col++) {
  let isSeparator = true

  for (const line of paddedNumberLines) {
    if (line[col] !== " ") {
      isSeparator = false
      break
    }
  }

  if (isSeparator && paddedOpLine[col] !== " ") {
    isSeparator = false
  }

  if (isSeparator) {
    separatorCols.push(col)
  }
}

// Create column groups from separators
interface ColumnGroup {
  start: number
  end: number
}

const groups: ColumnGroup[] = []
let groupStart = 0

while (groupStart < width && separatorCols.includes(groupStart)) {
  groupStart++
}

for (const sepCol of separatorCols) {
  if (sepCol > groupStart) {
    groups.push({ start: groupStart, end: sepCol })
  }
  groupStart = sepCol + 1
  while (groupStart < width && separatorCols.includes(groupStart)) {
    groupStart++
  }
}

if (groupStart < width) {
  groups.push({ start: groupStart, end: width })
}

// Part 1: Extract numbers horizontally from each row
function solvePart1(): number {
  let grandTotal = 0

  for (const group of groups) {
    const numbers: number[] = []
    for (const line of paddedNumberLines) {
      const segment = line.substring(group.start, group.end)
      const match = segment.match(/\d+/)
      if (match) {
        numbers.push(parseInt(match[0], 10))
      }
    }

    const opSegment = paddedOpLine.substring(group.start, group.end)
    let op = ""
    if (opSegment.includes("+")) op = "+"
    else if (opSegment.includes("*")) op = "*"

    if (numbers.length === 0 || !op) continue

    let result =
      op === "+"
        ? numbers.reduce((sum, n) => sum + n, 0)
        : numbers.reduce((prod, n) => prod * n, 1)

    grandTotal += result
  }

  return grandTotal
}

// Part 2: Read columns right-to-left, each column is a number
// Most significant digit at top, least significant at bottom
function solvePart2(): number {
  let grandTotal = 0

  for (const group of groups) {
    const numbers: number[] = []

    // Read columns from right to left within this group
    for (let col = group.end - 1; col >= group.start; col--) {
      // Build number from this column: top = most significant, bottom = least significant
      let numStr = ""
      for (const line of paddedNumberLines) {
        const char = line[col]
        if (char >= "0" && char <= "9") {
          numStr += char
        }
      }

      if (numStr.length > 0) {
        numbers.push(parseInt(numStr, 10))
      }
    }

    // Find operation in this group
    const opSegment = paddedOpLine.substring(group.start, group.end)
    let op = ""
    if (opSegment.includes("+")) op = "+"
    else if (opSegment.includes("*")) op = "*"

    if (numbers.length === 0 || !op) continue

    let result =
      op === "+"
        ? numbers.reduce((sum, n) => sum + n, 0)
        : numbers.reduce((prod, n) => prod * n, 1)

    grandTotal += result
  }

  return grandTotal
}

console.log(`Part 1: ${solvePart1()}`)
console.log(`Part 2: ${solvePart2()}`)
