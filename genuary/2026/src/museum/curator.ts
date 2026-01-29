/**
 * Curator
 *
 * A guided tour system with virtual curator commentary.
 * Provides context and insights about exhibits.
 */

// ============================================================================
// Types
// ============================================================================

export interface CuratorComment {
  dayNumber: number;
  intro: string;
  technique: string;
  appreciation: string;
}

export interface CuratorTour {
  id: string;
  name: string;
  description: string;
  stops: number[];
  comments: Map<number, string>;
}

export interface CuratorSystem {
  container: HTMLElement;
  isActive: boolean;
  currentTour: CuratorTour | null;
  currentStopIndex: number;
  commentPanel: HTMLElement | null;
  tourPanel: HTMLElement | null;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Curator Comments Data
// ============================================================================

const CURATOR_COMMENTS: CuratorComment[] = [
  {
    dayNumber: 1,
    intro: "Welcome to Day 1, where we explore verticality.",
    technique: "This piece uses vertical lines to create rhythm and movement.",
    appreciation: "Notice how the eye is drawn upward, evoking growth and aspiration.",
  },
  {
    dayNumber: 2,
    intro: "Day 2 invites us to layer complexity.",
    technique: "Multiple transparent layers create depth and interaction.",
    appreciation: "The interplay of layers suggests hidden connections beneath the surface.",
  },
  {
    dayNumber: 3,
    intro: "Here we celebrate the number 42 - the answer to everything.",
    technique: "The composition is built around the number 42 in various ways.",
    appreciation: "A playful nod to Douglas Adams that connects art and culture.",
  },
  {
    dayNumber: 7,
    intro: "Boolean operations reveal new forms through combination.",
    technique: "Shapes are merged, subtracted, and intersected algorithmically.",
    appreciation: "Digital sculpting that honors both mathematics and aesthetics.",
  },
  {
    dayNumber: 10,
    intro: "The hexagon - nature's preferred tessellation.",
    technique: "Hexagonal grids create organic yet structured patterns.",
    appreciation: "From honeycombs to basalt columns, this shape resonates with natural order.",
  },
  {
    dayNumber: 15,
    intro: "Isometric projection: 3D without perspective.",
    technique: "Objects are rendered at consistent 30-degree angles.",
    appreciation: "A visual language borrowed from technical drawing and video games.",
  },
];

// Pre-defined tours
const DEFAULT_TOURS: Omit<CuratorTour, 'comments'>[] = [
  {
    id: 'highlights',
    name: 'Museum Highlights',
    description: 'Our most celebrated pieces',
    stops: [1, 7, 10, 15, 21],
  },
  {
    id: 'techniques',
    name: 'Technique Showcase',
    description: 'Understanding the methods behind the art',
    stops: [2, 5, 9, 12, 18],
  },
  {
    id: 'journey',
    name: 'Complete Journey',
    description: 'Experience every exhibit in order',
    stops: Array.from({ length: 31 }, (_, i) => i + 1),
  },
];

// ============================================================================
// Curator System Creation
// ============================================================================

/**
 * Create the curator system
 */
export function createCuratorSystem(container: HTMLElement): CuratorSystem {
  const system: CuratorSystem = {
    container,
    isActive: false,
    currentTour: null,
    currentStopIndex: 0,
    commentPanel: null,
    tourPanel: null,
    onNavigate: null,
    cleanup: () => {
      hideCuratorComment(system);
      closeTourPanel(system);
    },
  };

  return system;
}

/**
 * Get curator comment for a day
 */
export function getCuratorComment(dayNumber: number): CuratorComment | undefined {
  return CURATOR_COMMENTS.find(c => c.dayNumber === dayNumber);
}

/**
 * Show curator comment for current exhibit
 */
export function showCuratorComment(system: CuratorSystem, dayNumber: number): void {
  hideCuratorComment(system);

  const comment = getCuratorComment(dayNumber);
  const genericComments = [
    "Each piece in this collection represents a moment of creative exploration.",
    "Observe how algorithms can produce unexpected beauty.",
    "The interplay of code and creativity is on full display here.",
  ];

  const panel = document.createElement('div');
  panel.id = 'curator-comment';
  panel.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 320px;
    background: rgba(25, 20, 15, 0.98);
    border: 2px solid rgba(180, 150, 100, 0.4);
    border-radius: 12px;
    font-family: 'Georgia', serif;
    color: #e8e0d0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.4s;
    overflow: hidden;
  `;

  const introText = comment?.intro || genericComments[dayNumber % genericComments.length];
  const techniqueText = comment?.technique || "A unique algorithmic approach creates this visual experience.";
  const appreciationText = comment?.appreciation || "Take a moment to observe the details and let the piece speak to you.";

  panel.innerHTML = `
    <div style="
      padding: 15px;
      background: linear-gradient(135deg, rgba(180, 150, 100, 0.15), transparent);
      border-bottom: 1px solid rgba(180, 150, 100, 0.2);
    ">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 28px;">🎩</span>
        <div>
          <div style="font-size: 14px; font-weight: bold; color: #c4a060;">
            The Curator
          </div>
          <div style="font-size: 11px; color: #888;">
            Day ${dayNumber}
          </div>
        </div>
      </div>
    </div>

    <div style="padding: 15px;">
      <div style="font-size: 14px; font-style: italic; line-height: 1.6; margin-bottom: 12px;">
        "${introText}"
      </div>

      <div style="font-size: 12px; color: #b0a090; line-height: 1.5; margin-bottom: 10px;">
        <strong style="color: #c4a060;">Technique:</strong> ${techniqueText}
      </div>

      <div style="font-size: 12px; color: #b0a090; line-height: 1.5;">
        <strong style="color: #c4a060;">Appreciation:</strong> ${appreciationText}
      </div>
    </div>

    ${system.currentTour ? `
      <div style="
        padding: 10px 15px;
        background: rgba(180, 150, 100, 0.1);
        border-top: 1px solid rgba(180, 150, 100, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="font-size: 11px; color: #888;">
          Stop ${system.currentStopIndex + 1} of ${system.currentTour.stops.length}
        </span>
        <div style="display: flex; gap: 8px;">
          <button id="curator-prev" style="
            background: rgba(180, 150, 100, 0.2);
            border: 1px solid rgba(180, 150, 100, 0.3);
            border-radius: 4px;
            padding: 5px 10px;
            color: #c4a060;
            font-size: 11px;
            cursor: pointer;
          ">◀ Prev</button>
          <button id="curator-next" style="
            background: rgba(180, 150, 100, 0.2);
            border: 1px solid rgba(180, 150, 100, 0.3);
            border-radius: 4px;
            padding: 5px 10px;
            color: #c4a060;
            font-size: 11px;
            cursor: pointer;
          ">Next ▶</button>
        </div>
      </div>
    ` : ''}

    <div style="
      padding: 8px 15px;
      border-top: 1px solid rgba(180, 150, 100, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Press G to dismiss • Shift+G for tours
    </div>
  `;

  system.container.appendChild(panel);
  system.commentPanel = panel;
  system.isActive = true;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up tour navigation
  if (system.currentTour) {
    const prevBtn = panel.querySelector('#curator-prev') as HTMLButtonElement;
    const nextBtn = panel.querySelector('#curator-next') as HTMLButtonElement;

    if (prevBtn) prevBtn.onclick = () => curatorPrev(system);
    if (nextBtn) nextBtn.onclick = () => curatorNext(system);
  }
}

/**
 * Hide curator comment
 */
export function hideCuratorComment(system: CuratorSystem): void {
  if (!system.commentPanel) return;

  system.commentPanel.style.opacity = '0';
  const panel = system.commentPanel;

  setTimeout(() => {
    panel.remove();
    if (system.commentPanel === panel) {
      system.commentPanel = null;
    }
  }, 400);

  system.isActive = false;
}

/**
 * Toggle curator comment
 */
export function toggleCuratorComment(system: CuratorSystem, dayNumber: number): void {
  if (system.isActive) {
    hideCuratorComment(system);
  } else {
    showCuratorComment(system, dayNumber);
  }
}

/**
 * Open tour selection panel
 */
export function openTourPanel(system: CuratorSystem): void {
  closeTourPanel(system);

  const panel = document.createElement('div');
  panel.id = 'curator-tour-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    background: rgba(25, 20, 15, 0.98);
    border: 2px solid rgba(180, 150, 100, 0.4);
    border-radius: 16px;
    font-family: 'Georgia', serif;
    color: #e8e0d0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(180, 150, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: #c4a060;">
          🎩 Guided Tours
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Let the curator guide you
        </div>
      </div>
      <button id="tour-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px;">
      ${DEFAULT_TOURS.map(tour => `
        <div class="tour-item" data-id="${tour.id}" style="
          padding: 15px;
          background: rgba(180, 150, 100, 0.1);
          border: 1px solid transparent;
          border-radius: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="font-size: 14px; font-weight: bold; color: #c4a060;">
            ${tour.name}
          </div>
          <div style="font-size: 12px; color: #b0a090; margin-top: 5px;">
            ${tour.description}
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 5px;">
            ${tour.stops.length} stops
          </div>
        </div>
      `).join('')}
    </div>

    ${system.currentTour ? `
      <div style="
        padding: 10px 15px;
        border-top: 1px solid rgba(180, 150, 100, 0.2);
        background: rgba(255, 100, 100, 0.1);
      ">
        <button id="end-tour" style="
          width: 100%;
          padding: 10px;
          background: rgba(255, 100, 100, 0.2);
          border: 1px solid rgba(255, 100, 100, 0.3);
          border-radius: 8px;
          color: #ff8080;
          font-size: 12px;
          cursor: pointer;
        ">End Current Tour</button>
      </div>
    ` : ''}
  `;

  system.container.appendChild(panel);
  system.tourPanel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#tour-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeTourPanel(system);

  // Wire up tour items
  const tourItems = panel.querySelectorAll('.tour-item');
  tourItems.forEach(item => {
    (item as HTMLElement).onmouseover = () => {
      (item as HTMLElement).style.background = 'rgba(180, 150, 100, 0.2)';
      (item as HTMLElement).style.borderColor = 'rgba(180, 150, 100, 0.3)';
    };
    (item as HTMLElement).onmouseout = () => {
      (item as HTMLElement).style.background = 'rgba(180, 150, 100, 0.1)';
      (item as HTMLElement).style.borderColor = 'transparent';
    };
    (item as HTMLElement).onclick = () => {
      const id = (item as HTMLElement).dataset.id || '';
      startTour(system, id);
      closeTourPanel(system);
    };
  });

  // Wire up end tour
  const endBtn = panel.querySelector('#end-tour') as HTMLButtonElement;
  if (endBtn) {
    endBtn.onclick = () => {
      endTour(system);
      closeTourPanel(system);
    };
  }

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeTourPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close tour panel
 */
function closeTourPanel(system: CuratorSystem): void {
  if (!system.tourPanel) return;

  system.tourPanel.style.opacity = '0';
  const panel = system.tourPanel;

  setTimeout(() => {
    panel.remove();
    if (system.tourPanel === panel) {
      system.tourPanel = null;
    }
  }, 300);
}

/**
 * Start a guided tour
 */
export function startTour(system: CuratorSystem, tourId: string): boolean {
  const tourData = DEFAULT_TOURS.find(t => t.id === tourId);
  if (!tourData) return false;

  system.currentTour = {
    ...tourData,
    comments: new Map(),
  };
  system.currentStopIndex = 0;

  // Navigate to first stop
  if (system.onNavigate && system.currentTour.stops.length > 0) {
    system.onNavigate(system.currentTour.stops[0]);
  }

  return true;
}

/**
 * End current tour
 */
export function endTour(system: CuratorSystem): void {
  system.currentTour = null;
  system.currentStopIndex = 0;
  hideCuratorComment(system);
}

/**
 * Go to next stop on tour
 */
export function curatorNext(system: CuratorSystem): number | null {
  if (!system.currentTour) return null;

  system.currentStopIndex++;
  if (system.currentStopIndex >= system.currentTour.stops.length) {
    system.currentStopIndex = 0; // Loop
  }

  const dayNumber = system.currentTour.stops[system.currentStopIndex];
  if (system.onNavigate) {
    system.onNavigate(dayNumber);
  }

  return dayNumber;
}

/**
 * Go to previous stop on tour
 */
export function curatorPrev(system: CuratorSystem): number | null {
  if (!system.currentTour) return null;

  system.currentStopIndex--;
  if (system.currentStopIndex < 0) {
    system.currentStopIndex = system.currentTour.stops.length - 1;
  }

  const dayNumber = system.currentTour.stops[system.currentStopIndex];
  if (system.onNavigate) {
    system.onNavigate(dayNumber);
  }

  return dayNumber;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeCuratorSystem(system: CuratorSystem): void {
  system.cleanup();
}
