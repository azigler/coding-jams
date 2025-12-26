// Test file for Challenge 11: 📹 Unwatched gifts
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function findUnsafeGifts(warehouse) {
  const rows = warehouse.length;
  if (rows === 0) return 0;
  const cols = warehouse[0].length;
  
  let unsafeCount = 0;
  
  // Directions: up, down, left, right
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (warehouse[r][c] === '*') {
        // Check if this present has any adjacent camera
        let hasCamera = false;
        
        for (const [dr, dc] of directions) {
          const newR = r + dr;
          const newC = c + dc;
          
          // Check if position is valid and contains a camera
          if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
            if (warehouse[newR][newC] === '#') {
              hasCamera = true;
              break;
            }
          }
        }
        
        // If no camera found, this present is unsafe
        if (!hasCamera) {
          unsafeCount++;
        }
      }
    }
  }
  
  return unsafeCount;
}

const testCases = [
  { input: [['.*.', '*#*', '.*.']], expected: 0 },
  { input: [['...', '.*.', '...']], expected: 1 },
  { input: [['*.*', '...', '*#*']], expected: 2 },
  { input: [['.....', '.*.*.', '..#..', '.*.*.', '.....']], expected: 4 },
];

for (const { input, expected } of testCases) {
  const result = findUnsafeGifts(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
