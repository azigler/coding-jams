const input = await Deno.readTextFile("input.txt")
const lines = input.split("\n").filter(line => line.length > 0)
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

console.log(`First 10 separator columns: ${separatorCols.slice(0, 10).join(", ")}`)
console.log(`First 5 groups: ${groups.slice(0, 5).map(g => `[${g.start},${g.end})`).join(", ")}`)
console.log()

// Show first 5 problems
for (let i = 0; i < 5; i++) {
  const group = groups[i]
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
  if (opSegment.includes('+')) op = '+'
  else if (opSegment.includes('*')) op = '*'
  
  let result = op === '+' 
    ? numbers.reduce((s, n) => s + n, 0)
    : numbers.reduce((p, n) => p * n, 1)
  
  console.log(`Problem ${i+1}: columns [${group.start},${group.end})`)
  console.log(`  Numbers: ${numbers.join(", ")}`)
  console.log(`  Operation: ${op}`)
  console.log(`  Result: ${result}`)
}
