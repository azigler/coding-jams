// Test file for Challenge 6: 🧤 Matching gloves
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function matchGloves(gloves) {
  // Track available gloves by color and hand
  const available = {
    L: {}, // color -> count
    R: {}  // color -> count
  };
  
  const pairs = [];
  
  for (const glove of gloves) {
    const { hand, color } = glove;
    const oppositeHand = hand === 'L' ? 'R' : 'L';
    
    // Check if there's a matching glove of the opposite hand
    if (available[oppositeHand][color] > 0) {
      // Found a pair! Add to result and remove the matched glove
      pairs.push(color);
      available[oppositeHand][color]--;
    } else {
      // No match yet, add this glove to available pool
      if (!available[hand][color]) {
        available[hand][color] = 0;
      }
      available[hand][color]++;
    }
  }
  
  return pairs;
}

const testCases = [
  { 
    input: [[
      { hand: 'L', color: 'red' },
      { hand: 'R', color: 'red' },
      { hand: 'R', color: 'green' },
      { hand: 'L', color: 'blue' },
      { hand: 'L', color: 'green' }
    ]], 
    expected: ['red', 'green']
  },
  { 
    input: [[
      { hand: 'L', color: 'gold' },
      { hand: 'R', color: 'gold' },
      { hand: 'L', color: 'gold' },
      { hand: 'L', color: 'gold' },
      { hand: 'R', color: 'gold' }
    ]], 
    expected: ['gold', 'gold']
  },
  { 
    input: [[
      { hand: 'L', color: 'red' },
      { hand: 'R', color: 'green' },
      { hand: 'L', color: 'blue' }
    ]], 
    expected: []
  },
  { 
    input: [[
      { hand: 'L', color: 'green' },
      { hand: 'L', color: 'red' },
      { hand: 'R', color: 'red' },
      { hand: 'R', color: 'green' }
    ]], 
    expected: ['red', 'green']
  },
];

for (const { input, expected } of testCases) {
  const result = matchGloves(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
