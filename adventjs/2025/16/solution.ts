
type Gifts = number[]
type MaxWeight = number
type Result = number | null

function packGifts(gifts: Gifts, maxWeight: MaxWeight): Result {
  if (gifts.length === 0) return 0;
  
  let sleighs = 1; // Start with first sleigh
  let currentWeight = 0;
  
  for (const gift of gifts) {
    // If a gift is too heavy for any sleigh, return null
    if (gift > maxWeight) {
      return null;
    }
    
    // Try to add gift to current sleigh
    if (currentWeight + gift <= maxWeight) {
      currentWeight += gift;
    } else {
      // Start a new sleigh
      sleighs++;
      currentWeight = gift;
    }
  }
  
  return sleighs;
}
