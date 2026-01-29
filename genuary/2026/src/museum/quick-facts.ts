/**
 * Quick Facts
 *
 * Shows brief interesting facts when hovering near exhibits.
 * Like a mini audio guide without audio.
 */

// ============================================================================
// Types
// ============================================================================

export interface QuickFact {
  dayNumber: number;
  facts: string[];
}

export interface QuickFactsSystem {
  container: HTMLElement;
  currentTooltip: HTMLElement | null;
  currentDay: number | null;
  factIndex: number;
  enabled: boolean;
  cleanup: () => void;
}

// ============================================================================
// Facts Data
// ============================================================================

const EXHIBIT_FACTS: QuickFact[] = [
  {
    dayNumber: 1,
    facts: [
      'The constraint: only vertical or horizontal lines',
      'No diagonals allowed in this piece',
      'Mondrian would approve',
    ],
  },
  {
    dayNumber: 2,
    facts: [
      'Built layer upon layer upon layer',
      'Each layer adds depth to the composition',
      'Like geological strata made of code',
    ],
  },
  {
    dayNumber: 3,
    facts: [
      'Exactly 42 lines of code',
      'The answer to life, the universe, and everything',
      'Every character counts',
    ],
  },
  {
    dayNumber: 4,
    facts: [
      'Black on black - subtle variations',
      'Look closer to see the hidden forms',
      'Inspired by Ad Reinhardt',
    ],
  },
  {
    dayNumber: 5,
    facts: [
      'Isometric projection - no rotation needed',
      '30-degree angles create the illusion of 3D',
      'Popular in retro video games',
    ],
  },
  {
    dayNumber: 6,
    facts: [
      'A landscape from primitive shapes only',
      'Circles, rectangles, and triangles',
      'Simplicity creates complexity',
    ],
  },
  {
    dayNumber: 7,
    facts: [
      'The digit 7 appears in the code',
      'Find it in the patterns',
      'A lucky number for January 7th',
    ],
  },
  {
    dayNumber: 8,
    facts: [
      'One million objects rendered',
      'Would take 11.5 days to count by hand',
      'The power of computational art',
    ],
  },
  {
    dayNumber: 9,
    facts: [
      'Inspired by textile arts',
      'Weaving, knitting, embroidery patterns',
      'Ancient craft meets modern code',
    ],
  },
  {
    dayNumber: 10,
    facts: [
      'Uses TAU (2π) instead of PI',
      'TAU = 6.28318... for full circles',
      'The Tau Manifesto lives on',
    ],
  },
  {
    dayNumber: 11,
    facts: [
      'The impossible challenge',
      'Attempts to satisfy ALL 31 prompts',
      'How many can you identify?',
    ],
  },
  {
    dayNumber: 12,
    facts: [
      'Recursive subdivision',
      'Splitting space infinitely',
      'Order emerges from division',
    ],
  },
  {
    dayNumber: 13,
    facts: [
      'Only triangles allowed',
      'The most stable geometric shape',
      'Three sides, infinite possibilities',
    ],
  },
  {
    dayNumber: 14,
    facts: [
      'Pure black and white',
      'No gray values permitted',
      'Maximum contrast, maximum impact',
    ],
  },
  {
    dayNumber: 15,
    facts: [
      'Designed as a rug pattern',
      'Functional art you could walk on',
      'Generative textiles',
    ],
  },
  {
    dayNumber: 16,
    facts: [
      'Colors from a favorite film',
      'Cinema inspires code',
      'Can you guess the movie?',
    ],
  },
  {
    dayNumber: 17,
    facts: [
      'What does wind look like?',
      'Invisible forces made visible',
      'Flow fields and turbulence',
    ],
  },
  {
    dayNumber: 18,
    facts: [
      'The opposite of... what?',
      'Interpretation is personal',
      'Art in contradiction',
    ],
  },
  {
    dayNumber: 19,
    facts: [
      'Op Art - optical illusions',
      'Your brain is being tricked',
      'Movement from stillness',
    ],
  },
  {
    dayNumber: 20,
    facts: [
      'Generative typography',
      'Letters that write themselves',
      'The alphabet reimagined',
    ],
  },
  {
    dayNumber: 21,
    facts: [
      'Collision detection in action',
      'Objects know their boundaries',
      'Physics simulation basics',
    ],
  },
  {
    dayNumber: 22,
    facts: [
      'Gradients only - no flat colors',
      'Smooth transitions everywhere',
      'The mathematics of color blending',
    ],
  },
  {
    dayNumber: 23,
    facts: [
      'More than 5 colors required',
      'A rainbow of possibilities',
      'Breaking the minimalist mold',
    ],
  },
  {
    dayNumber: 24,
    facts: [
      'Geometric abstraction',
      'Pure form, pure color',
      'In the tradition of Kandinsky',
    ],
  },
  {
    dayNumber: 25,
    facts: [
      'One extremely long line',
      'A journey without lifting the pen',
      'Continuous path, complex form',
    ],
  },
  {
    dayNumber: 26,
    facts: [
      'Perfect symmetry',
      'Balance and reflection',
      'Nature loves symmetry',
    ],
  },
  {
    dayNumber: 27,
    facts: [
      'No randomness allowed',
      'Every pixel is deterministic',
      'Pure mathematical beauty',
    ],
  },
  {
    dayNumber: 28,
    facts: [
      'Infinite scroll',
      'Content that never ends',
      'The modern attention trap',
    ],
  },
  {
    dayNumber: 29,
    facts: [
      'Grid-based composition',
      'Order and structure',
      'The foundation of design',
    ],
  },
  {
    dayNumber: 30,
    facts: [
      'Abstract emotion',
      'Feelings in pixels',
      'Can code feel?',
    ],
  },
  {
    dayNumber: 31,
    facts: [
      'Celebration!',
      'The end of Genuary',
      'Until next January...',
    ],
  },
];

// ============================================================================
// Quick Facts System Creation
// ============================================================================

/**
 * Create the quick facts system
 */
export function createQuickFactsSystem(container: HTMLElement): QuickFactsSystem {
  const system: QuickFactsSystem = {
    container,
    currentTooltip: null,
    currentDay: null,
    factIndex: 0,
    enabled: true,
    cleanup: () => {
      if (system.currentTooltip) {
        system.currentTooltip.remove();
        system.currentTooltip = null;
      }
    },
  };

  return system;
}

/**
 * Show a quick fact for an exhibit
 */
export function showQuickFact(system: QuickFactsSystem, dayNumber: number, x: number, y: number): void {
  if (!system.enabled) return;

  // If same day, cycle through facts
  if (system.currentDay === dayNumber && system.currentTooltip) {
    system.factIndex = (system.factIndex + 1) % 3;
  } else {
    system.factIndex = 0;
    system.currentDay = dayNumber;
  }

  // Remove existing tooltip
  hideQuickFact(system);

  // Get fact for this day
  const exhibitFact = EXHIBIT_FACTS.find(f => f.dayNumber === dayNumber);
  if (!exhibitFact) return;

  const fact = exhibitFact.facts[system.factIndex];

  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'quick-fact-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -100%) translateY(-10px);
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(74, 158, 255, 0.4);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #e0e0e0;
    max-width: 250px;
    z-index: 800;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  `;

  tooltip.innerHTML = `
    <div style="display: flex; align-items: start; gap: 8px;">
      <span style="color: #4a9eff; font-size: 14px;">💡</span>
      <div>
        <div style="font-size: 10px; color: #888; margin-bottom: 4px;">Day ${dayNumber}</div>
        <div style="line-height: 1.4;">${fact}</div>
      </div>
    </div>
  `;

  system.container.appendChild(tooltip);
  system.currentTooltip = tooltip;

  // Fade in
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
  });
}

/**
 * Hide the current quick fact
 */
export function hideQuickFact(system: QuickFactsSystem): void {
  if (!system.currentTooltip) return;

  const tooltip = system.currentTooltip;
  tooltip.style.opacity = '0';

  setTimeout(() => {
    tooltip.remove();
    if (system.currentTooltip === tooltip) {
      system.currentTooltip = null;
    }
  }, 200);
}

/**
 * Toggle quick facts on/off
 */
export function toggleQuickFacts(system: QuickFactsSystem): void {
  system.enabled = !system.enabled;
  if (!system.enabled) {
    hideQuickFact(system);
  }
}

/**
 * Get all facts for a specific day
 */
export function getFactsForDay(dayNumber: number): string[] {
  const exhibitFact = EXHIBIT_FACTS.find(f => f.dayNumber === dayNumber);
  return exhibitFact?.facts || [];
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeQuickFactsSystem(system: QuickFactsSystem): void {
  system.cleanup();
}
