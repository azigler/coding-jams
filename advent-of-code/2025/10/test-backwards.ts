// Test solving backwards from target
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
console.log(`Target: ${targetJoltage.join(",")}`)
console.log(`Expected: 10 presses`)

const n = targetJoltage.length

// Try backwards BFS: start from target, work backwards by "undoing" button presses
// If pressing a button increments counters, undoing it decrements them
const queue: Array<{ counters: number[]; presses: number }> = []
const visited = new Set<string>()

const targetState = targetJoltage.join(",")
const initialState = new Array(n).fill(0).join(",")

queue.push({ counters: [...targetJoltage], presses: 0 })
visited.add(targetState)

while (queue.length > 0) {
  const { counters, presses } = queue.shift()!

  // Try "undoing" each button (decrement affected counters)
  for (const button of buttons) {
    const newCounters = [...counters]
    let valid = true

    // Decrement counters affected by this button
    for (const index of button) {
      if (index < n) {
        if (newCounters[index] <= 0) {
          valid = false
          break
        }
        newCounters[index]--
      }
    }

    if (!valid) continue

    const newStateStr = newCounters.join(",")

    if (newStateStr === initialState) {
      console.log(`Found solution: ${presses + 1} presses`)
      Deno.exit(0)
    }

    if (!visited.has(newStateStr)) {
      visited.add(newStateStr)
      queue.push({ counters: newCounters, presses: presses + 1 })
    }
  }
}

console.log("No solution found")
