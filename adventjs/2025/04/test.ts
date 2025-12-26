// Test file for Challenge 4: 🧮 Decipher the Santa PIN
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function decodeSantaPin(code) {
  // Extract all blocks between brackets
  const blockRegex = /\[([^\]]+)\]/g;
  const blocks = [];
  let match;
  while ((match = blockRegex.exec(code)) !== null) {
    blocks.push(match[1]);
  }
  
  // If we have fewer than 4 blocks, return null
  if (blocks.length < 4) {
    return null;
  }
  
  const digits = [];
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Special block: repeat previous digit
    if (block === '<') {
      if (digits.length === 0) {
        // Can't repeat if there's no previous digit
        return null;
      }
      digits.push(digits[digits.length - 1]);
    } else {
      // Normal block: extract digit and apply operations
      // First character should be a digit
      if (!/^\d/.test(block)) {
        return null;
      }
      
      let digit = parseInt(block[0], 10);
      
      // Apply operations
      for (let j = 1; j < block.length; j++) {
        const op = block[j];
        if (op === '+') {
          digit = (digit + 1) % 10;
        } else if (op === '-') {
          digit = (digit - 1 + 10) % 10; // Add 10 to handle negative
        }
      }
      
      digits.push(digit);
    }
  }
  
  // Return the 4-digit PIN as a string
  return digits.join('');
}

const testCases = [
  { 
    input: ['[1++][2-][3+][<]'], 
    expected: '3144'
  },
  { 
    input: ['[9+][0-][4][<]'], 
    expected: '0944'
  },
  { 
    input: ['[1+][2-]'], 
    expected: null
  },
];

for (const { input, expected } of testCases) {
  const result = decodeSantaPin(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
