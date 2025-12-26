/**
 * @param {string} elf1 - The moves of the first elf
 * @param {string} elf2 - The moves of the second elf
 * @return {number} - The result of the battle
 */
function elfBattle(elf1, elf2) {
  const dmg = {
    A: { A: 1, B: 0, F: 1 },
    F: { A: 2, B: 2, F: 2 },
    B: { A: 0, B: 0, F: 0 },
  }
  let hp = [3, 3]

  for (let i = 0; hp[0] > 0 && hp[1] > 0 && elf1[i] && elf2[i]; i++) {
    hp[0] -= dmg[elf2[i]]?.[elf1[i]] ?? 0
    hp[1] -= dmg[elf1[i]]?.[elf2[i]] ?? 0
  }

  return hp[0] <= 0 && hp[1] <= 0
    ? 0
    : hp[0] <= 0
    ? 2
    : hp[1] <= 0
    ? 1
    : [2, 0, 1][Math.sign(hp[0] - hp[1]) + 1]
}
