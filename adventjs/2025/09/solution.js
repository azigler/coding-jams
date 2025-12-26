/**
 * @param {string} board - Represent the board situation
 * @param {string} moves - Movement direction
 * @returns {'fail' | 'crash' | 'success'}
 */
function moveReno(board, moves) {
  const grid = board
    .split("\n")
    .slice(1, -1)
    .map((l) => l.trim())
    .filter((l) => l)
  if (!grid.length) return "fail"

  const dirs = { L: [0, -1], R: [0, 1], U: [-1, 0], D: [1, 0] }
  let row = grid.findIndex((r) => r.includes("@"))
  if (row === -1) return "fail"
  let col = grid[row].indexOf("@")
  let pickedUp = false

  const isValid = (r, c) =>
    r >= 0 && r < grid.length && c >= 0 && c < grid[0].length
  const isObstacle = (r, c) => !isValid(r, c) || grid[r][c] === "#"

  for (const move of moves) {
    const [dr, dc] = dirs[move] || [0, 0]
    row += dr
    col += dc

    if (isObstacle(row, col)) return pickedUp ? "success" : "crash"
    if (grid[row][col] === "*") pickedUp = true
  }

  return pickedUp ? "success" : "fail"
}
