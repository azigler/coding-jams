// Analyze machine 1 to find a pattern

const line = `[.##.#..##.] (3,6) (0,1,2,3,4,5,7,9) (0,1,5,6,7,8,9) (1,9) (0,1,3,4,5,6,7) (0,1,2,3,4,5) (1,2,3,4,5,6,7,8) (2,3,5,7,8) (2,3,5,7,9) (0,1,2,3,4,6,9) (4,5,6,7,8) (3,6,7,8,9) {52,67,66,109,49,65,70,66,33,72}`

function parseLinePart2(line: string) {
  const joltageMatch = line.match(/\{([0-9,]+)\}/)
  if (!joltageMatch) throw new Error(`No joltage found: ${line}`)
  const joltageStr = joltageMatch[1]
  const targetJoltage = joltageStr.split(",").map(Number)
  
  const buttons: number[][] = []
  const buttonMatches = line.matchAll(/\(([0-9,]+)\)/g)
  for (const match of buttonMatches) {
    const indices = match[1].split(",").map(Number)
    buttons.push(indices)
  }
  
  return { targetJoltage, buttons }
}

const { targetJoltage, buttons } = parseLinePart2(line)
const n = targetJoltage.length
const m = buttons.length

console.log("Targets:", targetJoltage)
console.log("Sum of targets:", targetJoltage.reduce((a, b) => a + b, 0))
console.log("Buttons:", m)
console.log()

// Build the matrix
const matrix: number[][] = []
for (let i = 0; i < n; i++) {
  const row = new Array(m).fill(0)
  for (let j = 0; j < m; j++) {
    if (buttons[j].includes(i)) {
      row[j] = 1
    }
  }
  matrix.push(row)
  console.log(`Counter ${i} (target ${targetJoltage[i]}): buttons ${buttons.map((b, j) => b.includes(i) ? j : -1).filter(x => x >= 0).join(", ")}`)
}

console.log()

// Calculate efficiency: counters affected per button
for (let j = 0; j < m; j++) {
  const affected = buttons[j].filter(i => i < n).length
  console.log(`Button ${j}: affects ${affected} counters, indices ${buttons[j].join(",")}`)
}

console.log()

// What's the theoretical minimum?
// Each button press adds to the sum of all affected counters
// Total of targets = 649
// If each button press adds k units on average, minimum presses ≈ 649/k

const totalTarget = targetJoltage.reduce((a, b) => a + b, 0)
let totalCoverage = 0
for (const button of buttons) {
  totalCoverage += button.filter(i => i < n).length
}
const avgCoverage = totalCoverage / m

console.log(`Total target: ${totalTarget}`)
console.log(`Avg counters per button: ${avgCoverage.toFixed(2)}`)
console.log(`Lower bound (naive): ${Math.ceil(totalTarget / avgCoverage)}`)

