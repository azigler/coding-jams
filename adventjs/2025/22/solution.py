def can_escape(maze: list[list[str]]) -> bool:
  rows, cols = len(maze), len(maze[0])
  start_r, start_c = -1, -1
  
  for r in range(rows):
    for c in range(cols):
      if maze[r][c] == 'S':
        start_r, start_c = r, c
        break
    if start_r != -1:
      break
  
  queue = [(start_r, start_c)]
  visited = {(start_r, start_c)}
  dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
  
  while queue:
    r, c = queue.pop(0)
    
    if maze[r][c] == 'E':
      return True
    
    for dr, dc in dirs:
      nr, nc = r + dr, c + dc
      if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] != '#' and (nr, nc) not in visited:
        visited.add((nr, nc))
        queue.append((nr, nc))
  
  return False
