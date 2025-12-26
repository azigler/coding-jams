// Test file for Challenge 9: 🦌 The reno robot aspirator
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function moveReno(board, moves) {
  // Parse board: split by newlines and remove first/last blank lines
  const lines = board.split('\n');
  // Remove first and last lines (they are blank)
  const grid = lines.slice(1, -1).map(line => line.trim()).filter(line => line.length > 0);
  
  if (grid.length === 0) return 'fail';
  
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Find starting position of @
  let row = -1, col = -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '@') {
        row = r;
        col = c;
        break;
      }
    }
    if (row !== -1) break;
  }
  
  if (row === -1) return 'fail';
  
  let pickedUp = false;
  
  // Process each move
  for (const move of moves) {
    // Calculate new position
    let newRow = row;
    let newCol = col;
    
    if (move === 'L') newCol--;
    else if (move === 'R') newCol++;
    else if (move === 'U') newRow--;
    else if (move === 'D') newRow++;
    
    // Check boundaries
    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
      // Out of bounds - but if we already picked up, it's success
      return pickedUp ? 'success' : 'crash';
    }
    
    const cell = grid[newRow][newCol];
    
    // Check for obstacle
    if (cell === '#') {
      // Hit obstacle - but if we already picked up, it's success
      return pickedUp ? 'success' : 'crash';
    }
    
    // Move to new position
    row = newRow;
    col = newCol;
    
    // Check if we picked up something
    if (cell === '*') {
      pickedUp = true;
      // Continue processing moves, but we know it's success
    }
  }
  
  // After all moves
  return pickedUp ? 'success' : 'fail';
}

const board = `
.....
.*#.*
.@...
.....
`;

const testCases = [
  { input: [board, 'D'], expected: 'fail' },
  { input: [board, 'U'], expected: 'success' },
  { input: [board, 'RU'], expected: 'crash' },
  { input: [board, 'RRRUU'], expected: 'success' },
  { input: [board, 'DD'], expected: 'crash' },
  { input: [board, 'UUU'], expected: 'success' },
  { input: [board, 'RR'], expected: 'fail' },
];

for (const { input, expected } of testCases) {
  const result = moveReno(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: moves="${input[1]}" | Expected: ${expected} | Got: ${result}`);
}
