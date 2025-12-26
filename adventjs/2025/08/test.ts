// Test file for Challenge 8: 🎁 Find the unique toy
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function findUniqueToy(toy) {
  // Count occurrences (case-insensitive)
  const counts = {};
  for (const char of toy) {
    const lower = char.toLowerCase();
    counts[lower] = (counts[lower] || 0) + 1;
  }
  
  // Find first character with count === 1 (case-insensitive)
  for (const char of toy) {
    const lower = char.toLowerCase();
    if (counts[lower] === 1) {
      return char; // Return as it appears in original string
    }
  }
  
  return ''; // No unique letter found
}

const testCases = [
  { input: ['Gift'], expected: 'G' },
  { input: ['sS'], expected: '' },
  { input: ['reindeeR'], expected: 'i' },
  { input: ['AaBbCc'], expected: '' },
  { input: ['abcDEF'], expected: 'a' },
  { input: ['aAaAaAF'], expected: 'F' },
  { input: ['sTreSS'], expected: 'T' },
  { input: ['z'], expected: 'z' },
];

for (const { input, expected } of testCases) {
  const result = findUniqueToy(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
