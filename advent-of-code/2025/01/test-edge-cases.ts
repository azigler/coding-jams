// Test edge cases for Part 2

function testCase(
  name: string,
  start: number,
  direction: string,
  steps: number,
  expected: number
) {
  let pos = start
  let passesThrough0 = 0
  const oldPos = start
  const oldUnwrapped = oldPos

  if (direction === "R") {
    pos += steps
  } else {
    pos -= steps
  }

  const newUnwrapped = pos
  const startRange = Math.min(oldUnwrapped, newUnwrapped)
  const endRange = Math.max(oldUnwrapped, newUnwrapped)

  let count = 0
  for (let i = startRange; i <= endRange; i++) {
    if (i % 100 === 0 && i !== oldUnwrapped) {
      count++
    }
  }
  passesThrough0 = count

  const passed = passesThrough0 === expected
  console.log(
    `${name}: ${passed ? "✓" : "✗"} Got ${passesThrough0}, expected ${expected}`
  )
  if (!passed) {
    console.log(
      `  Range: [${startRange}, ${endRange}], multiples: ${Array.from(
        { length: Math.floor(endRange / 100) + 1 },
        (_, i) => i * 100
      )
        .filter((x) => x >= startRange && x <= endRange && x !== oldUnwrapped)
        .join(", ")}`
    )
  }
  return passed
}

console.log("Testing edge cases:\n")

testCase("R48 from 52", 52, "R", 48, 1) // Should end at 0
testCase("L68 from 50", 50, "L", 68, 1) // Should pass through 0 once
testCase("R1000 from 50", 50, "R", 1000, 10) // Should pass through 0 ten times
testCase("L1 from 0", 0, "L", 1, 0) // Starting at 0, shouldn't count
testCase("R100 from 0", 0, "R", 100, 1) // Starting at 0, going to 100 (wraps to 0), should count once
testCase("L55 from 55", 55, "L", 55, 1) // Should end at 0
