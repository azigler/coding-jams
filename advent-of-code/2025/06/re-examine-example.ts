// Re-examine the example very carefully
const example = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`

const lines = example.trim().split("\n")
const numberLines = lines.slice(0, 3)
const opLine = lines[3]

console.log("Example structure:")
console.log("Row 0:", numberLines[0])
console.log("Row 1:", numberLines[1])
console.log("Row 2:", numberLines[2])
console.log("Op row:", opLine)

console.log("\nProblem 1 should be: 123 * 45 * 6 = 33210")
console.log("Let's check columns 0-2:")
for (let row = 0; row < 3; row++) {
  console.log(`  Row ${row}: "${numberLines[row].substring(0, 3)}"`)
}
console.log(`  Op: "${opLine.substring(0, 3)}"`)

console.log("\nSeparator at column 3:")
for (let row = 0; row < 3; row++) {
  console.log(`  Row ${row}: "${numberLines[row][3]}"`)
}
console.log(`  Op: "${opLine[3]}"`)

console.log("\nProblem 2 should be: 328 + 64 + 98 = 490")
console.log("Let's check columns 4-6:")
for (let row = 0; row < 3; row++) {
  console.log(`  Row ${row}: "${numberLines[row].substring(4, 7)}"`)
}
console.log(`  Op: "${opLine.substring(4, 7)}"`)
