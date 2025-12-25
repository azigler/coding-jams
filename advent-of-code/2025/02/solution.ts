// https://adventofcode.com/2025/day/2
// https://adventofcode.com/2025/day/2#part2

import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf8").trim()

// Part 1: Find invalid IDs (numbers made of a sequence repeated twice)
function isInvalidID(id: number): boolean {
  const str = String(id)
  const len = str.length

  // Must have even length to be split into two equal halves
  if (len % 2 !== 0) return false

  // Split into two halves
  const half = len / 2
  const firstHalf = str.substring(0, half)
  const secondHalf = str.substring(half)

  // Check if halves are equal
  return firstHalf === secondHalf
}

// Parse ranges (comma-separated, each range is "start-end")
const ranges = input.split(",")
let part1 = 0

for (const range of ranges) {
  const [start, end] = range.split("-").map(Number)

  // Check each ID in the range
  for (let id = start; id <= end; id++) {
    if (isInvalidID(id)) {
      part1 += id
    }
  }
}

// Part 2: Find invalid IDs (numbers made of a sequence repeated at least twice)
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

// Re-parse ranges for Part 2
let part2 = 0

for (const range of ranges) {
  const [start, end] = range.split("-").map(Number)

  // Check each ID in the range
  for (let id = start; id <= end; id++) {
    if (isInvalidIDPart2(id)) {
      part2 += id
    }
  }
}

console.log(`Part 1: ${part1}`)
console.log(`Part 2: ${part2}`)
