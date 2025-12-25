// Test on the example from the challenge

const example = `aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out
`

const lines = example.trim().split("\n").filter(Boolean)

// Parse the graph
const graph = new Map<string, string[]>()

for (const line of lines) {
  const [device, ...outputs] = line.split(/[: ]+/).filter(Boolean)
  graph.set(device, outputs)
}

// Count all paths from 'start' to 'end' using memoized DFS
function countPaths(start: string, end: string, memo: Map<string, number> = new Map()): number {
  if (start === end) {
    return 1
  }
  
  // Check memo
  const memoKey = `${start}:${end}`
  if (memo.has(memoKey)) {
    return memo.get(memoKey)!
  }
  
  const outputs = graph.get(start)
  if (!outputs || outputs.length === 0) {
    return 0
  }
  
  let total = 0
  for (const next of outputs) {
    total += countPaths(next, end, memo)
  }
  
  memo.set(memoKey, total)
  return total
}

const result = countPaths("you", "out")
console.log(`Result: ${result}`)
console.log(`Expected: 5`)
console.log(`Match: ${result === 5 ? '✓' : '✗'}`)

