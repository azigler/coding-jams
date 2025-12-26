// Test file for Challenge 20: 🎁 Vertical warehouse
// Run with: deno run --allow-read test.ts

function dropGifts(warehouse, drops) {
  const result = warehouse.map(row => [...row]);
  
  for (const col of drops) {
    for (let row = result.length - 1; row >= 0; row--) {
      if (result[row][col] === '.') {
        result[row][col] = '#';
        break;
      }
    }
  }
  
  return result;
}

const testCases = [
  { 
    input: [
      [['.', '.', '.'], ['.', '#', '.'], ['#', '#', '.']],
      [0]
    ], 
    expected: [['.', '.', '.'], ['#', '#', '.'], ['#', '#', '.']]
  },
  { 
    input: [
      [['.', '.', '.'], ['#', '#', '.'], ['#', '#', '#']],
      [0, 2]
    ], 
    expected: [['#', '.', '.'], ['#', '#', '#'], ['#', '#', '#']]
  },
  { 
    input: [
      [['.', '.', '.'], ['.', '.', '.'], ['.', '.', '.']],
      [0, 1, 2]
    ], 
    expected: [['.', '.', '.'], ['.', '.', '.'], ['#', '#', '#']]
  },
  { 
    input: [
      [['#', '#'], ['#', '#']],
      [0, 0]
    ], 
    expected: [['#', '#'], ['#', '#']]
  },
];

for (const { input, expected } of testCases) {
  const result = dropGifts(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
