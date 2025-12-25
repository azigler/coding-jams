// Analyze the input structure carefully
const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")

console.log(`Total lines: ${lines.length}`)
console.log(`Line lengths: ${lines.map(l => l.length).join(", ")}`)

// Check the operation line
const opLine = lines[lines.length - 1]
console.log(`\nOperation line (first 100 chars):`)
console.log(opLine.substring(0, 100))

// Count operations
const opCount = (opLine.match(/[+*]/g) || []).length
console.log(`\nTotal operations: ${opCount}`)

// Check for patterns in separator columns
console.log(`\nAnalyzing first 50 columns:`)
for (let col = 0; col < 50; col++) {
  let allNumberRowsSpaces = true
  let opRowIsSpace = (opLine[col] || " ") === " "
  
  for (let row = 0; row < lines.length - 1; row++) {
    const char = lines[row][col] || " "
    if (char !== " ") {
      allNumberRowsSpaces = false
    }
  }
  
  if (allNumberRowsSpaces && col % 10 === 0) {
    console.log(`Column ${col}: all number rows are spaces, op row is ${opRowIsSpace ? "space" : "not space"}`)
  }
}
