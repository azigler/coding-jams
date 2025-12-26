// Test file for Challenge 10: 📨 Depth of Christmas magic
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function maxDepth(s) {
  let depth = 0;
  let maxDepth = 0;
  
  for (const char of s) {
    if (char === '[') {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === ']') {
      depth--;
      // If depth goes negative, we have a closing bracket before opening
      if (depth < 0) {
        return -1;
      }
    }
  }
  
  // If depth is not 0 at the end, brackets are not balanced
  if (depth !== 0) {
    return -1;
  }
  
  return maxDepth;
}

const testCases = [
  { input: ['[]'], expected: 1 },
  { input: ['[[]]'], expected: 2 },
  { input: ['[][]'], expected: 1 },
  { input: ['[[][]]'], expected: 2 },
  { input: ['[[[]]]'], expected: 3 },
  { input: ['[][[]][]'], expected: 2 },
  { input: [']['], expected: -1 },
  { input: ['[[['], expected: -1 },
  { input: ['[]]]'], expected: -1 },
  { input: ['[][]['], expected: -1 },
];

for (const { input, expected } of testCases) {
  const result = maxDepth(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
