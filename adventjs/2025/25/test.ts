// Test file for Challenge 25: 🪄 Execute the magical language
// Run with: deno run --allow-read test.ts

function execute(code: string): number {
  let value = 0
  let i = 0
  
  while (i < code.length) {
    const ch = code[i]
    
    if (ch === '>') {
      i++
    } else if (ch === '+') {
      value++
      i++
    } else if (ch === '-') {
      value--
      i++
    } else if (ch === '[') {
      if (value === 0) {
        let depth = 1
        i++
        while (depth > 0 && i < code.length) {
          if (code[i] === '[') depth++
          else if (code[i] === ']') depth--
          i++
        }
      } else {
        i++
      }
    } else if (ch === ']') {
      if (value !== 0) {
        let depth = 1
        i--
        while (depth > 0 && i >= 0) {
          if (code[i] === ']') depth++
          else if (code[i] === '[') depth--
          i--
        }
        i += 2
      } else {
        i++
      }
    } else if (ch === '{') {
      if (value === 0) {
        let depth = 1
        i++
        while (depth > 0 && i < code.length) {
          if (code[i] === '{') depth++
          else if (code[i] === '}') depth--
          i++
        }
      } else {
        i++
      }
    } else if (ch === '}') {
      i++
    } else {
      i++
    }
  }
  
  return value
}

const testCases = [
  { input: '+++', expected: 3 },
  { input: '+--', expected: -1 },
  { input: '>+++[-]', expected: 0 },
  { input: '>>>+{++}', expected: 3 },
  { input: '+{[-]+}+', expected: 2 },
  { input: '{+}{+}{+}', expected: 0 },
  { input: '------[+]++', expected: 2 },
  { input: '-[++{-}]+{++++}', expected: 5 },
];

for (const { input, expected } of testCases) {
  const result = execute(input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: "${input}" | Expected: ${expected} | Got: ${result}`);
}
