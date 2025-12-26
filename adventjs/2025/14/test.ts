// Test file for Challenge 14: 🗃️ Find the gift path
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function findGiftPath(workshop, gift) {
  function search(obj, target, path) {
    // Check if current object is the target
    if (obj === target) {
      return path;
    }
    
    // If obj is not an object or is null, skip
    if (typeof obj !== 'object' || obj === null) {
      return null;
    }
    
    // Search through all keys
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newPath = [...path, key];
        const result = search(obj[key], target, newPath);
        if (result !== null) {
          return result;
        }
      }
    }
    
    return null;
  }
  
  const result = search(workshop, gift, []);
  return result || [];
}

const workshop = {
  storage: {
    shelf: {
      box1: 'train',
      box2: 'switch'
    },
    box: 'car'
  },
  gift: 'doll'
};

const testCases = [
  { input: [workshop, 'train'], expected: ['storage', 'shelf', 'box1'] },
  { input: [workshop, 'switch'], expected: ['storage', 'shelf', 'box2'] },
  { input: [workshop, 'car'], expected: ['storage', 'box'] },
  { input: [workshop, 'doll'], expected: ['gift'] },
  { input: [workshop, 'plane'], expected: [] },
];

for (const { input, expected } of testCases) {
  const result = findGiftPath(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${pass ? "✅" : "❌"} Input: gift="${input[1]}" | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
