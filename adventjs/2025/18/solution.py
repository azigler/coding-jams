def has_four_in_a_row(board: list[list[str]]) -> bool:
  if not board:
    return False
  
  rows, cols = len(board), len(board[0])
  dirs = [(0, 1), (1, 0), (1, 1), (1, -1)]
  
  for r in range(rows):
    for c in range(cols):
      if board[r][c] == '.':
        continue
      
      for dr, dc in dirs:
        count = 1
        for i in range(1, 4):
          nr, nc = r + i * dr, c + i * dc
          if not (0 <= nr < rows and 0 <= nc < cols):
            break
          if board[nr][nc] != board[r][c]:
            break
          count += 1
        if count >= 4:
          return True
  return False
