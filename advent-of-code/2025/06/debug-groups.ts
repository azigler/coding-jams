// Debug group creation
const example = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`

const lines = example.trim().split("\n")
const numberLines = lines.slice(0, 3)
const opLine = lines[3]
const width = Math.max(...lines.map(l => l.length))

// Find separator columns
const isSeparatorColumn = (col: number): boolean => {
  for (let row = 0; row < numberLines.length; row++) {
    if ((numberLines[row][col] || " ") !== " ") {
      return false
    }
  }
  return true
}

const separatorCols: number[] = []
for (let col = 0; col < width; col++) {
  if (isSeparatorColumn(col)) {
    separatorCols.push(col)
  }
}

console.log("Separator columns:", separatorCols)

// Build groups
const columnGroups: Array<{ start: number; end: number; op: string }> = []
let groupStart = 0

for (const sepCol of separatorCols) {
  if (groupStart < sepCol) {
    // Find operation in this group
    let op = ""
    for (let col = groupStart; col < sepCol; col++) {
      if (opLine[col] === "+" || opLine[col] === "*") {
        op = opLine[col]
        break
      }
    }
    console.log(`Group: [${groupStart}, ${sepCol}), op: ${op}`)
    if (op) {
      columnGroups.push({ start: groupStart, end: sepCol, op })
    }
  }
  groupStart = sepCol + 1
}

// Last group
if (groupStart < width) {
  let op = ""
  for (let col = groupStart; col < width; col++) {
    if (opLine[col] === "+" || opLine[col] === "*") {
      op = opLine[col]
      break
    }
  }
  console.log(`Group: [${groupStart}, ${width}), op: ${op}`)
  if (op) {
    columnGroups.push({ start: groupStart, end: width, op })
  }
}

console.log(`\nTotal groups: ${columnGroups.length}`)
