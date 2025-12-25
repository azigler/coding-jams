// Check separator columns in real input
const input = await Deno.readTextFile("input.txt")
const lines = input.trim().split("\n")
const numberLines = lines.slice(0, lines.length - 1)
const opLine = lines[lines.length - 1]
const width = Math.max(...lines.map(l => l.length))

let separatorCountNumberRows = 0
let separatorCountAllRows = 0
let mixedCount = 0

for (let col = 0; col < width; col++) {
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
    separatorCountNumberRows++
    if (allRowsSpaces) {
      separatorCountAllRows++
    } else {
      mixedCount++
      if (mixedCount <= 5) {
        console.log(`Column ${col}: number rows are spaces, but op='${opChar}' (not a separator if checking all rows)`)
      }
    }
  }
}

console.log(`\nSeparators (number rows only): ${separatorCountNumberRows}`)
console.log(`Separators (all rows): ${separatorCountAllRows}`)
console.log(`Mixed (number rows spaces, op not space): ${mixedCount}`)
