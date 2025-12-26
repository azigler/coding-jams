def elf_battle(elf1: str, elf2: str) -> int:
    dmg = {'A': {'A': 1, 'B': 0, 'F': 1}, 'F': {
        'A': 2, 'B': 2, 'F': 2}, 'B': {'A': 0, 'B': 0, 'F': 0}}
    hp1, hp2 = 3, 3

    for m1, m2 in zip(elf1, elf2):
        if hp1 <= 0 or hp2 <= 0:
            break
        hp1 -= dmg[m2][m1]
        hp2 -= dmg[m1][m2]

    if hp1 <= 0 and hp2 <= 0:
        return 0
    if hp1 <= 0:
        return 2
    if hp2 <= 0:
        return 1
    return 0 if hp1 == hp2 else 1 if hp1 > hp2 else 2
