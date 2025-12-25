const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")

// Part 1: Find maximum joltage from each bank
// For each bank, we need to turn on exactly 2 batteries
// The joltage is the number formed by the two digits (in order)
// We need to find the maximum possible joltage from each bank

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

let totalJoltage = 0
for (const line of lines) {
  if (!line.trim()) continue
  const maxJolt = findMaxJoltage(line.trim())
  totalJoltage += maxJolt
}

console.log(`Part 1: ${totalJoltage}`)

// Part 2: Find maximum joltage by turning on exactly 12 batteries
// We need to select exactly 12 digits in order to form the largest number

function findMaxJoltagePart2(bank: string): number {
  const digits = bank.split("").map(Number)
  const targetLength = 12

  if (digits.length < targetLength) {
    // Not enough digits, return 0 or handle edge case
    return 0
  }

  if (digits.length === targetLength) {
    // Exactly 12 digits, return the number formed by all of them
    return parseInt(digits.join(""))
  }

  // We need to remove (digits.length - targetLength) digits
  // Use a greedy approach: keep digits that maximize the result
  // This is similar to "remove k digits to get largest number"
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

let totalJoltagePart2 = 0
for (const line of lines) {
  if (!line.trim()) continue
  const maxJolt = findMaxJoltagePart2(line.trim())
  totalJoltagePart2 += maxJolt
}

console.log(`Part 2: ${totalJoltagePart2}`)
