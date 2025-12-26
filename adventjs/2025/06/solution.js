/**
 * @param {{ hand: 'L' | 'R', color: string }[]} gloves
 * @returns {string[]} Colors of matched pairs
 */
function matchGloves(gloves) {
  // Track available gloves by color and hand
  const available = {
    L: {}, // color -> count
    R: {}  // color -> count
  };
  
  const pairs = [];
  
  for (const glove of gloves) {
    const { hand, color } = glove;
    const oppositeHand = hand === 'L' ? 'R' : 'L';
    
    // Check if there's a matching glove of the opposite hand
    if (available[oppositeHand][color] > 0) {
      // Found a pair! Add to result and remove the matched glove
      pairs.push(color);
      available[oppositeHand][color]--;
    } else {
      // No match yet, add this glove to available pool
      if (!available[hand][color]) {
        available[hand][color] = 0;
      }
      available[hand][color]++;
    }
  }
  
  return pairs;
}