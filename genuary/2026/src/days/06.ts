import type { DayConfig, p5 } from "../types"
import { createCanvas } from "../utils/canvas"

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
  orientation: "h"
  inDist: number
  outDist: number
}

// ============================================================================
// SCENE GENERATION
// ============================================================================

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
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
  totalLen: number
  sourceDist: number
} {
  // Pixel grid for that “thin-but-digital” circuit look
  const unit = 4

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

  // Coordinates (snapped)
  const src = snapV({ x: left + 50, y: top + 160 }, unit) // VCC pad
  const hub = snapV({ x: left + 330, y: top + 210 }, unit)
  const hub2 = snapV({ x: left + 440, y: top + 340 }, unit) // branching “bus”

  // Resistors (realistic-ish placement)
  const resistors = [
    { name: "R1", x: right - 160, y: top + 140, length: 90, height: 22, pad: 18, orientation: "h", inDist: 0, outDist: 0 },
    { name: "R2", x: right - 210, y: top + 290, length: 100, height: 22, pad: 18, orientation: "h", inDist: 0, outDist: 0 },
    { name: "R3", x: right - 170, y: top + 460, length: 110, height: 22, pad: 18, orientation: "h", inDist: 0, outDist: 0 },
    { name: "R4", x: left + 520, y: bottom - 160, length: 100, height: 22, pad: 18, orientation: "h", inDist: 0, outDist: 0 },
  ].map(
    (r) =>
      ({
        ...r,
        orientation: "h" as const,
        x: snap(r.x, unit),
        y: snap(r.y, unit),
      }) satisfies Resistor
  )

  // Pads: connector + resistor pads
  const pads: Pad[] = []

  // 3-pin connector (power)
  for (let i = 0; i < 3; i++) {
    const py = snap(top + 120 + i * 36, unit)
    pads.push({
      x: snap(left + 34, unit),
      y: py,
      w: snap(22, unit),
      h: snap(30, unit),
      hole: 8,
      round: 6,
    })
  }

  // Resistor pads
  for (const r of resistors) {
    pads.push({
      x: snap(r.x - r.length / 2 - r.pad / 2 - 6, unit),
      y: r.y,
      w: snap(r.pad + 6, unit),
      h: snap(r.pad, unit),
      hole: 7,
      round: 7,
    })
    pads.push({
      x: snap(r.x + r.length / 2 + r.pad / 2 + 6, unit),
      y: r.y,
      w: snap(r.pad + 6, unit),
      h: snap(r.pad, unit),
      hole: 7,
      round: 7,
    })
  }

  // Vias sprinkled for realism (and to hint at layers)
  const vias: Via[] = []
  const viaPts: Vec2[] = [
    { x: left + 220, y: top + 360 },
    { x: left + 520, y: top + 120 },
    { x: left + 600, y: top + 560 },
    { x: left + 160, y: top + 560 },
    { x: left + 420, y: top + 560 },
    { x: right - 80, y: top + 380 },
    { x: right - 80, y: top + 520 },
  ].map((pt) => snapV(pt, unit))

  for (const pt of viaPts) {
    vias.push({ x: pt.x, y: pt.y, outer: 14, hole: 6 })
  }

  // Segments (tree from source -> hub -> branches -> resistors)
  const segments: Segment[] = []
  const distMap = new Map<string, number>()
  distMap.set(keyOf(src), 0)

  const traceW = 6

  // Main trunk
  addPath(
    segments,
    distMap,
    [
      src,
      snapV({ x: left + 120, y: src.y }, unit),
      snapV({ x: left + 120, y: top + 210 }, unit),
      hub,
      snapV({ x: hub2.x, y: hub.y }, unit),
      hub2,
    ],
    traceW,
    "trace"
  )

  // Branches to resistors (into left pads)
  const resistorLeftPads = resistors.map((r) =>
    snapV({ x: r.x - r.length / 2 - r.pad - 14, y: r.y }, unit)
  )

  const branchStarts: Vec2[] = [
    hub2,
    snapV({ x: hub2.x, y: hub2.y + 60 }, unit),
    snapV({ x: hub2.x, y: hub2.y + 140 }, unit),
    snapV({ x: hub2.x - 80, y: hub2.y + 240 }, unit),
  ]

  // Ensure dist exists at intermediate branch nodes
  for (const bs of branchStarts) {
    const k = keyOf(bs)
    if (!distMap.has(k)) {
      // Connect from hub2 to branch start so it’s part of the routed tree
      addPath(segments, distMap, [hub2, bs], traceW, "trace")
    }
  }

  for (let i = 0; i < resistors.length; i++) {
    const r = resistors[i]
    const start = branchStarts[i] || hub2
    const leftPad = resistorLeftPads[i]
    // Manhattan route with a little jog
    const midX = snap(lerp(start.x, leftPad.x, 0.55), unit)
    addPath(
      segments,
      distMap,
      [start, snapV({ x: midX, y: start.y }, unit), snapV({ x: midX, y: leftPad.y }, unit), leftPad],
      traceW,
      "trace"
    )

    // Resistor body acts like a component segment (slower “dump”)
    const inK = keyOf(leftPad)
    const inDist = distMap.get(inK) ?? 0
    const bodyA = snapV({ x: r.x - r.length / 2, y: r.y }, unit)
    const bodyB = snapV({ x: r.x + r.length / 2, y: r.y }, unit)

    // Connect pad -> body start (tiny lead)
    addPath(segments, distMap, [leftPad, bodyA], traceW, "trace")

    // Component segment
    distMap.set(keyOf(bodyA), distMap.get(keyOf(bodyA)) ?? inDist)
    addPath(
      segments,
      distMap,
      [bodyA, bodyB],
      5,
      "resistor",
      { resistorName: r.name }
    )
    const outDist = distMap.get(keyOf(bodyB)) ?? inDist + r.length
    r.inDist = inDist
    r.outDist = outDist
  }

  const totalLen = segments.reduce((m, s) => Math.max(m, s.endDist), 0)

  return {
    board,
    unit,
    segments,
    vias,
    pads,
    resistors,
    totalLen,
    sourceDist: 0,
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

  // Body shadow
  p.noStroke()
  p.fill(0, 0, 0, 0.25)
  p.rect(r.x + 2, r.y + 2, bodyW, bodyH, 6)

  // Body
  p.fill(35, 40, 88, 1) // warm ceramic
  p.rect(r.x, r.y, bodyW, bodyH, 6)

  // Color bands
  const bands = [
    { c: [220, 70, 55] as [number, number, number], x: -bodyW * 0.22 },
    { c: [45, 75, 55] as [number, number, number], x: -bodyW * 0.05 },
    { c: [200, 65, 45] as [number, number, number], x: bodyW * 0.10 },
    { c: [50, 30, 75] as [number, number, number], x: bodyW * 0.28 },
  ]
  for (const b of bands) {
    p.fill(b.c[0], b.c[1], b.c[2], 0.9)
    p.rect(r.x + b.x, r.y, 10, bodyH - 6, 3)
  }

  // Silkscreen label
  p.fill(0, 0, 96, 0.75)
  p.textAlign(p.CENTER, p.CENTER)
  p.textSize(14)
  p.text(r.name, r.x, r.y - 18)
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

    // Deterministic-ish layout for a “designed” composition
    p.randomSeed(6)
    p.noiseSeed(6)
    const pcb = buildPCB(p)
    ;(p as any)._pcb = pcb

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
    const speedPx = 360 // px/sec along trace network
    const tail = 150
    const front = ((timeSec - surgeStartSec) * speedPx) % (pcb.totalLen + tail * 1.2)

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
      p.rect(r.x, r.y, r.length * 1.15, r.height * 1.8, 10)
      p.fill(215, 85, 100, 0.08 * heat)
      p.circle(r.x + r.length * 0.2, r.y - 2, 18)
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
    const front = pcb.totalLen * 0.62
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
  },
}

export default config
