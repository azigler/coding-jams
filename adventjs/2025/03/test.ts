/**
 * Local Test File for Challenge 3: Help the intern
 * 
 * Run with: deno task test 3
 */

// Inline solution for testing
function drawGift(size: number, symbol: string): string {
  if (size < 2) return ""
  
  const lines: string[] = []
  
  // Top row
  lines.push(symbol.repeat(size))
  
  // Middle rows
  for (let i = 0; i < size - 2; i++) {
    lines.push(symbol + " ".repeat(size - 2) + symbol)
  }
  
  // Bottom row
  lines.push(symbol.repeat(size))
  
  return lines.join("\n")
}

// Test cases from examples
const testCases = [
  {
    name: "drawGift(4, '*')",
    input: [4, "*"] as [number, string],
    expected: "****\n*  *\n*  *\n****",
  },
  {
    name: "drawGift(3, '#')",
    input: [3, "#"] as [number, string],
    expected: "###\n# #\n###",
  },
  {
    name: "drawGift(2, '-')",
    input: [2, "-"] as [number, string],
    expected: "--\n--",
  },
  {
    name: "drawGift(1, '+')",
    input: [1, "+"] as [number, string],
    expected: "",
  },
  {
    name: "drawGift(0, '*')",
    input: [0, "*"] as [number, string],
    expected: "",
  },
]

// Run tests
console.log("🧪 Local Tests for Challenge 3: Help the intern\n")

let passed = 0
let failed = 0

for (const tc of testCases) {
  const result = drawGift(tc.input[0], tc.input[1])
  const ok = result === tc.expected

  if (ok) {
    console.log(`✅ ${tc.name}`)
    passed++
  } else {
    console.log(`❌ ${tc.name}`)
    console.log(`   Expected: ${JSON.stringify(tc.expected)}`)
    console.log(`   Actual:   ${JSON.stringify(result)}`)
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
