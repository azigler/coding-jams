// Test a single machine to understand performance
const input = await Deno.readTextFile("input.txt")
const lines = input
  .trim()
  .split("\n")
  .filter((line) => line.length > 0)

const line = lines[0] // First machine

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
console.log(`Target: ${targetJoltage.join(",")}`)
console.log(`Buttons: ${buttons.length}`)
console.log(`Counter count: ${targetJoltage.length}`)

// Try BFS with progress
const n = targetJoltage.length
const targetStr = targetJoltage.join(",")

const queue: Array<{ counters: number[]; presses: number }> = []
const visited = new Set<string>()

const initialState = new Array(n).fill(0)
queue.push({ counters: initialState, presses: 0 })
visited.add(initialState.join(","))

let iterations = 0
const startTime = Date.now()

while (queue.length > 0) {
  iterations++
  if (iterations % 100000 === 0) {
    console.error(
      `Iterations: ${iterations}, Queue: ${queue.length}, Visited: ${
        visited.size
      }, Time: ${Date.now() - startTime}ms`
    )
  }

  const { counters, presses } = queue.shift()!

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
      console.log(
        `Found solution: ${presses + 1} presses in ${iterations} iterations, ${
          Date.now() - startTime
        }ms`
      )
      Deno.exit(0)
    }

    if (!visited.has(newStateStr)) {
      visited.add(newStateStr)
      queue.push({ counters: newCounters, presses: presses + 1 })
    }
  }

  if (iterations > 10000000) {
    console.error("Too many iterations, giving up")
    break
  }
}

console.error("No solution found")
