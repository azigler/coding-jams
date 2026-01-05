import type { DayConfig, p5 } from "../types"
import { createCanvas } from "../utils/canvas"
import type { ControlConfig, ControlState } from "../utils/controls"

// ============================================================================
// TYPES
// ============================================================================

interface WebNode {
  x: number
  y: number
  oldX: number
  oldY: number
  pinned: boolean
  isAnchor: boolean
  id: number
}

interface WebStrand {
  nodeA: number
  nodeB: number
  restLength: number
  isStructural: boolean
  isLetter: boolean
  age: number
  thickness: number
}

interface Spider {
  x: number
  y: number
  targetX: number
  targetY: number
  angle: number
  legPhase: number
  state: "crawling" | "spinning" | "resting"
  spinProgress: number
  currentLetterIdx: number
  currentPointIdx: number
  restTimer: number
  lastNodeId: number | null
  spinFromX: number
  spinFromY: number
}

interface DewDrop {
  strandIdx: number
  t: number
  size: number
  phase: number
}

// ============================================================================
// LETTER PATHS (normalized 0-1)
// ============================================================================

type Point = { x: number; y: number }
type Stroke = Point[]

const LETTER_PATHS: { [key: string]: Stroke[] } = {
  G: [
    [
      { x: 0.9, y: 0.15 },
      { x: 0.6, y: 0.0 },
      { x: 0.25, y: 0.05 },
      { x: 0.0, y: 0.35 },
      { x: 0.0, y: 0.65 },
      { x: 0.25, y: 0.95 },
      { x: 0.6, y: 1.0 },
      { x: 0.9, y: 0.75 },
      { x: 0.9, y: 0.5 },
      { x: 0.5, y: 0.5 },
    ],
  ],
  E: [
    [
      { x: 0.9, y: 0.0 },
      { x: 0.0, y: 0.0 },
      { x: 0.0, y: 1.0 },
      { x: 0.9, y: 1.0 },
    ],
    [
      { x: 0.0, y: 0.5 },
      { x: 0.7, y: 0.5 },
    ],
  ],
  N: [
    [
      { x: 0.0, y: 1.0 },
      { x: 0.0, y: 0.0 },
      { x: 1.0, y: 1.0 },
      { x: 1.0, y: 0.0 },
    ],
  ],
  U: [
    [
      { x: 0.0, y: 0.0 },
      { x: 0.0, y: 0.75 },
      { x: 0.25, y: 0.95 },
      { x: 0.5, y: 1.0 },
      { x: 0.75, y: 0.95 },
      { x: 1.0, y: 0.75 },
      { x: 1.0, y: 0.0 },
    ],
  ],
  A: [
    [
      { x: 0.0, y: 1.0 },
      { x: 0.5, y: 0.0 },
      { x: 1.0, y: 1.0 },
    ],
    [
      { x: 0.2, y: 0.6 },
      { x: 0.8, y: 0.6 },
    ],
  ],
  R: [
    [
      { x: 0.0, y: 1.0 },
      { x: 0.0, y: 0.0 },
      { x: 0.7, y: 0.0 },
      { x: 0.9, y: 0.15 },
      { x: 0.9, y: 0.35 },
      { x: 0.7, y: 0.5 },
      { x: 0.0, y: 0.5 },
    ],
    [
      { x: 0.5, y: 0.5 },
      { x: 1.0, y: 1.0 },
    ],
  ],
  Y: [
    [
      { x: 0.0, y: 0.0 },
      { x: 0.5, y: 0.45 },
    ],
    [
      { x: 1.0, y: 0.0 },
      { x: 0.5, y: 0.45 },
      { x: 0.5, y: 1.0 },
    ],
  ],
}

// ============================================================================
// WALLPAPER PATTERNS
// ============================================================================

const WALLPAPER_PATTERNS = [
  "damask",
  "floral",
  "geometric",
  "stripes",
  "moroccan",
]

function drawWallpaper(p: p5, pattern: number, _time: number): void {
  const patternName = WALLPAPER_PATTERNS[pattern % WALLPAPER_PATTERNS.length]

  // Base wall - aged plaster
  p.background(38, 28, 28)
  p.noStroke()

  switch (patternName) {
    case "damask": {
      const spacing = 55
      for (let y = -spacing; y < p.height + spacing; y += spacing) {
        for (let x = -spacing; x < p.width + spacing; x += spacing) {
          const offset = (Math.floor(y / spacing) % 2) * (spacing / 2)
          const px = x + offset
          p.push()
          p.translate(px, y)
          p.fill(48, 35, 32, 160)
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            p.ellipse(Math.cos(angle) * 18, Math.sin(angle) * 18, 14, 7)
          }
          p.ellipse(0, 0, 14, 14)
          p.pop()
        }
      }
      break
    }
    case "floral": {
      const spacing = 70
      for (let y = 0; y < p.height + spacing; y += spacing) {
        for (let x = 0; x < p.width + spacing; x += spacing) {
          const offset = (Math.floor(y / spacing) % 2) * (spacing / 2)
          p.push()
          p.translate(x + offset, y)
          p.stroke(55, 48, 38, 90)
          p.strokeWeight(1)
          p.noFill()
          p.bezier(0, 18, -8, 8, 8, -8, 0, -18)
          p.noStroke()
          p.fill(45, 52, 32, 100)
          p.ellipse(-7, 4, 10, 5)
          p.ellipse(7, -4, 10, 5)
          p.fill(65, 42, 48, 90)
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2
            p.ellipse(Math.cos(angle) * 5, Math.sin(angle) * 5 - 14, 7, 7)
          }
          p.pop()
        }
      }
      break
    }
    case "geometric": {
      const size = 45
      for (let y = 0; y < p.height + size; y += size) {
        for (let x = 0; x < p.width + size; x += size) {
          p.push()
          p.translate(x, y)
          p.stroke(48, 38, 34, 90)
          p.strokeWeight(1)
          p.noFill()
          p.beginShape()
          p.vertex(size / 2, 0)
          p.vertex(size, size / 2)
          p.vertex(size / 2, size)
          p.vertex(0, size / 2)
          p.endShape(p.CLOSE)
          p.beginShape()
          p.vertex(size / 2, size / 4)
          p.vertex((size * 3) / 4, size / 2)
          p.vertex(size / 2, (size * 3) / 4)
          p.vertex(size / 4, size / 2)
          p.endShape(p.CLOSE)
          p.pop()
        }
      }
      break
    }
    case "stripes": {
      const stripeWidth = 28
      for (let x = 0; x < p.width; x += stripeWidth * 2) {
        p.fill(43, 32, 30, 130)
        p.rect(x, 0, stripeWidth, p.height)
      }
      break
    }
    case "moroccan": {
      const size = 38
      for (let y = -size; y < p.height + size; y += size) {
        for (let x = -size; x < p.width + size; x += size) {
          p.push()
          p.translate(x, y)
          p.stroke(52, 42, 38, 100)
          p.strokeWeight(1.5)
          p.noFill()
          p.beginShape()
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const r = i % 2 === 0 ? size / 2 : size / 4
            p.vertex(Math.cos(angle) * r, Math.sin(angle) * r)
          }
          p.endShape(p.CLOSE)
          p.pop()
        }
      }
      break
    }
  }

  // Aging texture
  for (let i = 0; i < 150; i++) {
    p.fill(0, 0, 0, Math.random() * 15)
    p.ellipse(
      Math.random() * p.width,
      Math.random() * p.height,
      Math.random() * 3,
      Math.random() * 3
    )
  }
}

// ============================================================================
// ARCH GENERATION
// ============================================================================

function generateArchPoints(
  _p: p5,
  centerX: number,
  baseY: number,
  width: number,
  height: number,
  curve: number
): Point[] {
  const points: Point[] = []

  // Left side
  for (let i = 0; i <= 5; i++) {
    const t = i / 5
    points.push({ x: centerX - width / 2, y: baseY - t * (height * 0.55) })
  }

  // Arch curve
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    const angle = Math.PI * (1 - t)
    const curveH = height * 0.45
    const archY =
      baseY -
      height * 0.55 -
      Math.pow(Math.sin(angle), curve * 2 + 0.5) * curveH
    const archX = centerX - width / 2 + t * width
    points.push({ x: archX, y: archY })
  }

  // Right side
  for (let i = 5; i >= 0; i--) {
    const t = i / 5
    points.push({ x: centerX + width / 2, y: baseY - t * (height * 0.55) })
  }

  return points
}

// ============================================================================
// PHYSICS - Reduced gravity and more stability for letter strands
// ============================================================================

function simulatePhysics(
  nodes: WebNode[],
  strands: WebStrand[],
  gravity: number,
  iterations: number
): void {
  const damping = 0.96

  for (const node of nodes) {
    if (node.pinned) continue
    const vx = (node.x - node.oldX) * damping
    const vy = (node.y - node.oldY) * damping
    node.oldX = node.x
    node.oldY = node.y
    node.x += vx
    node.y += vy + gravity
  }

  for (let iter = 0; iter < iterations; iter++) {
    for (const strand of strands) {
      const nodeA = nodes[strand.nodeA]
      const nodeB = nodes[strand.nodeB]
      if (!nodeA || !nodeB) continue

      const dx = nodeB.x - nodeA.x
      const dy = nodeB.y - nodeA.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist === 0) continue

      const diff = (strand.restLength - dist) / dist
      // Letter strands are stiffer to maintain shape
      const stiffness = strand.isStructural ? 0.8 : strand.isLetter ? 0.9 : 0.5
      const offsetX = dx * diff * 0.5 * stiffness
      const offsetY = dy * diff * 0.5 * stiffness

      if (!nodeA.pinned) {
        nodeA.x -= offsetX
        nodeA.y -= offsetY
      }
      if (!nodeB.pinned) {
        nodeB.x += offsetX
        nodeB.y += offsetY
      }
    }
  }
}

// ============================================================================
// HELPER: Find nearest node
// ============================================================================

function findNearestNode(
  x: number,
  y: number,
  nodes: WebNode[],
  excludeId?: number
): { id: number; dist: number } | null {
  let nearestId = -1
  let nearestDist = Infinity

  for (let i = 0; i < nodes.length; i++) {
    if (i === excludeId) continue
    const node = nodes[i]
    const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)
    if (dist < nearestDist) {
      nearestDist = dist
      nearestId = i
    }
  }

  return nearestId >= 0 ? { id: nearestId, dist: nearestDist } : null
}

// ============================================================================
// HELPER: Check if strand exists between two nodes
// ============================================================================

function strandExists(
  nodeA: number,
  nodeB: number,
  strands: WebStrand[]
): boolean {
  return strands.some(
    (s) =>
      (s.nodeA === nodeA && s.nodeB === nodeB) ||
      (s.nodeA === nodeB && s.nodeB === nodeA)
  )
}

// ============================================================================
// DRAWING
// ============================================================================

function drawSpider(p: p5, spider: Spider): void {
  p.push()
  p.translate(spider.x, spider.y)
  p.rotate(spider.angle)

  const bodySize = 18
  const legWiggle = spider.state === "spinning" ? 1 : 0.15

  // Shadow
  p.noStroke()
  p.fill(0, 0, 0, 40)
  p.ellipse(4, 4, bodySize * 2.8, bodySize * 1.6)

  // Legs
  p.stroke(25, 18, 15)
  p.strokeWeight(2.5)

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const baseAngle = (i - 1.5) * 0.35 * side
      const legW = Math.sin(spider.legPhase + i * 0.9) * 0.18 * legWiggle

      const j1x = Math.cos(baseAngle + legW) * 20 * side
      const j1y = Math.sin(baseAngle) * 10 + 6
      const j2x = Math.cos(baseAngle + legW * 0.5) * 32 * side
      const j2y = j1y + 14

      p.line(0, 0, j1x, j1y)
      p.line(j1x, j1y, j2x, j2y)
    }
  }

  // Abdomen
  p.noStroke()
  p.fill(30, 24, 22)
  p.ellipse(-7, 0, bodySize * 2, bodySize * 1.5)

  // Cephalothorax
  p.fill(38, 30, 26)
  p.ellipse(8, 0, bodySize * 1.3, bodySize * 1.1)

  // Eyes
  p.fill(15, 12, 12)
  p.ellipse(14, -4, 5, 5)
  p.ellipse(14, 4, 5, 5)
  p.ellipse(17, -2, 3.5, 3.5)
  p.ellipse(17, 2, 3.5, 3.5)
  p.ellipse(10, -6, 3, 3)
  p.ellipse(10, 6, 3, 3)

  // Eye shine
  p.fill(80, 70, 60, 200)
  p.ellipse(14.5, -3, 2, 2)
  p.ellipse(14.5, 4.5, 2, 2)

  // Spinnerets - silk trail when spinning
  if (spider.state === "spinning") {
    p.stroke(230, 230, 240, 180)
    p.strokeWeight(1.5)
    const silkLen = 25 + Math.sin(p.frameCount * 0.3) * 8
    p.line(-14, 0, -14 - silkLen, Math.sin(p.frameCount * 0.2) * 4)
  }

  p.pop()
}

function drawWeb(
  p: p5,
  nodes: WebNode[],
  strands: WebStrand[],
  dewDrops: DewDrop[],
  time: number
): void {
  // Strands
  for (const strand of strands) {
    const nodeA = nodes[strand.nodeA]
    const nodeB = nodes[strand.nodeB]
    if (!nodeA || !nodeB) continue

    const fadeIn = Math.min(1, strand.age / 25)
    const shimmer = 0.85 + Math.sin(time * 2.5 + strand.nodeA * 0.08) * 0.15

    let alpha: number
    let color: [number, number, number]

    if (strand.isLetter) {
      // Letter strands - brighter, more prominent
      alpha = fadeIn * 255 * shimmer
      color = [255, 255, 255]
    } else if (strand.isStructural) {
      alpha = fadeIn * 140 * shimmer
      color = [200, 200, 210]
    } else {
      alpha = fadeIn * 100 * shimmer
      color = [190, 190, 200]
    }

    p.stroke(color[0], color[1], color[2], alpha)
    p.strokeWeight(strand.thickness)
    p.line(nodeA.x, nodeA.y, nodeB.x, nodeB.y)

    // Highlight
    if (strand.isLetter) {
      p.stroke(255, 255, 255, alpha * 0.4)
      p.strokeWeight(strand.thickness * 0.5)
      p.line(nodeA.x, nodeA.y, nodeB.x, nodeB.y)
    }
  }

  // Dew drops
  for (const dew of dewDrops) {
    const strand = strands[dew.strandIdx]
    if (!strand) continue
    const nodeA = nodes[strand.nodeA]
    const nodeB = nodes[strand.nodeB]
    if (!nodeA || !nodeB) continue

    const x = nodeA.x + (nodeB.x - nodeA.x) * dew.t
    const y = nodeA.y + (nodeB.y - nodeA.y) * dew.t
    const shimmer = 0.7 + Math.sin(time * 3.5 + dew.phase) * 0.3

    p.noStroke()
    p.fill(180, 200, 225, 90 * shimmer)
    p.ellipse(x, y, dew.size * 1.4, dew.size * 1.9)
    p.fill(255, 255, 255, 140 * shimmer)
    p.ellipse(
      x - dew.size * 0.2,
      y - dew.size * 0.3,
      dew.size * 0.4,
      dew.size * 0.4
    )
  }

  // Anchor dots
  for (const node of nodes) {
    if (node.isAnchor) {
      p.noStroke()
      p.fill(180, 180, 195, 80)
      p.ellipse(node.x, node.y, 5, 5)
    }
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  spiderSpeed: 2.5,
  archCurve: 0.6,
  archWidth: 0.55,
  archHeight: 0.72,
  wallpaper: 0,
}

const controlConfigs: { [key: string]: ControlConfig } = {
  spiderSpeed: {
    label: "Spider Speed",
    min: 0.5,
    max: 5.0,
    defaultValue: 2.5,
    step: 0.25,
  },
  archCurve: {
    label: "Arch Curve",
    min: 0.1,
    max: 1.5,
    defaultValue: 0.6,
    step: 0.1,
  },
  archWidth: {
    label: "Arch Width",
    min: 0.3,
    max: 0.85,
    defaultValue: 0.55,
    step: 0.05,
  },
  archHeight: {
    label: "Arch Height",
    min: 0.4,
    max: 0.88,
    defaultValue: 0.72,
    step: 0.05,
  },
  wallpaper: {
    label: "Wallpaper Pattern",
    min: 0,
    max: 4,
    defaultValue: 0,
    step: 1,
  },
}

// ============================================================================
// LETTER TARGET GENERATION
// ============================================================================

function generateLetterTargets(
  word: string,
  centerX: number,
  webCenterY: number,
  totalWidth: number,
  letterHeight: number
): Array<{ letter: string; stroke: number; points: Point[] }> {
  const targets: Array<{ letter: string; stroke: number; points: Point[] }> = []
  const letterWidth = totalWidth / word.length
  const startX = centerX - totalWidth / 2

  for (let li = 0; li < word.length; li++) {
    const letter = word[li]
    const letterStrokes = LETTER_PATHS[letter]
    if (!letterStrokes) continue

    const letterBaseX = startX + li * letterWidth + letterWidth * 0.5
    const letterBaseY = webCenterY - letterHeight * 0.3

    for (let si = 0; si < letterStrokes.length; si++) {
      const stroke = letterStrokes[si]
      const points: Point[] = stroke.map((pt) => ({
        x: letterBaseX + (pt.x - 0.5) * letterWidth * 0.9,
        y: letterBaseY + pt.y * letterHeight,
      }))
      targets.push({ letter, stroke: si, points })
    }
  }

  return targets
}

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 5,
  prompt: 'Write "Genuary". Avoid using a font.',
  creditName: "Piero",
  creditUrl: "https://pifragile.com/",
  recording: { enabled: true, duration: 45, filename: "genuary-2026-day-05" },

  setup: (p: p5) => {
    createCanvas(p, 1000, 800)
    ;(p as any)._controls = { ...defaultControls }
    ;(p as any)._nodes = []
    ;(p as any)._strands = []
    ;(p as any)._spider = null
    ;(p as any)._dewDrops = []
    ;(p as any)._archPoints = []
    ;(p as any)._letterTargets = []
    ;(p as any)._lastParams = null
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || {
      ...defaultControls,
    }
    const spiderSpeed = controls.spiderSpeed
    const archCurve = controls.archCurve
    const archWidth = controls.archWidth * p.width
    const archHeight = controls.archHeight * p.height
    const wallpaperPattern = Math.round(controls.wallpaper)

    const time = p.frameCount / 60
    const centerX = p.width / 2
    const baseY = p.height - 40
    const params = `${archCurve}-${archWidth.toFixed(0)}-${archHeight.toFixed(
      0
    )}`

    let nodes: WebNode[] = (p as any)._nodes
    let strands: WebStrand[] = (p as any)._strands
    let spider: Spider | null = (p as any)._spider
    let dewDrops: DewDrop[] = (p as any)._dewDrops
    let archPoints: Point[] = (p as any)._archPoints
    let letterTargets: Array<{
      letter: string
      stroke: number
      points: Point[]
    }> = (p as any)._letterTargets

    // Initialize or reinitialize
    if (!spider || params !== (p as any)._lastParams) {
      archPoints = generateArchPoints(
        p,
        centerX,
        baseY,
        archWidth,
        archHeight,
        archCurve
      )
      ;(p as any)._archPoints = archPoints
      ;(p as any)._lastParams = params

      nodes = []
      strands = []
      dewDrops = []

      // Arch anchor nodes (pinned)
      const archNodeIds: number[] = []
      for (let i = 0; i < archPoints.length; i += 2) {
        const pt = archPoints[i]
        const nodeId = nodes.length
        nodes.push({
          x: pt.x,
          y: pt.y,
          oldX: pt.x,
          oldY: pt.y,
          pinned: true,
          isAnchor: true,
          id: nodeId,
        })
        archNodeIds.push(nodeId)
      }

      // Web center (pinned to prevent collapse)
      const webCenterX = centerX
      const webCenterY = baseY - archHeight * 0.5
      const centerNodeId = nodes.length
      nodes.push({
        x: webCenterX,
        y: webCenterY,
        oldX: webCenterX,
        oldY: webCenterY,
        pinned: true, // Center is pinned for stability
        isAnchor: true,
        id: centerNodeId,
      })

      // Radial structural threads from center to arch anchors
      for (const anchorId of archNodeIds) {
        const anchor = nodes[anchorId]
        const segments = 4
        let prevId = centerNodeId

        for (let s = 1; s <= segments; s++) {
          const t = s / segments
          const x = webCenterX + (anchor.x - webCenterX) * t
          const y = webCenterY + (anchor.y - webCenterY) * t

          let nodeId: number
          if (s === segments) {
            nodeId = anchorId
          } else {
            nodeId = nodes.length
            // Intermediate nodes on radials are pinned for stability
            nodes.push({
              x,
              y,
              oldX: x,
              oldY: y,
              pinned: s <= 2, // First two segments pinned
              isAnchor: false,
              id: nodeId,
            })
          }

          const prevNode = nodes[prevId]
          const currNode = nodes[nodeId]
          const dist = Math.sqrt(
            (currNode.x - prevNode.x) ** 2 + (currNode.y - prevNode.y) ** 2
          )
          strands.push({
            nodeA: prevId,
            nodeB: nodeId,
            restLength: dist,
            isStructural: true,
            isLetter: false,
            age: 999,
            thickness: 1.5,
          })
          prevId = nodeId
        }
      }

      // Create ring connections between radial threads for more stability
      const ringNodes: number[][] = [[], [], []]
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.isAnchor && node.id !== centerNodeId) continue
        if (node.id === centerNodeId) continue

        const dx = node.x - webCenterX
        const dy = node.y - webCenterY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = Math.max(archWidth, archHeight) * 0.5

        const ringIdx = Math.floor((dist / maxDist) * 3)
        if (ringIdx >= 0 && ringIdx < 3) {
          ringNodes[ringIdx].push(i)
        }
      }

      // Connect nodes within each ring
      for (const ring of ringNodes) {
        if (ring.length < 2) continue
        // Sort by angle
        ring.sort((a, b) => {
          const angleA = Math.atan2(
            nodes[a].y - webCenterY,
            nodes[a].x - webCenterX
          )
          const angleB = Math.atan2(
            nodes[b].y - webCenterY,
            nodes[b].x - webCenterX
          )
          return angleA - angleB
        })

        for (let i = 0; i < ring.length; i++) {
          const nextI = (i + 1) % ring.length
          const nodeA = nodes[ring[i]]
          const nodeB = nodes[ring[nextI]]
          const dist = Math.sqrt(
            (nodeB.x - nodeA.x) ** 2 + (nodeB.y - nodeA.y) ** 2
          )

          if (dist < 180 && !strandExists(ring[i], ring[nextI], strands)) {
            strands.push({
              nodeA: ring[i],
              nodeB: ring[nextI],
              restLength: dist,
              isStructural: true,
              isLetter: false,
              age: 999,
              thickness: 1,
            })
          }
        }
      }

      // Letter targets
      const letterW = archWidth * 0.85
      const letterH = archHeight * 0.32
      letterTargets = generateLetterTargets(
        "GENUARY",
        centerX,
        webCenterY,
        letterW,
        letterH
      )
      ;(p as any)._letterTargets = letterTargets

      // Spider starts at center
      spider = {
        x: webCenterX,
        y: webCenterY,
        targetX: webCenterX,
        targetY: webCenterY,
        angle: 0,
        legPhase: 0,
        state: "resting",
        spinProgress: 0,
        currentLetterIdx: 0,
        currentPointIdx: 0,
        restTimer: 40,
        lastNodeId: centerNodeId,
        spinFromX: webCenterX,
        spinFromY: webCenterY,
      }

      // Initial dew drops on structural strands
      for (let i = 0; i < 15; i++) {
        const structuralStrands = strands.filter((s) => s.isStructural)
        if (structuralStrands.length > 0) {
          const idx = strands.indexOf(
            structuralStrands[
              Math.floor(Math.random() * structuralStrands.length)
            ]
          )
          dewDrops.push({
            strandIdx: idx,
            t: 0.2 + Math.random() * 0.6,
            size: 2.5 + Math.random() * 3.5,
            phase: Math.random() * Math.PI * 2,
          })
        }
      }

      ;(p as any)._nodes = nodes
      ;(p as any)._strands = strands
      ;(p as any)._spider = spider
      ;(p as any)._dewDrops = dewDrops
    }

    // Draw background
    drawWallpaper(p, wallpaperPattern, time)

    // Arch opening
    p.fill(12, 10, 16)
    p.noStroke()
    p.beginShape()
    for (const pt of archPoints) p.vertex(pt.x, pt.y)
    p.endShape(p.CLOSE)

    // Arch frame
    p.stroke(58, 48, 42)
    p.strokeWeight(10)
    p.noFill()
    p.beginShape()
    for (const pt of archPoints) p.vertex(pt.x, pt.y)
    p.endShape(p.CLOSE)

    p.stroke(78, 68, 58)
    p.strokeWeight(3)
    p.beginShape()
    for (const pt of archPoints) p.vertex(pt.x, pt.y)
    p.endShape(p.CLOSE)

    // Physics - reduced gravity
    simulatePhysics(nodes, strands, 0.05, 5)

    // Spider AI - emergent letter spelling
    if (spider && letterTargets.length > 0) {
      const speed = spiderSpeed * 3

      if (spider.state === "resting") {
        spider.restTimer--
        if (spider.restTimer <= 0) {
          // Pick next target point
          if (spider.currentLetterIdx < letterTargets.length) {
            const target = letterTargets[spider.currentLetterIdx]
            if (spider.currentPointIdx < target.points.length) {
              const pt = target.points[spider.currentPointIdx]
              // Small randomness for emergent feel, but keep letters readable
              spider.targetX = pt.x + (Math.random() - 0.5) * 3
              spider.targetY = pt.y + (Math.random() - 0.5) * 3
              spider.spinFromX = spider.x
              spider.spinFromY = spider.y
              spider.spinProgress = 0
              spider.state = "spinning"
            }
          }
        }
      }

      if (spider.state === "spinning") {
        spider.spinProgress += speed * 0.012
        spider.legPhase += speed * 0.2

        // Move along spin path
        spider.x =
          spider.spinFromX +
          (spider.targetX - spider.spinFromX) * spider.spinProgress
        spider.y =
          spider.spinFromY +
          (spider.targetY - spider.spinFromY) * spider.spinProgress

        // Update angle to face direction
        const dx = spider.targetX - spider.spinFromX
        const dy = spider.targetY - spider.spinFromY
        spider.angle = Math.atan2(dy, dx)

        if (spider.spinProgress >= 1) {
          // Arrived at target
          spider.x = spider.targetX
          spider.y = spider.targetY

          // ALWAYS create new node for letter points - no reuse!
          // This ensures continuous letter strokes without gaps
          const newNodeId = nodes.length
          nodes.push({
            x: spider.x,
            y: spider.y,
            oldX: spider.x,
            oldY: spider.y,
            pinned: false,
            isAnchor: false,
            id: newNodeId,
          })

          // Connect new node to nearby structural nodes for stability
          const connections: Array<{ id: number; dist: number }> = []
          for (let i = 0; i < nodes.length - 1; i++) {
            const node = nodes[i]
            // Only connect to structural/anchor nodes for stability
            if (!node.isAnchor && node.pinned === false) continue
            const dist = Math.sqrt(
              (node.x - spider.x) ** 2 + (node.y - spider.y) ** 2
            )
            if (dist < 150) {
              connections.push({ id: i, dist })
            }
          }

          // Connect to closest structural nodes
          connections.sort((a, b) => a.dist - b.dist)
          const maxConnections = 2
          for (
            let i = 0;
            i < Math.min(maxConnections, connections.length);
            i++
          ) {
            const conn = connections[i]
            if (!strandExists(newNodeId, conn.id, strands)) {
              strands.push({
                nodeA: newNodeId,
                nodeB: conn.id,
                restLength: conn.dist * 1.02,
                isStructural: false,
                isLetter: false, // Support strands (invisible anchor lines)
                age: 0,
                thickness: 0.5,
              })
            }
          }

          // Create letter strand from previous point in this stroke
          if (spider.lastNodeId !== null && spider.lastNodeId !== newNodeId) {
            const lastNode = nodes[spider.lastNodeId]
            const dist = Math.sqrt(
              (spider.x - lastNode.x) ** 2 + (spider.y - lastNode.y) ** 2
            )
            strands.push({
              nodeA: spider.lastNodeId,
              nodeB: newNodeId,
              restLength: dist * 1.0,
              isStructural: false,
              isLetter: true, // Bright white letter strand
              age: 0,
              thickness: 2.2,
            })

            // Occasional dew drop on letter strand
            if (Math.random() < 0.12) {
              dewDrops.push({
                strandIdx: strands.length - 1,
                t: 0.3 + Math.random() * 0.4,
                size: 2 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
              })
            }
          }

          spider.lastNodeId = newNodeId

          // Move to next point
          spider.currentPointIdx++
          const target = letterTargets[spider.currentLetterIdx]

          if (spider.currentPointIdx >= target.points.length) {
            // Finished this stroke, move to next letter/stroke
            spider.currentPointIdx = 0
            spider.currentLetterIdx++
            spider.restTimer = 15 + Math.random() * 15
            spider.lastNodeId = null // Break connection between letters
          } else {
            spider.restTimer = 3 + Math.random() * 5
          }

          spider.state = "resting"
        }
      }

      // Small idle motion when resting
      if (spider.state === "resting") {
        spider.legPhase += 0.03
        spider.angle += Math.sin(time * 2) * 0.003
      }
    }

    // Age strands
    for (const strand of strands) strand.age++

    // Draw web
    drawWeb(p, nodes, strands, dewDrops, time)

    // Draw spider
    if (spider)
      drawSpider(p, spider)

      // Update state
    ;(p as any)._nodes = nodes
    ;(p as any)._strands = strands
    ;(p as any)._spider = spider
    ;(p as any)._dewDrops = dewDrops

    p.loop()
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || {
      ...defaultControls,
    }
    const archCurve = controls.archCurve
    const archWidth = controls.archWidth * p.width
    const archHeight = controls.archHeight * p.height
    const wallpaperPattern = Math.round(controls.wallpaper)

    const centerX = p.width / 2
    const baseY = p.height - 40

    drawWallpaper(p, wallpaperPattern, 0)

    const archPoints = generateArchPoints(
      p,
      centerX,
      baseY,
      archWidth,
      archHeight,
      archCurve
    )

    p.fill(12, 10, 16)
    p.noStroke()
    p.beginShape()
    for (const pt of archPoints) p.vertex(pt.x, pt.y)
    p.endShape(p.CLOSE)

    p.stroke(58, 48, 42)
    p.strokeWeight(10)
    p.noFill()
    p.beginShape()
    for (const pt of archPoints) p.vertex(pt.x, pt.y)
    p.endShape(p.CLOSE)

    p.stroke(78, 68, 58)
    p.strokeWeight(3)
    p.beginShape()
    for (const pt of archPoints) p.vertex(pt.x, pt.y)
    p.endShape(p.CLOSE)

    // Draw completed web with GENUARY
    const webCenterX = centerX
    const webCenterY = baseY - archHeight * 0.5

    // Radial lines
    p.stroke(200, 200, 210, 100)
    p.strokeWeight(1.2)
    const numRadials = 16
    for (let i = 0; i < numRadials; i++) {
      const angle = (i / numRadials) * Math.PI * 2
      const endX = webCenterX + Math.cos(angle) * archWidth * 0.45
      const endY = webCenterY + Math.sin(angle) * archHeight * 0.42
      p.line(webCenterX, webCenterY, endX, endY)
    }

    // Letters
    const letterW = archWidth * 0.85
    const letterH = archHeight * 0.32
    const targets = generateLetterTargets(
      "GENUARY",
      centerX,
      webCenterY,
      letterW,
      letterH
    )

    p.stroke(255, 255, 255, 220)
    p.strokeWeight(2)

    for (const target of targets) {
      p.noFill()
      p.beginShape()
      for (const pt of target.points) {
        p.vertex(pt.x, pt.y)
      }
      p.endShape()
    }
  },
}

export function getClaudesChoice(): Partial<ControlState> {
  return {
    spiderSpeed: 3.0,
    archCurve: 0.7,
    archWidth: 0.58,
    archHeight: 0.75,
    wallpaper: 0,
  }
}

export { controlConfigs, defaultControls }
export default config
