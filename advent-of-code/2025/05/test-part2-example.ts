// Test Part 2 with the example
const exampleRanges = [
  [3, 5],
  [10, 14],
  [16, 20],
  [12, 18],
]

// Sort ranges by start
const ranges = [...exampleRanges].sort((a, b) => a[0] - b[0])

// Merge overlapping ranges
const mergedRanges: Array<[number, number]> = []
let currentRange: [number, number] | null = null

for (const [start, end] of ranges) {
  if (currentRange === null) {
    currentRange = [start, end]
  } else {
    // Check if ranges overlap or are adjacent
    if (start <= currentRange[1] + 1) {
      currentRange[1] = Math.max(currentRange[1], end)
    } else {
      mergedRanges.push(currentRange)
      currentRange = [start, end]
    }
  }
}

if (currentRange !== null) {
  mergedRanges.push(currentRange)
}

console.log("Merged ranges:", mergedRanges)

// Count total IDs
let totalFreshIds = 0
for (const [start, end] of mergedRanges) {
  const count = end - start + 1
  console.log(`  Range [${start}, ${end}]: ${count} IDs`)
  totalFreshIds += count
}

console.log(`\nTotal fresh IDs: ${totalFreshIds}, expected: 14`)
console.log(`Test: ${totalFreshIds === 14 ? "✓" : "✗"}`)
