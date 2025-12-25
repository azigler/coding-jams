// https://adventofcode.com/2025/day/1
// https://adventofcode.com/2025/day/1#part2
// 0 - 99
// starts at 50
// part 1: stops at 0
// part 2: passes through 0

import { readFileSync } from "node:fs"

const input = readFileSync("input.txt", "utf8")
const lines = input.split("\n")

let pos = 50
let stopsAt0 = 0
let passesThrough0 = 0

for (const line of lines) {
  if (!line.trim()) continue
  const direction = line.charAt(0)
  const steps = parseInt(line.substring(1))
  const oldPos = pos

  if (direction === "R") {
    pos += steps
  } else {
    pos -= steps
  }

  // Part 2: Count every time the dial points at 0
  // The dial points at 0 when the unwrapped position is a multiple of 100
  // Count all multiples of 100 in the range [oldPos, newPos], excluding the starting position
  const oldUnwrapped = oldPos
  const newUnwrapped = pos
  const start = Math.min(oldUnwrapped, newUnwrapped)
  const end = Math.max(oldUnwrapped, newUnwrapped)

  // Count all multiples of 100 in the range, excluding the starting position
  for (let i = start; i <= end; i++) {
    if (i % 100 === 0 && i !== oldUnwrapped) {
      // Don't count the starting position (the click didn't cause us to be there)
      passesThrough0++
    }
  }

  // Wrap the position
  pos = ((pos % 100) + 100) % 100

  // Part 1: Count if we END at 0
  if (pos === 0) {
    stopsAt0++
  }
}

console.log(`Part 1: ${stopsAt0}`)
console.log(`Part 2: ${passesThrough0}`)
