// Day 11: Reactor - Count paths through device graph

const input = Deno.readTextFileSync("input.txt").trim()
const lines = input.split("\n").filter(Boolean)

// Parse the graph
const graph = new Map<string, string[]>()

for (const line of lines) {
  const [device, ...outputs] = line.split(/[: ]+/).filter(Boolean)
  graph.set(device, outputs)
}

// Part 1: Count all paths from 'start' to 'end' using memoized DFS
function countPaths(
  start: string,
  end: string,
  memo: Map<string, number> = new Map()
): number {
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

// Part 2: Count paths from start to end that visit ALL required nodes (in any order)
function countPathsWithRequired(
  start: string,
  end: string,
  required: string[],
  memo: Map<string, number> = new Map()
): number {
  const allVisitedMask = (1 << required.length) - 1

  function dfs(node: string, visitedMask: number): number {
    // Check if we've reached the end
    if (node === end) {
      return visitedMask === allVisitedMask ? 1 : 0
    }

    // Check if this is a required node and mark it as visited
    for (let i = 0; i < required.length; i++) {
      if (node === required[i]) {
        visitedMask |= 1 << i
        break
      }
    }

    // Memoization key includes visited mask
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

const part1 = countPaths("you", "out")
console.log(`Part 1: ${part1}`)

const part2 = countPathsWithRequired("svr", "out", ["dac", "fft"])
console.log(`Part 2: ${part2}`)
