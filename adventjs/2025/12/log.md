# Challenge 12: ⚔️ Elf battle - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `elfBattle`

Simulate a turn-based battle between two elves. Each has moves: A (normal attack, 1 damage), B (block), F (strong attack, 2 damage, unblockable). Both start with 3 HP. Battle ends when someone reaches 0 or less HP. Return 1 if Elf 1 wins, 2 if Elf 2 wins, 0 if draw.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 4/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 4/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 4/5 quality) - First attempt

## Approach

1. **Initialize HP**: Both elves start with 3 HP
2. **Process each round**: For each move pair:
   - Calculate damage based on move combinations
   - A vs B: blocked (no damage)
   - F vs B: F cannot be blocked (2 damage)
   - A vs A: both take 1 damage
   - F vs F: both take 2 damage
   - A vs F: A takes 2, F takes 1
   - B vs A: blocked (no damage)
   - B vs F: F cannot be blocked (2 damage)
3. **Apply damage**: Subtract damage from HP
4. **Check end condition**: If either HP <= 0, end battle immediately
5. **Determine winner**: Compare final HP or check who reached 0 first

### Algorithm

```javascript
let hp1 = 3, hp2 = 3;

for (each move pair) {
  calculate damage1 and damage2 based on moves
  hp1 -= damage1;
  hp2 -= damage2;
  if (hp1 <= 0 || hp2 <= 0) break;
}

return winner based on final HP
```

## Key Insights

- **Simultaneous resolution**: Both moves happen at the same time, so both can take damage
- **Strong attack unblockable**: F cannot be blocked by B
- **Early termination**: Battle ends immediately when someone reaches 0 or less
- **Damage calculation**: Must handle all 9 combinations of moves (A, B, F × A, B, F)
- **Both attack case**: When both attack, both take damage from the opponent's attack
