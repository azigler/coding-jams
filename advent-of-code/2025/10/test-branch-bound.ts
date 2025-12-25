// Test branch-and-bound approach
const example = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}`

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

const { targetJoltage, buttons } = parseLinePart2(example)
const n = targetJoltage.length

console.log(`Target: ${targetJoltage.join(",")}`)
console.log(`Buttons: ${buttons.length}`)

// Try all combinations of button presses with increasing total
function findMinPresses(targetJoltage: number[], buttons: number[][]): number {
  const n = targetJoltage.length
  
  // Try increasing total presses
  const maxTotal = targetJoltage.reduce((a, b) => a + b, 0)
  
  function tryCombination(presses: number[], depth: number, maxDepth: number): number | null {
    if (depth > maxDepth) return null
    
    // Calculate current state
    const counters = new Array(n).fill(0)
    for (let i = 0; i < buttons.length; i++) {
      for (let j = 0; j < presses[i]; j++) {
        for (const idx of buttons[i]) {
          if (idx < n) counters[idx]++
        }
      }
    }
    
    // Check if we've reached target
    if (counters.every((val, i) => val === targetJoltage[i])) {
      return presses.reduce((a, b) => a + b, 0)
    }
    
    // Check if we've exceeded any target
    if (counters.some((val, i) => val > targetJoltage[i])) {
      return null
    }
    
    // Try adding one more press to each button
    let minResult = Infinity
    for (let i = 0; i < buttons.length; i++) {
      const newPresses = [...presses]
      newPresses[i]++
      const result = tryCombination(newPresses, depth + 1, maxDepth)
      if (result !== null && result < minResult) {
        minResult = result
      }
    }
    
    return minResult === Infinity ? null : minResult
  }
  
  for (let maxDepth = 1; maxDepth <= maxTotal; maxDepth++) {
    const presses = new Array(buttons.length).fill(0)
    const result = tryCombination(presses, 0, maxDepth)
    if (result !== null) {
      return result
    }
  }
  
  throw new Error("No solution found")
}

const result = findMinPresses(targetJoltage, buttons)
console.log(`Result: ${result}`)
console.log(`Expected: 10`)
console.log(`Match: ${result === 10 ? '✓' : '✗'}`)

