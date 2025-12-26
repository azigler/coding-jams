/**
 * @param {string[][]} board
 * @returns {boolean}
 */
function hasFourInARow(board) {
  if (!board.length) return false;
  
  const rows = board.length, cols = board[0].length;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === '.') continue;
      
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + i * dr, nc = c + i * dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
          if (board[nr][nc] !== board[r][c]) break;
          count++;
        }
        if (count >= 4) return true;
      }
    }
  }
  return false;
}
