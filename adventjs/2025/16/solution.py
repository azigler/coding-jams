def pack_gifts(gifts: list[int], maxWeight: int) -> int | None:
  if len(gifts) == 0:
    return 0
  
  sleighs = 1  # Start with first sleigh
  current_weight = 0
  
  for gift in gifts:
    # If a gift is too heavy for any sleigh, return None
    if gift > maxWeight:
      return None
    
    # Try to add gift to current sleigh
    if current_weight + gift <= maxWeight:
      current_weight += gift
    else:
      # Start a new sleigh
      sleighs += 1
      current_weight = gift
  
  return sleighs
