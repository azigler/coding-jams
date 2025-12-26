def clear_gifts(warehouse: list[list[str]], drops: list[int]) -> list[list[str]]:
  result = [row[:] for row in warehouse]
  cols = len(warehouse[0])
  
  for col in drops:
    drop_row = -1
    for row in range(len(result) - 1, -1, -1):
      if result[row][col] == '.':
        drop_row = row
        break
    
    if drop_row == -1:
      continue
    
    result[drop_row][col] = '#'
    
    if all(cell == '#' for cell in result[drop_row]):
      result.pop(drop_row)
      result.insert(0, ['.'] * cols)
  
  return result
