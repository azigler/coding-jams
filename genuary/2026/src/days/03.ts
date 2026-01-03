import type { DayConfig, p5 } from "../types"
import { createCanvas } from "../utils/canvas"
import type { ControlConfig, ControlState } from "../utils/controls"
import { snapToPixel, drawPixel } from "../utils/pixel-art"

interface Particle {
  x: number
  y: number
  angle: number
  speed: number
  radius: number
  color: import('p5').Color
  trail: Array<{ x: number; y: number; alpha: number }>
}

interface WaveSource {
  x: number
  y: number
  frequency: number // Based on Fibonacci
  phase: number
  amplitude: number
  color: import('p5').Color
}

// Generate Fibonacci sequence
function generateFibonacci(n: number): number[] {
  const fib = [1, 1]
  for (let i = 2; i < n; i++) {
    fib.push(fib[i - 1] + fib[i - 2])
  }
  return fib
}

// Default control values
const defaultControls: ControlState = {
  mode: 0, // 0 = spiral, 1 = wave interference
  numParticles: 12,
  spiralTightness: 0.3,
  particleSize: 4,
  trailLength: 20,
  animationSpeed: 0.8,
  colorSpread: 0.6,
  pixelSize: 4, // Pixel art block size
  numWaves: 6,
  frequencyScale: 0.02,
  waveAmplitude: 80,
  colorIntensity: 0.7,
  waveDensity: 0.8, // Lower for performance
}

// Control configurations
const controlConfigs: { [key: string]: ControlConfig } = {
  mode: {
    label: "Mode",
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 1,
  },
  numParticles: {
    label: "Number of Particles",
    min: 5,
    max: 25,
    defaultValue: 12,
    step: 1,
  },
  spiralTightness: {
    label: "Spiral Tightness",
    min: 0.1,
    max: 0.8,
    defaultValue: 0.3,
    step: 0.05,
  },
  particleSize: {
    label: "Particle Size",
    min: 2,
    max: 12,
    defaultValue: 4,
    step: 1,
  },
  trailLength: {
    label: "Trail Length",
    min: 5,
    max: 40,
    defaultValue: 20,
    step: 1,
  },
  animationSpeed: {
    label: "Animation Speed",
    min: 0.05, // Much slower minimum
    max: 2.0,
    defaultValue: 0.8,
    step: 0.05,
  },
  colorSpread: {
    label: "Color Spread",
    min: 0.2,
    max: 1.5,
    defaultValue: 0.6,
    step: 0.1,
  },
  pixelSize: {
    label: "Pixel Size",
    min: 2,
    max: 12,
    defaultValue: 4,
    step: 1,
  },
  numWaves: {
    label: "Number of Waves",
    min: 3,
    max: 10,
    defaultValue: 6,
    step: 1,
  },
  frequencyScale: {
    label: "Frequency Scale",
    min: 0.01,
    max: 0.04,
    defaultValue: 0.02,
    step: 0.002,
  },
  waveAmplitude: {
    label: "Wave Amplitude",
    min: 40,
    max: 150,
    defaultValue: 80,
    step: 5,
  },
  colorIntensity: {
    label: "Color Intensity",
    min: 0.3,
    max: 1.2,
    defaultValue: 0.7,
    step: 0.1,
  },
  waveDensity: {
    label: "Wave Density",
    min: 0.5,
    max: 1.5,
    defaultValue: 0.8,
    step: 0.1,
  },
}

// Spiral mode function
function drawSpiralMode(p: p5, controls: ControlState): void {
    // Dark background with slight fade for trails
    p.background(240, 30, 8, 0.15)

    const numParticles = Math.round(controls.numParticles)
    const spiralTightness = controls.spiralTightness
    const particleSize = controls.particleSize
    const trailLength = Math.round(controls.trailLength)
    const animationSpeed = controls.animationSpeed
    const colorSpread = controls.colorSpread
    const pixelSize = Math.round(controls.pixelSize || 4)

    // Initialize particles if not already done or if count changed
    let particles: Particle[] = (p as any)._particles
    const lastParticleCount = (p as any)._lastParticleCount || 0
    const lastSpiralTightness = (p as any)._lastSpiralTightness ?? null
    const lastColorSpread = (p as any)._lastColorSpread ?? null
    
    // Generate Fibonacci sequence for angles and speeds
    const fibSequence = generateFibonacci(numParticles + 5)
    
    if (!particles || lastParticleCount !== numParticles || 
        lastSpiralTightness !== spiralTightness || lastColorSpread !== colorSpread) {
      particles = []
      
      const centerX = p.width / 2
      const centerY = p.height / 2
      
      for (let i = 0; i < numParticles; i++) {
        // Use Fibonacci numbers for initial angles (golden angle approximation)
        const goldenAngle = 137.508 // Degrees (related to golden ratio/Fibonacci)
        const initialAngle = (i * goldenAngle) % 360
        
        // Use Fibonacci for speed variation
        const fibValue = fibSequence[i + 2]
        const speed = (fibValue * 0.01 + 0.5) * spiralTightness
        
        // Color based on Fibonacci
        const hue = (i * 360 / numParticles + fibValue * colorSpread * 10) % 360
        
        particles.push({
          x: centerX,
          y: centerY,
          angle: p.radians(initialAngle),
          speed,
          radius: 0,
          color: p.color(hue, 80, 90),
          trail: [],
        })
      }
      ;(p as any)._particles = particles
      ;(p as any)._lastParticleCount = numParticles
      ;(p as any)._lastSpiralTightness = spiralTightness
      ;(p as any)._lastColorSpread = colorSpread
    } else {
      // Update existing particles with new control values
      for (let i = 0; i < particles.length && i < numParticles; i++) {
        const fibValue = fibSequence[i + 2]
        // Update speed dynamically
        particles[i].speed = (fibValue * 0.01 + 0.5) * spiralTightness
        // Update color dynamically
        const hue = (i * 360 / numParticles + fibValue * colorSpread * 10) % 360
        particles[i].color = p.color(hue, 80, 90)
      }
    }

    // Update and draw particles
    const time = (p.frameCount * animationSpeed) / 60
    
    for (const particle of particles) {
      // Fibonacci spiral motion
      // Radius increases based on angle (spiral out)
      // Apply animationSpeed to make particles move faster/slower
      particle.radius += particle.speed * animationSpeed
      particle.angle += particle.speed * 0.02 * animationSpeed
      
      // Calculate position
      particle.x = p.width / 2 + p.cos(particle.angle) * particle.radius
      particle.y = p.height / 2 + p.sin(particle.angle) * particle.radius
      
      // Add to trail
      particle.trail.push({ x: particle.x, y: particle.y, alpha: 1.0 })
      if (particle.trail.length > trailLength) {
        particle.trail.shift()
      }
      
      // Fade trail
      particle.trail.forEach((point, idx) => {
        point.alpha = idx / particle.trail.length
      })
      
      // Draw trail with pixel art aesthetic
      if (particle.trail.length > 1) {
        for (let j = 1; j < particle.trail.length; j++) {
          const curr = particle.trail[j]
          const alpha = curr.alpha * 0.8 * 255
          drawPixel(p, curr.x, curr.y, pixelSize, particle.color, alpha)
        }
      }
      
      // Draw particle as pixel block
      const blockSize = Math.max(pixelSize, particleSize)
      // Draw multiple pixels for larger particles
      if (blockSize > pixelSize) {
        const blocks = Math.ceil(blockSize / pixelSize)
        for (let bx = 0; bx < blocks; bx++) {
          for (let by = 0; by < blocks; by++) {
            const offsetX = (bx - (blocks - 1) / 2) * pixelSize
            const offsetY = (by - (blocks - 1) / 2) * pixelSize
            drawPixel(p, particle.x + offsetX, particle.y + offsetY, pixelSize, particle.color, 255)
          }
        }
      } else {
        drawPixel(p, particle.x, particle.y, pixelSize, particle.color, 255)
      }
      
      // Reset if too far from center
      const distFromCenter = p.dist(particle.x, particle.y, p.width / 2, p.height / 2)
      if (distFromCenter > p.width * 0.7) {
        particle.radius = 0
        particle.angle = p.radians((particles.indexOf(particle) * 137.508) % 360)
      }
    }

    // Keep animation running
    if (!(p as any)._isRecording) {
      p.loop()
    }
}

// Wave interference mode function (optimized)
function drawWaveMode(p: p5, controls: ControlState): void {
    // Dark background
    p.background(240, 40, 10)

    const numWaves = Math.round(controls.numWaves || 6)
    const frequencyScale = controls.frequencyScale || 0.02
    const waveAmplitude = controls.waveAmplitude || 80
    const animationSpeed = controls.animationSpeed || 0.8
    const colorIntensity = controls.colorIntensity || 0.7
    const waveDensity = controls.waveDensity || 0.8
    const pixelSize = Math.round(controls.pixelSize || 4)

    // Initialize wave sources if not already done or if count changed
    let waveSources: WaveSource[] = (p as any)._waveSources
    const lastWaveCount = (p as any)._lastWaveCount || 0
    
    if (!waveSources || lastWaveCount !== numWaves) {
      waveSources = []
      
      // Generate Fibonacci sequence for frequencies
      const fibSequence = generateFibonacci(numWaves + 2)
      
      // Arrange wave sources in a circle pattern
      const centerX = p.width / 2
      const centerY = p.height / 2
      const radius = p.min(p.width, p.height) * 0.35
      
      for (let i = 0; i < numWaves; i++) {
        const angle = (i / numWaves) * p.TWO_PI
        const x = centerX + p.cos(angle) * radius
        const y = centerY + p.sin(angle) * radius
        
        // Use Fibonacci numbers for frequencies (normalized)
        const fibValue = fibSequence[i + 2]
        const frequency = fibValue * frequencyScale
        
        // Color based on position and Fibonacci
        const hue = (i * 360 / numWaves + fibValue * 10) % 360
        
        waveSources.push({
          x,
          y,
          frequency,
          phase: 0,
          amplitude: waveAmplitude,
          color: p.color(hue, 70, 90),
        })
      }
      ;(p as any)._waveSources = waveSources
      ;(p as any)._lastWaveCount = numWaves
    }

    // Update wave phases
    const time = (p.frameCount * animationSpeed) / 60
    waveSources.forEach((wave) => {
      wave.phase = time * wave.frequency
    })

    // Draw wave interference pattern - OPTIMIZED with large step and pixel art
    // Use much larger step for performance, then pixelate
    const step = Math.max(pixelSize, 20 / waveDensity) // Large step for performance
    
    for (let y = 0; y < p.height; y += step) {
      for (let x = 0; x < p.width; x += step) {
        // Calculate interference from all wave sources
        let interference = 0
        
        for (const wave of waveSources) {
          const dx = x - wave.x
          const dy = y - wave.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Wave equation: amplitude * sin(frequency * distance + phase)
          const waveValue = p.sin(distance * wave.frequency + wave.phase)
          interference += waveValue * wave.amplitude
        }
        
        // Normalize interference
        interference = interference / (numWaves * waveAmplitude)
        
        // Map interference to color
        const hue = (interference * 180 + time * 10) % 360
        const saturation = 50 + p.abs(interference) * 50 * colorIntensity
        const brightness = 30 + p.abs(interference) * 70 * colorIntensity
        
        // Convert HSB to RGB manually
        const h = hue / 360
        const s = saturation / 100
        const v = brightness / 100
        
        let r: number, g: number, b: number
        const i = Math.floor(h * 6)
        const f = h * 6 - i
        const p_val = v * (1 - s)
        const q = v * (1 - f * s)
        const t = v * (1 - (1 - f) * s)
        
        switch (i % 6) {
          case 0: r = v; g = t; b = p_val; break
          case 1: r = q; g = v; b = p_val; break
          case 2: r = p_val; g = v; b = t; break
          case 3: r = p_val; g = q; b = v; break
          case 4: r = t; g = p_val; b = v; break
          case 5: r = v; g = p_val; b = q; break
          default: r = 0; g = 0; b = 0
        }
        
        // Draw as pixel block
        const px = snapToPixel(x, pixelSize)
        const py = snapToPixel(y, pixelSize)
        const blockSize = Math.max(pixelSize, step)
        
        p.noStroke()
        p.fill(r * 255, g * 255, b * 255, 200)
        p.rect(px, py, blockSize, blockSize)
      }
    }

    // Draw wave source indicators (subtle)
    p.noFill()
    p.strokeWeight(1)
    for (const wave of waveSources) {
      const alpha = 0.3 + p.sin(wave.phase) * 0.2
      p.stroke(p.hue(wave.color), p.saturation(wave.color), p.brightness(wave.color), alpha)
      p.circle(wave.x, wave.y, 8)
    }

    // Keep animation running
    if (!(p as any)._isRecording) {
      p.loop()
    }
}

const config: DayConfig = {
  day: 3,
  prompt: "Fibonacci forever. Create a work that uses the Fibonacci sequence in some way.",
  creditName: "PaoloCurtoni",
  creditUrl: "https://www.paolocurtoni.com/",
  recording: {
    enabled: true,
    duration: 15,
    filename: "genuary-2026-day-03",
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800)
    p.colorMode(p.HSB, 360, 100, 100, 1)

    // Initialize controls state on p5 instance
    const controls = { ...defaultControls }
    ;(p as any)._controls = controls
    ;(p as any)._particles = null
    ;(p as any)._pixelBuffer = null
  },

  draw: (p: p5) => {
    // Get controls
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const mode = Math.round(controls.mode || 0)
    
    // Route to appropriate mode
    if (mode === 0) {
      drawSpiralMode(p, controls)
    } else {
      drawWaveMode(p, controls)
    }
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls }
    const mode = Math.round(controls.mode || 0)
    
    if (mode === 0) {
      renderFinalSpiral(p, controls)
    } else {
      renderFinalWave(p, controls)
    }
  },
}

// Render final spiral mode
function renderFinalSpiral(p: p5, controls: ControlState): void {
    // Dark background
    p.background(240, 30, 8)
    const numParticles = Math.round(controls.numParticles)
    const spiralTightness = controls.spiralTightness
    const particleSize = controls.particleSize
    const trailLength = Math.round(controls.trailLength)
    const colorSpread = controls.colorSpread

    // Generate particles
    const fibSequence = generateFibonacci(numParticles + 5)
    const particles: Particle[] = []
    const centerX = p.width / 2
    const centerY = p.height / 2

    for (let i = 0; i < numParticles; i++) {
      const goldenAngle = 137.508
      const initialAngle = (i * goldenAngle) % 360
      const fibValue = fibSequence[i + 2]
      const speed = (fibValue * 0.01 + 0.5) * spiralTightness
      const hue = (i * 360 / numParticles + fibValue * colorSpread * 10) % 360

      particles.push({
        x: centerX,
        y: centerY,
        angle: p.radians(initialAngle),
        speed,
        radius: 0,
        color: p.color(hue, 80, 90),
        trail: [],
      })
    }

    // Simulate particle movement for final render
    const steps = 200
    for (let step = 0; step < steps; step++) {
      for (const particle of particles) {
        particle.radius += particle.speed
        particle.angle += particle.speed * 0.02
        particle.x = centerX + p.cos(particle.angle) * particle.radius
        particle.y = centerY + p.sin(particle.angle) * particle.radius

        particle.trail.push({ x: particle.x, y: particle.y, alpha: 1.0 })
        if (particle.trail.length > trailLength) {
          particle.trail.shift()
        }

        particle.trail.forEach((point, idx) => {
          point.alpha = idx / particle.trail.length
        })
      }
    }

    // Draw all trails with pixel art aesthetic
    const pixelSize = Math.round(controls.pixelSize || 4)

    for (const particle of particles) {
      if (particle.trail.length > 1) {
        for (let j = 1; j < particle.trail.length; j++) {
          const curr = particle.trail[j]
          const alpha = curr.alpha * 0.8 * 255
          drawPixel(p, curr.x, curr.y, pixelSize, particle.color, alpha)
        }
      }

      // Draw particle as pixel block
      const blockSize = Math.max(pixelSize, particleSize)
      if (blockSize > pixelSize) {
        const blocks = Math.ceil(blockSize / pixelSize)
        for (let bx = 0; bx < blocks; bx++) {
          for (let by = 0; by < blocks; by++) {
            const offsetX = (bx - (blocks - 1) / 2) * pixelSize
            const offsetY = (by - (blocks - 1) / 2) * pixelSize
            drawPixel(p, particle.x + offsetX, particle.y + offsetY, pixelSize, particle.color, 255)
          }
        }
      } else {
        drawPixel(p, particle.x, particle.y, pixelSize, particle.color, 255)
      }
    }
}

// Render final wave mode
function renderFinalWave(p: p5, controls: ControlState): void {
  // Dark background
  p.background(240, 40, 10)

  const numWaves = Math.round(controls.numWaves || 6)
  const frequencyScale = controls.frequencyScale || 0.02
  const waveAmplitude = controls.waveAmplitude || 80
  const colorIntensity = controls.colorIntensity || 0.7
  const waveDensity = controls.waveDensity || 0.8
  const pixelSize = Math.round(controls.pixelSize || 4)

  const time = (p.frameCount || 0) / 60

  // Generate wave sources
  const fibSequence = generateFibonacci(numWaves + 2)
  const waveSources: WaveSource[] = []
  const centerX = p.width / 2
  const centerY = p.height / 2
  const radius = p.min(p.width, p.height) * 0.35

  for (let i = 0; i < numWaves; i++) {
    const angle = (i / numWaves) * p.TWO_PI
    const x = centerX + p.cos(angle) * radius
    const y = centerY + p.sin(angle) * radius
    const fibValue = fibSequence[i + 2]
    const frequency = fibValue * frequencyScale
    const hue = (i * 360 / numWaves + fibValue * 10) % 360

    waveSources.push({
      x,
      y,
      frequency,
      phase: time * frequency,
      amplitude: waveAmplitude,
      color: p.color(hue, 70, 90),
    })
  }

  // Draw wave interference pattern
  const step = Math.max(pixelSize, 20 / waveDensity)

  for (let y = 0; y < p.height; y += step) {
    for (let x = 0; x < p.width; x += step) {
      let interference = 0

      for (const wave of waveSources) {
        const dx = x - wave.x
        const dy = y - wave.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const waveValue = p.sin(distance * wave.frequency + wave.phase)
        interference += waveValue * wave.amplitude
      }

      interference = interference / (numWaves * waveAmplitude)

      const hue = (interference * 180 + time * 10) % 360
      const saturation = 50 + p.abs(interference) * 50 * colorIntensity
      const brightness = 30 + p.abs(interference) * 70 * colorIntensity

      const h = hue / 360
      const s = saturation / 100
      const v = brightness / 100

      let r: number, g: number, b: number
      const i = Math.floor(h * 6)
      const f = h * 6 - i
      const p_val = v * (1 - s)
      const q = v * (1 - f * s)
      const t = v * (1 - (1 - f) * s)

      switch (i % 6) {
        case 0: r = v; g = t; b = p_val; break
        case 1: r = q; g = v; b = p_val; break
        case 2: r = p_val; g = v; b = t; break
        case 3: r = p_val; g = q; b = v; break
        case 4: r = t; g = p_val; b = v; break
        case 5: r = v; g = p_val; b = q; break
        default: r = 0; g = 0; b = 0
      }

      const px = snapToPixel(x, pixelSize)
      const py = snapToPixel(y, pixelSize)
      const blockSize = Math.max(pixelSize, step)

      p.noStroke()
      p.fill(r * 255, g * 255, b * 255, 200)
      p.rect(px, py, blockSize, blockSize)
    }
  }
}

// Claude's Choice - beautiful settings for day 3
export function getClaudesChoice(): Partial<ControlState> {
  return {
    numParticles: 15,
    spiralTightness: 0.35,
    particleSize: 5,
    trailLength: 25,
    animationSpeed: 0.7,
    colorSpread: 0.7,
    pixelSize: 5, // Nice chunky pixels
  }
}

// Export control configs for use in index.ts
export { controlConfigs, defaultControls }

export default config
