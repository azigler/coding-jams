// Test with the example from the problem
const example = `3-5
10-14
16-20
12-18

1
5
8
11
17
32`

const lines = example.trim().split("\n")
const ranges: Array<[number, number]> = []
const availableIds: number[] = []

let parsingRanges = true
for (const line of lines) {
  if (!line.trim()) {
    parsingRanges = false
    continue
  }

  if (parsingRanges) {
    const [start, end] = line.split("-").map(Number)
    ranges.push([start, end])
  } else {
    availableIds.push(Number(line))
  }
}

function isFresh(id: number): boolean {
  for (const [start, end] of ranges) {
    if (id >= start && id <= end) {
      return true
    }
  }
  return false
}

let freshCount = 0
const results: Array<[number, boolean]> = []

for (const id of availableIds) {
  const fresh = isFresh(id)
  results.push([id, fresh])
  if (fresh) {
    freshCount++
  }
}

console.log("Results:")
for (const [id, fresh] of results) {
  console.log(`  ID ${id}: ${fresh ? "fresh" : "spoiled"}`)
}

console.log(`\nTotal fresh: ${freshCount}, expected: 3`)
console.log(`Test: ${freshCount === 3 ? "✓" : "✗"}`)
