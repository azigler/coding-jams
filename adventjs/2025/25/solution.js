/**
 * @param {string} code
 * @returns {number}
 */
function execute(code) {
  const jumps = {}
  const stack = []
  const add = { "+": 1, "-": -1 }
  const isOpen = { "[": 1, "{": 1 }
  const isClose = { "]": 1, "}": 1 }

  for (let i = 0; i < code.length; i++) {
    const c = code[i]
    if (isOpen[c]) stack.push(i)
    if (isClose[c]) {
      const s = stack.pop()
      jumps[s] = i + 1
      jumps[i] = s + 1
    }
  }

  let val = 0,
    pos = 0
  while (pos < code.length) {
    const c = code[pos]
    val += add[c] || 0
    const doJump = (isOpen[c] && val === 0) || (c === "]" && val !== 0)
    pos = doJump ? jumps[pos] : pos + 1
  }
  return val
}
