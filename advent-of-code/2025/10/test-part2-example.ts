// Test Part 2 on the example
const example = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

const lines = example.trim().split("\n")

// Parse a line for Part 2 (joltage requirements)
function parseLinePart2(line: string) {
  // Extract joltage requirements
  const joltageMatch = line.match(/\{([0-9,]+)\}/)
  if (!joltageMatch) throw new Error(`No joltage found: ${line}`)
  const joltageStr = joltageMatch[1]
  const targetJoltage = joltageStr.split(",").map(Number)

  // Extract buttons
  const buttons: number[][] = []
  const buttonMatches = line.matchAll(/\(([0-9,]+)\)/g)
  for (const match of buttonMatches) {
    const indices = match[1].split(",").map(Number)
    buttons.push(indices)
  }

  return { targetJoltage, buttons }
}

// Find minimum button presses using DP with memoization
function findMinPressesPart2(
  targetJoltage: number[],
  buttons: number[][]
): number {
  const n = targetJoltage.length
  const targetStr = targetJoltage.join(",")
  const memo = new Map<string, number>()

  function dp(counters: number[]): number {
    const stateStr = counters.join(",")

    if (stateStr === targetStr) return 0

    if (memo.has(stateStr)) {
      return memo.get(stateStr)!
    }

    if (counters.some((val, i) => val > targetJoltage[i])) {
      return Infinity
    }

    let minPresses = Infinity

    for (const button of buttons) {
      const newCounters = [...counters]
      for (const index of button) {
        if (index < n) {
          newCounters[index]++
        }
      }
      const result = dp(newCounters)
      if (result !== Infinity) {
        minPresses = Math.min(minPresses, 1 + result)
      }
    }

    memo.set(stateStr, minPresses)
    return minPresses
  }

  const initialState = new Array(n).fill(0)
  const result = dp(initialState)

  if (result === Infinity) {
    throw new Error("No solution found")
  }

  return result
}

// Test each machine
let total = 0
for (const line of lines) {
  const { targetJoltage, buttons } = parseLinePart2(line)
  const minPresses = findMinPressesPart2(targetJoltage, buttons)
  console.log(`Machine: joltage=${targetJoltage.join(",")}`)
  console.log(`  Min presses: ${minPresses}`)
  total += minPresses
}

console.log(`\nTotal: ${total}`)
console.log(`Expected: 33`)
console.log(`Match: ${total === 33 ? "✓" : "✗"}`)
