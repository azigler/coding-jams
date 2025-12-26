// Test file for Challenge 19: 🎄 Santa's Secret Journey
// Run with: deno run --allow-read test.ts

function revealSantaRoute(routes) {
  if (!routes.length) return [];
  
  const route = [...routes[0]];
  let currentDest = routes[0][1];
  
  while (true) {
    const next = routes.find(r => r[0] === currentDest);
    if (!next) break;
    route.push(next[1]);
    currentDest = next[1];
  }
  
  return route;
}

const testCases = [
  { 
    input: [[
      ['MEX', 'CAN'],
      ['UK', 'GER'],
      ['CAN', 'UK']
    ]], 
    expected: ['MEX', 'CAN', 'UK', 'GER'] 
  },
  { 
    input: [[
      ['USA', 'BRA'],
      ['JPN', 'PHL'],
      ['BRA', 'UAE'],
      ['UAE', 'JPN'],
      ['CMX', 'HKN']
    ]], 
    expected: ['USA', 'BRA', 'UAE', 'JPN', 'PHL'] 
  },
  { 
    input: [[
      ['STA', 'HYD'],
      ['ESP', 'CHN']
    ]], 
    expected: ['STA', 'HYD'] 
  },
];

for (const { input, expected } of testCases) {
  const result = revealSantaRoute(...input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
}
