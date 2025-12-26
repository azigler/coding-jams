function execute(code: string): number {
  const jumps: { [key: number]: number } = {}
  const stack: number[] = []
  const add: { [key: string]: number } = { "+": 1, "-": -1 }
  const isOpen = new Set<string>(["[", "{"])
  const isClose = new Set<string>(["]", "}"])

  for (let i = 0; i < code.length; i++) {
    const c = code[i]
    if (isOpen.has(c)) stack.push(i)
    if (isClose.has(c)) {
      const s = stack.pop()!
      jumps[s] = i + 1
      jumps[i] = s + 1
    }
  }

  let val = 0,
    pos = 0
  while (pos < code.length) {
    const c = code[pos]
    val += add[c] || 0
    const doJump = (isOpen.has(c) && val === 0) || (c === "]" && val !== 0)
    pos = doJump ? jumps[pos] : pos + 1
  }
  return val
}
