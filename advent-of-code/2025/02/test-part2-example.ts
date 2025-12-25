// Test Part 2 with the example
const example =
  "11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124"

function isInvalidIDPart2(id: number): boolean {
  const str = String(id)
  const len = str.length

  // Try all possible segment lengths (from 1 to len/2)
  // We need at least 2 segments, so segment length can be at most len/2
  for (let segLen = 1; segLen <= Math.floor(len / 2); segLen++) {
    // Check if the length is divisible by segment length
    if (len % segLen !== 0) continue

    // Extract the first segment
    const firstSegment = str.substring(0, segLen)

    // Check if all segments are identical
    let allMatch = true
    for (let i = segLen; i < len; i += segLen) {
      const segment = str.substring(i, i + segLen)
      if (segment !== firstSegment) {
        allMatch = false
        break
      }
    }

    if (allMatch) {
      // Found a pattern - check if we have at least 2 segments
      const numSegments = len / segLen
      if (numSegments >= 2) {
        return true
      }
    }
  }

  return false
}

let total = 0
const ranges = example.split(",")

for (const range of ranges) {
  const [start, end] = range.split("-").map(Number)

  for (let id = start; id <= end; id++) {
    if (isInvalidIDPart2(id)) {
      total += id
      console.log(`Invalid ID: ${id}`)
    }
  }
}

console.log(`\nTotal: ${total} (expected: 4174379265)`)
