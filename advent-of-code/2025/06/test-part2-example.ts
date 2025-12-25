// Test Part 2 logic on the example
const example = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`

const lines = example.split("\n").filter(line => line.length > 0)
const opLine = lines[lines.length - 1]
const numberLines = lines.slice(0, lines.length - 1)
const width = Math.max(...lines.map(l => l.length))

const paddedNumberLines = numberLines.map(line => line.padEnd(width, ' '))
const paddedOpLine = opLine.padEnd(width, ' ')

// Find separator columns
const separatorCols: number[] = []
for (let col = 0; col < width; col++) {
  let isSeparator = true
  for (const line of paddedNumberLines) {
    if (line[col] !== ' ') {
      isSeparator = false
      break
    }
  }
  if (isSeparator && paddedOpLine[col] !== ' ') {
    isSeparator = false
  }
  if (isSeparator) {
    separatorCols.push(col)
  }
}

// Create column groups
interface ColumnGroup { start: number; end: number }
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

console.log("Groups (left to right):", groups.map(g => `[${g.start},${g.end})`).join(", "))

// For Part 2, process groups from RIGHT to LEFT
// (since the example describes rightmost problem first)
let grandTotal = 0
const reversedGroups = [...groups].reverse()

for (let i = 0; i < reversedGroups.length; i++) {
  const group = reversedGroups[i]
  const numbers: number[] = []
  
  // Read columns from right to left within this group
  for (let col = group.end - 1; col >= group.start; col--) {
    let numStr = ''
    for (const line of paddedNumberLines) {
      const char = line[col]
      if (char >= '0' && char <= '9') {
        numStr += char
      }
    }
    
    if (numStr.length > 0) {
      numbers.push(parseInt(numStr, 10))
    }
  }
  
  const opSegment = paddedOpLine.substring(group.start, group.end)
  let op = ''
  if (opSegment.includes('+')) op = '+'
  else if (opSegment.includes('*')) op = '*'
  
  if (numbers.length === 0 || !op) continue
  
  let result = op === '+' 
    ? numbers.reduce((sum, n) => sum + n, 0)
    : numbers.reduce((prod, n) => prod * n, 1)
  
  console.log(`Problem ${i+1} (from right): columns [${group.start},${group.end})`)
  console.log(`  Numbers (R to L): ${numbers.join(", ")}`)
  console.log(`  ${numbers.join(` ${op} `)} = ${result}`)
  
  grandTotal += result
}

console.log(`\nGrand total: ${grandTotal}`)
console.log(`Expected: 3263827`)
console.log(`Match: ${grandTotal === 3263827 ? '✓' : '✗'}`)
