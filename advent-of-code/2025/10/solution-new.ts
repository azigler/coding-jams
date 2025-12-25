// Day 10 Solution - Part 1 and Part 2
// Part 2 uses Gaussian elimination + search over free variables

const input = Deno.readTextFileSync("input.txt").trim()
const lines = input.split("\n").filter(Boolean)

// Part 1: Toggle lights (XOR)
function parseLine(line: string) {
  const lightMatch = line.match(/\[([.#]+)\]/)
  if (!lightMatch) throw new Error(`No lights found: ${line}`)
  const lightPattern = lightMatch[1]
  const targetLights = lightPattern.split("").map(c => c === "#" ? 1 : 0)
  
  const buttons: number[][] = []
  const buttonMatches = line.matchAll(/\(([0-9,]+)\)/g)
  for (const match of buttonMatches) {
    buttons.push(match[1].split(",").map(Number))
  }
  
  return { targetLights, buttons }
}

function findMinPressesPart1(targetLights: number[], buttons: number[][]): number {
  const n = targetLights.length
  const targetState = targetLights.join("")
  
  const queue: Array<{ state: number[]; presses: number }> = []
  const visited = new Set<string>()
  
  const initialState = new Array(n).fill(0)
  const initialStateStr = initialState.join("")
  
  if (initialStateStr === targetState) return 0
  
  queue.push({ state: initialState, presses: 0 })
  visited.add(initialStateStr)
  
  while (queue.length > 0) {
    const { state, presses } = queue.shift()!
    
    for (const button of buttons) {
      const newState = [...state]
      for (const index of button) {
        if (index < n) {
          newState[index] = (newState[index] + 1) % 2
        }
      }
      
      const newStateStr = newState.join("")
      
      if (newStateStr === targetState) {
        return presses + 1
      }
      
      if (!visited.has(newStateStr)) {
        visited.add(newStateStr)
        queue.push({ state: newState, presses: presses + 1 })
      }
    }
  }
  
  throw new Error("No solution found for Part 1")
}

// Part 2: Increment counters
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

function findMinPressesPart2(targetJoltage: number[], buttons: number[][]): number {
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
  
  // Gaussian elimination to RREF
  const pivotColForRow: number[] = new Array(n).fill(-1)
  let currentRow = 0
  
  for (let col = 0; col < m && currentRow < n; col++) {
    let pivotRow = -1
    for (let row = currentRow; row < n; row++) {
      if (Math.abs(matrix[row][col]) > 1e-10) {
        pivotRow = row
        break
      }
    }
    
    if (pivotRow === -1) continue
    
    [matrix[currentRow], matrix[pivotRow]] = [matrix[pivotRow], matrix[currentRow]]
    pivotColForRow[currentRow] = col
    
    const pivotVal = matrix[currentRow][col]
    for (let c = col; c <= m; c++) {
      matrix[currentRow][c] /= pivotVal
    }
    
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
  
  // Identify free columns
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
      
      for (let i = 0; i < freeCols.length; i++) {
        x[freeCols[i]] = freeVals[i]
      }
      
      for (let row = 0; row < n; row++) {
        const col = pivotColForRow[row]
        if (col === -1) continue
        
        let val = matrix[row][m]
        for (let c = col + 1; c < m; c++) {
          val -= matrix[row][c] * x[c]
        }
        x[col] = val
      }
      
      for (const val of x) {
        if (val < -1e-10 || Math.abs(val - Math.round(val)) > 1e-10) {
          return
        }
      }
      
      for (let i = 0; i < m; i++) {
        x[i] = Math.round(x[i])
      }
      
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
    throw new Error("No solution found for Part 2")
  }
  
  return minTotal
}

// Part 1
let total1 = 0
for (const line of lines) {
  const { targetLights, buttons } = parseLine(line)
  total1 += findMinPressesPart1(targetLights, buttons)
}
console.log(`Part 1: ${total1}`)

// Part 2
let total2 = 0
for (let i = 0; i < lines.length; i++) {
  if ((i + 1) % 20 === 0) {
    console.error(`Processing machine ${i + 1}/${lines.length}...`)
  }
  const { targetJoltage, buttons } = parseLinePart2(lines[i])
  total2 += findMinPressesPart2(targetJoltage, buttons)
}
console.log(`Part 2: ${total2}`)

