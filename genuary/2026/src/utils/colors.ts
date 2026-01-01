/**
 * Color utility functions
 */

/**
 * Convert HSL to RGB array [r, g, b] (0-255)
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Generate a random color with optional hue range
 */
export function randomColor(p: p5, hueMin = 0, hueMax = 360, satMin = 50, satMax = 100, lightMin = 30, lightMax = 70): p5.Color {
  const h = p.random(hueMin, hueMax);
  const s = p.random(satMin, satMax);
  const l = p.random(lightMin, lightMax);
  return p.color(h, s, l);
}
