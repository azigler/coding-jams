from typing import List, Literal

def move_reno(board: str, moves: str) -> Literal['fail', 'crash', 'success']:
  grid = [l.strip() for l in board.split('\n')[1:-1] if l.strip()]
  if not grid:
    return 'fail'
  
  dirs = {'L': (0, -1), 'R': (0, 1), 'U': (-1, 0), 'D': (1, 0)}
  row = next((i for i, r in enumerate(grid) if '@' in r), -1)
  if row == -1:
    return 'fail'
  col = grid[row].index('@')
  picked_up = False
  
  for move in moves:
    dr, dc = dirs.get(move, (0, 0))
    row += dr
    col += dc
    
    in_bounds = 0 <= row < len(grid) and 0 <= col < len(grid[0])
    if not in_bounds or grid[row][col] == '#':
      return 'success' if picked_up else 'crash'
    
    if grid[row][col] == '*':
      picked_up = True
  
  return 'success' if picked_up else 'fail'
