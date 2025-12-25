const example = `.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`

const grid = example.trim().split("\n")
const rows = grid.length
const cols = grid[0].length

let startRow = -1
let startCol = -1
for (let r = 0; r < rows; r++) {
  const c = grid[r].indexOf("S")
  if (c !== -1) {
    startRow = r
    startCol = c
    break
  }
}

type ColCount = Map<number, bigint>
let current: ColCount = new Map()
current.set(startCol, 1n)
let ended = 0n

for (let row = startRow; row < rows; row++) {
  const next: ColCount = new Map()
  for (const [col, count] of current.entries()) {
    const nr = row + 1
    if (nr >= rows) {
      ended += count
      continue
    }
    const ch = grid[nr][col]
    if (ch === '.') {
      next.set(col, (next.get(col) ?? 0n) + count)
    } else if (ch === '^') {
      const lc = col - 1
      const rc = col + 1
      if (lc >= 0) next.set(lc, (next.get(lc) ?? 0n) + count)
      else ended += count
      if (rc < cols) next.set(rc, (next.get(rc) ?? 0n) + count)
      else ended += count
    } else {
      ended += count
    }
  }
  current = next
}
for (const cnt of current.values()) ended += cnt
console.log(`Timelines: ${ended}`)
console.log(`Expected: 40`)
