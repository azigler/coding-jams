// Test with the example from the problem
const example = [
  "L68",
  "L30",
  "R48",
  "L5",
  "R60",
  "L55",
  "L1",
  "L99",
  "R14",
  "L82",
]

let pos = 50
let passesThrough0 = 0

for (const line of example) {
  const direction = line.charAt(0)
  const steps = parseInt(line.substring(1))
  const oldPos = pos
  const oldUnwrapped = oldPos

  if (direction === "R") {
    pos += steps
  } else {
    pos -= steps
  }

  const newUnwrapped = pos
  const start = Math.min(oldUnwrapped, newUnwrapped)
  const end = Math.max(oldUnwrapped, newUnwrapped)

  // Count all multiples of 100 in the range, excluding the starting position
  for (let i = start; i <= end; i++) {
    if (i % 100 === 0 && i !== oldUnwrapped) {
      passesThrough0++
      console.log(`${line}: points at 0 at position ${i} (+1)`)
    }
  }

  // Wrap the position
  pos = ((pos % 100) + 100) % 100

  console.log(`${line}: pos=${oldPos} -> ${pos}, total=${passesThrough0}`)
}

console.log(`\nTotal: ${passesThrough0} (expected: 6)`)
