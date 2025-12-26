/**
 * @param {number} size - The size of the gift
 * @param {string} symbol - The symbol to draw
 * @returns {string} The gift drawn
 */
function drawGift(size, symbol) {
  if (size < 2) return ""
  
  const lines = []
  
  // Top row
  lines.push(symbol.repeat(size))
  
  // Middle rows
  for (let i = 0; i < size - 2; i++) {
    lines.push(symbol + " ".repeat(size - 2) + symbol)
  }
  
  // Bottom row
  lines.push(symbol.repeat(size))
  
  return lines.join("\n")
}
