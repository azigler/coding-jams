// Debug number extraction
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

// Build groups
const columnGroups: Array<{ start: number; end: number; op: string }> = []
let groupStart = 0

for (const sepCol of separatorCols) {
  if (groupStart < sepCol) {
    let op = ""
    for (let col = groupStart; col < sepCol; col++) {
      if (opLine[col] === "+" || opLine[col] === "*") {
        op = opLine[col]
        break
      }
    }
    if (op) {
      columnGroups.push({ start: groupStart, end: sepCol, op })
    }
  }
  groupStart = sepCol + 1
}

if (groupStart < width) {
  let op = ""
  for (let col = groupStart; col < width; col++) {
    if (opLine[col] === "+" || opLine[col] === "*") {
      op = opLine[col]
      break
    }
  }
  if (op) {
    columnGroups.push({ start: groupStart, end: width, op })
  }
}

// Extract numbers
for (let i = 0; i < columnGroups.length; i++) {
  const group = columnGroups[i]
  const numbers: number[] = []
  
  console.log(`\nProblem ${i + 1}: columns [${group.start}, ${group.end}), op: ${group.op}`)
  
  for (let row = 0; row < numberLines.length; row++) {
    const segment = numberLines[row].substring(group.start, group.end)
    const numberMatch = segment.match(/\d+/)
    if (numberMatch) {
      const num = parseInt(numberMatch[0], 10)
      numbers.push(num)
      console.log(`  Row ${row}: "${segment}" -> ${num}`)
    } else {
      console.log(`  Row ${row}: "${segment}" -> no number`)
    }
  }
  
  let result: number
  if (group.op === "+") {
    result = numbers.reduce((sum, n) => sum + n, 0)
  } else {
    result = numbers.reduce((prod, n) => prod * n, 1)
  }
  console.log(`  Result: ${numbers.join(" " + group.op + " ")} = ${result}`)
}
