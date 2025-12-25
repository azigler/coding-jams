// Test Part 2 on the example

const example = `svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out
`

const lines = example.trim().split("\n").filter(Boolean)

// Parse the graph
const graph = new Map<string, string[]>()

for (const line of lines) {
  const [device, ...outputs] = line.split(/[: ]+/).filter(Boolean)
  graph.set(device, outputs)
}

// Count paths from start to end that visit ALL required nodes (in any order)
function countPathsWithRequired(
  start: string,
  end: string,
  required: string[],
  memo: Map<string, number> = new Map()
): number {
  // Use bitmask to track visited required nodes
  // required[0] = bit 0, required[1] = bit 1, etc.
  const allVisitedMask = (1 << required.length) - 1

  function dfs(node: string, visitedMask: number): number {
    // Check if we've visited all required nodes
    if (node === end) {
      return visitedMask === allVisitedMask ? 1 : 0
    }

    // Check if this required node was visited
    for (let i = 0; i < required.length; i++) {
      if (node === required[i]) {
        visitedMask |= 1 << i
        break
      }
    }

    // Memoization key
    const memoKey = `${node}:${visitedMask}`
    if (memo.has(memoKey)) {
      return memo.get(memoKey)!
    }

    const outputs = graph.get(node)
    if (!outputs || outputs.length === 0) {
      return 0
    }

    let total = 0
    for (const next of outputs) {
      total += dfs(next, visitedMask)
    }

    memo.set(memoKey, total)
    return total
  }

  return dfs(start, 0)
}

const result = countPathsWithRequired("svr", "out", ["dac", "fft"])
console.log(`Result: ${result}`)
console.log(`Expected: 2`)
console.log(`Match: ${result === 2 ? "✓" : "✗"}`)
