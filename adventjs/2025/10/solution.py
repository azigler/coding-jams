def max_depth(s: str) -> int:
  depth = 0
  max_depth_val = 0
  
  for char in s:
    if char == '[':
      depth += 1
      max_depth_val = max(max_depth_val, depth)
    elif char == ']':
      depth -= 1
      # If depth goes negative, we have a closing bracket before opening
      if depth < 0:
        return -1
  
  # If depth is not 0 at the end, brackets are not balanced
  if depth != 0:
    return -1
  
  return max_depth_val
