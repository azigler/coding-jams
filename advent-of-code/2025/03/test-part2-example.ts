// Test with the example from Part 2
const example = [
  "987654321111111",
  "811111111111119",
  "234234234234278",
  "818181911112111",
]

function findMaxJoltagePart2(bank: string): number {
  const digits = bank.split("").map(Number)
  const targetLength = 12

  if (digits.length < targetLength) {
    return 0
  }

  if (digits.length === targetLength) {
    return parseInt(digits.join(""))
  }

  // We need to remove (digits.length - targetLength) digits
  // Use a greedy approach: keep digits that maximize the result
  const toRemove = digits.length - targetLength
  const stack: number[] = []

  for (let i = 0; i < digits.length; i++) {
    // While we can still remove digits and the current digit is larger
    // than the last digit in our result, remove the smaller one
    while (
      stack.length > 0 &&
      stack[stack.length - 1] < digits[i] &&
      digits.length - i + stack.length > targetLength
    ) {
      stack.pop()
    }

    // Add current digit if we haven't reached target length
    if (stack.length < targetLength) {
      stack.push(digits[i])
    }
  }

  // If we still have more than targetLength, trim from the end
  while (stack.length > targetLength) {
    stack.pop()
  }

  return parseInt(stack.join(""))
}

const expected = [
  987654321111, // "987654321111111" -> remove last 3 ones
  811111111119, // "811111111111119" -> remove middle ones
  434234234278, // "234234234234278" -> remove first 2,3,2
  888911112111, // "818181911112111" -> remove the 1s at positions 1,3,5
]

let total = 0

for (let i = 0; i < example.length; i++) {
  const maxJolt = findMaxJoltagePart2(example[i])
  const passed = maxJolt === expected[i]
  console.log(
    `Bank ${i + 1}: ${passed ? "✓" : "✗"} Got ${maxJolt}, expected ${
      expected[i]
    }`
  )
  if (!passed) {
    console.log(`  Input: ${example[i]}`)
    console.log(`  Length: ${example[i].length}, need 12 digits`)
  }
  total += maxJolt
}

console.log(`\nTotal: ${total}, expected: 3121910778619`)
console.log(`Overall: ${total === 3121910778619 ? "✓" : "✗"}`)
