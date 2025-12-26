type Result = "fail" | "crash" | "success"

function moveReno(board: string, moves: string): Result {
  const grid = board
    .split("\n")
    .slice(1, -1)
    .map((l) => l.trim())
    .filter(Boolean)
  if (!grid.length) return "fail"

  const dirs: Record<string, number[]> = {
    L: [0, -1],
    R: [0, 1],
    U: [-1, 0],
    D: [1, 0],
  }
  const start = grid.findIndex((row) => row.includes("@"))
  if (start < 0) return "fail"

  type State = { r: number; c: number; picked: boolean; done: Result | null }

  const result = [...moves].reduce<State>(
    (s, m) => {
      if (s.done) return s
      const d = dirs[m] ?? [0, 0]
      const r = s.r + d[0],
        c = s.c + d[1]
      const cell = grid[r]?.[c]
      if (!cell || cell === "#")
        return { ...s, done: s.picked ? "success" : "crash" }
      return { r, c, picked: s.picked || cell === "*", done: null }
    },
    { r: start, c: grid[start].indexOf("@"), picked: false, done: null }
  )

  return result.done ?? (result.picked ? "success" : "fail")
}
