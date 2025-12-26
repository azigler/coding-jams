/**
 * @param {string[]} factory - The factory layout
 * @returns {'completed'|'broken'|'loop'} Result of the gift journey
 */
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