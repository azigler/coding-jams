// Test a greedy approach
const example = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

const lines = example.trim().split("\n")

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

// Try a simple iterative approach: keep pressing buttons until we reach target
// Use BFS but with a depth limit based on a reasonable upper bound
function findMinPressesPart2(
  targetJoltage: number[],
  buttons: number[][]
): number {
  const n = targetJoltage.length
  const maxTarget = Math.max(...targetJoltage)
  const totalTarget = targetJoltage.reduce((a, b) => a + b, 0)

  // Upper bound: worst case is pressing buttons one at a time
  const maxDepth = Math.min(totalTarget, maxTarget * buttons.length)

  const queue: Array<{ counters: number[]; presses: number }> = []
  const visited = new Set<string>()

  const initialState = new Array(n).fill(0)
  const initialStateStr = initialState.join(",")
  const targetStr = targetJoltage.join(",")

  if (initialStateStr === targetStr) return 0

  queue.push({ counters: initialState, presses: 0 })
  visited.add(initialStateStr)

  while (queue.length > 0) {
    const { counters, presses } = queue.shift()!

    if (presses >= maxDepth) continue

    for (const button of buttons) {
      const newCounters = [...counters]
      for (const index of button) {
        if (index < n) {
          newCounters[index]++
        }
      }

      if (newCounters.some((val, i) => val > targetJoltage[i])) {
        continue
      }

      const newStateStr = newCounters.join(",")

      if (newStateStr === targetStr) {
        return presses + 1
      }

      if (!visited.has(newStateStr) && presses + 1 < maxDepth) {
        visited.add(newStateStr)
        queue.push({ counters: newCounters, presses: presses + 1 })
      }
    }
  }

  throw new Error("No solution found")
}

let total = 0
for (const line of lines) {
  const { targetJoltage, buttons } = parseLinePart2(line)
  const minPresses = findMinPressesPart2(targetJoltage, buttons)
  console.log(`Machine: ${minPresses} presses`)
  total += minPresses
}

console.log(`\nTotal: ${total}`)
console.log(`Expected: 33`)
console.log(`Match: ${total === 33 ? "✓" : "✗"}`)
