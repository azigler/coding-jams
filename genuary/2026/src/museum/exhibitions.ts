/**
 * Exhibitions
 *
 * Special themed exhibitions that group exhibits
 * by topic, style, or time period.
 */

// ============================================================================
// Types
// ============================================================================

export interface Exhibition {
  id: string;
  name: string;
  description: string;
  curator: string;
  startDate: string;
  endDate?: string;
  exhibits: number[];
  theme: {
    primaryColor: string;
    accentColor: string;
    icon: string;
  };
  featured: boolean;
}

export interface ExhibitionsSystem {
  container: HTMLElement;
  exhibitions: Exhibition[];
  currentExhibition: Exhibition | null;
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Exhibition Definitions
// ============================================================================

const EXHIBITIONS: Exhibition[] = [
  {
    id: 'geometric',
    name: 'Geometric Visions',
    description: 'Exploring the beauty of mathematical shapes and patterns',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [5, 7, 10, 12, 13, 24, 26, 29],
    theme: {
      primaryColor: '#4a9eff',
      accentColor: '#a855f7',
      icon: '📐',
    },
    featured: true,
  },
  {
    id: 'monochrome',
    name: 'Shades of Silence',
    description: 'The power of black, white, and everything in between',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [4, 14, 27],
    theme: {
      primaryColor: '#888888',
      accentColor: '#ffffff',
      icon: '⬛',
    },
    featured: false,
  },
  {
    id: 'nature',
    name: 'Digital Nature',
    description: 'Nature-inspired generative art',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [6, 9, 17, 18],
    theme: {
      primaryColor: '#64c896',
      accentColor: '#98d8aa',
      icon: '🌿',
    },
    featured: true,
  },
  {
    id: 'typography',
    name: 'Type & Form',
    description: 'The intersection of text and visual art',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [3, 20],
    theme: {
      primaryColor: '#ff8c42',
      accentColor: '#ffc864',
      icon: '🔤',
    },
    featured: false,
  },
  {
    id: 'optical',
    name: 'Optical Illusions',
    description: 'Mind-bending visual experiences',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [11, 16, 19],
    theme: {
      primaryColor: '#ff6b6b',
      accentColor: '#ffc0cb',
      icon: '👁️',
    },
    featured: true,
  },
  {
    id: 'layers',
    name: 'Depth & Layers',
    description: 'Exploring depth through overlapping elements',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [1, 2, 15, 22],
    theme: {
      primaryColor: '#9b59b6',
      accentColor: '#d4a5ff',
      icon: '📚',
    },
    featured: false,
  },
  {
    id: 'random',
    name: 'Controlled Chaos',
    description: 'The art of randomness and probability',
    curator: 'Digital Curator',
    startDate: '2026-01-01',
    exhibits: [8, 17, 25],
    theme: {
      primaryColor: '#e74c3c',
      accentColor: '#ff7675',
      icon: '🎲',
    },
    featured: false,
  },
];

// ============================================================================
// Exhibitions System Creation
// ============================================================================

/**
 * Create the exhibitions system
 */
export function createExhibitionsSystem(container: HTMLElement): ExhibitionsSystem {
  const system: ExhibitionsSystem = {
    container,
    exhibitions: EXHIBITIONS,
    currentExhibition: null,
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closeExhibitionsPanel(system);
    },
  };

  return system;
}

/**
 * Get featured exhibitions
 */
export function getFeaturedExhibitions(system: ExhibitionsSystem): Exhibition[] {
  return system.exhibitions.filter(e => e.featured);
}

/**
 * Get exhibition by ID
 */
export function getExhibition(system: ExhibitionsSystem, id: string): Exhibition | undefined {
  return system.exhibitions.find(e => e.id === id);
}

/**
 * Start viewing an exhibition
 */
export function startExhibition(system: ExhibitionsSystem, exhibitionId: string): boolean {
  const exhibition = system.exhibitions.find(e => e.id === exhibitionId);
  if (!exhibition || exhibition.exhibits.length === 0) return false;

  system.currentExhibition = exhibition;

  // Navigate to first exhibit
  if (system.onNavigate) {
    system.onNavigate(exhibition.exhibits[0]);
  }

  showExhibitionBanner(system, exhibition);
  return true;
}

/**
 * Show exhibition banner
 */
function showExhibitionBanner(system: ExhibitionsSystem, exhibition: Exhibition): void {
  const banner = document.createElement('div');
  banner.id = 'exhibition-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, ${exhibition.theme.primaryColor}40, ${exhibition.theme.accentColor}40);
    border-bottom: 2px solid ${exhibition.theme.primaryColor};
    padding: 15px 20px;
    font-family: system-ui, sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 600;
    opacity: 0;
    transform: translateY(-100%);
    transition: all 0.4s;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="font-size: 28px;">${exhibition.theme.icon}</span>
      <div>
        <div style="font-size: 14px; font-weight: bold; color: white;">
          ${exhibition.name}
        </div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.7);">
          ${exhibition.exhibits.length} exhibits • Curated by ${exhibition.curator}
        </div>
      </div>
    </div>
    <button id="exit-exhibition" style="
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      padding: 8px 15px;
      color: white;
      font-size: 11px;
      cursor: pointer;
    ">Exit Exhibition</button>
  `;

  system.container.appendChild(banner);

  // Animate in
  requestAnimationFrame(() => {
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';
  });

  // Wire up exit
  const exitBtn = banner.querySelector('#exit-exhibition') as HTMLButtonElement;
  exitBtn.onclick = () => {
    endExhibition(system);
  };
}

/**
 * End current exhibition
 */
export function endExhibition(system: ExhibitionsSystem): void {
  system.currentExhibition = null;

  const banner = document.getElementById('exhibition-banner');
  if (banner) {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-100%)';
    setTimeout(() => banner.remove(), 400);
  }
}

/**
 * Get next exhibit in current exhibition
 */
export function getNextExhibitInExhibition(system: ExhibitionsSystem, currentDay: number): number | null {
  if (!system.currentExhibition) return null;

  const index = system.currentExhibition.exhibits.indexOf(currentDay);
  if (index === -1 || index >= system.currentExhibition.exhibits.length - 1) {
    return system.currentExhibition.exhibits[0]; // Loop to start
  }

  return system.currentExhibition.exhibits[index + 1];
}

/**
 * Get previous exhibit in current exhibition
 */
export function getPrevExhibitInExhibition(system: ExhibitionsSystem, currentDay: number): number | null {
  if (!system.currentExhibition) return null;

  const index = system.currentExhibition.exhibits.indexOf(currentDay);
  if (index === -1 || index <= 0) {
    return system.currentExhibition.exhibits[system.currentExhibition.exhibits.length - 1]; // Loop to end
  }

  return system.currentExhibition.exhibits[index - 1];
}

/**
 * Open exhibitions panel
 */
export function openExhibitionsPanel(system: ExhibitionsSystem): void {
  closeExhibitionsPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'exhibitions-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    max-height: 600px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(200, 150, 255, 0.3);
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

  const featured = getFeaturedExhibitions(system);
  const other = system.exhibitions.filter(e => !e.featured);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(200, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          🏛️ Special Exhibitions
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Curated collections of related works
        </div>
      </div>
      <button id="exhibitions-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${featured.length > 0 ? `
        <div style="font-size: 11px; color: #c8a0ff; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
          Featured
        </div>
        ${featured.map(ex => renderExhibitionCard(ex, system.currentExhibition?.id === ex.id)).join('')}
      ` : ''}

      ${other.length > 0 ? `
        <div style="font-size: 11px; color: #888; margin: 15px 0 10px; text-transform: uppercase; letter-spacing: 1px;">
          All Exhibitions
        </div>
        ${other.map(ex => renderExhibitionCard(ex, system.currentExhibition?.id === ex.id)).join('')}
      ` : ''}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#exhibitions-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeExhibitionsPanel(system);

  // Wire up exhibition cards
  const cards = panel.querySelectorAll('.exhibition-card');
  cards.forEach(card => {
    (card as HTMLElement).onclick = () => {
      const id = (card as HTMLElement).dataset.id || '';
      closeExhibitionsPanel(system);
      startExhibition(system, id);
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeExhibitionsPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Render an exhibition card
 */
function renderExhibitionCard(exhibition: Exhibition, isActive: boolean): string {
  return `
    <div class="exhibition-card" data-id="${exhibition.id}" style="
      padding: 15px;
      background: linear-gradient(135deg, ${exhibition.theme.primaryColor}20, ${exhibition.theme.accentColor}10);
      border: 2px solid ${isActive ? exhibition.theme.primaryColor : 'transparent'};
      border-radius: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    ">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <span style="font-size: 32px;">${exhibition.theme.icon}</span>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: bold; color: white;">
            ${exhibition.name}
            ${isActive ? '<span style="color: #64c896; margin-left: 8px;">● Active</span>' : ''}
          </div>
          <div style="font-size: 12px; color: #b0b0b0; margin-top: 4px;">
            ${exhibition.description}
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 8px;">
            ${exhibition.exhibits.length} exhibits
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Close exhibitions panel
 */
function closeExhibitionsPanel(system: ExhibitionsSystem): void {
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
 * Toggle exhibitions panel
 */
export function toggleExhibitionsPanel(system: ExhibitionsSystem): void {
  if (system.isOpen) {
    closeExhibitionsPanel(system);
  } else {
    openExhibitionsPanel(system);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeExhibitionsSystem(system: ExhibitionsSystem): void {
  system.cleanup();
}
