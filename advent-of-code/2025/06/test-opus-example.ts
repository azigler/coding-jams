// Test the opus solution on the example
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

console.log("Lines:")
for (let i = 0; i < lines.length; i++) {
  console.log(`  ${i}: "${lines[i]}"`)
}
console.log(`Width: ${width}`)

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
console.log(`Separator columns: ${separatorCols.join(", ")}`)

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

console.log(`Column groups: ${groups.map(g => `[${g.start},${g.end})`).join(", ")}`)

// Solve each problem
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
  let op = ''
  if (opSegment.includes('+')) {
    op = '+'
  } else if (opSegment.includes('*')) {
    op = '*'
  }
  
  if (numbers.length === 0 || !op) continue
  
  let result: number
  if (op === '+') {
    result = numbers.reduce((sum, n) => sum + n, 0)
  } else {
    result = numbers.reduce((prod, n) => prod * n, 1)
  }
  
  console.log(`  ${numbers.join(` ${op} `)} = ${result}`)
  grandTotal += result
}

console.log(`\nGrand total: ${grandTotal}`)
console.log(`Expected: 4277556`)
console.log(`Match: ${grandTotal === 4277556 ? '✓' : '✗'}`)
