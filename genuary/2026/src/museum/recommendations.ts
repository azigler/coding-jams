/**
 * Recommendations
 *
 * Personalized exhibit recommendations based on
 * visitor preferences and viewing history.
 */

// ============================================================================
// Types
// ============================================================================

export interface Recommendation {
  dayNumber: number;
  reason: string;
  score: number;
  category: 'similar' | 'popular' | 'unexplored' | 'favorite_related' | 'trending';
}

export interface RecommendationsSystem {
  container: HTMLElement;
  recommendations: Recommendation[];
  viewedDays: Set<number>;
  favoriteDays: Set<number>;
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Exhibit Metadata for Recommendations
// ============================================================================

interface ExhibitMetadata {
  dayNumber: number;
  tags: string[];
  style: string;
  complexity: 'simple' | 'medium' | 'complex';
  colorful: boolean;
  animated: boolean;
  interactive: boolean;
}

const EXHIBIT_METADATA: ExhibitMetadata[] = [
  { dayNumber: 1, tags: ['lines', 'vertical', 'minimal'], style: 'geometric', complexity: 'simple', colorful: false, animated: true, interactive: false },
  { dayNumber: 2, tags: ['layers', 'depth', 'overlapping'], style: 'abstract', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 3, tags: ['number', 'code', 'constraint'], style: 'conceptual', complexity: 'simple', colorful: false, animated: false, interactive: false },
  { dayNumber: 4, tags: ['monochrome', 'dark', 'subtle'], style: 'minimal', complexity: 'medium', colorful: false, animated: true, interactive: false },
  { dayNumber: 5, tags: ['isometric', '3d', 'geometric'], style: 'geometric', complexity: 'complex', colorful: true, animated: false, interactive: false },
  { dayNumber: 6, tags: ['landscape', 'nature', 'shapes'], style: 'representational', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 7, tags: ['boolean', 'shapes', 'combination'], style: 'geometric', complexity: 'medium', colorful: true, animated: true, interactive: true },
  { dayNumber: 8, tags: ['particles', 'quantity', 'dots'], style: 'particle', complexity: 'complex', colorful: true, animated: true, interactive: false },
  { dayNumber: 9, tags: ['textile', 'pattern', 'weave'], style: 'pattern', complexity: 'complex', colorful: true, animated: false, interactive: false },
  { dayNumber: 10, tags: ['hexagon', 'grid', 'tessellation'], style: 'geometric', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 11, tags: ['impossible', 'illusion', 'paradox'], style: 'optical', complexity: 'complex', colorful: true, animated: true, interactive: false },
  { dayNumber: 12, tags: ['subdivision', 'recursive', 'fractal'], style: 'geometric', complexity: 'complex', colorful: true, animated: true, interactive: true },
  { dayNumber: 13, tags: ['triangles', 'shapes', 'angular'], style: 'geometric', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 14, tags: ['monochrome', 'contrast', 'stark'], style: 'minimal', complexity: 'simple', colorful: false, animated: true, interactive: false },
  { dayNumber: 15, tags: ['rug', 'pattern', 'symmetry'], style: 'pattern', complexity: 'complex', colorful: true, animated: false, interactive: true },
  { dayNumber: 16, tags: ['reflection', 'mirror', 'recursive'], style: 'optical', complexity: 'complex', colorful: true, animated: true, interactive: false },
  { dayNumber: 17, tags: ['random', 'dice', 'probability'], style: 'data', complexity: 'medium', colorful: true, animated: true, interactive: true },
  { dayNumber: 18, tags: ['wind', 'flow', 'movement'], style: 'organic', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 19, tags: ['op-art', 'illusion', 'pattern'], style: 'optical', complexity: 'medium', colorful: false, animated: true, interactive: false },
  { dayNumber: 20, tags: ['typography', 'text', 'letters'], style: 'typography', complexity: 'medium', colorful: true, animated: true, interactive: true },
  { dayNumber: 21, tags: ['collision', 'physics', 'interaction'], style: 'simulation', complexity: 'complex', colorful: true, animated: true, interactive: true },
  { dayNumber: 22, tags: ['gradient', 'color', 'smooth'], style: 'color', complexity: 'simple', colorful: true, animated: true, interactive: false },
  { dayNumber: 23, tags: ['color', 'vibrant', 'rainbow'], style: 'color', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 24, tags: ['abstract', 'shapes', 'composition'], style: 'abstract', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 25, tags: ['line', 'continuous', 'path'], style: 'line', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 26, tags: ['symmetry', 'balance', 'mirror'], style: 'geometric', complexity: 'medium', colorful: true, animated: true, interactive: true },
  { dayNumber: 27, tags: ['deterministic', 'no-random', 'precise'], style: 'minimal', complexity: 'complex', colorful: false, animated: true, interactive: false },
  { dayNumber: 28, tags: ['infinite', 'scroll', 'continuous'], style: 'generative', complexity: 'complex', colorful: true, animated: true, interactive: true },
  { dayNumber: 29, tags: ['grid', 'cells', 'structure'], style: 'geometric', complexity: 'medium', colorful: true, animated: true, interactive: true },
  { dayNumber: 30, tags: ['emotion', 'abstract', 'feeling'], style: 'abstract', complexity: 'medium', colorful: true, animated: true, interactive: false },
  { dayNumber: 31, tags: ['celebration', 'finale', 'remix'], style: 'mixed', complexity: 'complex', colorful: true, animated: true, interactive: true },
];

// ============================================================================
// Recommendations System Creation
// ============================================================================

/**
 * Create the recommendations system
 */
export function createRecommendationsSystem(container: HTMLElement): RecommendationsSystem {
  const system: RecommendationsSystem = {
    container,
    recommendations: [],
    viewedDays: new Set(),
    favoriteDays: new Set(),
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closeRecommendationsPanel(system);
    },
  };

  return system;
}

/**
 * Update viewed days
 */
export function recordView(system: RecommendationsSystem, dayNumber: number): void {
  system.viewedDays.add(dayNumber);
  generateRecommendations(system);
}

/**
 * Update favorites
 */
export function recordFavoriteForRec(system: RecommendationsSystem, dayNumber: number): void {
  system.favoriteDays.add(dayNumber);
  generateRecommendations(system);
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(system: RecommendationsSystem): void {
  const recommendations: Recommendation[] = [];

  // Find unexplored exhibits
  const unexplored = EXHIBIT_METADATA.filter(e => !system.viewedDays.has(e.dayNumber));

  // Find similar to favorites
  if (system.favoriteDays.size > 0) {
    const favoriteTags = new Set<string>();
    const favoriteStyles = new Set<string>();

    system.favoriteDays.forEach(day => {
      const meta = EXHIBIT_METADATA.find(e => e.dayNumber === day);
      if (meta) {
        meta.tags.forEach(tag => favoriteTags.add(tag));
        favoriteStyles.add(meta.style);
      }
    });

    unexplored.forEach(exhibit => {
      const tagOverlap = exhibit.tags.filter(t => favoriteTags.has(t)).length;
      const styleMatch = favoriteStyles.has(exhibit.style) ? 1 : 0;
      const score = tagOverlap * 20 + styleMatch * 30;

      if (score > 20) {
        recommendations.push({
          dayNumber: exhibit.dayNumber,
          reason: `Similar to your favorites`,
          score,
          category: 'similar',
        });
      }
    });
  }

  // Add unexplored recommendations
  unexplored.slice(0, 5).forEach(exhibit => {
    if (!recommendations.find(r => r.dayNumber === exhibit.dayNumber)) {
      recommendations.push({
        dayNumber: exhibit.dayNumber,
        reason: 'Waiting to be discovered',
        score: 50 - system.viewedDays.size,
        category: 'unexplored',
      });
    }
  });

  // Add popular (interactive/complex ones)
  EXHIBIT_METADATA
    .filter(e => e.interactive && !system.viewedDays.has(e.dayNumber))
    .slice(0, 3)
    .forEach(exhibit => {
      if (!recommendations.find(r => r.dayNumber === exhibit.dayNumber)) {
        recommendations.push({
          dayNumber: exhibit.dayNumber,
          reason: 'Interactive experience',
          score: 60,
          category: 'popular',
        });
      }
    });

  // Sort by score
  recommendations.sort((a, b) => b.score - a.score);

  system.recommendations = recommendations.slice(0, 8);
}

/**
 * Get top recommendations
 */
export function getTopRecommendations(system: RecommendationsSystem, count: number = 5): Recommendation[] {
  if (system.recommendations.length === 0) {
    generateRecommendations(system);
  }
  return system.recommendations.slice(0, count);
}

/**
 * Open recommendations panel
 */
export function openRecommendationsPanel(system: RecommendationsSystem): void {
  closeRecommendationsPanel(system);

  system.isOpen = true;

  // Generate fresh recommendations
  generateRecommendations(system);

  const panel = document.createElement('div');
  panel.id = 'recommendations-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
    max-height: 550px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 150, 100, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 150, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          ✨ For You
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Personalized recommendations
        </div>
      </div>
      <button id="recommendations-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${system.recommendations.length === 0 ? `
        <div style="text-align: center; color: #666; padding: 30px;">
          View some exhibits to get personalized recommendations!
        </div>
      ` : system.recommendations.map(rec => {
        const meta = EXHIBIT_METADATA.find(e => e.dayNumber === rec.dayNumber);
        const categoryIcon = getCategoryIcon(rec.category);

        return `
          <div class="recommendation-item" data-day="${rec.dayNumber}" style="
            padding: 15px;
            background: rgba(255, 150, 100, 0.08);
            border: 1px solid transparent;
            border-radius: 10px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 45px;
                height: 45px;
                background: linear-gradient(135deg, rgba(255, 150, 100, 0.3), rgba(255, 200, 100, 0.2));
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: bold;
                color: #ffc864;
              ">${rec.dayNumber}</div>
              <div style="flex: 1;">
                <div style="font-size: 13px; color: white; font-weight: 500;">
                  Day ${rec.dayNumber}
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 2px; display: flex; align-items: center; gap: 5px;">
                  <span>${categoryIcon}</span>
                  <span>${rec.reason}</span>
                </div>
                ${meta ? `
                  <div style="font-size: 10px; color: #666; margin-top: 4px;">
                    ${meta.tags.slice(0, 3).join(' • ')}
                  </div>
                ` : ''}
              </div>
              <div style="color: #666; font-size: 16px;">→</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(255, 150, 100, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Based on ${system.viewedDays.size} viewed • ${system.favoriteDays.size} favorites
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#recommendations-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeRecommendationsPanel(system);

  // Wire up recommendation clicks
  const items = panel.querySelectorAll('.recommendation-item');
  items.forEach(item => {
    (item as HTMLElement).onmouseover = () => {
      (item as HTMLElement).style.background = 'rgba(255, 150, 100, 0.15)';
      (item as HTMLElement).style.borderColor = 'rgba(255, 150, 100, 0.3)';
    };
    (item as HTMLElement).onmouseout = () => {
      (item as HTMLElement).style.background = 'rgba(255, 150, 100, 0.08)';
      (item as HTMLElement).style.borderColor = 'transparent';
    };
    (item as HTMLElement).onclick = () => {
      const dayNumber = parseInt((item as HTMLElement).dataset.day || '0', 10);
      if (dayNumber && system.onNavigate) {
        closeRecommendationsPanel(system);
        system.onNavigate(dayNumber);
      }
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeRecommendationsPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Get category icon
 */
function getCategoryIcon(category: Recommendation['category']): string {
  switch (category) {
    case 'similar':
      return '💜';
    case 'popular':
      return '🔥';
    case 'unexplored':
      return '🆕';
    case 'favorite_related':
      return '❤️';
    case 'trending':
      return '📈';
    default:
      return '✨';
  }
}

/**
 * Close recommendations panel
 */
function closeRecommendationsPanel(system: RecommendationsSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Toggle recommendations panel
 */
export function toggleRecommendationsPanel(system: RecommendationsSystem): void {
  if (system.isOpen) {
    closeRecommendationsPanel(system);
  } else {
    openRecommendationsPanel(system);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeRecommendationsSystem(system: RecommendationsSystem): void {
  system.cleanup();
}
