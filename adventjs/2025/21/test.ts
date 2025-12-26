// Test file for Challenge 21: 🤖 The cleaning robot
// Run with: deno run --allow-read test.ts

function clearGifts(warehouse, drops) {
  const result = warehouse.map(row => [...row]);
  
  for (const col of drops) {
    // Find lowest empty cell in column
    let dropRow = -1;
    for (let row = result.length - 1; row >= 0; row--) {
      if (result[row][col] === '.') {
        dropRow = row;
        break;
      }
    }
    
    // If column is full, skip
    if (dropRow === -1) continue;
    
    // Place gift
    result[dropRow][col] = '#';
    
    // Check if row is now complete
    if (result[dropRow].every(cell => cell === '#')) {
      // Remove complete row
      result.splice(dropRow, 1);
      // Add empty row at top
      result.unshift(new Array(result[0].length).fill('.'));
    }
  }
  
  return result;
}

const testCases = [
  { 
    input: [
      [['.', '.', '.'], ['.', '.', '.'], ['#', '.', '#']],
      [1]
    ], 
    expected: [['.', '.', '.'], ['.', '.', '.'], ['.', '.', '.']]
  },
  { 
    input: [
      [['.', '.', '#'], ['#', '.', '#'], ['#', '.', '#']],
      [0, 1, 2]
    ], 
    expected: [['.', '.', '#'], ['#', '.', '#'], ['#', '.', '#']]
  },
];

for (const { input, expected } of testCases) {
  const result = clearGifts(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
