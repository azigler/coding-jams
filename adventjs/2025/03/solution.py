def draw_gift(size, symbol):
  if size < 2:
    return ""
  
  lines = []
  
  # Top row
  lines.append(symbol * size)
  
  # Middle rows
  for _ in range(size - 2):
    lines.append(symbol + " " * (size - 2) + symbol)
  
  # Bottom row
  lines.append(symbol * size)
  
  return "\n".join(lines)
