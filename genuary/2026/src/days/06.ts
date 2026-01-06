import type { DayConfig, p5 } from "../types"
import { createCanvas } from "../utils/canvas"
import type { ControlConfig, ControlState } from "../utils/controls"

// ============================================================================
// TYPES
// ============================================================================

type Vec2 = { x: number; y: number }

interface Segment {
  a: Vec2
  b: Vec2
  width: number
  startDist: number
  endDist: number
  kind: "trace" | "resistor"
  meta?: {
    resistorName?: string
  }
}

interface Via {
  x: number
  y: number
  outer: number
  hole: number
}

interface Pad {
  x: number
  y: number
  w: number
  h: number
  hole?: number
  round: number
}

interface Resistor {
  name: string
  x: number
  y: number
  length: number
  height: number
  pad: number
  orientation: "h" | "v"
  inDist: number
  outDist: number
  ohms: number
  bands: Array<[number, number, number]> // HSB colors
}

// ============================================================================
// SCENE GENERATION
// ============================================================================

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function randomInt(p: p5, min: number, max: number): number {
  return Math.floor(p.random(min, max + 1))
}

function dist(a: Vec2, b: Vec2): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function vLerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
}

function keyOf(p: Vec2): string {
  return `${Math.round(p.x)},${Math.round(p.y)}`
}

function snap(v: number, unit: number): number {
  return Math.round(v / unit) * unit
}

function snapV(v: Vec2, unit: number): Vec2 {
  return { x: snap(v.x, unit), y: snap(v.y, unit) }
}

function splitManhattan(points: Vec2[]): Array<{ a: Vec2; b: Vec2 }> {
  const out: Array<{ a: Vec2; b: Vec2 }> = []
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (a.x === b.x && a.y === b.y) continue
    out.push({ a, b })
  }
  return out
}

function addPath(
  segs: Segment[],
  distMap: Map<string, number>,
  points: Vec2[],
  width: number,
  kind: Segment["kind"],
  meta?: Segment["meta"]
): void {
  const parts = splitManhattan(points)
  for (const part of parts) {
    const k = keyOf(part.a)
    const startDist = distMap.get(k) ?? 0
    const len = dist(part.a, part.b)
    const endDist = startDist + len
    segs.push({ a: part.a, b: part.b, width, startDist, endDist, kind, meta })
    distMap.set(keyOf(part.b), endDist)
  }
}

function buildPCB(p: p5): {
  board: { x: number; y: number; w: number; h: number; r: number }
  unit: number
  segments: Segment[]
  vias: Via[]
  pads: Pad[]
  resistors: Resistor[]
  maxDist: number
  sourceNodeId: number
} {
  const controls: ControlState = (p as any)._controls || {}
  const unit = 4

  const seed = Math.round(controls.seed || 1)
  const complexity = clamp(controls.complexity ?? 0.6, 0, 1)
  const numResistors = Math.round(clamp(controls.numResistors ?? 4, 2, 8))
  const strength = clamp(controls.resistorStrength ?? 0.55, 0, 1)

  const boardW = 800
  const boardH = 780
  const board = {
    x: p.width / 2,
    y: p.height / 2 - 20,
    w: boardW,
    h: boardH,
    r: 26,
  }

  const left = board.x - board.w / 2
  const top = board.y - board.h / 2
  const right = board.x + board.w / 2
  const bottom = board.y + board.h / 2

  // Routing grid: higher complexity => tighter grid (more traces, no overlaps)
  const stepCells = Math.round(lerp(7, 3, complexity)) // unit multiples
  const step = unit * stepCells
  const inset = 70

  const gridLeft = left + inset
  const gridTop = top + inset
  const gridRight = right - inset
  const gridBottom = bottom - inset

  const gridW = Math.max(12, Math.floor((gridRight - gridLeft) / step) + 1)
  const gridH = Math.max(12, Math.floor((gridBottom - gridTop) / step) + 1)
  const nodeCount = gridW * gridH

  const nodeId = (ix: number, iy: number) => iy * gridW + ix
  const nodePos = (id: number): Vec2 =>
    snapV(
      { x: gridLeft + (id % gridW) * step, y: gridTop + Math.floor(id / gridW) * step },
      unit
    )

  // Source near connector area
  const srcIx = 1
  const srcIy = clamp(Math.floor(gridH * 0.18), 2, gridH - 3)
  const sourceNodeId = nodeId(srcIx, srcIy)
  const srcPos = nodePos(sourceNodeId)

  // Choose “realistic-ish” E12 resistor values around a base decade
  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]
  const decadeExp = Math.round(lerp(1, 5, strength)) // 10^1 .. 10^5

  function pickOhms(idx: number): number {
    const jitter = p.noise(seed * 0.01, idx * 0.23)
    const pick = E12[Math.floor(jitter * E12.length) % E12.length]
    const multShift = p.noise(seed * 0.02, idx * 0.31) > 0.82 ? 1 : 0
    return pick * Math.pow(10, decadeExp - 1 + multShift)
  }

  const DIGIT_COLORS: Array<[number, number, number]> = [
    [0, 0, 15], // 0 black
    [25, 70, 32], // 1 brown
    [0, 80, 65], // 2 red
    [28, 85, 80], // 3 orange
    [55, 75, 92], // 4 yellow
    [120, 65, 55], // 5 green
    [210, 75, 70], // 6 blue
    [280, 45, 70], // 7 violet
    [0, 0, 62], // 8 gray
    [0, 0, 95], // 9 white
  ]
  const GOLD: [number, number, number] = [45, 70, 70] // tolerance band

  function resistorBandsFromOhms(ohms: number): Array<[number, number, number]> {
    const v = Math.max(1, Math.round(ohms))
    const exp = Math.floor(Math.log10(v))
    let sig = Math.round(v / Math.pow(10, exp - 1))
    if (sig >= 100) sig = Math.round(sig / 10)
    const d1 = Math.floor(sig / 10) % 10
    const d2 = sig % 10
    const mult = clamp(exp - 1, 0, 9)
    return [DIGIT_COLORS[d1], DIGIT_COLORS[d2], DIGIT_COLORS[mult], GOLD]
  }

  // --- Generate a spanning tree over the grid (no overlapping lines by construction) ---
  const visited = new Uint8Array(nodeCount)
  const adj: number[][] = Array.from({ length: nodeCount }, () => [])
  const edges: Array<{ a: number; b: number }> = []

  const neighbors = (id: number): number[] => {
    const ix = id % gridW
    const iy = Math.floor(id / gridW)
    const out: number[] = []
    if (ix > 0) out.push(id - 1)
    if (ix < gridW - 1) out.push(id + 1)
    if (iy > 0) out.push(id - gridW)
    if (iy < gridH - 1) out.push(id + gridW)
    return out
  }

  const stack: number[] = [sourceNodeId]
  visited[sourceNodeId] = 1
  while (stack.length > 0) {
    const cur = stack[stack.length - 1]
    const nbs = neighbors(cur).filter((n) => visited[n] === 0)
    if (nbs.length === 0) {
      stack.pop()
      continue
    }
    const next = nbs[Math.floor(p.random(0, nbs.length))]
    visited[next] = 1
    adj[cur].push(next)
    adj[next].push(cur)
    edges.push({ a: cur, b: next })
    stack.push(next)
  }

  // Distances from source along the tree (branching surge uses these)
  const distFromSource = new Float32Array(nodeCount)
  const q: number[] = [sourceNodeId]
  const seen = new Uint8Array(nodeCount)
  seen[sourceNodeId] = 1
  while (q.length > 0) {
    const cur = q.pop()!
    const d0 = distFromSource[cur]
    for (const nb of adj[cur]) {
      if (seen[nb]) continue
      seen[nb] = 1
      distFromSource[nb] = d0 + step
      q.push(nb)
    }
  }

  let maxDist = 0
  for (let i = 0; i < nodeCount; i++) maxDist = Math.max(maxDist, distFromSource[i] || 0)

  // Build trace segments from edges
  const traceW = clamp(Math.round(lerp(7, 5, complexity)), 4, 7)
  const segments: Segment[] = edges.map(({ a, b }) => {
    const pa = nodePos(a)
    const pb = nodePos(b)
    const da = distFromSource[a]
    const db = distFromSource[b]
    return {
      a: pa,
      b: pb,
      width: traceW,
      startDist: Math.min(da, db),
      endDist: Math.max(da, db),
      kind: "trace",
    }
  })

  // Edge lookup for run detection
  const edgeSet = new Set<string>()
  for (const e of edges) edgeSet.add(`${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`)
  const connected = (a: number, b: number): boolean => edgeSet.has(`${Math.min(a, b)}-${Math.max(a, b)}`)

  // Find maximal straight runs
  type Run = { nodes: number[]; orientation: "h" | "v" }
  const runs: Run[] = []

  for (let iy = 0; iy < gridH; iy++) {
    for (let ix = 0; ix < gridW; ix++) {
      const id = nodeId(ix, iy)
      const hasR = ix < gridW - 1 && connected(id, id + 1)
      const hasL = ix > 0 && connected(id, id - 1)
      const hasD = iy < gridH - 1 && connected(id, id + gridW)
      const hasU = iy > 0 && connected(id, id - gridW)

      // horizontal start: has right, no left
      if (hasR && !hasL) {
        const nodes: number[] = [id]
        let cur = id
        while (true) {
          const cix = cur % gridW
          if (cix >= gridW - 1) break
          const nb = cur + 1
          if (!connected(cur, nb)) break
          nodes.push(nb)
          cur = nb
        }
        if (nodes.length >= 6) runs.push({ nodes, orientation: "h" })
      }

      // vertical start: has down, no up
      if (hasD && !hasU) {
        const nodes: number[] = [id]
        let cur = id
        while (true) {
          const ciy = Math.floor(cur / gridW)
          if (ciy >= gridH - 1) break
          const nb = cur + gridW
          if (!connected(cur, nb)) break
          nodes.push(nb)
          cur = nb
        }
        if (nodes.length >= 6) runs.push({ nodes, orientation: "v" })
      }
    }
  }

  runs.sort((a, b) => b.nodes.length - a.nodes.length)

  const resistors: Resistor[] = []
  const pads: Pad[] = []

  // 3-pin connector (visual only)
  for (let i = 0; i < 3; i++) {
    pads.push({
      x: snap(left + 36, unit),
      y: snap(srcPos.y - 36 + i * 36, unit),
      w: snap(22, unit),
      h: snap(30, unit),
      hole: 8,
      round: 6,
    })
  }

  const chosenNodeSet = new Set<number>()

  for (let ri = 0; ri < numResistors; ri++) {
    let placed = false
    for (let attempt = 0; attempt < 220 && !placed; attempt++) {
      const run = runs[Math.floor(p.random(0, Math.max(1, runs.length)))]
      if (!run) continue
      const minSpan = 4
      const maxSpan = 9
      const maxAllowed = Math.max(minSpan + 1, run.nodes.length - 2)
      const span = Math.min(Math.floor(p.random(minSpan, maxSpan + 1)), maxAllowed)
      if (span >= run.nodes.length) continue

      const startIdx = Math.floor(p.random(0, run.nodes.length - span))
      const endIdx = startIdx + span

      // Reserve nodes so resistors don’t stack
      let ok = true
      for (let k = startIdx; k <= endIdx; k++) {
        if (chosenNodeSet.has(run.nodes[k])) {
          ok = false
          break
        }
      }
      if (!ok) continue

      const aNode = run.nodes[startIdx]
      const bNode = run.nodes[endIdx]
      const aPos = nodePos(aNode)
      const bPos = nodePos(bNode)

      const center = { x: (aPos.x + bPos.x) / 2, y: (aPos.y + bPos.y) / 2 }
      const lengthPx = Math.max(78, Math.min(150, dist(aPos, bPos) * 0.85))

      const ohms = pickOhms(ri)
      const bands = resistorBandsFromOhms(ohms)

      const da = distFromSource[aNode]
      const db = distFromSource[bNode]
      const inDist = Math.min(da, db)
      const outDist = Math.max(da, db)

      resistors.push({
        name: `R${ri + 1}`,
        x: snap(center.x, unit),
        y: snap(center.y, unit),
        length: snap(lengthPx, unit),
        height: 22,
        pad: 18,
        orientation: run.orientation,
        inDist,
        outDist,
        ohms,
        bands,
      })

      // Gold pads at endpoints (visual)
      const padW = snap(22, unit)
      const padH = snap(18, unit)
      const endA =
        run.orientation === "h"
          ? { x: snap(center.x - lengthPx / 2 - 18, unit), y: snap(center.y, unit) }
          : { x: snap(center.x, unit), y: snap(center.y - lengthPx / 2 - 18, unit) }
      const endB =
        run.orientation === "h"
          ? { x: snap(center.x + lengthPx / 2 + 18, unit), y: snap(center.y, unit) }
          : { x: snap(center.x, unit), y: snap(center.y + lengthPx / 2 + 18, unit) }

      pads.push({ x: endA.x, y: endA.y, w: padW, h: padH, hole: 7, round: 7 })
      pads.push({ x: endB.x, y: endB.y, w: padW, h: padH, hole: 7, round: 7 })

      for (let k = startIdx; k <= endIdx; k++) chosenNodeSet.add(run.nodes[k])
      placed = true
    }
  }

  // Vias for texture
  const vias: Via[] = []
  const viaCount = Math.round(lerp(16, 90, complexity))
  for (let i = 0; i < viaCount; i++) {
    const id = Math.floor(p.random(0, nodeCount))
    const pos = nodePos(id)
    vias.push({ x: pos.x, y: pos.y, outer: 12 + (i % 3), hole: 6 })
  }

  return {
    board,
    unit,
    segments,
    vias,
    pads,
    resistors,
    maxDist,
    sourceNodeId,
  }
}

// ============================================================================
// DRAWING
// ============================================================================

function drawBoardBase(p: p5, board: { x: number; y: number; w: number; h: number; r: number }, timeSec: number): void {
  const { x, y, w, h, r } = board

  // Shadow
  p.noStroke()
  p.fill(0, 0, 0, 0.35)
  p.rect(x + 10, y + 12, w, h, r + 4)

  // Solder mask: deep PCB green with subtle gradient
  for (let i = 0; i < 6; i++) {
    const t = i / 5
    const ww = w - t * 10
    const hh = h - t * 10
    p.fill(135, 70, 18 + (1 - t) * 8, 1)
    p.rect(x, y, ww, hh, r)
  }

  // Glossy “wipe” highlight
  p.fill(140, 55, 55, 0.05)
  p.push()
  p.translate(x, y)
  p.rotate(-0.5)
  p.rect(0, -h * 0.2 + Math.sin(timeSec * 0.3) * 6, w * 1.2, h * 0.18, 40)
  p.pop()

  // Micro-noise speckle
  for (let i = 0; i < 900; i++) {
    const px = x - w / 2 + Math.random() * w
    const py = y - h / 2 + Math.random() * h
    p.fill(120, 25, 80, Math.random() * 0.03)
    p.rect(px, py, 2, 2)
  }

  // Vignette
  p.fill(0, 0, 0, 0.22)
  p.rect(x, y, w + 40, h + 40, r + 8)
}

function drawPixelLine(p: p5, a: Vec2, b: Vec2, unit: number, width: number, hue: number, sat: number, bri: number, alpha: number): void {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const steps = Math.max(1, Math.floor((Math.abs(dx) + Math.abs(dy)) / unit))
  const half = Math.max(unit, width) / 2

  p.noStroke()
  p.fill(hue, sat, bri, alpha)

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = snap(lerp(a.x, b.x, t), unit)
    const y = snap(lerp(a.y, b.y, t), unit)
    p.rect(x, y, width + half, width + half, width * 0.35)
  }
}

function drawCopperTrace(p: p5, seg: Segment, unit: number): void {
  // Copper under solder mask: render as raised green “channels” with highlights
  const baseHue = 140
  const baseSat = 60
  const baseBri = 24

  // Shadow
  drawPixelLine(p, seg.a, seg.b, unit, seg.width + 3, baseHue, baseSat, 8, 0.22)
  // Main
  drawPixelLine(p, seg.a, seg.b, unit, seg.width, baseHue, baseSat, baseBri, 0.9)
  // Highlight edge (slight offset)
  const off: Vec2 =
    seg.a.y === seg.b.y
      ? { x: 0, y: -unit * 0.5 }
      : { x: -unit * 0.5, y: 0 }
  drawPixelLine(
    p,
    { x: seg.a.x + off.x, y: seg.a.y + off.y },
    { x: seg.b.x + off.x, y: seg.b.y + off.y },
    unit,
    Math.max(2, seg.width - 2),
    140,
    45,
    38,
    0.28
  )
}

function drawPad(p: p5, pad: Pad): void {
  // Gold ENIG pad
  p.noStroke()
  p.fill(45, 65, 85, 1)
  p.rect(pad.x, pad.y, pad.w, pad.h, pad.round)
  p.fill(45, 70, 65, 1)
  p.rect(pad.x, pad.y, pad.w - 6, pad.h - 6, pad.round)

  if (pad.hole) {
    p.fill(0, 0, 10, 1)
    p.circle(pad.x, pad.y, pad.hole)
    p.fill(0, 0, 0, 0.25)
    p.circle(pad.x + 1.5, pad.y + 1.5, pad.hole + 2)
  }
}

function drawVia(p: p5, via: Via): void {
  p.noStroke()
  p.fill(45, 60, 78, 1)
  p.circle(via.x, via.y, via.outer)
  p.fill(45, 65, 62, 1)
  p.circle(via.x, via.y, via.outer - 4)
  p.fill(0, 0, 10, 1)
  p.circle(via.x, via.y, via.hole)
}

function drawResistor(p: p5, r: Resistor): void {
  // Pads are separate; draw body + silk label
  const bodyW = r.length
  const bodyH = r.height

  p.push()
  p.translate(r.x, r.y)
  if (r.orientation === "v") p.rotate(Math.PI / 2)

  // Body shadow
  p.noStroke()
  p.fill(0, 0, 0, 0.25)
  p.rect(2, 2, bodyW, bodyH, 6)

  // Body
  p.fill(35, 40, 88, 1) // warm ceramic
  p.rect(0, 0, bodyW, bodyH, 6)

  // Color bands
  const bandXs = [-0.22, -0.05, 0.10, 0.30].map((t) => t * bodyW)
  for (let i = 0; i < Math.min(4, r.bands.length); i++) {
    const c = r.bands[i]
    p.fill(c[0], c[1], c[2], 0.92)
    p.rect(bandXs[i], 0, 10, bodyH - 6, 3)
  }

  // Tiny value hint on body (subtle)
  p.fill(0, 0, 12, 0.35)
  p.textAlign(p.CENTER, p.CENTER)
  p.textSize(10)
  const v = r.ohms >= 1000000
    ? `${Math.round(r.ohms / 1000000)}M`
    : r.ohms >= 1000
      ? `${Math.round(r.ohms / 1000)}k`
      : `${Math.round(r.ohms)}`
  p.text(v, 0, 1)

  p.pop()

  // Silkscreen label
  p.fill(0, 0, 96, 0.75)
  p.textAlign(p.CENTER, p.CENTER)
  p.textSize(14)
  p.text(r.name, r.x, r.y - 18)
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  electricitySpeed: 1.0, // multiplier
  numResistors: 4,
  resistorStrength: 0.55, // 0..1 (low->high decade)
  complexity: 0.6, // 0..1
  seed: 0, // 0 => auto-randomize on load
}

const controlConfigs: { [key: string]: ControlConfig } = {
  electricitySpeed: {
    label: "Electricity Speed",
    min: 0.3,
    max: 2.2,
    defaultValue: 1.0,
    step: 0.05,
  },
  numResistors: {
    label: "Number of Resistors",
    min: 2,
    max: 8,
    defaultValue: 4,
    step: 1,
  },
  resistorStrength: {
    label: "Resistor Strength (Ω decade)",
    min: 0,
    max: 1,
    defaultValue: 0.55,
    step: 0.05,
  },
  complexity: {
    label: "Routing Complexity",
    min: 0,
    max: 1,
    defaultValue: 0.6,
    step: 0.05,
  },
  seed: {
    label: "Seed",
    min: 0,
    max: 9999,
    defaultValue: 0,
    step: 1,
  },
}

function drawSilk(p: p5, board: { x: number; y: number; w: number; h: number }, unit: number): void {
  p.noStroke()
  p.fill(0, 0, 96, 0.22)

  // Fiducials / alignment marks
  const left = board.x - board.w / 2
  const top = board.y - board.h / 2
  const right = board.x + board.w / 2
  const bottom = board.y + board.h / 2

  const pts: Vec2[] = [
    { x: left + 60, y: top + 60 },
    { x: right - 60, y: top + 60 },
    { x: right - 60, y: bottom - 60 },
  ].map((pt) => snapV(pt, unit))

  for (const pt of pts) {
    p.circle(pt.x, pt.y, 10)
    p.fill(0, 0, 96, 0.16)
    p.circle(pt.x, pt.y, 18)
    p.fill(0, 0, 96, 0.22)
  }
}

function pulseIntensityOnSegment(seg: Segment, front: number, tail: number): { a: number; b: number; intensity: number } | null {
  // Returns normalized segment portion [a,b] (0..1) that is “lit” by the moving front.
  const len = seg.endDist - seg.startDist
  if (len <= 0) return null

  const start = front - tail
  const end = front
  const s0 = seg.startDist
  const s1 = seg.endDist

  if (end <= s0 || start >= s1) return null

  const litStart = Math.max(s0, start)
  const litEnd = Math.min(s1, end)
  const a = (litStart - s0) / len
  const b = (litEnd - s0) / len
  const intensity = clamp((litEnd - litStart) / tail, 0.15, 1.0)
  return { a, b, intensity }
}

function drawElectricOverlay(
  p: p5,
  seg: Segment,
  unit: number,
  front: number,
  tail: number,
  globalOn: boolean,
  afterglow: number,
  timeSec: number
): void {
  const lit = pulseIntensityOnSegment(seg, front, tail)
  const isActive = globalOn && lit
  const baseGlow = afterglow * 0.22

  const cobaltHue = 215
  const cobaltSat = 85
  const cobaltBri = 95

  // Off-state afterglow along whole segment
  if (!globalOn && baseGlow > 0.01) {
    const a = seg.a
    const b = seg.b
    drawPixelLine(p, a, b, unit, seg.width + 6, cobaltHue, cobaltSat, cobaltBri, baseGlow * 0.12)
    drawPixelLine(p, a, b, unit, seg.width + 2, cobaltHue, cobaltSat, cobaltBri, baseGlow * 0.18)
  }

  if (!isActive) return

  // Draw only the lit portion
  const t0 = lit!.a
  const t1 = lit!.b
  const a = vLerp(seg.a, seg.b, t0)
  const b = vLerp(seg.a, seg.b, t1)

  const jitter = (p.noise(timeSec * 7.0, seg.startDist * 0.003) - 0.5) * unit * 0.8
  const aa = snapV({ x: a.x + (seg.a.y === seg.b.y ? 0 : jitter), y: a.y + (seg.a.y === seg.b.y ? jitter : 0) }, unit)
  const bb = snapV({ x: b.x + (seg.a.y === seg.b.y ? 0 : jitter), y: b.y + (seg.a.y === seg.b.y ? jitter : 0) }, unit)

  const coreW = seg.kind === "resistor" ? Math.max(2, seg.width - 3) : seg.width
  const glowW = seg.width + 10
  const i = lit!.intensity

  // Outer glow
  drawPixelLine(p, aa, bb, unit, glowW, cobaltHue, cobaltSat, cobaltBri, 0.10 * i)
  drawPixelLine(p, aa, bb, unit, seg.width + 6, cobaltHue, cobaltSat, cobaltBri, 0.16 * i)
  // Core
  drawPixelLine(p, aa, bb, unit, coreW, cobaltHue, cobaltSat, cobaltBri, 0.45 * i)

  // Tiny traveling spark at the front
  const spark = vLerp(seg.a, seg.b, t1)
  p.noStroke()
  p.fill(cobaltHue, cobaltSat, 100, 0.45)
  p.rect(snap(spark.x, unit), snap(spark.y, unit), unit * 2.2, unit * 2.2, unit)
}

function drawSwitchUI(p: p5, t: number): void {
  const w = Math.min(340, p.width * 0.55)
  const h = 46
  const x = p.width / 2
  const y = p.height - 70

  p.push()
  p.noStroke()

  // Track
  p.fill(0, 0, 0, 0.35)
  p.rect(x, y, w + 10, h + 10, 24)
  p.fill(220, 12, 18, 0.9)
  p.rect(x, y, w, h, 22)

  // Glow on the "ON" side (right when t=1)
  p.fill(140, 70, 90, 0.18 * t)
  p.rect(x + w * 0.25, y, w * 0.5, h, 22)

  // Knob
  const knobX = p.lerp(x - w * 0.25, x + w * 0.25, t)
  p.fill(0, 0, 0, 0.35)
  p.circle(knobX + 2, y + 2, h + 8)
  p.fill(0, 0, 96, 0.92)
  p.circle(knobX, y, h + 4)
  p.fill(0, 0, 0, 0.08)
  p.circle(knobX, y + 2, h + 4)

  // Simple LED indicators
  p.fill(140, 80, 90, 0.22 + 0.62 * t) // ON indicator (right)
  p.circle(x + w * 0.34, y, 10)
  p.fill(0, 0, 70, 0.12 + 0.35 * (1 - t)) // OFF indicator (left)
  p.circle(x - w * 0.34, y, 10)

  p.pop()
}

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 6,
  prompt:
    'Lights on/off. Make something that changes when you switch on or off the "digital" lights.',
  creditName: "George Henry Rowe",
  creditUrl: "https://georgehenryrowe.co.uk/",
  recording: { enabled: true, duration: 12, filename: "genuary-2026-day-06" },

  setup: (p: p5) => {
    createCanvas(p, 900, 900)
    p.colorMode(p.HSB, 360, 100, 100, 1)
    p.rectMode(p.CENTER)
    p.textFont("monospace")

    // Ensure controls exist (index.ts sets this before setup when controls are exported)
    const controls: ControlState = (p as any)._controls || { ...defaultControls }

    // Auto-randomize seed on first load if seed==0, and push to UI/localStorage
    if (!controls.seed || Math.round(controls.seed) === 0) {
      const newSeed = Math.floor(Math.random() * 10000)
      controls.seed = newSeed
      ;(p as any)._controls = controls
      if (typeof window !== "undefined" && typeof (window as any).setGenuaryControls === "function") {
        ;(window as any).setGenuaryControls(6, { seed: newSeed })
      }
    }

    const seed = Math.round(controls.seed || 1)
    p.randomSeed(seed)
    p.noiseSeed(seed)
    ;(p as any)._lastPcbKey = null
    ;(p as any)._pcb = buildPCB(p)

    ;(p as any)._lightsOn = true
    ;(p as any)._switchT = 1
    ;(p as any)._manualHoldUntilSec = 0
    ;(p as any)._autoPeriodSec = 6.0
    ;(p as any)._lastAutoPhase = -1
    ;(p as any)._lastToggleSec = 0
    ;(p as any)._surgeStartSec = 0
    ;(p as any)._afterglow = 0
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const key = `${Math.round(controls.seed || 1)}-${Math.round(controls.numResistors || 4)}-${(controls.resistorStrength ?? 0.55).toFixed(2)}-${(controls.complexity ?? 0.6).toFixed(2)}`
    if ((p as any)._lastPcbKey !== key) {
      const seed = Math.round(controls.seed || 1)
      p.randomSeed(seed)
      p.noiseSeed(seed)
      ;(p as any)._pcb = buildPCB(p)
      ;(p as any)._lastPcbKey = key
      ;(p as any)._surgeStartSec = 0
    }

    const pcb: ReturnType<typeof buildPCB> = (p as any)._pcb

    const timeSec = p.millis() / 1000
    const autoPeriodSec: number = (p as any)._autoPeriodSec
    const manualHoldUntilSec: number = (p as any)._manualHoldUntilSec

    // Auto-toggle for timelapse recordings, but defer after manual interaction
    if (timeSec > manualHoldUntilSec) {
      const autoPhase = Math.floor(timeSec / autoPeriodSec)
      const lastAutoPhase: number = (p as any)._lastAutoPhase
      if (autoPhase !== lastAutoPhase && autoPhase > 0) {
        ;(p as any)._lightsOn = !(p as any)._lightsOn
        ;(p as any)._lastToggleSec = timeSec
      }
      ;(p as any)._lastAutoPhase = autoPhase
    } else {
      // Keep phase in sync so we don't immediately flip when hold ends
      ;(p as any)._lastAutoPhase = Math.floor(timeSec / autoPeriodSec)
    }

    const lightsOn: boolean = (p as any)._lightsOn
    const lastToggleSec: number = (p as any)._lastToggleSec
    let switchT: number = (p as any)._switchT
    switchT = p.lerp(switchT, lightsOn ? 1 : 0, 0.12)
    ;(p as any)._switchT = switchT

    const sinceToggle = Math.max(0, timeSec - lastToggleSec)
    const edge = Math.exp(-sinceToggle * 3.0)
    const dt = Math.min(0.05, Math.max(0.001, p.deltaTime / 1000))

    // Background
    p.background(0, 0, 6, 1)

    // Draw board + static details
    drawBoardBase(p, pcb.board, timeSec)
    drawSilk(p, pcb.board, pcb.unit)

    // Pads / vias
    for (const pad of pcb.pads) drawPad(p, pad)
    for (const via of pcb.vias) drawVia(p, via)

    // Traces (thin pixelated copper under mask)
    for (const seg of pcb.segments) {
      if (seg.kind === "trace") drawCopperTrace(p, seg, pcb.unit)
    }

    // Resistors
    for (const r of pcb.resistors) drawResistor(p, r)

    // Electricity animation
    // - On: cobalt beam surges from source, branches naturally as front passes segment startDist
    // - Off: a faint decay along previously energized segments
    let afterglow: number = (p as any)._afterglow || 0
    afterglow = lightsOn ? clamp(afterglow + dt * 1.8, 0, 1) : clamp(afterglow - dt * 0.28, 0, 1)
    ;(p as any)._afterglow = afterglow

    if (lightsOn && (p as any)._surgeStartSec === 0) {
      ;(p as any)._surgeStartSec = timeSec
    }

    const surgeStartSec: number = (p as any)._surgeStartSec || timeSec
    const speedMult = clamp(controls.electricitySpeed ?? 1.0, 0.3, 2.2)
    const speedPx = 360 * speedMult // px/sec along trace network
    const tail = 150
    const front = ((timeSec - surgeStartSec) * speedPx) % (pcb.maxDist + tail * 1.2)

    // Power edge flash
    p.blendMode(p.ADD)
    p.noStroke()
    p.fill(215, 80, 100, 0.08 * edge)
    p.rect(pcb.board.x, pcb.board.y, pcb.board.w, pcb.board.h, pcb.board.r)

    for (const seg of pcb.segments) {
      drawElectricOverlay(p, seg, pcb.unit, front, tail, lightsOn, afterglow, timeSec)
    }

    // Resistor “dump” bloom when the surge reaches them
    for (const r of pcb.resistors) {
      const hit = clamp((front - r.inDist) / Math.max(1, r.outDist - r.inDist), 0, 1)
      const active = hit > 0 && hit < 1.05
      if (!active) continue
      const heat = Math.sin(hit * Math.PI) * 0.9
      p.fill(215, 85, 95, 0.18 * heat)
      const w = r.orientation === "h" ? r.length : r.height
      const h = r.orientation === "h" ? r.height : r.length
      p.rect(r.x, r.y, w * 1.15, h * 0.9, 10)
      p.fill(215, 85, 100, 0.08 * heat)
      p.circle(
        r.x + (r.orientation === "h" ? r.length * 0.2 : 0),
        r.y + (r.orientation === "v" ? -r.length * 0.2 : -2),
        18
      )
    }

    p.blendMode(p.BLEND)

    // Switch UI overlay
    drawSwitchUI(p, switchT)

    p.loop()
  },

  renderFinal: (p: p5) => {
    const pcb: ReturnType<typeof buildPCB> = (p as any)._pcb
    const timeSec = (p.frameCount || 180) / 60

    p.background(0, 0, 6, 1)
    drawBoardBase(p, pcb.board, timeSec)
    drawSilk(p, pcb.board, pcb.unit)
    for (const pad of pcb.pads) drawPad(p, pad)
    for (const via of pcb.vias) drawVia(p, via)
    for (const seg of pcb.segments) if (seg.kind === "trace") drawCopperTrace(p, seg, pcb.unit)
    for (const r of pcb.resistors) drawResistor(p, r)

    // Render a “hero” surge mid-flight
    const front = pcb.maxDist * 0.62
    const tail = 180
    p.blendMode(p.ADD)
    for (const seg of pcb.segments) {
      drawElectricOverlay(p, seg, pcb.unit, front, tail, true, 1, timeSec)
    }
    p.blendMode(p.BLEND)
    drawSwitchUI(p, 1)
  },

  mousePressed: (p: p5) => {
    const timeSec = p.millis() / 1000
    ;(p as any)._lightsOn = !(p as any)._lightsOn
    ;(p as any)._manualHoldUntilSec = timeSec + 10
    ;(p as any)._lastToggleSec = timeSec
    if ((p as any)._lightsOn) {
      ;(p as any)._surgeStartSec = timeSec
    }
  },

  keyPressed: (p: p5) => {
    if (p.key === " " || p.key === "l" || p.key === "L") {
      const timeSec = p.millis() / 1000
      ;(p as any)._lightsOn = !(p as any)._lightsOn
      ;(p as any)._manualHoldUntilSec = timeSec + 10
      ;(p as any)._lastToggleSec = timeSec
      if ((p as any)._lightsOn) {
        ;(p as any)._surgeStartSec = timeSec
      }
    }
    // Randomize seed quickly
    if (p.key === "n" || p.key === "N") {
      const newSeed = Math.floor(Math.random() * 10000)
      if (typeof window !== "undefined" && typeof (window as any).setGenuaryControls === "function") {
        ;(window as any).setGenuaryControls(6, { seed: newSeed })
      } else {
        const controls: ControlState = (p as any)._controls || { ...defaultControls }
        controls.seed = newSeed
        ;(p as any)._controls = controls
      }
    }
  },
}

export function getClaudesChoice(): Partial<ControlState> {
  return {
    electricitySpeed: 1.25,
    numResistors: 6,
    resistorStrength: 0.65, // nice mid-high decade (kΩ-ish)
    complexity: 0.78,
  }
}

export { controlConfigs, defaultControls }
export default config
