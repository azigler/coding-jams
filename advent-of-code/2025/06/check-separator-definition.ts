// Check what "full column of only spaces" means
const example = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`

const lines = example.trim().split("\n")
const numberLines = lines.slice(0, 3)
const opLine = lines[3]

console.log("Checking separator columns in example:")
for (let col = 0; col < 15; col++) {
  let allNumberRowsSpaces = true
  for (let row = 0; row < numberLines.length; row++) {
    if ((numberLines[row][col] || " ") !== " ") {
      allNumberRowsSpaces = false
      break
    }
  }
  const opChar = opLine[col] || " "
  const allRowsSpaces = allNumberRowsSpaces && opChar === " "
  
  if (allNumberRowsSpaces) {
    console.log(`Column ${col}: number rows are spaces, op='${opChar}', ALL rows spaces: ${allRowsSpaces}`)
  }
}
