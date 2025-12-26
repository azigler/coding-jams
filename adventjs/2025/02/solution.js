/**
 * @param {Array<{ toy: string, quantity: number }>} giftsToProduce
 * @returns {string[]} Array of manufactured gifts
 */
function manufactureGifts(giftsToProduce) {
  const result = []
  for (const gift of giftsToProduce) {
    if (typeof gift.quantity === 'number' && gift.quantity > 0) {
      for (let i = 0; i < gift.quantity; i++) {
        result.push(gift.toy)
      }
    }
  }
  return result
}
