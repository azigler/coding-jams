// Analyze where operations appear relative to separators
const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")
const numberLines = lines.slice(0, lines.length - 1)
const opLine = lines[lines.length - 1]
const width = Math.max(...lines.map(l => l.length))

// Find true separators (all rows including operation line are spaces)
const trueSeparators: number[] = []
for (let col = 0; col < width; col++) {
  let allSpaces = true
  for (let row = 0; row < numberLines.length; row++) {
    if ((numberLines[row][col] || " ") !== " ") {
      allSpaces = false
      break
    }
  }
  if (allSpaces && (opLine[col] || " ") === " ") {
    trueSeparators.push(col)
  }
}

console.log(`True separators (all rows): ${trueSeparators.length}`)
console.log(`First 10 separators: ${trueSeparators.slice(0, 10).join(", ")}`)

// Count operations
let opCount = 0
for (let col = 0; col < width; col++) {
  if (opLine[col] === "+" || opLine[col] === "*") {
    opCount++
  }
}
console.log(`Total operations: ${opCount}`)

// Check: if we use true separators, how many problems would we get?
// Problems = separators + 1 (if operations match)
console.log(`\nIf using true separators: ${trueSeparators.length + 1} problems expected`)
console.log(`But we have ${opCount} operations!`)

// Maybe each operation is its own problem, and separators work differently?
// Let's check the example structure more carefully
