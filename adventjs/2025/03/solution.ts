function drawGift(size: number, symbol: string): string {
  if (size < 2) return ""
  
  const lines: string[] = []
  
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
