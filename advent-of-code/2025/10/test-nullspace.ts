// Solve using Gaussian elimination + search over free variables

const line = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}`

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
  // A[i][j] = 1 if button j affects counter i
  // Use fractions to avoid floating point issues
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
  
  // Gaussian elimination
  const pivotRows: number[] = []  // pivotRows[col] = row that has pivot in this col, or -1
  let currentRow = 0
  
  for (let col = 0; col < m && currentRow < n; col++) {
    // Find pivot
    let pivotRow = -1
    for (let row = currentRow; row < n; row++) {
      if (matrix[row][col] !== 0) {
        pivotRow = row
        break
      }
    }
    
    if (pivotRow === -1) continue  // No pivot in this column (free variable)
    
    // Swap to current row
    [matrix[currentRow], matrix[pivotRow]] = [matrix[pivotRow], matrix[currentRow]]
    pivotRows.push(currentRow)
    
    // Normalize pivot row
    const pivotVal = matrix[currentRow][col]
    for (let c = col; c <= m; c++) {
      matrix[currentRow][c] /= pivotVal
    }
    
    // Eliminate other rows
    for (let row = 0; row < n; row++) {
      if (row !== currentRow && matrix[row][col] !== 0) {
        const factor = matrix[row][col]
        for (let c = col; c <= m; c++) {
          matrix[row][c] -= factor * matrix[currentRow][c]
        }
      }
    }
    
    currentRow++
  }
  
  // Identify pivot and free variables
  const pivotCols: number[] = []
  const freeCols: number[] = []
  
  for (let col = 0; col < m; col++) {
    let isPivot = false
    for (let row = 0; row < n; row++) {
      if (matrix[row][col] === 1) {
        // Check if this is the only non-zero in this row before this column
        let isOnlyOne = true
        for (let c = 0; c < col; c++) {
          if (matrix[row][c] !== 0) {
            isOnlyOne = false
            break
          }
        }
        if (isOnlyOne) {
          isPivot = true
          break
        }
      }
    }
    if (isPivot) {
      pivotCols.push(col)
    } else {
      freeCols.push(col)
    }
  }
  
  console.log(`Pivot cols: ${pivotCols.join(", ")}`)
  console.log(`Free cols: ${freeCols.join(", ")}`)
  
  // Now we need to search over integer values of free variables
  // For each free variable, what's the range?
  
  // Get the solution in terms of free variables
  // x_pivot[i] = constant - sum of (coef[j] * x_free[j])
  
  // For each free variable, find the max value it can take
  const freeMax: number[] = []
  for (const freeCol of freeCols) {
    let maxVal = Infinity
    for (const idx of buttons[freeCol]) {
      if (idx < n) {
        maxVal = Math.min(maxVal, targetJoltage[idx])
      }
    }
    freeMax.push(maxVal === Infinity ? 100 : maxVal)
  }
  
  console.log(`Free max: ${freeMax.join(", ")}`)
  
  // Brute force search over free variable values
  let minTotal = Infinity
  
  function searchFree(freeIdx: number, freeVals: number[]): void {
    if (freeIdx === freeCols.length) {
      // Compute all x values
      const x: number[] = new Array(m).fill(0)
      
      // Set free variables
      for (let i = 0; i < freeCols.length; i++) {
        x[freeCols[i]] = freeVals[i]
      }
      
      // Compute pivot variables from the equations
      for (let row = 0; row < pivotCols.length; row++) {
        const col = pivotCols[row]
        let val = matrix[row][m]  // constant term
        for (let c = col + 1; c < m; c++) {
          val -= matrix[row][c] * x[c]
        }
        x[col] = val
      }
      
      // Check if all non-negative integers
      let valid = true
      for (const val of x) {
        if (val < 0 || !Number.isInteger(val)) {
          valid = false
          break
        }
      }
      
      if (valid) {
        // Verify solution
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
            console.log(`Found solution: [${x.join(", ")}] = ${total}`)
          }
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

const { targetJoltage, buttons } = parseLinePart2(line)
const result = findMinPresses(targetJoltage, buttons)
console.log(`\nMin presses: ${result}`)
console.log(`Expected: 10`)

