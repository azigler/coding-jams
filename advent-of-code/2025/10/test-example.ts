// Test on the example from the challenge
const example = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`

const lines = example.trim().split("\n")

// Parse a line
function parseLine(line: string) {
  // Extract indicator lights
  const lightsMatch = line.match(/\[([.#]+)\]/)
  if (!lightsMatch) throw new Error(`No lights found: ${line}`)
  const lightsStr = lightsMatch[1]
  const targetLights = lightsStr.split("").map((c) => (c === "#" ? 1 : 0))

  // Extract buttons
  const buttons: number[][] = []
  const buttonMatches = line.matchAll(/\(([0-9,]+)\)/g)
  for (const match of buttonMatches) {
    const indices = match[1].split(",").map(Number)
    buttons.push(indices)
  }

  return { targetLights, buttons }
}

// Find minimum button presses using BFS
function findMinPresses(targetLights: number[], buttons: number[][]): number {
  const n = targetLights.length
  const targetState = targetLights.join("")

  // BFS from all-off state to target state
  const queue: Array<{ state: number[]; presses: number }> = []
  const visited = new Set<string>()

  const initialState = new Array(n).fill(0)
  const initialStateStr = initialState.join("")

  if (initialStateStr === targetState) return 0

  queue.push({ state: initialState, presses: 0 })
  visited.add(initialStateStr)

  while (queue.length > 0) {
    const { state, presses } = queue.shift()!

    // Try each button
    for (const button of buttons) {
      const newState = [...state]

      // Toggle lights affected by this button
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

  throw new Error("No solution found")
}

// Test each machine
let total = 0
for (const line of lines) {
  const { targetLights, buttons } = parseLine(line)
  const minPresses = findMinPresses(targetLights, buttons)
  console.log(`Machine: ${line.substring(0, 20)}...`)
  console.log(`  Target: ${targetLights.join("")}`)
  console.log(`  Min presses: ${minPresses}`)
  total += minPresses
}

console.log(`\nTotal: ${total}`)
console.log(`Expected: 7`)
console.log(`Match: ${total === 7 ? "✓" : "✗"}`)
