// Test file for Challenge 17: 🎄 The Christmas lights panel
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function hasFourLights(board) {
  if (board.length === 0) return false;
  
  const rows = board.length;
  const cols = board[0].length;
  
  // Check horizontal lines
  for (let r = 0; r < rows; r++) {
    let count = 0;
    let currentColor = null;
    
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell === '.') {
        count = 0;
        currentColor = null;
      } else if (cell === currentColor) {
        count++;
        if (count >= 4) return true;
      } else {
        count = 1;
        currentColor = cell;
        if (count >= 4) return true;
      }
    }
  }
  
  // Check vertical lines
  for (let c = 0; c < cols; c++) {
    let count = 0;
    let currentColor = null;
    
    for (let r = 0; r < rows; r++) {
      const cell = board[r][c];
      if (cell === '.') {
        count = 0;
        currentColor = null;
      } else if (cell === currentColor) {
        count++;
        if (count >= 4) return true;
      } else {
        count = 1;
        currentColor = cell;
        if (count >= 4) return true;
      }
    }
  }
  
  return false;
}

const testCases = [
  { 
    input: [[
      ['.', '.', '.', '.', '.'],
      ['R', 'R', 'R', 'R', '.'],
      ['G', 'G', '.', '.', '.']
    ]], 
    expected: true 
  },
  { 
    input: [[
      ['.', 'G', '.', '.'],
      ['.', 'G', '.', '.'],
      ['.', 'G', '.', '.'],
      ['.', 'G', '.', '.']
    ]], 
    expected: true 
  },
  { 
    input: [[
      ['R', 'G', 'R'],
      ['G', 'R', 'G'],
      ['G', 'R', 'G']
    ]], 
    expected: false 
  },
];

for (const { input, expected } of testCases) {
  const result = hasFourLights(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
