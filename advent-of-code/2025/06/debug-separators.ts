// Debug separator detection
const example = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`

const lines = example.trim().split("\n")
const numberLines = lines.slice(0, 3)
const opLine = lines[3]
const width = Math.max(...lines.map(l => l.length))

console.log("Checking each column:")
for (let col = 0; col < Math.min(15, width); col++) {
  let allSpaces = true
  for (let row = 0; row < numberLines.length; row++) {
    const char = numberLines[row][col] || " "
    if (char !== " ") {
      allSpaces = false
    }
    process.stdout.write(char)
  }
  const opChar = opLine[col] || " "
  process.stdout.write(` | op: ${opChar} | separator: ${allSpaces}\n`)
}
