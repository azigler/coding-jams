def find_unsafe_gifts(warehouse: list[str]) -> int:
  rows = len(warehouse)
  if rows == 0:
    return 0
  cols = len(warehouse[0])
  
  unsafe_count = 0
  
  # Directions: up, down, left, right
  directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
  
  for r in range(rows):
    for c in range(cols):
      if warehouse[r][c] == '*':
        # Check if this present has any adjacent camera
        has_camera = False
        
        for dr, dc in directions:
          new_r = r + dr
          new_c = c + dc
          
          # Check if position is valid and contains a camera
          if 0 <= new_r < rows and 0 <= new_c < cols:
            if warehouse[new_r][new_c] == '#':
              has_camera = True
              break
        
        # If no camera found, this present is unsafe
        if not has_camera:
          unsafe_count += 1
  
  return unsafe_count
