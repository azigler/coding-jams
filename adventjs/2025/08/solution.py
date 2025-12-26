def find_unique_toy(toy: str) -> str:
  # Count occurrences (case-insensitive)
  counts = {}
  for char in toy:
    lower = char.lower()
    counts[lower] = counts.get(lower, 0) + 1
  
  # Find first character with count === 1 (case-insensitive)
  for char in toy:
    lower = char.lower()
    if counts[lower] == 1:
      return char  # Return as it appears in original string
  
  return ''  # No unique letter found
