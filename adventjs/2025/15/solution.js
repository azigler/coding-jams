/**
 * @param {Array<Object>} data - The data to draw the table
 * @param {string} sortBy - The field to sort the table
 * @returns {string}
 */
function drawTable(data, sortBy) {
  if (!data.length) return ""

  const compare = (a, b) => {
    const va = a[sortBy],
      vb = b[sortBy]
    if (typeof va === "number" && typeof vb === "number") return va - vb
    return String(va).localeCompare(String(vb))
  }
  const sorted = [...data].sort(compare)

  const keys = Object.keys(data[0])
  const toStr = (v) => (v == null ? "" : String(v))
  const widths = keys.map((k) =>
    Math.max(1, ...sorted.map((r) => toStr(r[k]).length))
  )
  const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+"
  const row = (vals) =>
    "| " + vals.map((v, i) => v.padEnd(widths[i])).join(" | ") + " |"

  return [
    sep,
    row(keys.map((_, i) => String.fromCharCode(65 + i))),
    sep,
    ...sorted.map((r) => row(keys.map((k) => toStr(r[k])))),
    sep,
  ].join("\n")
}
