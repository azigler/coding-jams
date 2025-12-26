/**
 * Local Test File for Challenge 2: Manufacture the toys
 *
 * Tests derived from:
 * - examples.html (public examples)
 * - API results.details (server test cases)
 *
 * Run with: deno task test 2
 * Or: cd 02 && deno run --allow-read test.ts
 */

// Import solution (inline for testing - copy your solution function here)
function manufactureGifts(
  giftsToProduce: Array<{ toy: string; quantity: number }>
): string[] {
  const result: string[] = []
  for (const gift of giftsToProduce) {
    if (typeof gift.quantity === "number" && gift.quantity > 0) {
      for (let i = 0; i < gift.quantity; i++) {
        result.push(gift.toy)
      }
    }
  }
  return result
}

// Test cases from API results.details
const testCases = [
  {
    name: "return type check",
    input: [[{ toy: "car", quantity: 3 }]],
    expected: ["car", "car", "car"],
    checkType: true,
  },
  {
    name: "manufactureGifts([{ toy: 'car', quantity: 3 }, { toy: 'doll', quantity: 1 }, { toy: 'ball', quantity: 2 }])",
    input: [
      [
        { toy: "car", quantity: 3 },
        { toy: "doll", quantity: 1 },
        { toy: "ball", quantity: 2 },
      ],
    ],
    expected: ["car", "car", "car", "doll", "ball", "ball"],
  },
  {
    name: "manufactureGifts([{ toy: 'train', quantity: 0 }, { toy: 'bear', quantity: -2 }, { toy: 'puzzle', quantity: 1 }])",
    input: [
      [
        { toy: "train", quantity: 0 },
        { toy: "bear", quantity: -2 },
        { toy: "puzzle", quantity: 1 },
      ],
    ],
    expected: ["puzzle"],
  },
  {
    name: "manufactureGifts([])",
    input: [[]],
    expected: [],
  },
  {
    name: "manufactureGifts([{ toy: 'car', quantity: 1 }, { toy: 'doll', quantity: 2 }, { toy: 'ball', quantity: 0 }, { toy: 'car', quantity: 3 }])",
    input: [
      [
        { toy: "car", quantity: 1 },
        { toy: "doll", quantity: 2 },
        { toy: "ball", quantity: 0 },
        { toy: "car", quantity: 3 },
      ],
    ],
    expected: ["car", "doll", "doll", "car", "car", "car"],
  },
  {
    name: "manufactureGifts([{ toy: 'robot', quantity: 2 }, { toy: 'drone', quantity: -3 }, { toy: 'ball', quantity: 1 }])",
    input: [
      [
        { toy: "robot", quantity: 2 },
        { toy: "drone", quantity: -3 },
        { toy: "ball", quantity: 1 },
      ],
    ],
    expected: ["robot", "robot", "ball"],
  },
]

// Run tests
console.log("🧪 Local Tests for Challenge 2: Manufacture the toys\n")

let passed = 0
let failed = 0

for (const tc of testCases) {
  const result = manufactureGifts(
    ...(tc.input as [Array<{ toy: string; quantity: number }>])
  )
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
