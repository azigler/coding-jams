import type { DayConfig, p5 } from "../types"
import { createCanvas } from "../utils/canvas"

// ============================================================================
// TYPES
// ============================================================================

interface LedCell {
  gx: number
  gy: number
  x: number
  y: number
  seed: number
  hue: number
  charge: number // persistent brightness (for afterglow)
}

interface Trace {
  points: Array<{ x: number; y: number }>
  hue: number
  seed: number
}

interface TraceSampler {
  points: Array<{ x: number; y: number }>
  lens: number[]
  totalLen: number
}

interface Packet {
  traceIdx: number
  dist: number
  speed: number // px/sec
  hue: number
  energy: number
  driftX: number
  driftY: number
  kind: "charge" | "spore"
  age: number
}

// ============================================================================
// SCENE GENERATION
// ============================================================================

function randomInt(p: p5, min: number, max: number): number {
  return Math.floor(p.random(min, max + 1))
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function generateTraces(
  p: p5,
  cols: number,
  rows: number,
  cell: number,
  count: number
): Trace[] {
  const traces: Trace[] = []
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ]

  for (let i = 0; i < count; i++) {
    let gx = randomInt(p, 2, cols - 3)
    let gy = randomInt(p, 2, rows - 3)
    const steps = randomInt(p, 10, 26)

    const points: Array<{ x: number; y: number }> = []
    points.push({ x: (gx + 0.5) * cell, y: (gy + 0.5) * cell })

    let lastDir = randomInt(p, 0, dirs.length - 1)
    for (let s = 0; s < steps; s++) {
      // Bias to keep going straight, like PCB traces
      const dirIdx =
        p.random() < 0.72 ? lastDir : randomInt(p, 0, dirs.length - 1)
      lastDir = dirIdx
      const d = dirs[dirIdx]

      gx = Math.max(1, Math.min(cols - 2, gx + d.x))
      gy = Math.max(1, Math.min(rows - 2, gy + d.y))

      // Occasionally step twice to create longer segments
      if (p.random() < 0.22) {
        gx = Math.max(1, Math.min(cols - 2, gx + d.x))
        gy = Math.max(1, Math.min(rows - 2, gy + d.y))
      }

      points.push({ x: (gx + 0.5) * cell, y: (gy + 0.5) * cell })
    }

    traces.push({
      points,
      hue: (p.random(0, 1) * 360 + i * 7) % 360,
      seed: p.random(0, 1),
    })
  }

  return traces
}

function buildTraceSamplers(traces: Trace[]): TraceSampler[] {
  return traces.map((t) => {
    const lens: number[] = []
    let total = 0
    for (let i = 1; i < t.points.length; i++) {
      const a = t.points[i - 1]
      const b = t.points[i]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.sqrt(dx * dx + dy * dy)
      lens.push(len)
      total += len
    }
    return { points: t.points, lens, totalLen: total }
  })
}

function sampleTrace(
  sampler: TraceSampler,
  dist: number
): { x: number; y: number; dx: number; dy: number } {
  const total = sampler.totalLen
  if (total <= 0 || sampler.points.length < 2) {
    const p0 = sampler.points[0] || { x: 0, y: 0 }
    return { x: p0.x, y: p0.y, dx: 1, dy: 0 }
  }

  let d = ((dist % total) + total) % total
  for (let i = 0; i < sampler.lens.length; i++) {
    const segLen = sampler.lens[i] || 0
    if (d <= segLen || i === sampler.lens.length - 1) {
      const a = sampler.points[i]
      const b = sampler.points[i + 1]
      const t = segLen > 0 ? d / segLen : 0
      const x = a.x + (b.x - a.x) * t
      const y = a.y + (b.y - a.y) * t
      const dx = b.x - a.x
      const dy = b.y - a.y
      const mag = Math.sqrt(dx * dx + dy * dy) || 1
      return { x, y, dx: dx / mag, dy: dy / mag }
    }
    d -= segLen
  }

  const last = sampler.points[sampler.points.length - 1]
  return { x: last.x, y: last.y, dx: 1, dy: 0 }
}

function spawnPacket(p: p5, samplers: TraceSampler[], kind: Packet["kind"]): Packet {
  const traceIdx = Math.floor(p.random(0, Math.max(1, samplers.length)))
  const sampler = samplers[traceIdx]
  const dist = p.random(0, Math.max(1, sampler.totalLen))
  const baseHue = (p.random(0, 1) * 360 + traceIdx * 9.0) % 360
  const hue = kind === "charge" ? baseHue : 150 + p.random(-20, 20)

  return {
    traceIdx,
    dist,
    speed: kind === "charge" ? p.random(120, 280) : p.random(35, 90),
    hue,
    energy: kind === "charge" ? p.random(0.75, 1.15) : p.random(0.35, 0.75),
    driftX: 0,
    driftY: 0,
    kind,
    age: 0,
  }
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

    const cols = 72
    const rows = 72
    const cell = p.width / cols

    const leds: LedCell[] = []
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const seed = p.random(0, 1)
        const hue = (seed * 360 + gx * 0.8 + gy * 0.25 + p.random(-12, 12)) % 360
        leds.push({
          gx,
          gy,
          x: (gx + 0.5) * cell,
          y: (gy + 0.5) * cell,
          seed,
          hue,
          charge: 0,
        })
      }
    }

    const traces = generateTraces(p, cols, rows, cell, 60)
    const samplers = buildTraceSamplers(traces)
    const packets: Packet[] = []
    for (let i = 0; i < 18; i++) packets.push(spawnPacket(p, samplers, "charge"))

    ;(p as any)._cols = cols
    ;(p as any)._rows = rows
    ;(p as any)._cell = cell
    ;(p as any)._leds = leds
    ;(p as any)._traces = traces
    ;(p as any)._traceSamplers = samplers
    ;(p as any)._packets = packets
    ;(p as any)._accum = new Float32Array(cols * rows)

    ;(p as any)._lightsOn = true
    ;(p as any)._switchT = 1
    ;(p as any)._manualHoldUntilSec = 0
    ;(p as any)._autoPeriodSec = 4.2
    ;(p as any)._lastAutoPhase = -1
    ;(p as any)._lastToggleSec = 0
  },

  draw: (p: p5) => {
    const cols: number = (p as any)._cols
    const rows: number = (p as any)._rows
    const cell: number = (p as any)._cell
    const leds: LedCell[] = (p as any)._leds
    const traces: Trace[] = (p as any)._traces
    const samplers: TraceSampler[] = (p as any)._traceSamplers
    const packets: Packet[] = (p as any)._packets
    const accum: Float32Array = (p as any)._accum

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

    const dt = Math.min(0.05, Math.max(0.001, p.deltaTime / 1000))
    const sinceToggle = Math.max(0, timeSec - lastToggleSec)
    const edge = Math.exp(-sinceToggle * 2.4) // power edge flash

    // Background: screen glow changes personality
    p.background(230, 18, lightsOn ? 7 : 2, 1)
    p.noStroke()
    p.fill(230, 30, 0, lightsOn ? 0.2 : 0.45)
    p.rect(p.width / 2, p.height / 2, p.width * 1.2, p.height * 1.2)

    // Scanlines (subtle)
    for (let y = 0; y < p.height; y += 6) {
      const a = lightsOn ? 0.05 : 0.09
      p.stroke(0, 0, 0, a)
      p.strokeWeight(1)
      p.line(0, y + (y % 12 === 0 ? 1 : 0), p.width, y)
    }

    // Circuit traces become more visible when lights are off, but "breathe" when on
    p.noFill()
    p.strokeWeight(1.5)
    for (const trace of traces) {
      const shimmer =
        0.65 +
        0.35 *
          Math.sin(timeSec * 1.7 + trace.seed * Math.PI * 2 + trace.points.length * 0.07)
      const alpha = (lightsOn ? 0.06 + 0.05 * edge : 0.22) * shimmer
      const hue = lightsOn ? (trace.hue + 10 * Math.sin(timeSec * 0.7)) % 360 : 160
      const sat = lightsOn ? 22 : 35
      const bri = lightsOn ? 70 : 55
      p.stroke(hue, sat, bri, alpha)
      p.beginShape()
      for (const pt of trace.points) p.vertex(pt.x, pt.y)
      p.endShape()
    }

    // --- Simulate "power" as packets in traces ---
    accum.fill(0)

    // Maintain population
    const targetCharges = 18
    const targetSpores = lightsOn ? 0 : 26
    const charges = packets.filter((pk) => pk.kind === "charge").length
    const spores = packets.filter((pk) => pk.kind === "spore").length

    if (charges < targetCharges) {
      for (let i = 0; i < targetCharges - charges; i++) packets.push(spawnPacket(p, samplers, "charge"))
    }
    if (spores < targetSpores) {
      for (let i = 0; i < targetSpores - spores; i++) packets.push(spawnPacket(p, samplers, "spore"))
    }

    // Cull to avoid runaway
    while (packets.length > 70) packets.splice(Math.floor(p.random(0, packets.length)), 1)

    // Update packets and stamp light into the grid
    const stampRadius = 4
    const sigma2 = 3.0 * 3.0
    const noiseScale = 0.006

    for (let i = 0; i < packets.length; i++) {
      const pk = packets[i]
      const sampler = samplers[pk.traceIdx]
      if (!sampler) continue

      pk.age += dt
      pk.dist += pk.speed * dt * (pk.kind === "charge" ? (lightsOn ? 1 : 0.25) : (lightsOn ? 0.1 : 0.45))

      const s = sampleTrace(sampler, pk.dist)

      // Spores leak off-trace when power is off: a "digital afterlife"
      if (!lightsOn && pk.kind === "spore") {
        const n1 = p.noise(s.x * noiseScale, s.y * noiseScale, timeSec * 0.35 + pk.traceIdx)
        const n2 = p.noise(s.y * noiseScale, s.x * noiseScale, timeSec * 0.35 + pk.energy * 10)
        const ax = (n1 - 0.5) * 120
        const ay = (n2 - 0.5) * 120
        pk.driftX = clamp(pk.driftX + ax * dt, -90, 90)
        pk.driftY = clamp(pk.driftY + ay * dt, -90, 90)
      } else {
        pk.driftX *= 0.92
        pk.driftY *= 0.92
      }

      const px = s.x + pk.driftX
      const py = s.y + pk.driftY

      // Convert to grid coords and stamp
      const gx = Math.floor(px / cell)
      const gy = Math.floor(py / cell)
      if (gx < -stampRadius || gx > cols - 1 + stampRadius) continue
      if (gy < -stampRadius || gy > rows - 1 + stampRadius) continue

      const baseI =
        (pk.kind === "charge"
          ? (lightsOn ? 1.0 : 0.25)
          : lightsOn
            ? 0.07
            : 0.55) * pk.energy

      const dirGlow = pk.kind === "charge" ? 1.2 : 0.6
      const dx = s.dx
      const dy = s.dy

      for (let oy = -stampRadius; oy <= stampRadius; oy++) {
        const yy = gy + oy
        if (yy < 0 || yy >= rows) continue
        for (let ox = -stampRadius; ox <= stampRadius; ox++) {
          const xx = gx + ox
          if (xx < 0 || xx >= cols) continue

          // Slight directional streak
          const along = ox * dx + oy * dy
          const perp = ox * -dy + oy * dx
          const r2 = perp * perp + (along * 0.6) * (along * 0.6)
          const w = Math.exp(-r2 / (2 * sigma2))
          accum[yy * cols + xx] += baseI * w * dirGlow
        }
      }

      // Rare branching: when power is off, spores occasionally split (creepy)
      if (!lightsOn && pk.kind === "spore" && p.random() < 0.012) {
        const child = spawnPacket(p, samplers, "spore")
        child.traceIdx = pk.traceIdx
        child.dist = pk.dist + p.random(-30, 30)
        child.driftX = pk.driftX + p.random(-10, 10)
        child.driftY = pk.driftY + p.random(-10, 10)
        child.energy = pk.energy * p.random(0.55, 0.85)
        packets.push(child)
      }

      // Recycle old spores
      if (pk.kind === "spore" && pk.age > 12) {
        packets[i] = spawnPacket(p, samplers, "spore")
      }
    }

    // Draw LEDs (additive when "on", ghostly when "off")
    if (lightsOn) p.blendMode(p.ADD)

    const freq = 0.07

    p.noStroke()

    for (let i = 0; i < leds.length; i++) {
      const led = leds[i]
      const idx = led.gy * cols + led.gx

      const ambient = lightsOn
        ? 0.02 + 0.02 * p.noise(led.gx * freq, led.gy * freq, timeSec * 0.2 + led.seed * 6.0)
        : 0.003
      const packetI = accum[idx]

      let target = 0
      if (lightsOn) {
        target = ambient + packetI * 0.55 + 0.35 * edge
        led.charge = p.lerp(led.charge, target, 0.25)
      } else {
        target = ambient + packetI * 0.22
        // phosphor discharge: slow decay + occasional ghost sparkles
        const ghost = p.noise(led.seed * 30, timeSec * 1.1) > 0.925 ? 0.08 : 0
        led.charge = Math.max(led.charge * 0.945, target + ghost)
      }

      const flicker =
        (p.noise(led.seed * 40, timeSec * 4.2 + led.gx * 0.02 + led.gy * 0.01) - 0.5) *
        (lightsOn ? 0.06 : 0.018)
      const intensity = clamp(led.charge + flicker * Math.max(0.05, led.charge), 0, 1.25)
      if (intensity < 0.01) continue

      const size = cell * (0.62 + 0.22 * intensity)
      const hue = lightsOn ? (led.hue + packetI * 18) % 360 : 150
      const sat = lightsOn ? 80 : 28
      const bri = (lightsOn ? 100 : 78) * clamp(intensity, 0, 1)

      // Bloom layers
      if (lightsOn) {
        p.fill(hue, sat, bri, 0.05 + 0.10 * clamp(intensity, 0, 1) + 0.08 * edge)
        p.rect(led.x, led.y, size * 2.6, size * 2.6, cell * 0.25)
        p.fill(hue, sat, bri, 0.08 + 0.12 * clamp(intensity, 0, 1))
        p.rect(led.x, led.y, size * 1.8, size * 1.8, cell * 0.25)
      } else {
        p.fill(hue, sat, bri, 0.06 + 0.14 * clamp(intensity, 0, 1))
        p.rect(led.x, led.y, size * 1.9, size * 1.9, cell * 0.25)
      }

      // Core LED
      const coreAlpha = lightsOn
        ? 0.18 + 0.62 * clamp(intensity, 0, 1)
        : 0.14 + 0.52 * clamp(intensity, 0, 1)
      p.fill(hue, sat, bri, coreAlpha)
      p.rect(led.x, led.y, size, size, cell * 0.2)
    }

    if (lightsOn) p.blendMode(p.BLEND)

    // Soft vignette to frame the panel
    p.noStroke()
    p.fill(230, 20, 0, 0.35)
    p.rect(p.width / 2, p.height / 2, p.width * 1.25, p.height * 1.25)

    // Switch UI overlay
    drawSwitchUI(p, switchT)

    p.loop()
  },

  renderFinal: (p: p5) => {
    const cols: number = (p as any)._cols
    const rows: number = (p as any)._rows
    const cell: number = (p as any)._cell
    const leds: LedCell[] = (p as any)._leds
    const traces: Trace[] = (p as any)._traces
    const samplers: TraceSampler[] = (p as any)._traceSamplers

    // Deterministic "powered on" snapshot
    const t = 6.0
    p.background(230, 18, 7, 1)

    // Traces
    p.noFill()
    p.strokeWeight(1.5)
    for (const trace of traces) {
      p.stroke(trace.hue, 22, 70, 0.08)
      p.beginShape()
      for (const pt of trace.points) p.vertex(pt.x, pt.y)
      p.endShape()
    }

    // Stamp some packets to suggest motion
    const accum = new Float32Array(cols * rows)
    const stampRadius = 4
    const sigma2 = 3.0 * 3.0

    for (let i = 0; i < 22; i++) {
      const pk = spawnPacket(p, samplers, "charge")
      pk.dist = (i / 22) * Math.max(1, samplers[pk.traceIdx]?.totalLen || 1)
      const s = sampleTrace(samplers[pk.traceIdx], pk.dist + t * 190)
      const gx = Math.floor(s.x / cell)
      const gy = Math.floor(s.y / cell)
      const baseI = pk.energy
      for (let oy = -stampRadius; oy <= stampRadius; oy++) {
        const yy = gy + oy
        if (yy < 0 || yy >= rows) continue
        for (let ox = -stampRadius; ox <= stampRadius; ox++) {
          const xx = gx + ox
          if (xx < 0 || xx >= cols) continue
          const along = ox * s.dx + oy * s.dy
          const perp = ox * -s.dy + oy * s.dx
          const r2 = perp * perp + (along * 0.6) * (along * 0.6)
          const w = Math.exp(-r2 / (2 * sigma2))
          accum[yy * cols + xx] += baseI * w
        }
      }
    }

    // LEDs
    p.blendMode(p.ADD)
    p.noStroke()
    const freq = 0.07
    for (const led of leds) {
      const idx = led.gy * cols + led.gx
      const ambient = 0.02 + 0.02 * p.noise(led.gx * freq, led.gy * freq, t * 0.2 + led.seed * 6.0)
      const intensity = clamp(ambient + accum[idx] * 0.55, 0, 1.1)
      if (intensity < 0.02) continue

      const size = cell * (0.62 + 0.22 * intensity)
      const hue = (led.hue + accum[idx] * 18) % 360
      const sat = 80
      const bri = 100 * clamp(intensity, 0, 1)

      p.fill(hue, sat, bri, 0.12)
      p.rect(led.x, led.y, size * 2.2, size * 2.2, cell * 0.25)
      p.fill(hue, sat, bri, 0.22 + 0.55 * clamp(intensity, 0, 1))
      p.rect(led.x, led.y, size, size, cell * 0.2)
    }
    p.blendMode(p.BLEND)

    drawSwitchUI(p, 1)
  },

  mousePressed: (p: p5) => {
    const timeSec = p.millis() / 1000
    ;(p as any)._lightsOn = !(p as any)._lightsOn
    ;(p as any)._manualHoldUntilSec = timeSec + 10
    ;(p as any)._lastToggleSec = timeSec
  },

  keyPressed: (p: p5) => {
    if (p.key === " " || p.key === "l" || p.key === "L") {
      const timeSec = p.millis() / 1000
      ;(p as any)._lightsOn = !(p as any)._lightsOn
      ;(p as any)._manualHoldUntilSec = timeSec + 10
      ;(p as any)._lastToggleSec = timeSec
    }
  },
}

export default config
