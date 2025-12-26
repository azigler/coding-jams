type Data = Array<Record<string, string | number | boolean>>
type SortBy = string

function drawTable(data: Data, sortBy: SortBy): string {
  if (!data.length) return ""

  const sorted = [...data].sort((a, b) => {
    const va = a[sortBy],
      vb = b[sortBy]
    return typeof va === "number" && typeof vb === "number"
      ? va - vb
      : String(va).localeCompare(String(vb))
  })

  const keys = Object.keys(data[0])
  const toStr = (v: any) => (v == null ? "" : String(v))
  const widths = keys.map((k) =>
    Math.max(1, ...sorted.map((r) => toStr(r[k]).length))
  )
  const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+"
  const row = (vals: string[]) =>
    "| " + vals.map((v, i) => v.padEnd(widths[i])).join(" | ") + " |"

  return [
    sep,
    row(keys.map((_, i) => String.fromCharCode(65 + i))),
    sep,
    ...sorted.map((r) => row(keys.map((k) => toStr(r[k])))),
    sep,
  ].join("\n")
}
