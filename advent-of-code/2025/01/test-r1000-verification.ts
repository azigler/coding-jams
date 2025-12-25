// Verify R1000 from 50 should count 10 times
let pos = 50
let passesThrough0 = 0

const direction = "R"
const steps = 1000
const oldPos = pos
const oldUnwrapped = oldPos

console.log(`Starting at ${oldPos}, moving ${direction}${steps}`)

if (direction === "R") {
  pos += steps
} else {
  pos -= steps
}

const newUnwrapped = pos
const start = Math.min(oldUnwrapped, newUnwrapped)
const end = Math.max(oldUnwrapped, newUnwrapped)

console.log(`Unwrapped: ${oldUnwrapped} -> ${newUnwrapped}`)
console.log(`Range: [${start}, ${end}]`)

// Count all multiples of 100 in the range, excluding the starting position
let count = 0
for (let i = start; i <= end; i++) {
  if (i % 100 === 0 && i !== oldUnwrapped) {
    count++
    console.log(`  Multiple of 100: ${i}`)
  }
}

passesThrough0 = count

console.log(`\nTotal times pointing at 0: ${passesThrough0} (expected: 10)`)
