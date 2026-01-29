/**
 * Art Styles Guide
 *
 * Educational component that explains artistic techniques
 * and concepts used in each exhibit.
 */

// ============================================================================
// Types
// ============================================================================

export interface ArtStyle {
  name: string;
  description: string;
  techniques: string[];
  relatedArtists?: string[];
}

export interface StyleGuide {
  dayNumber: number;
  primaryStyle: ArtStyle;
  secondaryStyles?: ArtStyle[];
  toolsUsed: string[];
  conceptExplained: string;
}

export interface ArtStylesSystem {
  container: HTMLElement;
  popup: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Style Database
// ============================================================================

const STYLE_DATABASE: Record<string, ArtStyle> = {
  minimalism: {
    name: 'Minimalism',
    description: 'Art that strips down to essential elements, emphasizing simplicity and purity of form.',
    techniques: ['Reduction', 'Negative space', 'Geometric simplicity'],
    relatedArtists: ['Sol LeWitt', 'Donald Judd', 'Agnes Martin'],
  },
  generative: {
    name: 'Generative Art',
    description: 'Art created through autonomous systems, often using algorithms and randomness.',
    techniques: ['Algorithmic design', 'Procedural generation', 'Emergent behavior'],
    relatedArtists: ['Vera Molnár', 'Manfred Mohr', 'Casey Reas'],
  },
  opArt: {
    name: 'Op Art',
    description: 'Art that creates optical illusions through precise geometric patterns.',
    techniques: ['Moiré patterns', 'Color vibration', 'Geometric repetition'],
    relatedArtists: ['Bridget Riley', 'Victor Vasarely', 'Jesús Rafael Soto'],
  },
  organic: {
    name: 'Organic Forms',
    description: 'Art inspired by natural shapes and growth patterns found in nature.',
    techniques: ['Flow fields', 'L-systems', 'Reaction-diffusion'],
    relatedArtists: ['Karl Blossfeldt', 'Ernst Haeckel', 'Nervous System'],
  },
  geometric: {
    name: 'Geometric Abstraction',
    description: 'Art based on geometric forms arranged in non-representational compositions.',
    techniques: ['Tessellation', 'Sacred geometry', 'Modular systems'],
    relatedArtists: ['Piet Mondrian', 'Kazimir Malevich', 'M.C. Escher'],
  },
  kinetic: {
    name: 'Kinetic Art',
    description: 'Art that contains movement or depends on motion for its effect.',
    techniques: ['Animation', 'Time-based media', 'Interactive systems'],
    relatedArtists: ['Alexander Calder', 'Jean Tinguely', 'Julio Le Parc'],
  },
  dataMoshing: {
    name: 'Glitch Art',
    description: 'Art that embraces digital errors and corruption as aesthetic elements.',
    techniques: ['Data bending', 'Pixel sorting', 'Compression artifacts'],
    relatedArtists: ['Rosa Menkman', 'Sabato Visconti', 'Daniel Temkin'],
  },
  proceduralNoise: {
    name: 'Procedural Noise',
    description: 'Art created using mathematical noise functions for organic textures.',
    techniques: ['Perlin noise', 'Simplex noise', 'Fractal Brownian motion'],
    relatedArtists: ['Ken Perlin', 'Inigo Quilez', 'Robert Hodgin'],
  },
};

// Map days to styles
const DAY_STYLES: Record<number, StyleGuide> = {
  1: {
    dayNumber: 1,
    primaryStyle: STYLE_DATABASE.minimalism,
    toolsUsed: ['Canvas 2D', 'Linear gradients'],
    conceptExplained: 'Vertical elements create rhythm and depth through simple repetition.',
  },
  3: {
    dayNumber: 3,
    primaryStyle: STYLE_DATABASE.geometric,
    toolsUsed: ['Canvas 2D', 'Pattern algorithms'],
    conceptExplained: 'Tessellation fills space with repeating geometric shapes.',
  },
  5: {
    dayNumber: 5,
    primaryStyle: STYLE_DATABASE.proceduralNoise,
    secondaryStyles: [STYLE_DATABASE.organic],
    toolsUsed: ['Perlin noise', 'Flow fields'],
    conceptExplained: 'Particles follow invisible force fields created by noise functions.',
  },
  7: {
    dayNumber: 7,
    primaryStyle: STYLE_DATABASE.geometric,
    toolsUsed: ['Boolean operations', 'Shape blending'],
    conceptExplained: 'Combining shapes through union, intersection, and difference.',
  },
  10: {
    dayNumber: 10,
    primaryStyle: STYLE_DATABASE.organic,
    secondaryStyles: [STYLE_DATABASE.generative],
    toolsUsed: ['L-systems', 'Recursive algorithms'],
    conceptExplained: 'Growth patterns emerge from simple rules applied recursively.',
  },
  12: {
    dayNumber: 12,
    primaryStyle: STYLE_DATABASE.opArt,
    toolsUsed: ['3D rendering', 'Isometric projection'],
    conceptExplained: 'Impossible geometry challenges perception through visual paradox.',
  },
  19: {
    dayNumber: 19,
    primaryStyle: STYLE_DATABASE.opArt,
    toolsUsed: ['SVG', 'Geometric patterns'],
    conceptExplained: 'Optical illusions emerge from precise pattern interference.',
  },
  23: {
    dayNumber: 23,
    primaryStyle: STYLE_DATABASE.generative,
    secondaryStyles: [STYLE_DATABASE.kinetic],
    toolsUsed: ['WebGL', 'Shader programming'],
    conceptExplained: 'Maximalist approach: complexity through layered generative systems.',
  },
  24: {
    dayNumber: 24,
    primaryStyle: STYLE_DATABASE.minimalism,
    toolsUsed: ['Canvas 2D', 'Constraint systems'],
    conceptExplained: 'Minimalist approach: finding beauty in reduction and restraint.',
  },
  26: {
    dayNumber: 26,
    primaryStyle: STYLE_DATABASE.geometric,
    toolsUsed: ['Reflection algorithms', 'Symmetry operations'],
    conceptExplained: 'Symmetry creates visual harmony through mirrored transformations.',
  },
  27: {
    dayNumber: 27,
    primaryStyle: STYLE_DATABASE.organic,
    toolsUsed: ['Branching algorithms', 'Recursive structures'],
    conceptExplained: 'Plant forms modeled through recursive branching rules.',
  },
};

// ============================================================================
// Art Styles System Creation
// ============================================================================

/**
 * Create the art styles system
 */
export function createArtStylesSystem(container: HTMLElement): ArtStylesSystem {
  const system: ArtStylesSystem = {
    container,
    popup: null,
    isOpen: false,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  return system;
}

/**
 * Show style guide for a specific day
 */
export function showStyleGuide(system: ArtStylesSystem, dayNumber: number): void {
  closeStyleGuide(system);

  const guide = DAY_STYLES[dayNumber];
  if (!guide) {
    // Generate a generic guide
    showGenericGuide(system, dayNumber);
    return;
  }

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'style-guide';
  popup.style.cssText = `
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 280px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 200, 100, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(255, 200, 100, 0.2);
      background: linear-gradient(90deg, rgba(255, 200, 100, 0.1), transparent);
    ">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">
        Art Style Guide
      </div>
      <div style="font-size: 14px; color: white; font-weight: bold;">
        Day ${dayNumber}
      </div>
    </div>

    <div style="padding: 15px; max-height: 350px; overflow-y: auto;">
      <!-- Primary Style -->
      <div style="margin-bottom: 15px;">
        <div style="
          font-size: 13px;
          color: #ffc864;
          font-weight: bold;
          margin-bottom: 6px;
        ">
          ${guide.primaryStyle.name}
        </div>
        <div style="font-size: 11px; color: #aaa; line-height: 1.5;">
          ${guide.primaryStyle.description}
        </div>
      </div>

      <!-- Techniques -->
      <div style="margin-bottom: 15px;">
        <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px;">
          Techniques
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${guide.primaryStyle.techniques.map(t => `
            <span style="
              padding: 4px 8px;
              background: rgba(255, 200, 100, 0.15);
              border-radius: 4px;
              font-size: 10px;
              color: #ddd;
            ">${t}</span>
          `).join('')}
        </div>
      </div>

      <!-- Tools Used -->
      <div style="margin-bottom: 15px;">
        <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px;">
          Tools Used
        </div>
        <div style="font-size: 11px; color: #aaa;">
          ${guide.toolsUsed.join(' · ')}
        </div>
      </div>

      <!-- Concept -->
      <div style="
        padding: 10px;
        background: rgba(255, 200, 100, 0.08);
        border-radius: 6px;
        border-left: 3px solid rgba(255, 200, 100, 0.4);
      ">
        <div style="font-size: 10px; color: #888; margin-bottom: 4px;">
          Concept
        </div>
        <div style="font-size: 11px; color: #ccc; line-height: 1.5;">
          ${guide.conceptExplained}
        </div>
      </div>

      ${guide.primaryStyle.relatedArtists ? `
        <!-- Related Artists -->
        <div style="margin-top: 15px;">
          <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px;">
            Related Artists
          </div>
          <div style="font-size: 11px; color: #999;">
            ${guide.primaryStyle.relatedArtists.join(', ')}
          </div>
        </div>
      ` : ''}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(255, 200, 100, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Press E to close
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Auto-close after 15 seconds
  setTimeout(() => {
    if (system.popup === popup) {
      closeStyleGuide(system);
    }
  }, 15000);
}

/**
 * Show generic guide for days without specific entries
 */
function showGenericGuide(system: ArtStylesSystem, dayNumber: number): void {
  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'style-guide';
  popup.style.cssText = `
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 250px;
    background: rgba(15, 15, 25, 0.95);
    border: 1px solid rgba(255, 200, 100, 0.2);
    border-radius: 12px;
    padding: 15px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  popup.innerHTML = `
    <div style="font-size: 11px; color: #888; margin-bottom: 8px;">
      Art Style Guide · Day ${dayNumber}
    </div>
    <div style="font-size: 13px; color: #ffc864; font-weight: bold; margin-bottom: 10px;">
      Generative Art
    </div>
    <div style="font-size: 11px; color: #aaa; line-height: 1.5;">
      This exhibit explores algorithmic creation, where code becomes the artist's brush and randomness adds organic variation.
    </div>
    <div style="margin-top: 10px; font-size: 10px; color: #666;">
      Press E to close
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  setTimeout(() => {
    if (system.popup === popup) {
      closeStyleGuide(system);
    }
  }, 10000);
}

/**
 * Close the style guide
 */
export function closeStyleGuide(system: ArtStylesSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Toggle style guide
 */
export function toggleStyleGuide(system: ArtStylesSystem, dayNumber: number): void {
  if (system.isOpen) {
    closeStyleGuide(system);
  } else {
    showStyleGuide(system, dayNumber);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeArtStylesSystem(system: ArtStylesSystem): void {
  system.cleanup();
}
