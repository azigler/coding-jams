/**
 * @param {string[][]} maze
 * @returns {boolean}
 */
function canEscape(maze) {
  const rows = maze.length, cols = maze[0].length;
  let startR = -1, startC = -1;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === 'S') {
        startR = r;
        startC = c;
        break;
      }
    }
    if (startR !== -1) break;
  }
  
  const queue = [[startR, startC]];
  const visited = new Set([`${startR},${startC}`]);
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  while (queue.length) {
    const [r, c] = queue.shift();
    
    if (maze[r][c] === 'E') return true;
    
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && 
          maze[nr][nc] !== '#' && !visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  
  return false;
}
