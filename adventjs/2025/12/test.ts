// Test file for Challenge 12: ⚔️ Elf battle
// Run with: deno run --allow-read test.ts

// Inline the solution function for testing
function elfBattle(elf1, elf2) {
  let hp1 = 3;
  let hp2 = 3;
  
  const maxRounds = Math.max(elf1.length, elf2.length);
  
  for (let i = 0; i < maxRounds; i++) {
    const move1 = elf1[i] || null;
    const move2 = elf2[i] || null;
    
    // Calculate damage for each elf
    let damage1 = 0; // Damage to elf1
    let damage2 = 0; // Damage to elf2
    
    if (move1 === 'A') {
      // Elf1 uses normal attack
      if (move2 === 'B') {
        // Elf2 blocks - no damage to elf2
      } else if (move2 === 'A') {
        // Both attack with A - both take 1 damage
        damage1 = 1;
        damage2 = 1;
      } else if (move2 === 'F') {
        // Both attack - elf1 takes 2 (from F), elf2 takes 1 (from A)
        damage1 = 2;
        damage2 = 1;
      }
    } else if (move1 === 'F') {
      // Elf1 uses strong attack (cannot be blocked)
      if (move2 === 'A') {
        // Both attack - elf1 takes 1 (from A), elf2 takes 2 (from F)
        damage1 = 1;
        damage2 = 2;
      } else if (move2 === 'F') {
        // Both attack with F - both take 2 damage
        damage1 = 2;
        damage2 = 2;
      } else if (move2 === 'B') {
        // Elf2 blocks but F cannot be blocked
        damage2 = 2;
      }
    } else if (move1 === 'B') {
      // Elf1 blocks
      if (move2 === 'A') {
        // Elf2's attack is blocked - no damage to elf1
      } else if (move2 === 'F') {
        // F cannot be blocked - elf1 takes damage
        damage1 = 2;
      }
    }
    
    // Apply damage
    hp1 -= damage1;
    hp2 -= damage2;
    
    // Check if battle ends (someone reaches 0 or less)
    if (hp1 <= 0 || hp2 <= 0) {
      break;
    }
  }
  
  // Determine winner
  if (hp1 <= 0 && hp2 <= 0) {
    return 0; // Draw (both at 0 or less)
  } else if (hp1 <= 0) {
    return 2; // Elf 2 wins
  } else if (hp2 <= 0) {
    return 1; // Elf 1 wins
  } else {
    // Both still alive - compare HP
    if (hp1 > hp2) return 1;
    if (hp2 > hp1) return 2;
    return 0; // Same HP = draw
  }
}

const testCases = [
  { input: ['A', 'B'], expected: 0 },
  { input: ['F', 'B'], expected: 1 },
  { input: ['AAB', 'BBA'], expected: 0 },
  { input: ['AFA', 'BBA'], expected: 1 },
  { input: ['AFAB', 'BBAF'], expected: 1 },
  { input: ['AA', 'FF'], expected: 2 },
];

for (const { input, expected } of testCases) {
  const result = elfBattle(...input);
  const pass = result === expected;
  console.log(`${pass ? "✅" : "❌"} Input: ${JSON.stringify(input)} | Expected: ${expected} | Got: ${result}`);
}
