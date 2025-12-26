/**
 * @param {number[]} gifts - The gifts to pack
 * @param {number} maxWeight - The maximum weight of the sleigh
 * @returns {number | null} The number of sleighs needed
 * Return null if no sleigh can carry all the gifts
 */
function packGifts(gifts, maxWeight) {
  if (gifts.length === 0) return 0

  let sleighs = 1 // Start with first sleigh
  let currentWeight = 0

  for (const gift of gifts) {
    // If a gift is too heavy for any sleigh, return null
    if (gift > maxWeight) {
      return null
    }

    // Try to add gift to current sleigh
    if (currentWeight + gift <= maxWeight) {
      currentWeight += gift
    } else {
      // Start a new sleigh
      sleighs++
      currentWeight = gift
    }
  }

  return sleighs
}
