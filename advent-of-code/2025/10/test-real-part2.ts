// Test Part 2 on real input with the optimized approach

const input = Deno.readTextFileSync("input.txt").trim()
const lines = input.split("\n").filter(Boolean)

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

function findMinPresses(targetJoltage: number[], buttons: number[][]): number {
  const n = targetJoltage.length
  const m = buttons.length
  
  // Calculate max presses for each button
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
  
  // Search using iterative deepening on total presses
  const sumTargets = targetJoltage.reduce((a, b) => a + b, 0)
  
  for (let totalTarget = 1; totalTarget <= sumTargets; totalTarget++) {
    const presses = new Array(m).fill(0)
    
    const found = search(0, totalTarget)
    if (found) {
      return totalTarget
    }
    
    function search(buttonIdx: number, remaining: number): boolean {
      if (buttonIdx === m) {
        if (remaining !== 0) return false
        // Check constraints
        const counters = new Array(n).fill(0)
        for (let j = 0; j < m; j++) {
          for (const idx of buttons[j]) {
            if (idx < n) {
              counters[idx] += presses[j]
            }
          }
        }
        return counters.every((val, i) => val === targetJoltage[i])
      }
      
      for (let p = 0; p <= Math.min(maxPresses[buttonIdx], remaining); p++) {
        presses[buttonIdx] = p
        
        // Early pruning
        const counters = new Array(n).fill(0)
        let exceeded = false
        for (let j = 0; j <= buttonIdx; j++) {
          for (const idx of buttons[j]) {
            if (idx < n) {
              counters[idx] += presses[j]
              if (counters[idx] > targetJoltage[idx]) {
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
  }
  
  throw new Error("No solution found")
}

console.log(`Processing ${lines.length} machines...`)
const startTime = Date.now()

let total = 0
for (let i = 0; i < lines.length; i++) {
  if ((i + 1) % 10 === 0) {
    console.log(`Machine ${i + 1}/${lines.length}...`)
  }
  const { targetJoltage, buttons } = parseLinePart2(lines[i])
  const minPresses = findMinPresses(targetJoltage, buttons)
  total += minPresses
}

const elapsed = Date.now() - startTime
console.log(`\nPart 2: ${total}`)
console.log(`Time: ${elapsed}ms`)

