function manufactureGifts(
  giftsToProduce: Array<{ toy: string; quantity: number }>
): string[] {
  const result: string[] = []
  for (const gift of giftsToProduce) {
    if (typeof gift.quantity === 'number' && gift.quantity > 0) {
      for (let i = 0; i < gift.quantity; i++) {
        result.push(gift.toy)
      }
    }
  }
  return result
}
