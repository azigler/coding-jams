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

// ============================================================================
// DOT MATRIX FONT (5x7)
// ============================================================================

const DOT_FONT: Record<string, string[]> = {
  O: [
    "01110",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110",
  ],
  N: [
    "10001",
    "11001",
    "10101",
    "10011",
    "10001",
    "10001",
    "10001",
  ],
  F: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "10000",
  ],
}

function buildDotMask(
  message: string,
  cols: number,
  rows: number,
  scale: number
): Set<number> {
  const glyphW = 5
  const glyphH = 7
  const spacing = 1

  const msgW = message.length * glyphW + (message.length - 1) * spacing
  const msgWScaled = msgW * scale
  const msgHScaled = glyphH * scale

  const originGX = Math.floor(cols / 2 - msgWScaled / 2)
  const originGY = Math.floor(rows * 0.33 - msgHScaled / 2)

  const mask = new Set<number>()

  for (let mi = 0; mi < message.length; mi++) {
    const ch = message[mi]
    const glyph = DOT_FONT[ch]
    if (!glyph) continue

    const glyphGX = originGX + mi * (glyphW + spacing) * scale
    for (let gy = 0; gy < glyphH; gy++) {
      const row = glyph[gy]
      for (let gx = 0; gx < glyphW; gx++) {
        if (row[gx] !== "1") continue
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const x = glyphGX + gx * scale + sx
            const y = originGY + gy * scale + sy
            if (x < 0 || x >= cols || y < 0 || y >= rows) continue
            mask.add(y * cols + x)
          }
        }
      }
    }
  }

  return mask
}

// ============================================================================
// SCENE GENERATION
// ============================================================================

function randomInt(p: p5, min: number, max: number): number {
  return Math.floor(p.random(min, max + 1))
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

  // Glow on the "ON" side
  p.fill(190, 80, 85, 0.15 * t)
  p.rect(x - w * 0.25, y, w * 0.5, h, 22)

  // Knob
  const knobX = p.lerp(x - w * 0.25, x + w * 0.25, t)
  p.fill(0, 0, 0, 0.35)
  p.circle(knobX + 2, y + 2, h + 8)
  p.fill(0, 0, 96, 0.92)
  p.circle(knobX, y, h + 4)
  p.fill(0, 0, 0, 0.08)
  p.circle(knobX, y + 2, h + 4)

  // Simple LED indicators
  p.fill(190, 90, 90, 0.25 + 0.55 * t)
  p.circle(x - w * 0.34, y, 10)
  p.fill(0, 0, 70, 0.12 + 0.35 * (1 - t))
  p.circle(x + w * 0.34, y, 10)

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

    const maskOn = buildDotMask("ON", cols, rows, 3)
    const maskOff = buildDotMask("OFF", cols, rows, 3)

    ;(p as any)._cols = cols
    ;(p as any)._rows = rows
    ;(p as any)._cell = cell
    ;(p as any)._leds = leds
    ;(p as any)._traces = generateTraces(p, cols, rows, cell, 52)
    ;(p as any)._maskOn = maskOn
    ;(p as any)._maskOff = maskOff

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
    const maskOn: Set<number> = (p as any)._maskOn
    const maskOff: Set<number> = (p as any)._maskOff

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

    // Background: dim screen glow + vignette
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

    // Circuit traces become more visible when lights are off
    p.noFill()
    p.strokeWeight(1.5)
    for (const trace of traces) {
      const shimmer =
        0.65 +
        0.35 *
          Math.sin(timeSec * 1.7 + trace.seed * Math.PI * 2 + trace.points.length * 0.07)
      const alpha = (lightsOn ? 0.06 : 0.18) * shimmer
      const hue = lightsOn ? trace.hue : 160
      const sat = lightsOn ? 20 : 35
      const bri = lightsOn ? 70 : 55
      p.stroke(hue, sat, bri, alpha)
      p.beginShape()
      for (const pt of trace.points) p.vertex(pt.x, pt.y)
      p.endShape()
    }

    // Draw LEDs (additive when "on", phosphor-like when "off")
    if (lightsOn) p.blendMode(p.ADD)

    const msgMask = lightsOn ? maskOn : maskOff
    const freq = 0.065
    const flash = Math.exp(-Math.max(0, timeSec - lastToggleSec) * 2.2)

    p.noStroke()

    for (let i = 0; i < leds.length; i++) {
      const led = leds[i]
      const idx = led.gy * cols + led.gx
      const isMessagePixel = msgMask.has(idx)

      const n = p.noise(led.gx * freq, led.gy * freq, timeSec * 0.35 + led.seed * 9.0)
      const pulse = 0.5 + 0.5 * Math.sin(timeSec * 2.2 + led.seed * p.TWO_PI)

      let target = 0
      if (lightsOn) {
        target = Math.pow(n, 1.9) * 0.88 + 0.12 * pulse
        if (isMessagePixel) target = Math.max(target, 1)
        led.charge = p.lerp(led.charge, target, 0.22)
      } else {
        const standby =
          (isMessagePixel ? 0.34 : 0) +
          (p.noise(led.seed * 20, timeSec * 0.7) > 0.86 ? 0.15 : 0)
        target = standby
        led.charge = Math.max(led.charge * 0.93, target)
      }

      const flicker =
        (p.noise(led.seed * 40, timeSec * 4.0 + led.gx * 0.02 + led.gy * 0.01) - 0.5) *
        (lightsOn ? 0.09 : 0.02)
      const intensity = p.constrain(led.charge + flicker * led.charge, 0, 1)
      if (intensity < 0.01) continue

      const size = cell * (0.62 + 0.22 * intensity)
      const hue = lightsOn ? led.hue : 160
      const sat = lightsOn ? 75 : 25
      const bri = (lightsOn ? 100 : 75) * intensity

      // Bloom layers
      if (lightsOn) {
        p.fill(hue, sat, bri, 0.06 + 0.08 * intensity + 0.06 * flash)
        p.rect(led.x, led.y, size * 2.6, size * 2.6, cell * 0.25)
        p.fill(hue, sat, bri, 0.08 + 0.12 * intensity)
        p.rect(led.x, led.y, size * 1.8, size * 1.8, cell * 0.25)
      } else {
        p.fill(hue, sat, bri, 0.06 + 0.12 * intensity)
        p.rect(led.x, led.y, size * 1.9, size * 1.9, cell * 0.25)
      }

      // Core LED
      const coreAlpha = lightsOn ? 0.22 + 0.55 * intensity : 0.18 + 0.45 * intensity
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
    const cell: number = (p as any)._cell
    const leds: LedCell[] = (p as any)._leds
    const traces: Trace[] = (p as any)._traces
    const maskOn: Set<number> = (p as any)._maskOn

    const t = 6.2 // chosen static time
    p.background(230, 18, 7, 1)

    // Traces
    p.noFill()
    p.strokeWeight(1.5)
    for (const trace of traces) {
      const alpha = 0.07
      p.stroke(trace.hue, 18, 70, alpha)
      p.beginShape()
      for (const pt of trace.points) p.vertex(pt.x, pt.y)
      p.endShape()
    }

    // LEDs
    p.blendMode(p.ADD)
    p.noStroke()
    const freq = 0.065
    for (const led of leds) {
      const idx = led.gy * cols + led.gx
      const isMessagePixel = maskOn.has(idx)
      const n = p.noise(led.gx * freq, led.gy * freq, t * 0.35 + led.seed * 9.0)
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + led.seed * p.TWO_PI)
      let intensity = Math.pow(n, 1.9) * 0.88 + 0.12 * pulse
      if (isMessagePixel) intensity = Math.max(intensity, 1)
      intensity = p.constrain(intensity, 0, 1)
      if (intensity < 0.02) continue

      const size = cell * (0.62 + 0.22 * intensity)
      const hue = led.hue
      const sat = 75
      const bri = 100 * intensity

      p.fill(hue, sat, bri, 0.12)
      p.rect(led.x, led.y, size * 2.2, size * 2.2, cell * 0.25)
      p.fill(hue, sat, bri, 0.22 + 0.55 * intensity)
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
