// Test with the example from the problem
const example = [
  "987654321111111",
  "811111111111119",
  "234234234234278",
  "818181911112111",
]

function findMaxJoltage(bank: string): number {
  const digits = bank.split("").map(Number)
  let maxJoltage = 0

  // Try all pairs of positions (i, j) where i < j
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      // Form the number from digits[i] and digits[j]
      const joltage = digits[i] * 10 + digits[j]
      maxJoltage = Math.max(maxJoltage, joltage)
    }
  }

  return maxJoltage
}

const expected = [98, 89, 78, 92]
let total = 0

for (let i = 0; i < example.length; i++) {
  const maxJolt = findMaxJoltage(example[i])
  const passed = maxJolt === expected[i]
  console.log(
    `Bank ${i + 1}: ${passed ? "✓" : "✗"} Got ${maxJolt}, expected ${
      expected[i]
    }`
  )
  total += maxJolt
}

console.log(`\nTotal: ${total}, expected: 357`)
console.log(`Overall: ${total === 357 ? "✓" : "✗"}`)
