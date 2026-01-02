import type { DayConfig } from "../types"
import { createCanvas } from "../utils/canvas"
import type { ControlConfig, ControlState } from "../utils/controls"

interface Ball {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  baseY: number // Ground level for this ball
  color: p5.Color
  squashAmount: number // Current squash/stretch amount
  rotation: number
  trail: Array<{ x: number; y: number; alpha: number }>
}

// Default control values
const defaultControls: ControlState = {
  numBalls: 8,
  bounceHeight: 200,
  animationSpeed: 1.0,
  exaggeration: 0.5,
  squashAmount: 0.3,
  trailLength: 15,
  colorMutation: 0.0, // 0 = normal, 1 = pastel, -1 = glitchy
}

// Control configurations
const controlConfigs: { [key: string]: ControlConfig } = {
  numBalls: {
    label: "Number of Balls",
    min: 3,
    max: 15,
    defaultValue: 8,
    step: 1,
  },
  bounceHeight: {
    label: "Bounce Height",
    min: 50,
    max: 400,
    defaultValue: 200,
    step: 5,
  },
  animationSpeed: {
    label: "Animation Speed",
    min: 0.1,
    max: 3.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  exaggeration: {
    label: "Exaggeration",
    min: 0,
    max: 1.0,
    defaultValue: 0.5,
    step: 0.05,
  },
  squashAmount: {
    label: "Squash & Stretch",
    min: 0,
    max: 0.8,
    defaultValue: 0.3,
    step: 0.05,
  },
  trailLength: {
    label: "Trail Length",
    min: 0,
    max: 30,
    defaultValue: 15,
    step: 1,
  },
  colorMutation: {
    label: "Color Style",
    min: -1.0,
    max: 1.0,
    defaultValue: 0.0,
    step: 0.05,
  },
}

const config: DayConfig = {
  day: 2,
  prompt: "Twelve principles of animation.",
  creditName: "Anna Lucia",
  creditUrl: "https://annalucia.io/",
  recording: {
    enabled: true,
    duration: 10, // 10 seconds for a full cycle
    filename: "genuary-2026-day-02",
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 600)
    p.colorMode(p.HSB, 360, 100, 100, 1)
    
    // Initialize controls state on p5 instance
    const controls = { ...defaultControls }
    ;(p as any)._controls = controls
    ;(p as any)._balls = null // Will be initialized in draw
  },

  draw: (p: p5) => {
    // Dark background
    p.background(220, 30, 15)

    // Get controls
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const numBalls = Math.round(controls.numBalls)
    const bounceHeight = controls.bounceHeight
    const animationSpeed = controls.animationSpeed
    const exaggeration = controls.exaggeration
    const squashAmount = controls.squashAmount
    const trailLength = Math.round(controls.trailLength)
    const colorMutation = controls.colorMutation || 0.0

    // Initialize balls if not already done or if count/mutation changed
    let balls: Ball[] = (p as any)._balls
    const lastBallCount = (p as any)._lastBallCount || 0
    const lastColorMutation = (p as any)._lastColorMutation ?? null
    
    if (!balls || lastBallCount !== numBalls || lastColorMutation !== colorMutation) {
      balls = []
      const spacing = p.width / (numBalls + 1)
      
      for (let i = 0; i < numBalls; i++) {
        const x = spacing * (i + 1)
        const baseY = p.height - 50
        let hue = (i * 360 / numBalls) % 360
        
        // Apply color mutation
        let saturation = 80
        let brightness = 90
        
        if (colorMutation > 0) {
          // Pastel: reduce saturation, increase brightness
          saturation = 80 - (colorMutation * 50)
          brightness = 90 + (colorMutation * 10)
        } else if (colorMutation < 0) {
          // Glitchy: random hue shifts, high saturation, variable brightness
          const glitchAmount = Math.abs(colorMutation)
          hue = (hue + p.random(-glitchAmount * 60, glitchAmount * 60)) % 360
          saturation = 80 + (glitchAmount * 20)
          brightness = 70 + p.random(-glitchAmount * 30, glitchAmount * 30)
        }
        
        // Initialize each ball at a different phase in the bounce cycle
        const initialPhase = (i / numBalls) * 1.0
        const initialProgress = initialPhase % 1.0
        // Calculate initial Y based on phase
        let initNormalized = initialProgress
        if (initNormalized < 0.5) {
          initNormalized = initNormalized * 2
          initNormalized = 1 - p.pow(1 - initNormalized, 2.5)
          initNormalized = initNormalized / 2
        } else {
          initNormalized = (initNormalized - 0.5) * 2
          initNormalized = p.pow(initNormalized, 2.2)
          initNormalized = initNormalized / 2 + 0.5
        }
        const initialY = baseY - (bounceHeight * p.sin(initNormalized * p.PI))
        
        balls.push({
          x,
          y: initialY,
          radius: 30 + i * 5, // Varying sizes
          vx: 0,
          vy: 0,
          baseY,
          color: p.color(hue, saturation, brightness),
          squashAmount: 0,
          rotation: initialPhase * p.TWO_PI, // Start rotation at different angles
          trail: [],
        })
      }
      ;(p as any)._balls = balls
      ;(p as any)._lastBallCount = numBalls
      ;(p as any)._lastColorMutation = colorMutation
    }

    // Calculate time with animation speed
    const time = (p.frameCount * animationSpeed) / 60 // Convert to seconds
    const cycleTime = 3.0 // Full bounce cycle in seconds
    const cycleProgress = (time % cycleTime) / cycleTime

    // Draw ground line
    p.stroke(0, 0, 60, 0.3)
    p.strokeWeight(2)
    p.line(0, p.height - 50, p.width, p.height - 50)

    // Update and draw each ball
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i]
      
      // Phase offset for each ball (staging - different timing)
      // Distribute balls evenly across the full cycle for better visual variety
      // Use i+1 to avoid ball 0 having 0 offset, ensuring better distribution
      const phaseOffset = ((i + 1) / (numBalls + 1)) * 1.0 // Full cycle distribution
      // Use continuous time instead of modulo to avoid jumps
      const continuousProgress = cycleProgress + phaseOffset
      const ballProgress = continuousProgress % 1.0
      
      // Calculate bounce using arc motion (principle: Arc)
      // Use smoother easing for more natural bounce feel
      let normalizedProgress = ballProgress
      
      // Smoother bounce curve: faster at bottom, slower at top
      // Use a more natural easing that feels bouncier
      if (normalizedProgress < 0.5) {
        // Going up - ease out (slower at top)
        normalizedProgress = normalizedProgress * 2
        // Smoother ease-out using quadratic-cubic blend
        normalizedProgress = 1 - p.pow(1 - normalizedProgress, 2.5)
        normalizedProgress = normalizedProgress / 2
      } else {
        // Going down - ease in (faster at bottom, bouncier)
        normalizedProgress = (normalizedProgress - 0.5) * 2
        // Smoother ease-in with slight bounce anticipation
        normalizedProgress = p.pow(normalizedProgress, 2.2)
        normalizedProgress = normalizedProgress / 2 + 0.5
      }
      
      // Calculate Y position (arc motion)
      const maxHeight = bounceHeight * (1 + exaggeration * 0.5)
      const sinValue = p.sin(normalizedProgress * p.PI)
      const y = ball.baseY - (maxHeight * sinValue)
      
      // Add forward motion - balls bounce forward as they move
      // Keep balls at fixed x positions (no forward motion)
      // The smooth bounce animation creates the illusion of movement
      
      // Calculate velocity (derivative of position)
      const velocity = p.abs(p.cos(normalizedProgress * p.PI))
      
      // Smooth squash/stretch based on position
      // Squash is maximum at bottom (when sin is near 0)
      // Stretch is maximum at top (when sin is near 1) - they hang and stretch
      const distanceFromBottom = 1 - p.abs(sinValue) // 1 at bottom, 0 at top
      const distanceFromTop = p.abs(sinValue) // 1 at top, 0 at bottom
      
      // Smooth squash curve: maximum at bottom
      const squashIntensity = p.pow(distanceFromBottom, 0.6) // Smooth curve
      const squash = squashIntensity * squashAmount * (1 + exaggeration * 0.5)
      
      // Stretch at top: when hanging in air, get tall and skinny
      // More pronounced stretch when at apex
      const stretchIntensity = p.pow(distanceFromTop, 1.8) // Stronger at top
      const stretch = -stretchIntensity * squashAmount * 0.6 * (1 + exaggeration * 0.8)
      
      // Combine squash and stretch smoothly
      const currentSquash = squash + stretch
      
      ball.squashAmount = currentSquash
      ball.y = y
      
      // Rotation (principle: Secondary Action)
      ball.rotation += velocity * 0.1 * animationSpeed
      
      // Add to trail (principle: Follow Through)
      if (trailLength > 0) {
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 1.0 })
        if (ball.trail.length > trailLength) {
          ball.trail.shift()
        }
        
        // Fade trail
        ball.trail.forEach((point, idx) => {
          point.alpha = idx / ball.trail.length
        })
      }
      
      // Draw trail
      if (ball.trail.length > 1) {
        p.strokeWeight(3)
        for (let j = 1; j < ball.trail.length; j++) {
          const prev = ball.trail[j - 1]
          const curr = ball.trail[j]
          const alpha = curr.alpha * 0.5
          p.stroke(p.hue(ball.color), p.saturation(ball.color), p.brightness(ball.color), alpha)
          p.line(prev.x, prev.y, curr.x, curr.y)
        }
      }
      
      // Draw ball with squash/stretch
      p.push()
      p.translate(ball.x, ball.y)
      p.rotate(ball.rotation)
      
      // Apply squash/stretch transformation
      // When squashing: wider (scaleX > 1), shorter (scaleY < 1)
      // When stretching: narrower (scaleX < 1), taller (scaleY > 1)
      const scaleX = 1 + currentSquash * 0.8 // Horizontal squash/stretch
      const scaleY = 1 - currentSquash * 0.6 // Vertical squash/stretch (inverse)
      p.scale(scaleX, scaleY)
      
      // Apply color mutation dynamically (for glitchy effect)
      let displayColor = ball.color
      if (colorMutation < 0) {
        // Glitchy: add frame-based color shifts
        const glitchAmount = Math.abs(colorMutation)
        const hueShift = p.sin(p.frameCount * 0.1 + i) * glitchAmount * 30
        const currentHue = (p.hue(ball.color) + hueShift) % 360
        displayColor = p.color(
          currentHue,
          p.saturation(ball.color),
          p.brightness(ball.color)
        )
      }
      
      // Draw ball
      p.noStroke()
      p.fill(displayColor)
      p.circle(0, 0, ball.radius * 2)
      
      // Add highlight for appeal (principle: Appeal)
      p.fill(0, 0, 100, 0.3)
      p.circle(-ball.radius * 0.3, -ball.radius * 0.3, ball.radius * 0.6)
      
      p.pop()
      
      // Draw anticipation indicator (principle: Anticipation)
      // Show compression lines when squashing significantly at bottom
      if (squashIntensity > 0.3 && currentSquash > 0.05 && distanceFromBottom > 0.5) {
        // Draw small lines indicating compression, intensity based on squash
        const lineIntensity = p.min(squashIntensity, 1.0)
        p.stroke(ball.color)
        p.strokeWeight(2 * lineIntensity)
        p.line(ball.x - ball.radius * 1.5, ball.baseY, ball.x - ball.radius * 1.2, ball.baseY)
        p.line(ball.x + ball.radius * 1.2, ball.baseY, ball.x + ball.radius * 1.5, ball.baseY)
      }
    }

    // Keep animation running
    if (!(p as any)._isRecording) {
      p.loop()
    }
  },

  // Function to render final image (all balls at a specific moment)
  renderFinal: (p: p5) => {
    // Dark background
    p.background(220, 30, 15)

    // Get controls
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const numBalls = Math.round(controls.numBalls)
    const bounceHeight = controls.bounceHeight
    const exaggeration = controls.exaggeration
    const squashAmount = controls.squashAmount
    const colorMutation = controls.colorMutation || 0.0

    // Use current frame count to capture different animation states
    // This ensures screenshots show different positions
    const time = (p.frameCount || Math.floor(Math.random() * 180)) / 60
    const cycleTime = 3.0
    const cycleProgress = (time % cycleTime) / cycleTime

    // Generate balls with color mutation
    const balls: Ball[] = []
    const spacing = p.width / (numBalls + 1)
    
    for (let i = 0; i < numBalls; i++) {
      const x = spacing * (i + 1)
      const baseY = p.height - 50
      let hue = (i * 360 / numBalls) % 360
      
      // Apply color mutation
      let saturation = 80
      let brightness = 90
      
      if (colorMutation > 0) {
        // Pastel
        saturation = 80 - (colorMutation * 50)
        brightness = 90 + (colorMutation * 10)
      } else if (colorMutation < 0) {
        // Glitchy
        const glitchAmount = Math.abs(colorMutation)
        hue = (hue + p.random(-glitchAmount * 60, glitchAmount * 60)) % 360
        saturation = 80 + (glitchAmount * 20)
        brightness = 70 + p.random(-glitchAmount * 30, glitchAmount * 30)
      }
      
      balls.push({
        x,
        y: baseY - bounceHeight,
        radius: 30 + i * 5,
        vx: 0,
        vy: 0,
        baseY,
        color: p.color(hue, saturation, brightness),
        squashAmount: 0,
        rotation: 0,
        trail: [],
      })
    }

    // Draw ground line
    p.stroke(0, 0, 60, 0.3)
    p.strokeWeight(2)
    p.line(0, p.height - 50, p.width, p.height - 50)

    // Draw balls at different phases based on frame count
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i]
      const phaseOffset = ((i + 1) / (numBalls + 1)) * 1.0 // Full cycle distribution
      // Use continuous progress to avoid jumps
      const continuousProgress = cycleProgress + phaseOffset
      const ballProgress = continuousProgress % 1.0
      
      // Calculate position with easing (same as draw function)
      let normalizedProgress = ballProgress
      if (normalizedProgress < 0.5) {
        normalizedProgress = normalizedProgress * 2
        normalizedProgress = 1 - p.pow(1 - normalizedProgress, 2.5)
        normalizedProgress = normalizedProgress / 2
      } else {
        normalizedProgress = (normalizedProgress - 0.5) * 2
        normalizedProgress = p.pow(normalizedProgress, 2.2)
        normalizedProgress = normalizedProgress / 2 + 0.5
      }
      
      const maxHeight = bounceHeight * (1 + exaggeration * 0.5)
      const sinValue = p.sin(normalizedProgress * p.PI)
      const y = ball.baseY - (maxHeight * sinValue)
      
      // Keep balls at fixed x positions (no forward motion)
      
      // Smooth squash/stretch calculation (same as in draw)
      const distanceFromBottom = 1 - p.abs(sinValue)
      const distanceFromTop = p.abs(sinValue)
      
      const squashIntensity = p.pow(distanceFromBottom, 0.6)
      const squash = squashIntensity * squashAmount * (1 + exaggeration * 0.5)
      
      // Stretch at top when hanging in air
      const stretchIntensity = p.pow(distanceFromTop, 1.8)
      const stretch = -stretchIntensity * squashAmount * 0.6 * (1 + exaggeration * 0.8)
      
      const currentSquash = squash + stretch
      
      ball.y = y
      ball.rotation = i * 0.5 + (time * 0.1)
      
      // Apply glitchy color if needed
      let displayColor = ball.color
      if (colorMutation < 0) {
        const glitchAmount = Math.abs(colorMutation)
        const hueShift = p.sin(time * 0.1 + i) * glitchAmount * 30
        const currentHue = (p.hue(ball.color) + hueShift) % 360
        displayColor = p.color(
          currentHue,
          p.saturation(ball.color),
          p.brightness(ball.color)
        )
      }
      
      // Draw ball
      p.push()
      p.translate(ball.x, ball.y)
      p.rotate(ball.rotation)
      
      // Apply squash/stretch transformation (same as draw)
      const scaleX = 1 + currentSquash * 0.8
      const scaleY = 1 - currentSquash * 0.6
      p.scale(scaleX, scaleY)
      
      p.noStroke()
      p.fill(displayColor)
      p.circle(0, 0, ball.radius * 2)
      
      p.fill(0, 0, 100, 0.3)
      p.circle(-ball.radius * 0.3, -ball.radius * 0.3, ball.radius * 0.6)
      
      p.pop()
      
      // Draw anticipation lines when squashing at bottom
      if (squashIntensity > 0.3 && currentSquash > 0.05 && distanceFromBottom > 0.5) {
        const lineIntensity = p.min(squashIntensity, 1.0)
        p.stroke(ball.color)
        p.strokeWeight(2 * lineIntensity)
        p.line(ball.x - ball.radius * 1.5, ball.baseY, ball.x - ball.radius * 1.2, ball.baseY)
        p.line(ball.x + ball.radius * 1.2, ball.baseY, ball.x + ball.radius * 1.5, ball.baseY)
      }
    }
  },
}

// Claude's Choice - beautiful settings for day 2
export function getClaudesChoice(): Partial<ControlState> {
  return {
    numBalls: 6,
    bounceHeight: 280,
    animationSpeed: 0.8,
    exaggeration: 0.7,
    squashAmount: 0.4,
    trailLength: 20,
    colorMutation: 0.3, // Slightly pastel for elegance
  }
}

// Export control configs for use in index.ts
export { controlConfigs, defaultControls }

export default config
