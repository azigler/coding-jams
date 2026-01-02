import type { DayConfig } from "../types"
import { createCanvas } from "../utils/canvas"
import type { ControlConfig, ControlState } from "../utils/controls"

// Wheaty beige color - a warm, earthy tone
const WHEATY_BEIGE = "#D2B48C" // tan color, perfect for fine art aesthetic

interface TriangleData {
  initialAngle: number // Initial angle position in degrees
  radius: number // Distance from center (constant)
  baseRotation: number // Base rotation of the triangle itself
  size: number
  opacity: number
}

interface Triangle {
  x: number
  y: number
  size: number
  rotation: number
  opacity: number
}

// Default control values
const defaultControls: ControlState = {
  numTriangles: 120,
  orbitVelocity: 0.5, // degrees per frame (at max radius)
  rotationVelocity: 0.3, // degrees per frame
}

// Control configurations
const controlConfigs: { [key: string]: ControlConfig } = {
  numTriangles: {
    label: "Number of Triangles",
    min: 50,
    max: 300,
    defaultValue: 120,
    step: 1,
  },
  orbitVelocity: {
    label: "Orbit Velocity",
    min: 0,
    max: 2,
    defaultValue: 0.5,
    step: 0.01,
  },
  rotationVelocity: {
    label: "Rotation Velocity",
    min: 0,
    max: 2,
    defaultValue: 0.3,
    step: 0.01,
  },
}

const config: DayConfig = {
  day: 1,
  prompt: "One color, one shape.",
  creditName: "Piero",
  creditUrl: "https://pifragile.com/",
  recording: {
    enabled: true,
    duration: 8, // 8 seconds for the timelapse
    filename: "genuary-2026-day-01",
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800) // Square canvas for fine art composition
    p.colorMode(p.RGB)
    p.rectMode(p.CENTER)
    
    // Initialize controls state on p5 instance
    const controls = { ...defaultControls }
    ;(p as any)._controls = controls
    ;(p as any)._triangleData = null // Will be initialized in draw
    ;(p as any)._controlsUpdateCallback = null
  },

  draw: (p: p5) => {
    // Clear with a subtle off-white background
    p.background(250, 248, 245)

    // Get controls
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const numTriangles = Math.round(controls.numTriangles)
    const orbitVelocity = controls.orbitVelocity
    const rotationVelocity = controls.rotationVelocity
    const maxFrame = 240 // 8 seconds at 30fps

    // Generate triangle data if not already initialized or if number changed
    let triangleData: TriangleData[] = (p as any)._triangleData
    const lastTriangleCount = (p as any)._lastTriangleCount || 0
    
    if (!triangleData || lastTriangleCount !== numTriangles) {
      triangleData = []
      const goldenRatio = 1.618
      const maxRadius = p.width * 0.4
      
      for (let i = 0; i < numTriangles; i++) {
        // Use golden ratio for spacing
        const initialAngle = (i * goldenRatio * 137.5) % 360 // Golden angle
        const radius = p.map(i, 0, numTriangles, 50, maxRadius)
        
        // Size varies based on distance from center (smaller near center for vortex effect)
        const size = p.map(radius, 50, maxRadius, 12, 60)
        
        // Base rotation for the triangle itself
        const baseRotation = initialAngle + i * 23.5 // Fibonacci-like rotation
        
        // Opacity varies for depth
        const opacity = p.map(radius, 50, maxRadius, 0.5, 0.2)
        
        triangleData.push({
          initialAngle,
          radius,
          baseRotation,
          size,
          opacity,
        })
      }
      ;(p as any)._triangleData = triangleData
      ;(p as any)._lastTriangleCount = numTriangles
    }

    // Calculate current time for animation
    const time = p.frameCount
    const centerX = p.width / 2
    const centerY = p.height / 2
    const maxRadius = p.width * 0.4

    // Draw triangles that should be visible at current frame (for timelapse)
    const currentProgress = p.frameCount / maxFrame
    const trianglesToDraw = p.floor(
      p.map(p.constrain(currentProgress, 0, 1), 0, 1, 0, numTriangles)
    )
    const safeTrianglesToDraw = p.min(trianglesToDraw, triangleData.length)

    p.push()
    p.translate(centerX, centerY)

    for (let i = 0; i < safeTrianglesToDraw; i++) {
      const data = triangleData[i]
      if (!data) continue

      // Calculate orbital motion
      // Speed is faster closer to center (inverse relationship with radius)
      // Normalize radius to 0-1 range for speed calculation
      const normalizedRadius = (data.radius - 50) / (maxRadius - 50)
      const speedMultiplier = 1 + (1 - normalizedRadius) * 2 // 3x faster at center, 1x at edge
      const currentAngle = data.initialAngle + (time * orbitVelocity * speedMultiplier)

      // Calculate position based on current angle (clockwise, so subtract)
      const x = p.cos(p.radians(-currentAngle)) * data.radius
      const y = p.sin(p.radians(-currentAngle)) * data.radius

      // Calculate triangle rotation (spinning as it orbits)
      const triangleRotation = data.baseRotation + (time * rotationVelocity)

      // Calculate opacity fade-in effect for timelapse
      const triangleProgress = i / numTriangles
      const fadeIn = p.map(
        p.constrain(currentProgress - triangleProgress, 0, 0.1),
        0,
        0.1,
        0,
        1
      )
      const finalOpacity = data.opacity * fadeIn

      p.push()
      p.translate(x, y)
      p.rotate(p.radians(triangleRotation))

      // Set fill with wheaty beige and opacity
      const beige = p.color(WHEATY_BEIGE)
      beige.setAlpha(finalOpacity * 255)
      p.fill(beige)
      p.noStroke()

      // Draw right triangle
      p.beginShape()
      p.vertex(0, -data.size / 2) // top-left
      p.vertex(data.size, data.size / 2) // bottom-right (right angle point)
      p.vertex(0, data.size / 2) // bottom-left
      p.endShape(p.CLOSE)

      p.pop()
    }

    p.pop()

    // Keep animation running (don't stop)
    if (!(p as any)._isRecording) {
      p.loop()
    }
  },

  // Function to render final image (all triangles)
  renderFinal: (p: p5) => {
    // Clear with a subtle off-white background
    p.background(250, 248, 245)

    // Get controls (use current values from p5 instance if available)
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const numTriangles = Math.round(controls.numTriangles)
    const orbitVelocity = controls.orbitVelocity
    const rotationVelocity = controls.rotationVelocity

    // Use the same triangle data generation as draw
    const goldenRatio = 1.618
    const centerX = p.width / 2
    const centerY = p.height / 2
    const maxRadius = p.width * 0.4
    
    // Generate triangle data
    const triangleData: TriangleData[] = []
    for (let i = 0; i < numTriangles; i++) {
      const initialAngle = (i * goldenRatio * 137.5) % 360
      const radius = p.map(i, 0, numTriangles, 50, maxRadius)
      const size = p.map(radius, 50, maxRadius, 12, 60)
      const baseRotation = initialAngle + i * 23.5
      const opacity = p.map(radius, 50, maxRadius, 0.5, 0.2)
      
      triangleData.push({
        initialAngle,
        radius,
        baseRotation,
        size,
        opacity,
      })
    }

    // Use current frame count for final position
    const time = p.frameCount || 0

    // Draw all triangles
    p.push()
    p.translate(centerX, centerY)

    for (let i = 0; i < triangleData.length; i++) {
      const data = triangleData[i]
      
      // Calculate orbital position (same as draw)
      const normalizedRadius = (data.radius - 50) / (maxRadius - 50)
      const speedMultiplier = 1 + (1 - normalizedRadius) * 2
      const currentAngle = data.initialAngle + (time * orbitVelocity * speedMultiplier)
      
      const x = p.cos(p.radians(-currentAngle)) * data.radius
      const y = p.sin(p.radians(-currentAngle)) * data.radius
      
      const triangleRotation = data.baseRotation + (time * rotationVelocity)

      p.push()
      p.translate(x, y)
      p.rotate(p.radians(triangleRotation))

      const beige = p.color(WHEATY_BEIGE)
      beige.setAlpha(data.opacity * 255)
      p.fill(beige)
      p.noStroke()

      p.beginShape()
      p.vertex(0, -data.size / 2)
      p.vertex(data.size, data.size / 2)
      p.vertex(0, data.size / 2)
      p.endShape(p.CLOSE)

      p.pop()
    }

    p.pop()
  },
}

// Claude's Choice - beautiful settings for day 1
export function getClaudesChoice(): Partial<ControlState> {
  return {
    numTriangles: 220,
    orbitVelocity: 0.20,
    rotationVelocity: 0.50,
  }
}

// Export control configs for use in index.ts
export { controlConfigs, defaultControls }

export default config
