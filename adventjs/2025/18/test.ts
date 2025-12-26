// Test file for Challenge 18: 🎄 Lights in line with diagonals
// Run with: deno run --allow-read test.ts

function hasFourInARow(board) {
  if (!board.length) return false;
  
  const rows = board.length;
  const cols = board[0].length;
  
  const checkLine = (cells) => {
    let count = 0, color = null;
    for (const cell of cells) {
      if (cell === '.') {
        count = 0;
        color = null;
      } else if (cell === color) {
        count++;
      } else {
        count = 1;
        color = cell;
      }
      if (count >= 4) return true;
    }
    return false;
  };
  
  // Horizontal
  for (let r = 0; r < rows; r++) {
    if (checkLine(board[r])) return true;
  }
  
  // Vertical
  for (let c = 0; c < cols; c++) {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      cells.push(board[r][c]);
    }
    if (checkLine(cells)) return true;
  }
  
  // Diagonal ↘ (top-left to bottom-right)
  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 0; c <= cols - 4; c++) {
      const cells = [];
      for (let i = 0; i < 4; i++) {
        cells.push(board[r + i][c + i]);
      }
      if (checkLine(cells)) return true;
    }
  }
  
  // Diagonal ↙ (top-right to bottom-left)
  for (let r = 0; r <= rows - 4; r++) {
    for (let c = 3; c < cols; c++) {
      const cells = [];
      for (let i = 0; i < 4; i++) {
        cells.push(board[r + i][c - i]);
      }
      if (checkLine(cells)) return true;
    }
  }
  
  return false;
}

const testCases = [
  { 
    input: [[
      ['R', '.', '.', '.'],
      ['.', 'R', '.', '.'],
      ['.', '.', 'R', '.'],
      ['.', '.', '.', 'R']
    ]], 
    expected: true 
  },
  { 
    input: [[
      ['.', '.', '.', 'G'],
      ['.', '.', 'G', '.'],
      ['.', 'G', '.', '.'],
      ['G', '.', '.', '.']
    ]], 
    expected: true 
  },
  { 
    input: [[
      ['R', 'R', 'R', 'R'],
      ['G', 'G', '.', '.'],
      ['.', '.', '.', '.'],
      ['.', '.', '.', '.']
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
  const result = hasFourInARow(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
