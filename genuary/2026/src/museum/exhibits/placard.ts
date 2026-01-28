/**
 * Placard System for Museum Exhibits
 *
 * Creates information panels that display details about each artwork.
 * Placards are rendered as canvas textures for crisp, readable text.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Placard {
  group: THREE.Group;
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  texture: THREE.CanvasTexture;
  dayNumber: number;
}

export interface PlacardConfig {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontSize: number;
}

export interface DayInfo {
  dayNumber: number;
  title: string;
  description: string;
  credit?: string;
}

// ============================================================================
// Prompt Data
// ============================================================================

/**
 * Information for each Genuary day
 * Extracted from prompts.md
 */
export const dayInfoMap: Record<number, DayInfo> = {
  1: {
    dayNumber: 1,
    title: 'One Color, One Shape',
    description: 'Explore minimalism through a single color and form.',
    credit: 'Piero',
  },
  2: {
    dayNumber: 2,
    title: 'Twelve Principles of Animation',
    description: 'Apply classic animation principles to generative art.',
    credit: 'Anna Lucia',
  },
  3: {
    dayNumber: 3,
    title: 'Fibonacci Forever',
    description: 'Create work using the Fibonacci sequence.',
    credit: 'PaoloCurtoni',
  },
  4: {
    dayNumber: 4,
    title: 'Lowres',
    description: 'An image with low resolution, simplified or pixelated.',
    credit: 'Manuel Larino',
  },
  5: {
    dayNumber: 5,
    title: 'Write "Genuary"',
    description: 'Spell it out without using a font.',
    credit: 'Piero',
  },
  6: {
    dayNumber: 6,
    title: 'Lights On/Off',
    description: 'Something that changes when you switch the digital lights.',
    credit: 'George Henry Rowe',
  },
  7: {
    dayNumber: 7,
    title: 'Boolean Algebra',
    description: 'Get inspired by Boolean algebra in any way.',
    credit: 'PaoloCurtoni',
  },
  8: {
    dayNumber: 8,
    title: 'A City',
    description: 'Create a generative metropolis.',
    credit: 'PaoloCurtoni',
  },
  9: {
    dayNumber: 9,
    title: 'Crazy Automaton',
    description: 'Cellular automata with crazy rules.',
    credit: 'PaoloCurtoni',
  },
  10: {
    dayNumber: 10,
    title: 'Polar Coordinates',
    description: 'Explore the circular coordinate system.',
    credit: 'Sophia (fractal kitty)',
  },
  11: {
    dayNumber: 11,
    title: 'Quine',
    description: 'A program that outputs exactly its own source code.',
    credit: 'Manuel Larino',
  },
  12: {
    dayNumber: 12,
    title: 'Boxes Only',
    description: 'Construct your work using only boxes.',
    credit: 'Stranger in the Q',
  },
  13: {
    dayNumber: 13,
    title: 'Self Portrait',
    description: 'Create a generative self portrait with variable features.',
    credit: 'Jos Vromans',
  },
  14: {
    dayNumber: 14,
    title: 'Everything Fits Perfectly',
    description: 'Satisfying precision and alignment.',
    credit: 'Roni',
  },
  15: {
    dayNumber: 15,
    title: 'Invisible Object',
    description: 'Create an invisible object where only shadows can be seen.',
    credit: 'P1xelboy',
  },
  16: {
    dayNumber: 16,
    title: 'Order and Disorder',
    description: 'Explore the tension between chaos and structure.',
    credit: 'Ivan Dianov',
  },
  17: {
    dayNumber: 17,
    title: 'Wallpaper Group',
    description: 'One of 17 ways to cover a plane with a repeating pattern.',
    credit: 'Ivan Dianov',
  },
  18: {
    dayNumber: 18,
    title: 'Unexpected Path',
    description: 'A route that changes direction based on one simple rule.',
    credit: 'Baret LaVida',
  },
  19: {
    dayNumber: 19,
    title: '16×16',
    description: 'Work within a tiny grid.',
    credit: 'Jos Vromans',
  },
  20: {
    dayNumber: 20,
    title: 'One Line',
    description: 'An artwork made of a single line only.',
    credit: 'Jos Vromans',
  },
  21: {
    dayNumber: 21,
    title: 'Bauhaus Poster',
    description: 'A poster design inspired by the Bauhaus art school.',
    credit: 'Piero',
  },
  22: {
    dayNumber: 22,
    title: 'Pen Plotter Ready',
    description: 'Create work suitable for plotting.',
    credit: 'Sophia (fractal kitty)',
  },
  23: {
    dayNumber: 23,
    title: 'Transparency',
    description: 'Explore the concept of transparency.',
    credit: 'PaoloCurtoni',
  },
  24: {
    dayNumber: 24,
    title: "Perfectionist's Nightmare",
    description: 'Intentional imperfection and discomfort.',
    credit: 'Sophia (fractal kitty)',
  },
  25: {
    dayNumber: 25,
    title: 'Organic Geometry',
    description: 'Forms that look organic but are built from geometry.',
    credit: 'Manuel Larino',
  },
  26: {
    dayNumber: 26,
    title: 'Recursive Grids',
    description: 'Split the canvas into a grid and recurse on each cell.',
    credit: 'Piero',
  },
  27: {
    dayNumber: 27,
    title: 'Lifeform',
    description: 'A shape or structure that behaves as if alive or growing.',
    credit: 'Manuel Larino',
  },
  28: {
    dayNumber: 28,
    title: 'No Libraries, Only HTML',
    description: 'No canvas, only HTML elements.',
    credit: 'Piero',
  },
  29: {
    dayNumber: 29,
    title: 'Genetic Evolution',
    description: 'Genetic evolution and mutation.',
    credit: 'Monokai',
  },
  30: {
    dayNumber: 30,
    title: "It's Not a Bug",
    description: "It's a feature.",
    credit: 'Bart Simons',
  },
  31: {
    dayNumber: 31,
    title: 'GLSL Day',
    description: 'Create an artwork using only shaders.',
    credit: 'Piero',
  },
};

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultPlacardConfig: PlacardConfig = {
  width: 0.4,
  height: 0.15,
  backgroundColor: '#1a1a1a',
  textColor: '#e0e0e0',
  accentColor: '#808080',
  fontSize: 14,
};

// ============================================================================
// Placard Creation
// ============================================================================

/**
 * Create a placard for a museum exhibit
 */
export function createPlacard(
  dayNumber: number,
  config: Partial<PlacardConfig> = {}
): Placard {
  const cfg = { ...defaultPlacardConfig, ...config };
  const group = new THREE.Group();

  // Get day information
  const info = dayInfoMap[dayNumber] || {
    dayNumber,
    title: `Day ${dayNumber}`,
    description: 'Coming soon.',
  };

  // Create canvas for text rendering
  const canvas = document.createElement('canvas');
  const scale = 4; // Higher resolution for crisp text
  canvas.width = Math.round(cfg.width * 512 * scale);
  canvas.height = Math.round(cfg.height * 512 * scale);

  const ctx = canvas.getContext('2d');
  if (ctx) {
    renderPlacardContent(ctx, info, cfg, scale);
  }

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Create material and mesh
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(cfg.width, cfg.height);
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // Add subtle backing panel for depth
  const backingGeom = new THREE.BoxGeometry(cfg.width + 0.01, cfg.height + 0.01, 0.008);
  const backingMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
    metalness: 0.1,
  });
  const backing = new THREE.Mesh(backingGeom, backingMaterial);
  backing.position.z = -0.005;
  group.add(backing);

  return {
    group,
    mesh,
    material,
    texture,
    dayNumber,
  };
}

/**
 * Render placard content to a canvas context
 */
function renderPlacardContent(
  ctx: CanvasRenderingContext2D,
  info: DayInfo,
  cfg: PlacardConfig,
  scale: number
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const fontSize = cfg.fontSize * scale;
  const padding = 12 * scale;

  // Background
  ctx.fillStyle = cfg.backgroundColor;
  ctx.fillRect(0, 0, w, h);

  // Subtle border
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = scale;
  ctx.strokeRect(scale / 2, scale / 2, w - scale, h - scale);

  // Day number badge (left side)
  const badgeWidth = 45 * scale;
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, badgeWidth, h);

  // Day number text
  ctx.fillStyle = cfg.accentColor;
  ctx.font = `bold ${fontSize * 0.85}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${info.dayNumber}`, badgeWidth / 2, h / 2);

  // Title
  ctx.fillStyle = cfg.textColor;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(info.title, badgeWidth + padding, padding);

  // Description (smaller, muted)
  ctx.fillStyle = cfg.accentColor;
  ctx.font = `${fontSize * 0.75}px sans-serif`;

  // Word wrap the description
  const maxWidth = w - badgeWidth - padding * 2;
  const words = info.description.split(' ');
  let line = '';
  let y = padding + fontSize * 1.3;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, badgeWidth + padding, y);
      line = word;
      y += fontSize * 0.9;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, badgeWidth + padding, y);
}

/**
 * Get day information by number
 */
export function getDayInfo(dayNumber: number): DayInfo | undefined {
  return dayInfoMap[dayNumber];
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose of placard resources
 */
export function disposePlacard(placard: Placard): void {
  placard.texture.dispose();
  placard.material.dispose();

  placard.group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
}
