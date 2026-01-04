import type { DayConfig, p5 } from "../types"
import { createCanvas } from "../utils/canvas"
import type { ControlConfig, ControlState } from "../utils/controls"
import { snapToPixel } from "../utils/pixel-art"

// Retro color palette
const PALETTE = {
  sky: ["#1a1a2e", "#16213e", "#0f3460", "#e94560"], // Night to sunset gradient
  sun: ["#ffd700", "#ff8c00", "#ff6347", "#ff4500"],
  hills: ["#2d3436", "#1e272e", "#0c0c0c"],
  clouds: ["#dfe6e9", "#b2bec3", "#636e72"],
  stars: "#ffffff",
}

// Default control values
const defaultControls: ControlState = {
  pixelSize: 8,
  sunSpeed: 0.3,
  cloudSpeed: 0.5,
  numClouds: 5,
  numStars: 50,
  hillLayers: 3,
  colorMode: 0, // 0 = sunset, 1 = night, 2 = dawn
}

// Control configurations
const controlConfigs: { [key: string]: ControlConfig } = {
  pixelSize: {
    label: "Pixel Size",
    min: 4,
    max: 24,
    defaultValue: 8,
    step: 2,
  },
  sunSpeed: {
    label: "Sun Speed",
    min: 0.1,
    max: 1.0,
    defaultValue: 0.3,
    step: 0.05,
  },
  cloudSpeed: {
    label: "Cloud Speed",
    min: 0.1,
    max: 2.0,
    defaultValue: 0.5,
    step: 0.1,
  },
  numClouds: {
    label: "Number of Clouds",
    min: 2,
    max: 10,
    defaultValue: 5,
    step: 1,
  },
  numStars: {
    label: "Number of Stars",
    min: 10,
    max: 150,
    defaultValue: 50,
    step: 5,
  },
  hillLayers: {
    label: "Hill Layers",
    min: 2,
    max: 5,
    defaultValue: 3,
    step: 1,
  },
  colorMode: {
    label: "Color Mode (0=sunset, 1=night, 2=dawn)",
    min: 0,
    max: 2,
    defaultValue: 0,
    step: 1,
  },
}

interface Cloud {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Star {
  x: number
  y: number
  twinkleOffset: number
  size: number
}

// Generate hills using simple noise-like pattern
function getHillHeight(x: number, layer: number, width: number, p: p5): number {
  const frequency = 0.008 + layer * 0.003
  const amplitude = 80 + layer * 30
  const offset = layer * 50
  
  // Create a smooth wave pattern for hills
  const wave1 = Math.sin(x * frequency) * amplitude
  const wave2 = Math.sin(x * frequency * 2.3 + layer) * (amplitude * 0.4)
  const wave3 = Math.sin(x * frequency * 0.5 + layer * 2) * (amplitude * 0.6)
  
  return offset + wave1 + wave2 + wave3
}

// Draw the pixelated sun
function drawSun(
  p: p5,
  centerX: number,
  centerY: number,
  radius: number,
  pixelSize: number,
  time: number
): void {
  const sunColors = PALETTE.sun
  const pulseRadius = radius + Math.sin(time * 2) * 5
  
  // Draw sun in concentric pixel rings
  for (let r = pulseRadius; r > 0; r -= pixelSize) {
    const colorIndex = Math.floor(p.map(r, 0, pulseRadius, 0, sunColors.length - 0.01))
    const color = sunColors[colorIndex]
    
    // Draw pixelated circle
    for (let angle = 0; angle < p.TWO_PI; angle += 0.1) {
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      const px = snapToPixel(x, pixelSize)
      const py = snapToPixel(y, pixelSize)
      
      p.noStroke()
      p.fill(color)
      p.rect(px, py, pixelSize, pixelSize)
    }
  }
  
  // Fill center
  const centerPx = snapToPixel(centerX - pixelSize, pixelSize)
  const centerPy = snapToPixel(centerY - pixelSize, pixelSize)
  p.fill(sunColors[0])
  p.rect(centerPx, centerPy, pixelSize * 3, pixelSize * 3)
}

// Draw pixelated sun rays
function drawSunRays(
  p: p5,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  pixelSize: number,
  time: number
): void {
  const numRays = 8
  const rotationOffset = time * 0.2
  
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * p.TWO_PI + rotationOffset
    const rayLength = innerRadius + (outerRadius - innerRadius) * (0.5 + Math.sin(time * 3 + i) * 0.3)
    
    // Draw ray as a line of pixels
    for (let r = innerRadius; r < rayLength; r += pixelSize) {
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      const px = snapToPixel(x, pixelSize)
      const py = snapToPixel(y, pixelSize)
      
      const alpha = p.map(r, innerRadius, rayLength, 255, 50)
      const c = p.color("#ffd700")
      c.setAlpha(alpha)
      
      p.noStroke()
      p.fill(c)
      p.rect(px, py, pixelSize, pixelSize)
    }
  }
}

// Draw the sky gradient (pixelated)
function drawSky(p: p5, pixelSize: number, sunY: number): void {
  const skyColors = PALETTE.sky
  
  for (let y = 0; y < p.height; y += pixelSize) {
    // Calculate gradient based on sun position and y position
    const normalizedY = y / p.height
    const sunInfluence = 1 - Math.abs(y - sunY) / p.height
    
    // Blend between colors based on height
    let colorIndex: number
    if (normalizedY < 0.3) {
      colorIndex = 0
    } else if (normalizedY < 0.5) {
      colorIndex = 1
    } else if (normalizedY < 0.7) {
      colorIndex = 2
    } else {
      colorIndex = 3
    }
    
    // Add some variation
    const color = skyColors[colorIndex]
    
    for (let x = 0; x < p.width; x += pixelSize) {
      const px = snapToPixel(x, pixelSize)
      const py = snapToPixel(y, pixelSize)
      
      p.noStroke()
      p.fill(color)
      p.rect(px, py, pixelSize, pixelSize)
    }
  }
}

// Draw stars
function drawStars(p: p5, stars: Star[], pixelSize: number, time: number, sunY: number): void {
  // Only show stars when sun is low (more visible at night)
  const starsAlpha = p.map(sunY, p.height * 0.3, p.height * 0.8, 255, 0)
  if (starsAlpha <= 0) return
  
  for (const star of stars) {
    // Only draw stars in upper portion
    if (star.y > sunY - 50) continue
    
    const twinkle = (Math.sin(time * 3 + star.twinkleOffset) + 1) / 2
    const alpha = starsAlpha * (0.3 + twinkle * 0.7)
    
    const c = p.color(PALETTE.stars)
    c.setAlpha(alpha)
    
    const px = snapToPixel(star.x, pixelSize)
    const py = snapToPixel(star.y, pixelSize)
    
    p.noStroke()
    p.fill(c)
    
    // Draw star (single pixel or cross pattern for larger stars)
    if (star.size > 1) {
      p.rect(px, py, pixelSize, pixelSize)
      p.rect(px - pixelSize, py, pixelSize, pixelSize)
      p.rect(px + pixelSize, py, pixelSize, pixelSize)
      p.rect(px, py - pixelSize, pixelSize, pixelSize)
      p.rect(px, py + pixelSize, pixelSize, pixelSize)
    } else {
      p.rect(px, py, pixelSize, pixelSize)
    }
  }
}

// Draw a pixelated cloud
function drawCloud(p: p5, cloud: Cloud, pixelSize: number): void {
  const baseColor = p.color(PALETTE.clouds[0])
  baseColor.setAlpha(200)
  
  const shadowColor = p.color(PALETTE.clouds[1])
  shadowColor.setAlpha(180)
  
  // Draw cloud as a collection of pixelated circles
  const numBubbles = 5
  for (let i = 0; i < numBubbles; i++) {
    const offsetX = (i - 2) * (cloud.width / 4)
    const offsetY = Math.sin(i * 0.8) * (cloud.height / 4)
    const bubbleRadius = cloud.height / 2 + Math.sin(i * 1.2) * (cloud.height / 4)
    
    // Draw bubble as pixelated circle
    for (let angle = 0; angle < p.TWO_PI; angle += 0.2) {
      for (let r = 0; r < bubbleRadius; r += pixelSize) {
        const x = cloud.x + offsetX + Math.cos(angle) * r
        const y = cloud.y + offsetY + Math.sin(angle) * r
        const px = snapToPixel(x, pixelSize)
        const py = snapToPixel(y, pixelSize)
        
        // Use shadow color for bottom portion
        p.noStroke()
        if (angle > p.PI * 0.3 && angle < p.PI * 0.7) {
          p.fill(shadowColor)
        } else {
          p.fill(baseColor)
        }
        p.rect(px, py, pixelSize, pixelSize)
      }
    }
  }
}

// Draw hills/mountains
function drawHills(p: p5, pixelSize: number, hillLayers: number): void {
  const hillColors = PALETTE.hills
  
  for (let layer = hillLayers - 1; layer >= 0; layer--) {
    const baseY = p.height - (layer + 1) * 60
    const color = hillColors[Math.min(layer, hillColors.length - 1)]
    
    for (let x = 0; x < p.width; x += pixelSize) {
      const hillHeight = getHillHeight(x, layer, p.width, p)
      const topY = baseY - hillHeight
      
      // Draw column of pixels from top of hill to bottom of screen
      for (let y = topY; y < p.height; y += pixelSize) {
        const px = snapToPixel(x, pixelSize)
        const py = snapToPixel(y, pixelSize)
        
        p.noStroke()
        p.fill(color)
        p.rect(px, py, pixelSize, pixelSize)
      }
    }
  }
}

// Draw water/reflection at bottom
function drawWater(p: p5, pixelSize: number, time: number, sunX: number): void {
  const waterLevel = p.height * 0.85
  const waterColor = p.color("#0f3460")
  
  for (let y = waterLevel; y < p.height; y += pixelSize) {
    for (let x = 0; x < p.width; x += pixelSize) {
      // Add wave movement
      const wave = Math.sin((x * 0.02) + time * 2) * 3
      const py = snapToPixel(y + wave, pixelSize)
      const px = snapToPixel(x, pixelSize)
      
      // Calculate sun reflection
      const distFromSun = Math.abs(x - sunX)
      const reflectionIntensity = p.map(distFromSun, 0, p.width / 2, 0.5, 0)
      const shimmer = Math.sin(x * 0.05 + time * 4) * 0.2 + 0.8
      
      if (reflectionIntensity > 0 && Math.random() < reflectionIntensity * shimmer) {
        // Sun reflection
        const reflectColor = p.color("#ff8c00")
        reflectColor.setAlpha(150 * reflectionIntensity)
        p.fill(reflectColor)
      } else {
        p.fill(waterColor)
      }
      
      p.noStroke()
      p.rect(px, py, pixelSize, pixelSize)
    }
  }
}

const config: DayConfig = {
  day: 4,
  prompt: "Lowres. An image or graphic with low resolution, where details are simplified or pixelated.",
  creditName: "Manuel Larino",
  creditUrl: "https://mlarino.com/",
  recording: {
    enabled: true,
    duration: 12,
    filename: "genuary-2026-day-04",
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800)
    
    // Initialize controls state on p5 instance
    const controls = { ...defaultControls }
    ;(p as any)._controls = controls
    ;(p as any)._clouds = null
    ;(p as any)._stars = null
  },

  draw: (p: p5) => {
    // Get controls
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const pixelSize = Math.round(controls.pixelSize)
    const sunSpeed = controls.sunSpeed
    const cloudSpeed = controls.cloudSpeed
    const numClouds = Math.round(controls.numClouds)
    const numStars = Math.round(controls.numStars)
    const hillLayers = Math.round(controls.hillLayers)
    
    const time = p.frameCount / 60
    
    // Initialize clouds if needed
    let clouds: Cloud[] = (p as any)._clouds
    const lastCloudCount = (p as any)._lastCloudCount || 0
    
    if (!clouds || lastCloudCount !== numClouds) {
      clouds = []
      for (let i = 0; i < numClouds; i++) {
        clouds.push({
          x: (p.width / numClouds) * i + Math.random() * 100,
          y: 80 + Math.random() * 120,
          width: 60 + Math.random() * 80,
          height: 25 + Math.random() * 20,
          speed: 0.3 + Math.random() * 0.4,
        })
      }
      ;(p as any)._clouds = clouds
      ;(p as any)._lastCloudCount = numClouds
    }
    
    // Initialize stars if needed
    let stars: Star[] = (p as any)._stars
    const lastStarCount = (p as any)._lastStarCount || 0
    
    if (!stars || lastStarCount !== numStars) {
      stars = []
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * p.width,
          y: Math.random() * (p.height * 0.5),
          twinkleOffset: Math.random() * p.TWO_PI,
          size: Math.random() > 0.8 ? 2 : 1,
        })
      }
      ;(p as any)._stars = stars
      ;(p as any)._lastStarCount = numStars
    }
    
    // Calculate sun position (oscillates up and down)
    const sunCycleProgress = (Math.sin(time * sunSpeed) + 1) / 2
    const sunY = p.map(sunCycleProgress, 0, 1, p.height * 0.3, p.height * 0.65)
    const sunX = p.width / 2 + Math.cos(time * sunSpeed * 0.5) * 50
    const sunRadius = 50 + Math.sin(time) * 5
    
    // Draw sky
    drawSky(p, pixelSize, sunY)
    
    // Draw stars (visible when sun is low)
    drawStars(p, stars, pixelSize, time, sunY)
    
    // Draw sun rays (behind sun)
    drawSunRays(p, sunX, sunY, sunRadius + 10, sunRadius + 80, pixelSize, time)
    
    // Draw sun
    drawSun(p, sunX, sunY, sunRadius, pixelSize, time)
    
    // Draw clouds
    for (const cloud of clouds) {
      // Update cloud position
      cloud.x += cloud.speed * cloudSpeed
      
      // Wrap around
      if (cloud.x > p.width + cloud.width) {
        cloud.x = -cloud.width
      }
      
      drawCloud(p, cloud, pixelSize)
    }
    
    // Draw hills
    drawHills(p, pixelSize, hillLayers)
    
    // Draw water
    drawWater(p, pixelSize, time, sunX)
    
    // Keep animation running
    if (!(p as any)._isRecording) {
      p.loop()
    }
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const pixelSize = Math.round(controls.pixelSize)
    const numClouds = Math.round(controls.numClouds)
    const numStars = Math.round(controls.numStars)
    const hillLayers = Math.round(controls.hillLayers)
    
    const time = (p.frameCount || 60) / 60 // Default to 1 second
    
    // Generate clouds
    const clouds: Cloud[] = []
    for (let i = 0; i < numClouds; i++) {
      clouds.push({
        x: (p.width / numClouds) * i + 50,
        y: 80 + (i % 3) * 40,
        width: 60 + (i % 2) * 40,
        height: 25 + (i % 2) * 10,
        speed: 0.3,
      })
    }
    
    // Generate stars
    const stars: Star[] = []
    const rng = new (class {
      seed = 42
      next() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
        return this.seed / 0x7fffffff
      }
    })()
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: rng.next() * p.width,
        y: rng.next() * (p.height * 0.5),
        twinkleOffset: rng.next() * Math.PI * 2,
        size: rng.next() > 0.8 ? 2 : 1,
      })
    }
    
    // Calculate sun position at a nice point
    const sunY = p.height * 0.45
    const sunX = p.width / 2
    const sunRadius = 50
    
    // Draw everything
    drawSky(p, pixelSize, sunY)
    drawStars(p, stars, pixelSize, time, sunY)
    drawSunRays(p, sunX, sunY, sunRadius + 10, sunRadius + 80, pixelSize, time)
    drawSun(p, sunX, sunY, sunRadius, pixelSize, time)
    
    for (const cloud of clouds) {
      drawCloud(p, cloud, pixelSize)
    }
    
    drawHills(p, pixelSize, hillLayers)
    drawWater(p, pixelSize, time, sunX)
  },
}

// Claude's Choice - beautiful settings for day 4
export function getClaudesChoice(): Partial<ControlState> {
  return {
    pixelSize: 10,
    sunSpeed: 0.25,
    cloudSpeed: 0.4,
    numClouds: 6,
    numStars: 80,
    hillLayers: 3,
    colorMode: 0,
  }
}

// Export control configs for use in index.ts
export { controlConfigs, defaultControls }

export default config
