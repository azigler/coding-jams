def run_factory(factory: list[str]) -> str:
  if not factory:
    return 'broken'
  
  rows = len(factory)
  cols = len(factory[0])
  
  row = 0
  col = 0
  visited = set()
  
  while True:
    # Check if we've been here before (loop detection)
    pos = (row, col)
    if pos in visited:
      return 'loop'
    visited.add(pos)
    
    # Check boundaries
    if row < 0 or row >= rows or col < 0 or col >= cols:
      return 'broken'
    
    cell = factory[row][col]
    
    # Check if we reached the exit
    if cell == '.':
      return 'completed'
    
    # Move according to direction
    if cell == '>':
      col += 1
    elif cell == '<':
      col -= 1
    elif cell == '^':
      row -= 1
    elif cell == 'v':
      row += 1
