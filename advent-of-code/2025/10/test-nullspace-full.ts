// Solve Part 2 using Gaussian elimination + search over free variables

function parseLinePart2(line: string) {
  const joltageMatch = line.match(/\{([0-9,]+)\}/)
  if (!joltageMatch) throw new Error(`No joltage found: ${line}`)
  const targetJoltage = joltageMatch[1].split(",").map(Number)
  
  const buttons: number[][] = []
  const buttonMatches = line.matchAll(/\(([0-9,]+)\)/g)
  for (const match of buttonMatches) {
    buttons.push(match[1].split(",").map(Number))
  }
  
  return { targetJoltage, buttons }
}

function findMinPresses(targetJoltage: number[], buttons: number[][]): number {
  const n = targetJoltage.length
  const m = buttons.length
  
  // Build augmented matrix [A | b]
  const matrix: number[][] = []
  for (let i = 0; i < n; i++) {
    const row = new Array(m + 1).fill(0)
    row[m] = targetJoltage[i]
    for (let j = 0; j < m; j++) {
      if (buttons[j].includes(i)) {
        row[j] = 1
      }
    }
    matrix.push(row)
  }
  
  // Gaussian elimination to reduced row echelon form
  const pivotColForRow: number[] = new Array(n).fill(-1)
  let currentRow = 0
  
  for (let col = 0; col < m && currentRow < n; col++) {
    // Find pivot
    let pivotRow = -1
    for (let row = currentRow; row < n; row++) {
      if (Math.abs(matrix[row][col]) > 1e-10) {
        pivotRow = row
        break
      }
    }
    
    if (pivotRow === -1) continue
    
    // Swap
    [matrix[currentRow], matrix[pivotRow]] = [matrix[pivotRow], matrix[currentRow]]
    pivotColForRow[currentRow] = col
    
    // Normalize
    const pivotVal = matrix[currentRow][col]
    for (let c = col; c <= m; c++) {
      matrix[currentRow][c] /= pivotVal
    }
    
    // Eliminate all other rows
    for (let row = 0; row < n; row++) {
      if (row !== currentRow && Math.abs(matrix[row][col]) > 1e-10) {
        const factor = matrix[row][col]
        for (let c = col; c <= m; c++) {
          matrix[row][c] -= factor * matrix[currentRow][c]
        }
      }
    }
    
    currentRow++
  }
  
  // Identify pivot and free columns
  const pivotCols = new Set(pivotColForRow.filter(c => c >= 0))
  const freeCols: number[] = []
  for (let col = 0; col < m; col++) {
    if (!pivotCols.has(col)) {
      freeCols.push(col)
    }
  }
  
  // Get max value for each free variable
  const freeMax: number[] = []
  for (const freeCol of freeCols) {
    let maxVal = Infinity
    for (const idx of buttons[freeCol]) {
      if (idx < n) {
        maxVal = Math.min(maxVal, targetJoltage[idx])
      }
    }
    freeMax.push(maxVal === Infinity ? 200 : maxVal)
  }
  
  // Search over free variable values
  let minTotal = Infinity
  
  function searchFree(freeIdx: number, freeVals: number[]): void {
    if (freeIdx === freeCols.length) {
      const x: number[] = new Array(m).fill(0)
      
      // Set free variables
      for (let i = 0; i < freeCols.length; i++) {
        x[freeCols[i]] = freeVals[i]
      }
      
      // Compute pivot variables from RREF
      for (let row = 0; row < n; row++) {
        const col = pivotColForRow[row]
        if (col === -1) continue
        
        let val = matrix[row][m]
        for (let c = col + 1; c < m; c++) {
          val -= matrix[row][c] * x[c]
        }
        x[col] = val
      }
      
      // Check non-negative integers
      for (const val of x) {
        if (val < -1e-10 || Math.abs(val - Math.round(val)) > 1e-10) {
          return
        }
      }
      
      // Round to integers
      for (let i = 0; i < m; i++) {
        x[i] = Math.round(x[i])
      }
      
      // Verify
      const counters = new Array(n).fill(0)
      for (let j = 0; j < m; j++) {
        for (const idx of buttons[j]) {
          if (idx < n) {
            counters[idx] += x[j]
          }
        }
      }
      
      if (counters.every((val, i) => val === targetJoltage[i])) {
        const total = x.reduce((a, b) => a + b, 0)
        if (total < minTotal) {
          minTotal = total
        }
      }
      return
    }
    
    for (let v = 0; v <= freeMax[freeIdx]; v++) {
      freeVals[freeIdx] = v
      searchFree(freeIdx + 1, freeVals)
    }
  }
  
  searchFree(0, [])
  
  if (minTotal === Infinity) {
    throw new Error("No solution found")
  }
  
  return minTotal
}

// Test on examples
const example = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

const lines = example.trim().split("\n")
let total = 0
const expected = [10, 12, 11]

for (let i = 0; i < lines.length; i++) {
  const { targetJoltage, buttons } = parseLinePart2(lines[i])
  const result = findMinPresses(targetJoltage, buttons)
  const match = result === expected[i] ? "✓" : "✗"
  console.log(`Machine ${i + 1}: ${result} (expected ${expected[i]}) ${match}`)
  total += result
}

console.log(`\nTotal: ${total}`)
console.log(`Expected: 33`)
console.log(`Match: ${total === 33 ? "✓" : "✗"}`)

