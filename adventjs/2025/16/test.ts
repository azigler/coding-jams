// Test file for Challenge 16: 🎁 Packing gifts for Santa
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function packGifts(gifts, maxWeight) {
  if (gifts.length === 0) return 0;
  
  let sleighs = 1; // Start with first sleigh
  let currentWeight = 0;
  
  for (const gift of gifts) {
    // If a gift is too heavy for any sleigh, return null
    if (gift > maxWeight) {
      return null;
    }
    
    // Try to add gift to current sleigh
    if (currentWeight + gift <= maxWeight) {
      currentWeight += gift;
    } else {
      // Start a new sleigh
      sleighs++;
      currentWeight = gift;
    }
  }
  
  return sleighs;
}

const testCases = [
  { input: [[2, 3, 4, 1], 5], expected: 2 },
  { input: [[3, 3, 2, 1], 3], expected: 3 },
  { input: [[1, 1, 1, 1], 2], expected: 2 },
  { input: [[5, 6, 1], 5], expected: null },
  { input: [[], 10], expected: 0 },
];

for (const { input, expected } of testCases) {
  const result = packGifts(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
