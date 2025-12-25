const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")

// Parse ranges and available IDs
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

// Part 1: Count how many available IDs are fresh (in at least one range)
function isFresh(id: number): boolean {
  for (const [start, end] of ranges) {
    if (id >= start && id <= end) {
      return true
    }
  }
  return false
}

let freshCount = 0
for (const id of availableIds) {
  if (isFresh(id)) {
    freshCount++
  }
}

console.log(`Part 1: ${freshCount}`)

// Part 2: Count all unique ingredient IDs that are considered fresh
// Need to merge overlapping ranges and count total IDs

// Sort ranges by start
ranges.sort((a, b) => a[0] - b[0])

// Merge overlapping ranges
const mergedRanges: Array<[number, number]> = []
let currentRange: [number, number] | null = null

for (const [start, end] of ranges) {
  if (currentRange === null) {
    currentRange = [start, end]
  } else {
    // Check if ranges overlap or are adjacent (end + 1 >= start of next)
    if (start <= currentRange[1] + 1) {
      // Merge: extend current range to include this one
      currentRange[1] = Math.max(currentRange[1], end)
    } else {
      // No overlap, save current and start new
      mergedRanges.push(currentRange)
      currentRange = [start, end]
    }
  }
}

if (currentRange !== null) {
  mergedRanges.push(currentRange)
}

// Count total IDs in all merged ranges (inclusive)
let totalFreshIds = 0
for (const [start, end] of mergedRanges) {
  totalFreshIds += end - start + 1
}

console.log(`Part 2: ${totalFreshIds}`)
