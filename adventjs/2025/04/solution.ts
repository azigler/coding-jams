function decodeSantaPin(code: string): string | null {
  const blocks = code.match(/\[([^\]]+)\]/g)?.map((m) => m.slice(1, -1)) || []
  if (blocks.length < 4) return null

  const digits: number[] = []
  for (const block of blocks) {
    if (block === "<") {
      if (!digits.length) return null
      digits.push(digits[digits.length - 1])
    } else {
      if (!/^\d/.test(block)) return null
      let digit = parseInt(block[0], 10)
      for (const op of block.slice(1)) {
        digit = op === "+" ? (digit + 1) % 10 : (digit - 1 + 10) % 10
      }
      digits.push(digit)
    }
  }
  return digits.join("")
}
