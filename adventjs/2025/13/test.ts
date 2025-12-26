// Test file for Challenge 13: 🏭 The assembly line
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function runFactory(factory) {
  if (factory.length === 0) return 'broken';
  
  const rows = factory.length;
  const cols = factory[0].length;
  
  let row = 0;
  let col = 0;
  const visited = new Set();
  
  while (true) {
    // Check if we've been here before (loop detection)
    const pos = `${row},${col}`;
    if (visited.has(pos)) {
      return 'loop';
    }
    visited.add(pos);
    
    // Check boundaries
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return 'broken';
    }
    
    const cell = factory[row][col];
    
    // Check if we reached the exit
    if (cell === '.') {
      return 'completed';
    }
    
    // Move according to direction
    if (cell === '>') {
      col++;
    } else if (cell === '<') {
      col--;
    } else if (cell === '^') {
      row--;
    } else if (cell === 'v') {
      row++;
    }
  }
}

const testCases = [
  { input: [['>>.']], expected: 'completed' },
  { input: [['>>>']], expected: 'broken' },
  { input: [['>><']], expected: 'loop' },
  { input: [['>>v', '..<']], expected: 'completed' },
  { input: [['>>v', '<<<']], expected: 'broken' },
  { input: [['>v.', '^..']], expected: 'completed' },
  { input: [['v.', '^.']], expected: 'loop' },
];

for (const { input, expected } of testCases) {
  const result = runFactory(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
