// Gaussian elimination approach to solve Part 2

const example = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

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

// Build the coefficient matrix and use Gaussian elimination
function findMinPresses(targetJoltage: number[], buttons: number[][]): number {
  const n = targetJoltage.length  // number of counters (equations)
  const m = buttons.length         // number of buttons (variables)
  
  // Build augmented matrix [A | b]
  // A[i][j] = 1 if button j affects counter i
  const matrix: number[][] = []
  for (let i = 0; i < n; i++) {
    const row = new Array(m + 1).fill(0)
    row[m] = targetJoltage[i]  // b[i]
    matrix.push(row)
  }
  
  for (let j = 0; j < m; j++) {
    for (const idx of buttons[j]) {
      if (idx < n) {
        matrix[idx][j] = 1
      }
    }
  }
  
  // Gaussian elimination with partial pivoting
  const pivotCols: number[] = []  // Which column is the pivot for each row
  let pivotRow = 0
  
  for (let col = 0; col < m && pivotRow < n; col++) {
    // Find pivot
    let maxRow = pivotRow
    for (let row = pivotRow + 1; row < n; row++) {
      if (Math.abs(matrix[row][col]) > Math.abs(matrix[maxRow][col])) {
        maxRow = row
      }
    }
    
    if (matrix[maxRow][col] === 0) continue  // No pivot in this column
    
    // Swap rows
    [matrix[pivotRow], matrix[maxRow]] = [matrix[maxRow], matrix[pivotRow]]
    
    pivotCols.push(col)
    
    // Eliminate below
    for (let row = pivotRow + 1; row < n; row++) {
      if (matrix[row][col] !== 0) {
        const factor = matrix[row][col] / matrix[pivotRow][col]
        for (let c = col; c <= m; c++) {
          matrix[row][c] -= factor * matrix[pivotRow][c]
        }
      }
    }
    
    pivotRow++
  }
  
  // Back substitution to express pivot variables in terms of free variables
  // Free variables are columns not in pivotCols
  const freeVars = []
  for (let j = 0; j < m; j++) {
    if (!pivotCols.includes(j)) {
      freeVars.push(j)
    }
  }
  
  console.log(`  Pivot cols: ${pivotCols.join(", ")}`)
  console.log(`  Free vars: ${freeVars.join(", ")}`)
  console.log(`  Degrees of freedom: ${freeVars.length}`)
  
  // For simplicity, let's use a different approach:
  // Since we know the system is solvable, we can use BFS with a smarter bound
  
  // The key insight: number of free variables = m - rank(A)
  // We can search over free variable values and compute the rest
  
  // But an even simpler observation:
  // Total presses = sum of all x_i
  // The minimum occurs when we maximize the "savings" from free variables
  
  // Let's try a greedy approach based on the structure:
  // For each free variable, find the maximum value it can take
  
  // Actually, let's just do a smarter BFS over button press COUNTS
  // The search space is: for each button, how many times do we press it?
  // Maximum presses for button j = min(target[i] for i in buttons[j])
  
  const maxPresses: number[] = []
  for (let j = 0; j < m; j++) {
    let maxPress = Infinity
    for (const idx of buttons[j]) {
      if (idx < n) {
        maxPress = Math.min(maxPress, targetJoltage[idx])
      }
    }
    maxPresses.push(maxPress === Infinity ? 0 : maxPress)
  }
  
  console.log(`  Max presses per button: ${maxPresses.join(", ")}`)
  
  // Now search using iterative deepening on total presses
  for (let totalTarget = 1; totalTarget <= targetJoltage.reduce((a, b) => a + b, 0); totalTarget++) {
    const found = searchCombinations(buttons, targetJoltage, maxPresses, totalTarget, n)
    if (found !== null) {
      console.log(`  Found solution with ${totalTarget} total presses`)
      return totalTarget
    }
  }
  
  throw new Error("No solution found")
}

// Search for a valid combination of button presses summing to exactly totalTarget
function searchCombinations(
  buttons: number[][],
  target: number[],
  maxPresses: number[],
  totalTarget: number,
  n: number
): number[] | null {
  const m = buttons.length
  const presses = new Array(m).fill(0)
  
  function search(buttonIdx: number, remaining: number): boolean {
    if (buttonIdx === m) {
      if (remaining !== 0) return false
      // Check if this combination satisfies all constraints
      const counters = new Array(n).fill(0)
      for (let j = 0; j < m; j++) {
        for (const idx of buttons[j]) {
          if (idx < n) {
            counters[idx] += presses[j]
          }
        }
      }
      return counters.every((val, i) => val === target[i])
    }
    
    // Try different values for this button
    for (let p = 0; p <= Math.min(maxPresses[buttonIdx], remaining); p++) {
      presses[buttonIdx] = p
      
      // Early pruning: check if any counter is already exceeded
      const counters = new Array(n).fill(0)
      let exceeded = false
      for (let j = 0; j <= buttonIdx; j++) {
        for (const idx of buttons[j]) {
          if (idx < n) {
            counters[idx] += presses[j]
            if (counters[idx] > target[idx]) {
              exceeded = true
              break
            }
          }
        }
        if (exceeded) break
      }
      
      if (!exceeded && search(buttonIdx + 1, remaining - p)) {
        return true
      }
    }
    
    return false
  }
  
  if (search(0, totalTarget)) {
    return presses
  }
  return null
}

const lines = example.trim().split("\n")
let total = 0

for (let i = 0; i < lines.length; i++) {
  console.log(`\nMachine ${i + 1}:`)
  const { targetJoltage, buttons } = parseLinePart2(lines[i])
  console.log(`  Targets: ${targetJoltage.join(", ")}`)
  console.log(`  Buttons: ${buttons.length}`)
  
  const minPresses = findMinPresses(targetJoltage, buttons)
  console.log(`  Min presses: ${minPresses}`)
  total += minPresses
}

console.log(`\nTotal: ${total}`)
console.log(`Expected: 33`)
console.log(`Match: ${total === 33 ? '✓' : '✗'}`)

