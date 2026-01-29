/**
 * Trivia
 *
 * Fun facts and trivia about the exhibits
 * and generative art techniques.
 */

// ============================================================================
// Types
// ============================================================================

export interface TriviaItem {
  id: string;
  dayNumber?: number;
  category: 'technique' | 'history' | 'fun_fact' | 'artist_note';
  text: string;
  source?: string;
}

export interface TriviaSystem {
  container: HTMLElement;
  currentTrivia: TriviaItem | null;
  shownIds: Set<string>;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Trivia Data
// ============================================================================

const TRIVIA: TriviaItem[] = [
  // General generative art trivia
  {
    id: 'gen1',
    category: 'history',
    text: 'Generative art has roots in the 1960s with pioneers like Vera Molnár and Georg Nees using computers to create algorithmic compositions.',
  },
  {
    id: 'gen2',
    category: 'technique',
    text: 'Perlin noise, invented by Ken Perlin in 1983, is the foundation for natural-looking procedural textures in games and art.',
  },
  {
    id: 'gen3',
    category: 'history',
    text: 'Genuary began in 2021 as a month of daily generative art prompts, inspired by Inktober and similar challenges.',
  },
  {
    id: 'gen4',
    category: 'fun_fact',
    text: 'The term "generative art" was popularized by the Processing programming language community in the early 2000s.',
  },
  {
    id: 'gen5',
    category: 'technique',
    text: 'Flow fields create organic patterns by assigning a direction vector to each point in space, guiding particle movement.',
  },
  {
    id: 'gen6',
    category: 'history',
    text: 'Sol LeWitt\'s wall drawings from the 1960s are considered precursors to algorithmic art, using written instructions as code.',
  },
  {
    id: 'gen7',
    category: 'technique',
    text: 'L-systems, developed by Aristid Lindenmayer in 1968, model plant growth using recursive grammar rules.',
  },
  {
    id: 'gen8',
    category: 'fun_fact',
    text: 'The JavaScript library p5.js was created by Lauren McCarthy in 2014 as a modern, web-friendly version of Processing.',
  },
  {
    id: 'gen9',
    category: 'technique',
    text: 'WebGL allows browsers to render 3D graphics using the GPU, enabling complex real-time visualizations.',
  },
  {
    id: 'gen10',
    category: 'history',
    text: 'The first computer-generated art exhibition was held in 1965 at the Technische Hochschule in Stuttgart, Germany.',
  },

  // Day-specific trivia
  {
    id: 'day1',
    dayNumber: 1,
    category: 'artist_note',
    text: 'Day 1\'s "Vertical" theme explores the fundamental axis of human experience - how we stand, how buildings rise.',
  },
  {
    id: 'day3',
    dayNumber: 3,
    category: 'fun_fact',
    text: 'The number 42 is famous as "the answer to life, the universe, and everything" from Douglas Adams\' Hitchhiker\'s Guide.',
  },
  {
    id: 'day7',
    dayNumber: 7,
    category: 'technique',
    text: 'Day 7\'s boolean operation creates new shapes by combining, subtracting, or intersecting geometric forms.',
  },
  {
    id: 'day10',
    dayNumber: 10,
    category: 'history',
    text: 'Hex grids were popularized in games, but mathematicians have studied hexagonal tilings since ancient times.',
  },
  {
    id: 'day15',
    dayNumber: 15,
    category: 'technique',
    text: 'Isometric projection creates an illusion of 3D by drawing objects at 30-degree angles without perspective.',
  },
];

// ============================================================================
// Trivia System Creation
// ============================================================================

/**
 * Create the trivia system
 */
export function createTriviaSystem(container: HTMLElement): TriviaSystem {
  const system: TriviaSystem = {
    container,
    currentTrivia: null,
    shownIds: new Set(),
    indicator: null,
    cleanup: () => {
      hideTrivia(system);
    },
  };

  return system;
}

/**
 * Show random trivia
 */
export function showRandomTrivia(system: TriviaSystem, dayNumber?: number): void {
  // Filter trivia by day if specified
  let candidates = dayNumber
    ? TRIVIA.filter(t => !t.dayNumber || t.dayNumber === dayNumber)
    : TRIVIA;

  // Prefer unshown trivia
  const unshown = candidates.filter(t => !system.shownIds.has(t.id));
  if (unshown.length > 0) {
    candidates = unshown;
  } else {
    // Reset shown if all have been seen
    system.shownIds.clear();
  }

  // Pick random
  const trivia = candidates[Math.floor(Math.random() * candidates.length)];
  showTrivia(system, trivia);
}

/**
 * Show specific trivia
 */
export function showTrivia(system: TriviaSystem, trivia: TriviaItem): void {
  hideTrivia(system);

  system.currentTrivia = trivia;
  system.shownIds.add(trivia.id);

  const indicator = document.createElement('div');
  indicator.id = 'trivia-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 500px;
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(255, 200, 100, 0.3);
    border-radius: 12px;
    padding: 15px 20px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 500;
    opacity: 0;
    transition: opacity 0.3s;
    text-align: center;
  `;

  const categoryIcon = getCategoryIcon(trivia.category);
  const categoryLabel = getCategoryLabel(trivia.category);

  indicator.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 10px;
    ">
      <span style="font-size: 18px;">${categoryIcon}</span>
      <span style="font-size: 11px; color: #ffc864; text-transform: uppercase; letter-spacing: 1px;">
        ${categoryLabel}
      </span>
    </div>
    <div style="font-size: 13px; line-height: 1.5;">
      ${trivia.text}
    </div>
    ${trivia.dayNumber ? `
      <div style="font-size: 10px; color: #666; margin-top: 8px;">
        Day ${trivia.dayNumber}
      </div>
    ` : ''}
    <div style="
      margin-top: 10px;
      font-size: 10px;
      color: #666;
    ">
      Press any key to dismiss
    </div>
  `;

  system.container.appendChild(indicator);
  system.indicator = indicator;

  // Animate in
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
  });

  // Dismiss on any key
  const dismissHandler = () => {
    hideTrivia(system);
    document.removeEventListener('keydown', dismissHandler);
  };
  setTimeout(() => {
    document.addEventListener('keydown', dismissHandler);
  }, 500);

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    hideTrivia(system);
    document.removeEventListener('keydown', dismissHandler);
  }, 10000);
}

/**
 * Hide trivia
 */
export function hideTrivia(system: TriviaSystem): void {
  if (!system.indicator) return;

  system.indicator.style.opacity = '0';
  const indicator = system.indicator;

  setTimeout(() => {
    indicator.remove();
    if (system.indicator === indicator) {
      system.indicator = null;
    }
  }, 300);

  system.currentTrivia = null;
}

/**
 * Get category icon
 */
function getCategoryIcon(category: TriviaItem['category']): string {
  switch (category) {
    case 'technique': return '🔧';
    case 'history': return '📚';
    case 'fun_fact': return '💡';
    case 'artist_note': return '🎨';
    default: return '💭';
  }
}

/**
 * Get category label
 */
function getCategoryLabel(category: TriviaItem['category']): string {
  switch (category) {
    case 'technique': return 'Technique';
    case 'history': return 'History';
    case 'fun_fact': return 'Fun Fact';
    case 'artist_note': return 'Artist Note';
    default: return 'Trivia';
  }
}

/**
 * Get trivia for a specific day
 */
export function getDayTrivia(dayNumber: number): TriviaItem | undefined {
  return TRIVIA.find(t => t.dayNumber === dayNumber);
}

/**
 * Get all trivia count
 */
export function getTriviaCount(): number {
  return TRIVIA.length;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTriviaSystem(system: TriviaSystem): void {
  system.cleanup();
}
