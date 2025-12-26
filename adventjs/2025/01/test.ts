/**
 * Local Test File for Challenge 1: Filter the defective gifts
 * 
 * Tests derived from:
 * - examples.html (public examples)
 * - API results.details (server test cases)
 * 
 * Run with: deno task test 1
 * Or: cd 01 && deno run --allow-read test.ts
 */

// Import solution (inline for testing - copy your solution function here)
function filterGifts(gifts: string[]): string[] {
  return gifts.filter((gift) => !gift.includes("#"))
}

// Test cases from API results.details
const testCases = [
  {
    name: "return type check",
    input: [["car", "doll#arm", "ball", "#train"]],
    expected: ["car", "ball"],
    checkType: true,
  },
  {
    name: "filterGifts(['car', 'doll#arm', 'ball', '#train'])",
    input: [["car", "doll#arm", "ball", "#train"]],
    expected: ["car", "ball"],
  },
  {
    name: "filterGifts(['#broken', '#rusty'])",
    input: [["#broken", "#rusty"]],
    expected: [],
  },
  {
    name: "filterGifts([])",
    input: [[]],
    expected: [],
  },
  {
    name: "filterGifts(['game', 'poster', 'sticker#bad', 'console'])",
    input: [["game", "poster", "sticker#bad", "console"]],
    expected: ["game", "poster", "console"],
  },
  {
    name: "filterGifts(['#bad', 'car', '#oops', 'ball'])",
    input: [["#bad", "car", "#oops", "ball"]],
    expected: ["car", "ball"],
  },
]

// Run tests
console.log("🧪 Local Tests for Challenge 1: Filter the defective gifts\n")

let passed = 0
let failed = 0

for (const tc of testCases) {
  const result = filterGifts(...(tc.input as [string[]]))
  const resultJson = JSON.stringify(result)
  const expectedJson = JSON.stringify(tc.expected)
  const ok = resultJson === expectedJson

  if (tc.checkType) {
    const typeOk = Array.isArray(result)
    if (!typeOk) {
      console.log(`❌ ${tc.name}`)
      console.log(`   Expected: array, Got: ${typeof result}`)
      failed++
      continue
    }
  }

  if (ok) {
    console.log(`✅ ${tc.name}`)
    passed++
  } else {
    console.log(`❌ ${tc.name}`)
    console.log(`   Expected: ${expectedJson}`)
    console.log(`   Actual:   ${resultJson}`)
    failed++
  }
}

console.log(`\n${"─".repeat(50)}`)
console.log(`📊 Local Results: ${passed}/${testCases.length} passed`)

if (failed > 0) {
  console.log(`\n⚠️  ${failed} test(s) failed - fix before submitting`)
  Deno.exit(1)
} else {
  console.log(`\n✅ All local tests passed - ready to submit!`)
}
