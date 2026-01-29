/**
 * Related Exhibits
 *
 * Shows thematically related exhibits when viewing one.
 * Helps visitors discover connections between artworks.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExhibitRelation {
  dayNumber: number;
  relation: string; // e.g., "Similar colors", "Same technique"
  strength: number; // 0-1, how strongly related
}

export interface RelatedSystem {
  container: HTMLElement;
  panel: HTMLElement | null;
  currentDay: number;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Exhibit Themes and Relations
// ============================================================================

// Tag each exhibit with themes/techniques
const EXHIBIT_TAGS: Record<number, string[]> = {
  1: ['vertical', 'minimalist', 'lines', 'black-white'],
  2: ['layers', 'depth', 'animation', 'colors'],
  3: ['patterns', 'geometric', 'tiles', 'math'],
  4: ['dots', 'particles', 'minimalist', 'animation'],
  5: ['noise', 'organic', 'flow', 'animation'],
  6: ['3d', 'perspective', 'geometric', 'animation'],
  7: ['boolean', 'shapes', 'overlap', 'colors'],
  8: ['drawing', 'sketch', 'lines', 'organic'],
  9: ['pixels', 'retro', 'grid', 'colors'],
  10: ['growing', 'organic', 'nature', 'animation'],
  11: ['audio', 'reactive', 'visualization', 'animation'],
  12: ['impossible', 'illusion', 'geometric', '3d'],
  13: ['triangles', 'geometric', 'minimalist', 'patterns'],
  14: ['subdivide', 'recursive', 'patterns', 'math'],
  15: ['design', 'curves', 'smooth', 'animation'],
  16: ['palette', 'colors', 'harmony', 'minimalist'],
  17: ['what-if', 'experimental', 'abstract', 'animation'],
  18: ['wind', 'flow', 'particles', 'organic'],
  19: ['op-art', 'illusion', 'patterns', 'black-white'],
  20: ['23', 'numbers', 'abstract', 'experimental'],
  21: ['combine', 'shapes', 'collision', 'animation'],
  22: ['gradients', 'colors', 'smooth', 'minimalist'],
  23: ['more', 'maximalist', 'complex', 'animation'],
  24: ['less', 'minimalist', 'simple', 'zen'],
  25: ['portrait', 'face', 'generative', 'organic'],
  26: ['symmetry', 'mirror', 'patterns', 'geometric'],
  27: ['plants', 'nature', 'growth', 'organic'],
  28: ['skyline', 'architecture', 'urban', 'geometric'],
  29: ['grid', 'tiles', 'patterns', 'geometric'],
  30: ['math', 'abstract', 'procedural', 'animation'],
  31: ['random', 'chaos', 'experimental', 'surprise'],
};

// Special named connections
const NAMED_CONNECTIONS: Array<{
  days: [number, number];
  relation: string;
}> = [
  { days: [1, 4], relation: 'Both explore minimalism' },
  { days: [3, 29], relation: 'Both use grid patterns' },
  { days: [5, 18], relation: 'Both feature flow fields' },
  { days: [6, 12], relation: 'Both play with 3D perception' },
  { days: [7, 21], relation: 'Both combine geometric shapes' },
  { days: [10, 27], relation: 'Both simulate growth' },
  { days: [13, 26], relation: 'Both emphasize symmetry' },
  { days: [16, 22], relation: 'Both focus on color harmony' },
  { days: [19, 12], relation: 'Both create optical illusions' },
  { days: [23, 24], relation: 'Opposite approaches: more vs less' },
  { days: [9, 28], relation: 'Both use pixel aesthetics' },
  { days: [8, 25], relation: 'Both have organic, hand-drawn feel' },
];

// ============================================================================
// Related System Creation
// ============================================================================

/**
 * Create the related exhibits system
 */
export function createRelatedSystem(container: HTMLElement): RelatedSystem {
  const system: RelatedSystem = {
    container,
    panel: null,
    currentDay: 0,
    onNavigate: null,
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
 * Find related exhibits for a given day
 */
export function findRelated(dayNumber: number): ExhibitRelation[] {
  const related: ExhibitRelation[] = [];
  const sourceTags = EXHIBIT_TAGS[dayNumber] || [];

  if (sourceTags.length === 0) return [];

  // Check named connections first
  NAMED_CONNECTIONS.forEach(conn => {
    if (conn.days[0] === dayNumber || conn.days[1] === dayNumber) {
      const otherDay = conn.days[0] === dayNumber ? conn.days[1] : conn.days[0];
      related.push({
        dayNumber: otherDay,
        relation: conn.relation,
        strength: 1.0, // Named connections are strongest
      });
    }
  });

  // Calculate tag overlap with other days
  for (let other = 1; other <= 31; other++) {
    if (other === dayNumber) continue;
    // Skip if already in related from named connections
    if (related.some(r => r.dayNumber === other)) continue;

    const otherTags = EXHIBIT_TAGS[other] || [];
    if (otherTags.length === 0) continue;

    // Count shared tags
    const sharedTags = sourceTags.filter(tag => otherTags.includes(tag));
    if (sharedTags.length >= 2) {
      const strength = sharedTags.length / Math.max(sourceTags.length, otherTags.length);

      // Generate relation description
      let relation = '';
      if (sharedTags.includes('geometric')) {
        relation = 'Geometric exploration';
      } else if (sharedTags.includes('organic')) {
        relation = 'Organic aesthetics';
      } else if (sharedTags.includes('minimalist')) {
        relation = 'Minimalist approach';
      } else if (sharedTags.includes('animation')) {
        relation = 'Dynamic animation';
      } else if (sharedTags.includes('colors')) {
        relation = 'Color focused';
      } else if (sharedTags.includes('patterns')) {
        relation = 'Pattern-based';
      } else if (sharedTags.includes('math')) {
        relation = 'Mathematical concepts';
      } else {
        relation = `Shares: ${sharedTags.slice(0, 2).join(', ')}`;
      }

      related.push({
        dayNumber: other,
        relation,
        strength,
      });
    }
  }

  // Sort by strength and limit to top 5
  related.sort((a, b) => b.strength - a.strength);
  return related.slice(0, 5);
}

/**
 * Show the related exhibits panel
 */
export function showRelated(system: RelatedSystem, dayNumber: number): void {
  hideRelated(system);

  const related = findRelated(dayNumber);
  if (related.length === 0) return;

  system.currentDay = dayNumber;

  const panel = document.createElement('div');
  panel.id = 'related-panel';
  panel.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 180px;
    background: rgba(15, 15, 25, 0.95);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 12px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      font-size: 12px;
      color: #888;
    ">
      Related to Day ${dayNumber}
    </div>
    <div style="padding: 8px; max-height: 300px; overflow-y: auto;">
      ${related.map(r => `
        <div class="related-item" data-day="${r.dayNumber}" style="
          padding: 8px 10px;
          margin-bottom: 6px;
          background: rgba(40, 40, 60, 0.5);
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(74, 158, 255, 0.3)'"
           onmouseout="this.style.background='rgba(40, 40, 60, 0.5)'">
          <div style="font-size: 13px; font-weight: bold; color: white;">
            Day ${r.dayNumber}
          </div>
          <div style="font-size: 10px; color: #888; margin-top: 2px;">
            ${r.relation}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up clicks
  setTimeout(() => {
    const items = panel.querySelectorAll('.related-item');
    items.forEach(item => {
      (item as HTMLElement).onclick = () => {
        const day = parseInt((item as HTMLElement).dataset.day || '0', 10);
        if (day > 0 && system.onNavigate) {
          system.onNavigate(day);
        }
      };
    });
  }, 0);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (system.panel === panel && system.currentDay === dayNumber) {
      hideRelated(system);
    }
  }, 10000);
}

/**
 * Hide the related panel
 */
export function hideRelated(system: RelatedSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);

  system.currentDay = 0;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeRelatedSystem(system: RelatedSystem): void {
  system.cleanup();
}
