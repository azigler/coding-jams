// Test both separator definitions
const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")
const numberLines = lines.slice(0, lines.length - 1)
const opLine = lines[lines.length - 1]
const width = Math.max(...lines.map(l => l.length))

// Approach 1: Separators = all number rows are spaces (current)
const separators1: number[] = []
for (let col = 0; col < width; col++) {
  let allSpaces = true
  for (let row = 0; row < numberLines.length; row++) {
    if ((numberLines[row][col] || " ") !== " ") {
      allSpaces = false
      break
    }
  }
  if (allSpaces) {
    separators1.push(col)
  }
}

// Approach 2: Separators = all rows (including operation) are spaces
const separators2: number[] = []
for (let col = 0; col < width; col++) {
  let allSpaces = true
  for (let row = 0; row < numberLines.length; row++) {
    if ((numberLines[row][col] || " ") !== " ") {
      allSpaces = false
      break
    }
  }
  if (allSpaces && (opLine[col] || " ") === " ") {
    separators2.push(col)
  }
}

console.log(`Approach 1 (number rows only): ${separators1.length} separators`)
console.log(`Approach 2 (all rows): ${separators2.length} separators`)

// Count operations
let opCount = 0
for (let col = 0; col < width; col++) {
  if (opLine[col] === "+" || opLine[col] === "*") {
    opCount++
  }
}
console.log(`Total operations: ${opCount}`)

// The key insight: maybe "full column of only spaces" means
// the number rows are spaces, and the operation line can have anything?
// But that doesn't match the example...

// Wait, let me check: maybe operations can appear in what would be separator columns?
// If so, those columns are NOT separators, they're part of problems
console.log(`\nColumns where number rows are spaces but op is not space: ${separators1.length - separators2.length}`)
