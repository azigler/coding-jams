/**
 * Pixel Art utility functions for creating pixelated/blocky aesthetics
 */

import type p5 from 'p5'

/**
 * Snap a coordinate to a pixel grid
 */
export function snapToPixel(value: number, pixelSize: number): number {
  return Math.floor(value / pixelSize) * pixelSize
}

/**
 * Draw a pixel block at the given position
 */
export function drawPixel(
  p: p5,
  x: number,
  y: number,
  pixelSize: number,
  color: p5.Color,
  alpha: number = 255
): void {
  const px = snapToPixel(x, pixelSize)
  const py = snapToPixel(y, pixelSize)
  
  p.push()
  p.noStroke()
  const c = p.color(color)
  c.setAlpha(alpha)
  p.fill(c)
  p.rect(px, py, pixelSize, pixelSize)
  p.pop()
}

/**
 * Draw a pixelated line between two points
 */
export function drawPixelLine(
  p: p5,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pixelSize: number,
  color: p5.Color,
  alpha: number = 255
): void {
  // Snap both points to grid
  const px1 = snapToPixel(x1, pixelSize)
  const py1 = snapToPixel(y1, pixelSize)
  const px2 = snapToPixel(x2, pixelSize)
  const py2 = snapToPixel(y2, pixelSize)
  
  // Draw pixels along the line
  const steps = Math.max(
    Math.abs(px2 - px1) / pixelSize,
    Math.abs(py2 - py1) / pixelSize
  )
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = px1 + (px2 - px1) * t
    const y = py1 + (py2 - py1) * t
    drawPixel(p, x, y, pixelSize, color, alpha)
  }
}

/**
 * Draw a pixelated circle
 */
export function drawPixelCircle(
  p: p5,
  x: number,
  y: number,
  radius: number,
  pixelSize: number,
  color: p5.Color,
  alpha: number = 255
): void {
  const centerX = snapToPixel(x, pixelSize)
  const centerY = snapToPixel(y, pixelSize)
  const pixelRadius = Math.floor(radius / pixelSize) * pixelSize
  
  p.push()
  p.noStroke()
  const c = p.color(color)
  c.setAlpha(alpha)
  p.fill(c)
  
  // Draw filled circle as pixel blocks
  for (let py = centerY - pixelRadius; py <= centerY + pixelRadius; py += pixelSize) {
    for (let px = centerX - pixelRadius; px <= centerX + pixelRadius; px += pixelSize) {
      const dist = p.dist(px, py, centerX, centerY)
      if (dist <= pixelRadius) {
        p.rect(px, py, pixelSize, pixelSize)
      }
    }
  }
  p.pop()
}

/**
 * Draw a pixelated rectangle
 */
export function drawPixelRect(
  p: p5,
  x: number,
  y: number,
  width: number,
  height: number,
  pixelSize: number,
  color: p5.Color,
  alpha: number = 255
): void {
  const px = snapToPixel(x, pixelSize)
  const py = snapToPixel(y, pixelSize)
  const pw = Math.floor(width / pixelSize) * pixelSize
  const ph = Math.floor(height / pixelSize) * pixelSize
  
  p.push()
  p.noStroke()
  const c = p.color(color)
  c.setAlpha(alpha)
  p.fill(c)
  p.rect(px, py, pw, ph)
  p.pop()
}
