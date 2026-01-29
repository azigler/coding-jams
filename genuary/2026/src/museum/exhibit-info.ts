/**
 * Exhibit Information System
 *
 * Shows detailed information about exhibits when viewing them.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExhibitInfo {
  dayNumber: number;
  title: string;
  prompt: string;
  artistNote?: string;
  technique?: string;
  interactionHint?: string;
}

export interface ExhibitInfoPanel {
  container: HTMLElement;
  panel: HTMLElement | null;
  currentDay: number | null;
  isExpanded: boolean;
  cleanup: () => void;
}

// ============================================================================
// Exhibit Data
// ============================================================================

const EXHIBIT_DATA: Record<number, Partial<ExhibitInfo>> = {
  1: {
    title: 'Vertical or Horizontal Lines',
    prompt: 'Vertical or horizontal lines (only)',
    technique: 'p5.js canvas, procedural line generation',
    artistNote: 'Exploring the tension between rigidity and flow through simple lines.',
    interactionHint: 'Adjust line density and spacing with sliders',
  },
  2: {
    title: 'Layers Upon Layers',
    prompt: 'Layers upon layers upon layers',
    technique: 'p5.js with blend modes',
    artistNote: 'Each layer tells a story; together they create depth.',
    interactionHint: 'Control layer count and opacity',
  },
  3: {
    title: 'Exactly 42 Lines',
    prompt: 'Exactly 42 lines of code',
    technique: 'Constrained code art',
    artistNote: 'The answer to life, the universe, and everything... in 42 lines.',
    interactionHint: 'Minimal controls for a minimal piece',
  },
  4: {
    title: 'Black on Black',
    prompt: 'Black on black',
    technique: 'Subtle value variations',
    artistNote: 'Finding light in darkness, detail in monotony.',
    interactionHint: 'Adjust contrast to reveal hidden details',
  },
  5: {
    title: 'Isometric Art',
    prompt: 'Isometric art (no rotation)',
    technique: 'Isometric projection mathematics',
    artistNote: 'The world seen from an angle that never was.',
    interactionHint: 'Explore the isometric world',
  },
  6: {
    title: 'Make a Landscape',
    prompt: 'Make a landscape using only primitive shapes',
    technique: 'Procedural landscape generation',
    artistNote: 'Mountains from triangles, clouds from circles.',
    interactionHint: 'Adjust terrain features',
  },
  7: {
    title: 'Use the Digit 7',
    prompt: 'Use the digit 7 in your code',
    technique: 'Numeric constraint art',
    artistNote: 'Lucky number 7 woven throughout.',
    interactionHint: 'Count the sevens if you can',
  },
  8: {
    title: 'Draw One Million',
    prompt: 'Draw one million of something',
    technique: 'High-performance rendering',
    artistNote: 'A million points of light, each one matters.',
    interactionHint: 'Particle count slider',
  },
  9: {
    title: 'The Textile Arts',
    prompt: 'The textile arts: weaving, knitting, embroidery, etc.',
    technique: 'Woven pattern algorithms',
    artistNote: 'Code as thread, algorithms as looms.',
    interactionHint: 'Adjust weave pattern',
  },
  10: {
    title: 'You Can Only Use TAU',
    prompt: 'You can only use TAU in your code',
    technique: 'TAU (2π) mathematics',
    artistNote: 'TAU is the true circle constant.',
    interactionHint: 'Embrace the full turn',
  },
  11: {
    title: 'Impossible Day',
    prompt: 'Impossible day - can you satisfice all prompts?',
    technique: 'Multi-constraint satisfaction',
    artistNote: 'When everything is required, creativity finds a way.',
    interactionHint: 'Toggle between interpretations',
  },
  12: {
    title: 'Subdivision',
    prompt: 'Subdivision',
    technique: 'Recursive subdivision algorithms',
    artistNote: 'Division creates multiplication of form.',
    interactionHint: 'Control recursion depth',
  },
  13: {
    title: 'Triangles and Only Triangles',
    prompt: 'Triangles and only triangles',
    technique: 'Triangulated mesh generation',
    artistNote: 'The fundamental polygon.',
    interactionHint: 'Adjust triangle complexity',
  },
  14: {
    title: 'Pure Black and White',
    prompt: 'Pure black and white, no gray',
    technique: 'Binary threshold rendering',
    artistNote: 'Stark contrast, no compromise.',
    interactionHint: 'Control threshold boundary',
  },
  15: {
    title: 'Design a Rug',
    prompt: 'Design a rug',
    technique: 'Pattern generation, symmetry',
    artistNote: 'Patterns that could warm a floor.',
    interactionHint: 'Customize rug pattern',
  },
  16: {
    title: 'Palette from Your Favorite Movie',
    prompt: 'Palette from your favorite movie',
    technique: 'Color extraction and harmony',
    artistNote: 'Cinema colors in code.',
    interactionHint: 'Switch movie palettes',
  },
  17: {
    title: 'What Does Wind Look Like?',
    prompt: 'What does wind look like?',
    technique: 'Flow field visualization',
    artistNote: 'Making the invisible visible.',
    interactionHint: 'Control wind intensity',
  },
  18: {
    title: 'What Does the Opposite Mean to You?',
    prompt: 'What does the opposite mean to you?',
    technique: 'Conceptual inversion',
    artistNote: 'Every action has an equal and opposite reaction.',
    interactionHint: 'Toggle opposite modes',
  },
  19: {
    title: 'Op Art',
    prompt: 'Op art',
    technique: 'Optical illusion patterns',
    artistNote: 'When geometry plays tricks on the eye.',
    interactionHint: 'Adjust optical intensity',
  },
  20: {
    title: 'Generative Typography',
    prompt: 'Generative typography',
    technique: 'Procedural letterform generation',
    artistNote: 'Letters that write themselves.',
    interactionHint: 'Customize typography',
  },
  21: {
    title: 'Create a Collision Detection System',
    prompt: 'Create a collision detection system and use it',
    technique: 'Physics simulation',
    artistNote: 'When objects meet, things get interesting.',
    interactionHint: 'Control physics parameters',
  },
  22: {
    title: 'Gradients Only',
    prompt: 'Gradients only',
    technique: 'Color interpolation',
    artistNote: 'The space between colors is infinite.',
    interactionHint: 'Customize gradient stops',
  },
  23: {
    title: 'More Than 5 Colors',
    prompt: 'More than 5 colors',
    technique: 'Multi-color harmony',
    artistNote: 'When five is not enough.',
    interactionHint: 'Add and adjust colors',
  },
  24: {
    title: 'Geometric Abstraction',
    prompt: 'Geometric abstraction',
    technique: 'Abstract geometry composition',
    artistNote: 'Pure form, pure expression.',
    interactionHint: 'Control abstraction level',
  },
  25: {
    title: 'One Line That Is Extremely Long',
    prompt: 'One line that is extremely long',
    technique: 'Single continuous path',
    artistNote: 'One stroke to rule them all.',
    interactionHint: 'Control line path',
  },
  26: {
    title: 'Symmetry',
    prompt: 'Symmetry',
    technique: 'Reflection and rotation symmetry',
    artistNote: 'Balance in mathematics, harmony in art.',
    interactionHint: 'Choose symmetry type',
  },
  27: {
    title: 'Make Something Interesting With No Color',
    prompt: 'Make something interesting with no randomness or noise',
    technique: 'Deterministic generation',
    artistNote: 'Pure mathematics, no chance.',
    interactionHint: 'Adjust deterministic parameters',
  },
  28: {
    title: 'Infinite Scroll',
    prompt: 'Infinite scroll',
    technique: 'Seamless tiling animation',
    artistNote: 'A journey with no end.',
    interactionHint: 'Control scroll speed',
  },
  29: {
    title: 'Grid-Based',
    prompt: 'Grid-based',
    technique: 'Grid mathematics and layout',
    artistNote: 'Order from the grid, chaos in the cells.',
    interactionHint: 'Adjust grid dimensions',
  },
  30: {
    title: 'Abstract Emotion',
    prompt: 'Abstract emotion',
    technique: 'Emotional color and motion',
    artistNote: 'Feelings rendered in pixels.',
    interactionHint: 'Choose emotional tone',
  },
  31: {
    title: 'Celebrate',
    prompt: 'Celebrate!',
    technique: 'Particle celebration effects',
    artistNote: 'The grand finale of Genuary.',
    interactionHint: 'Unleash the celebration',
  },
};

// ============================================================================
// Panel Creation
// ============================================================================

/**
 * Create the exhibit info panel system
 */
export function createExhibitInfoPanel(container: HTMLElement): ExhibitInfoPanel {
  const system: ExhibitInfoPanel = {
    container,
    panel: null,
    currentDay: null,
    isExpanded: false,
    cleanup: () => {
      if (system.panel) {
        system.panel.remove();
        system.panel = null;
      }
    },
  };

  return system;
}

/**
 * Show exhibit info panel for a day
 */
export function showExhibitInfo(panel: ExhibitInfoPanel, dayNumber: number): void {
  if (panel.currentDay === dayNumber && panel.panel) {
    // Already showing this day
    return;
  }

  hideExhibitInfo(panel);

  const info = getExhibitInfo(dayNumber);
  panel.currentDay = dayNumber;

  const element = document.createElement('div');
  element.id = 'exhibit-info-panel';
  element.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 20px;
    width: 280px;
    background: rgba(15, 15, 25, 0.9);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 100;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
  `;

  // Day badge
  const dayBadge = document.createElement('div');
  dayBadge.style.cssText = `
    display: inline-block;
    background: linear-gradient(135deg, #4a9eff, #a855f7);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
    margin-bottom: 10px;
  `;
  dayBadge.textContent = `Day ${dayNumber}`;
  element.appendChild(dayBadge);

  // Title
  const title = document.createElement('h3');
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 16px;
    color: white;
    font-weight: 600;
  `;
  title.textContent = info.title;
  element.appendChild(title);

  // Prompt
  const prompt = document.createElement('div');
  prompt.style.cssText = `
    font-size: 12px;
    color: #888;
    font-style: italic;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(100, 100, 120, 0.3);
  `;
  prompt.textContent = `"${info.prompt}"`;
  element.appendChild(prompt);

  // Expandable details section
  if (info.technique || info.artistNote || info.interactionHint) {
    const detailsButton = document.createElement('button');
    detailsButton.style.cssText = `
      background: none;
      border: none;
      color: #4a9eff;
      font-size: 12px;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    detailsButton.innerHTML = `
      <span class="expand-icon">▸</span>
      <span>More details</span>
    `;

    const detailsContent = document.createElement('div');
    detailsContent.style.cssText = `
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s;
      margin-top: 8px;
    `;

    if (info.technique) {
      const techEl = document.createElement('div');
      techEl.style.cssText = 'font-size: 11px; color: #888; margin-bottom: 6px;';
      techEl.innerHTML = `<strong style="color: #a855f7;">Technique:</strong> ${info.technique}`;
      detailsContent.appendChild(techEl);
    }

    if (info.artistNote) {
      const noteEl = document.createElement('div');
      noteEl.style.cssText = 'font-size: 11px; color: #888; margin-bottom: 6px;';
      noteEl.innerHTML = `<strong style="color: #10b981;">Artist Note:</strong> ${info.artistNote}`;
      detailsContent.appendChild(noteEl);
    }

    if (info.interactionHint) {
      const hintEl = document.createElement('div');
      hintEl.style.cssText = 'font-size: 11px; color: #888;';
      hintEl.innerHTML = `<strong style="color: #f59e0b;">Interaction:</strong> ${info.interactionHint}`;
      detailsContent.appendChild(hintEl);
    }

    let expanded = false;
    detailsButton.onclick = () => {
      expanded = !expanded;
      panel.isExpanded = expanded;
      const icon = detailsButton.querySelector('.expand-icon') as HTMLElement;
      if (expanded) {
        icon.textContent = '▾';
        detailsContent.style.maxHeight = '200px';
      } else {
        icon.textContent = '▸';
        detailsContent.style.maxHeight = '0';
      }
    };

    element.appendChild(detailsButton);
    element.appendChild(detailsContent);
  }

  // Controls hint
  const controlsHint = document.createElement('div');
  controlsHint.style.cssText = `
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(100, 100, 120, 0.3);
    font-size: 10px;
    color: #666;
    display: flex;
    gap: 12px;
  `;
  controlsHint.innerHTML = `
    <span><kbd style="background: rgba(60, 60, 80, 0.5); padding: 2px 4px; border-radius: 2px;">F</kbd> Favorite</span>
    <span><kbd style="background: rgba(60, 60, 80, 0.5); padding: 2px 4px; border-radius: 2px;">[ ]</kbd> Browse</span>
    <span><kbd style="background: rgba(60, 60, 80, 0.5); padding: 2px 4px; border-radius: 2px;">Esc</kbd> Exit</span>
  `;
  element.appendChild(controlsHint);

  panel.container.appendChild(element);
  panel.panel = element;

  // Animate in
  requestAnimationFrame(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
}

/**
 * Hide the exhibit info panel
 */
export function hideExhibitInfo(panel: ExhibitInfoPanel): void {
  if (panel.panel) {
    panel.panel.style.opacity = '0';
    panel.panel.style.transform = 'translateY(10px)';
    const element = panel.panel;
    setTimeout(() => {
      element.remove();
      if (panel.panel === element) {
        panel.panel = null;
      }
    }, 300);
    panel.currentDay = null;
    panel.isExpanded = false;
  }
}

/**
 * Get exhibit info for a day
 */
export function getExhibitInfo(dayNumber: number): ExhibitInfo {
  const data = EXHIBIT_DATA[dayNumber] || {};
  return {
    dayNumber,
    title: data.title || `Day ${dayNumber}`,
    prompt: data.prompt || 'Genuary 2026',
    artistNote: data.artistNote,
    technique: data.technique,
    interactionHint: data.interactionHint,
  };
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose exhibit info panel
 */
export function disposeExhibitInfoPanel(panel: ExhibitInfoPanel): void {
  panel.cleanup();
}
