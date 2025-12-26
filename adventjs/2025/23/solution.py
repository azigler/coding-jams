def min_steps_to_deliver(map: list[list[str]]) -> int:
  rows, cols = len(map), len(map[0])
  start_r, start_c = -1, -1
  goals = []
  
  for r in range(rows):
    for c in range(cols):
      if map[r][c] == 'S':
        start_r, start_c = r, c
      elif map[r][c] == 'G':
        goals.append((r, c))
  
  if not goals:
    return 0
  
  def bfs(sr, sc, gr, gc):
    queue = [(sr, sc, 0)]
    visited = {(sr, sc)}
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
      r, c, steps = queue.pop(0)
      
      if r == gr and c == gc:
        return steps
      
      for dr, dc in dirs:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and map[nr][nc] != '#' and (nr, nc) not in visited:
          visited.add((nr, nc))
          queue.append((nr, nc, steps + 1))
    return -1
  
  total = 0
  for gr, gc in goals:
    dist = bfs(start_r, start_c, gr, gc)
    if dist == -1:
      return -1
    total += dist
  
  return total
