// Test with the example from the problem (Part 1)
const example =
  "11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124"

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

let total = 0
const ranges = example.split(",")

for (const range of ranges) {
  const [start, end] = range.split("-").map(Number)

  for (let id = start; id <= end; id++) {
    if (isInvalidID(id)) {
      total += id
      console.log(
        `Invalid ID: ${id} (${String(id).substring(
          0,
          String(id).length / 2
        )} repeated twice)`
      )
    }
  }
}

console.log(`\nTotal: ${total} (expected: 1227775554)`)
