def drop_gifts(warehouse: list[list[str]], drops: list[int]) -> list[list[str]]:
  result = [row[:] for row in warehouse]
  
  for col in drops:
    for row in range(len(result) - 1, -1, -1):
      if result[row][col] == '.':
        result[row][col] = '#'
        break
  
  return result
