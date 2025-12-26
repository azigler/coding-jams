def has_four_lights(board: list[list[str]]) -> bool:
  if not board:
    return False
  
  def check_line(cells):
    count, color = 0, None
    for cell in cells:
      if cell == '.':
        count, color = 0, None
      elif cell == color:
        count += 1
      else:
        count, color = 1, cell
      if count >= 4:
        return True
    return False
  
  rows, cols = len(board), len(board[0])
  return any(check_line(board[r]) for r in range(rows)) or any(check_line([board[r][c] for r in range(rows)]) for c in range(cols))
