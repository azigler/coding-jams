// Test using a more compact state representation
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
const maxVal = Math.max(...targetJoltage)

console.log(`Counters: ${n}, Max value: ${maxVal}`)
console.log(`Can encode state as number: ${maxVal < 256 ? "Yes" : "No"}`)

// Try encoding state as a single number (base maxVal+1)
function encode(counters: number[]): number {
  let encoded = 0
  let base = maxVal + 1
  for (let i = 0; i < counters.length; i++) {
    encoded = encoded * base + counters[i]
  }
  return encoded
}

function decode(encoded: number, n: number): number[] {
  const base = maxVal + 1
  const counters: number[] = []
  let val = encoded
  for (let i = n - 1; i >= 0; i--) {
    counters[i] = val % base
    val = Math.floor(val / base)
  }
  return counters
}

const testState = [3, 5, 4, 7]
const encoded = encode(testState)
const decoded = decode(encoded, n)
console.log(`Original: ${testState.join(",")}`)
console.log(`Encoded: ${encoded}`)
console.log(`Decoded: ${decoded.join(",")}`)
console.log(
  `Match: ${testState.every((v, i) => v === decoded[i]) ? "Yes" : "No"}`
)
