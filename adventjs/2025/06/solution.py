from typing import List, Dict

def match_gloves(gloves: List[Dict[str, str]]) -> List[str]:
  # Track available gloves by color and hand
  available = {
    'L': {},  # color -> count
    'R': {}   # color -> count
  }
  
  pairs = []
  
  for glove in gloves:
    hand = glove['hand']
    color = glove['color']
    opposite_hand = 'R' if hand == 'L' else 'L'
    
    # Check if there's a matching glove of the opposite hand
    if available[opposite_hand].get(color, 0) > 0:
      # Found a pair! Add to result and remove the matched glove
      pairs.append(color)
      available[opposite_hand][color] -= 1
    else:
      # No match yet, add this glove to available pool
      if color not in available[hand]:
        available[hand][color] = 0
      available[hand][color] += 1
  
  return pairs
