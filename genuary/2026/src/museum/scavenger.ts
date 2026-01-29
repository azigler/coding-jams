/**
 * Scavenger Hunt
 *
 * Gives visitors missions to find specific exhibits based on clues.
 * Adds a game-like discovery element to exploration.
 */

// ============================================================================
// Types
// ============================================================================

export interface Hunt {
  id: string;
  name: string;
  description: string;
  clues: HuntClue[];
  reward: string;
}

export interface HuntClue {
  text: string;
  targetDay: number;
  hint?: string;
}

export interface HuntProgress {
  huntId: string;
  foundDays: Set<number>;
  completed: boolean;
  completedAt?: number;
}

export interface ScavengerSystem {
  container: HTMLElement;
  hunts: Hunt[];
  progress: Map<string, HuntProgress>;
  currentHunt: string | null;
  popup: HTMLElement | null;
  clueIndicator: HTMLElement | null;
  isOpen: boolean;
  onDayFound: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Hunt Definitions
// ============================================================================

const HUNTS: Hunt[] = [
  {
    id: 'shapes',
    name: 'Shape Hunter',
    description: 'Find exhibits featuring geometric shapes',
    clues: [
      { text: 'Find something that loops endlessly', targetDay: 7, hint: 'Think spirals' },
      { text: 'Find intersecting straight lines', targetDay: 12, hint: 'Grid patterns' },
      { text: 'Find perfect circles', targetDay: 15, hint: 'Round and round' },
    ],
    reward: '🔷 Geometry Master',
  },
  {
    id: 'colors',
    name: 'Color Quest',
    description: 'Discover the rainbow of generative art',
    clues: [
      { text: 'Find something predominantly blue', targetDay: 3, hint: 'Ocean vibes' },
      { text: 'Find warm sunset colors', targetDay: 8, hint: 'Orange and red' },
      { text: 'Find a monochrome piece', targetDay: 19, hint: 'Black and white' },
    ],
    reward: '🎨 Color Explorer',
  },
  {
    id: 'motion',
    name: 'Motion Detective',
    description: 'Track down the most dynamic pieces',
    clues: [
      { text: 'Find something that flows like water', targetDay: 5, hint: 'Fluid dynamics' },
      { text: 'Find particles in motion', targetDay: 11, hint: 'Tiny moving dots' },
      { text: 'Find a pulsing rhythm', targetDay: 22, hint: 'Like a heartbeat' },
    ],
    reward: '💫 Motion Master',
  },
  {
    id: 'nature',
    name: 'Nature Trail',
    description: 'Find art inspired by the natural world',
    clues: [
      { text: 'Find organic growth patterns', targetDay: 2, hint: 'Like plants' },
      { text: 'Find something celestial', targetDay: 17, hint: 'Stars and space' },
      { text: 'Find terrain or landscapes', targetDay: 25, hint: 'Mountains or valleys' },
    ],
    reward: '🌿 Nature Guide',
  },
  {
    id: 'abstract',
    name: 'Abstract Seeker',
    description: 'Discover the most abstract expressions',
    clues: [
      { text: 'Find pure noise', targetDay: 9, hint: 'Random chaos' },
      { text: 'Find mathematical beauty', targetDay: 14, hint: 'Formulas made visible' },
      { text: 'Find layered complexity', targetDay: 28, hint: 'Depth and overlap' },
    ],
    reward: '🌀 Abstract Expert',
  },
];

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-scavenger';

// ============================================================================
// Scavenger System Creation
// ============================================================================

/**
 * Create the scavenger hunt system
 */
export function createScavengerSystem(container: HTMLElement): ScavengerSystem {
  const savedProgress = loadProgress();

  const system: ScavengerSystem = {
    container,
    hunts: HUNTS,
    progress: savedProgress,
    currentHunt: null,
    popup: null,
    clueIndicator: null,
    isOpen: false,
    onDayFound: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
      if (system.clueIndicator) {
        system.clueIndicator.remove();
        system.clueIndicator = null;
      }
    },
  };

  // Open with Shift+H (Hunt)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyH' && event.shiftKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeScavenger(system);
      } else {
        openScavenger(system);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return system;
}

/**
 * Open the scavenger hunt menu
 */
export function openScavenger(system: ScavengerSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'scavenger-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    max-height: 70vh;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(74, 222, 128, 0.4);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  const completedCount = Array.from(system.progress.values()).filter(p => p.completed).length;

  popup.innerHTML = `
    <div style="
      padding: 20px;
      border-bottom: 1px solid rgba(74, 222, 128, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <h2 style="margin: 0; font-size: 18px; color: white;">🔍 Scavenger Hunts</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
          ${completedCount} of ${system.hunts.length} completed
        </p>
      </div>
      <button id="scavenger-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
      ">×</button>
    </div>

    <div id="scavenger-hunts" style="
      flex: 1;
      overflow-y: auto;
      padding: 15px 20px;
    ">
      ${system.hunts.map(hunt => {
        const progress = system.progress.get(hunt.id);
        const foundCount = progress?.foundDays.size || 0;
        const isCompleted = progress?.completed || false;
        const isActive = system.currentHunt === hunt.id;

        return `
          <div class="hunt-card" data-hunt="${hunt.id}" style="
            background: ${isActive ? 'rgba(74, 222, 128, 0.15)' : 'rgba(40, 40, 60, 0.5)'};
            border: 1px solid ${isCompleted ? 'rgba(74, 222, 128, 0.5)' : isActive ? 'rgba(74, 222, 128, 0.4)' : 'rgba(60, 60, 80, 0.5)'};
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: bold; color: white;">
                ${isCompleted ? '✓ ' : ''}${hunt.name}
              </div>
              <div style="font-size: 11px; color: ${isCompleted ? '#4ade80' : '#888'};">
                ${foundCount}/${hunt.clues.length}
              </div>
            </div>
            <div style="font-size: 12px; color: #888; margin-bottom: 10px;">
              ${hunt.description}
            </div>
            <div style="
              height: 4px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 2px;
              overflow: hidden;
            ">
              <div style="
                width: ${(foundCount / hunt.clues.length) * 100}%;
                height: 100%;
                background: ${isCompleted ? '#4ade80' : 'linear-gradient(90deg, #4ade80, #22c55e)'};
                transition: width 0.3s;
              "></div>
            </div>
            ${isCompleted ? `
              <div style="margin-top: 10px; font-size: 12px; color: #ffd700;">
                Reward: ${hunt.reward}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up interactions
  setTimeout(() => {
    const closeBtn = document.getElementById('scavenger-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeScavenger(system);
    }

    const huntCards = popup.querySelectorAll('.hunt-card');
    huntCards.forEach(card => {
      (card as HTMLElement).onmouseover = () => {
        if (!system.progress.get((card as HTMLElement).dataset.hunt || '')?.completed) {
          (card as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
        }
      };
      (card as HTMLElement).onmouseout = () => {
        const huntId = (card as HTMLElement).dataset.hunt || '';
        const isActive = system.currentHunt === huntId;
        (card as HTMLElement).style.background = isActive ? 'rgba(74, 222, 128, 0.15)' : 'rgba(40, 40, 60, 0.5)';
      };
      (card as HTMLElement).onclick = () => {
        const huntId = (card as HTMLElement).dataset.hunt || '';
        selectHunt(system, huntId);
      };
    });
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeScavenger(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Select a hunt to work on
 */
function selectHunt(system: ScavengerSystem, huntId: string): void {
  const hunt = system.hunts.find(h => h.id === huntId);
  if (!hunt) return;

  const progress = system.progress.get(huntId);
  if (progress?.completed) {
    // Already completed, just show details
    showHuntDetails(system, hunt);
    return;
  }

  system.currentHunt = huntId;

  // Initialize progress if needed
  if (!system.progress.has(huntId)) {
    system.progress.set(huntId, {
      huntId,
      foundDays: new Set(),
      completed: false,
    });
  }

  closeScavenger(system);
  showClueIndicator(system, hunt);
}

/**
 * Show hunt details (for completed hunts)
 */
function showHuntDetails(system: ScavengerSystem, hunt: Hunt): void {
  if (!system.popup) return;

  const huntsDiv = document.getElementById('scavenger-hunts');
  if (!huntsDiv) return;

  huntsDiv.innerHTML = `
    <button id="scavenger-back" style="
      background: rgba(100, 100, 120, 0.5);
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 15px;
    ">← Back to Hunts</button>

    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 40px; margin-bottom: 10px;">✓</div>
      <div style="font-size: 18px; color: white; font-weight: bold;">${hunt.name}</div>
      <div style="font-size: 14px; color: #4ade80; margin-top: 5px;">Completed!</div>
    </div>

    <div style="
      background: rgba(40, 40, 60, 0.5);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    ">
      <div style="font-size: 12px; color: #888; margin-bottom: 10px;">Clues Found:</div>
      ${hunt.clues.map(clue => `
        <div style="
          padding: 8px 0;
          border-bottom: 1px solid rgba(100, 100, 120, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="font-size: 12px; color: #c0c0c0;">${clue.text}</div>
          <div style="font-size: 11px; color: #4ade80;">Day ${clue.targetDay}</div>
        </div>
      `).join('')}
    </div>

    <div style="
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2));
      border: 1px solid rgba(255, 215, 0, 0.4);
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    ">
      <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Reward Earned</div>
      <div style="font-size: 16px; color: #ffd700;">${hunt.reward}</div>
    </div>
  `;

  setTimeout(() => {
    const backBtn = document.getElementById('scavenger-back');
    if (backBtn) {
      backBtn.onclick = () => {
        closeScavenger(system);
        openScavenger(system);
      };
    }
  }, 0);
}

/**
 * Show the current clue indicator
 */
function showClueIndicator(system: ScavengerSystem, hunt: Hunt): void {
  if (system.clueIndicator) {
    system.clueIndicator.remove();
  }

  const progress = system.progress.get(hunt.id);
  if (!progress) return;

  // Find next unfound clue
  const nextClue = hunt.clues.find(clue => !progress.foundDays.has(clue.targetDay));
  if (!nextClue) return;

  const indicator = document.createElement('div');
  indicator.id = 'scavenger-clue';
  indicator.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 15, 25, 0.95);
    border: 1px solid rgba(74, 222, 128, 0.4);
    border-radius: 10px;
    padding: 12px 20px;
    font-family: system-ui, sans-serif;
    z-index: 600;
    max-width: 400px;
    text-align: center;
  `;

  const foundCount = progress.foundDays.size;
  const totalCount = hunt.clues.length;

  indicator.innerHTML = `
    <div style="font-size: 10px; color: #4ade80; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
      🔍 ${hunt.name} (${foundCount}/${totalCount})
    </div>
    <div style="font-size: 13px; color: white; line-height: 1.4;">
      "${nextClue.text}"
    </div>
    <div style="font-size: 10px; color: #666; margin-top: 8px;">
      ${nextClue.hint ? `Hint: ${nextClue.hint}` : 'Find the exhibit that matches this clue'}
    </div>
    <button id="clue-abandon" style="
      margin-top: 10px;
      background: rgba(100, 100, 120, 0.5);
      border: none;
      border-radius: 4px;
      padding: 4px 12px;
      color: #888;
      font-size: 10px;
      cursor: pointer;
    ">Abandon Hunt</button>
  `;

  system.container.appendChild(indicator);
  system.clueIndicator = indicator;

  setTimeout(() => {
    const abandonBtn = document.getElementById('clue-abandon');
    if (abandonBtn) {
      abandonBtn.onclick = () => {
        system.currentHunt = null;
        if (system.clueIndicator) {
          system.clueIndicator.remove();
          system.clueIndicator = null;
        }
      };
    }
  }, 0);
}

/**
 * Check if a day discovery matches current hunt
 */
export function checkScavengerProgress(system: ScavengerSystem, dayNumber: number): boolean {
  if (!system.currentHunt) return false;

  const hunt = system.hunts.find(h => h.id === system.currentHunt);
  if (!hunt) return false;

  const progress = system.progress.get(system.currentHunt);
  if (!progress) return false;

  // Check if this day is a target
  const matchingClue = hunt.clues.find(c => c.targetDay === dayNumber && !progress.foundDays.has(dayNumber));
  if (!matchingClue) return false;

  // Found a clue!
  progress.foundDays.add(dayNumber);
  system.onDayFound?.(dayNumber);

  // Check if hunt is complete
  if (progress.foundDays.size >= hunt.clues.length) {
    progress.completed = true;
    progress.completedAt = Date.now();
    system.currentHunt = null;

    if (system.clueIndicator) {
      system.clueIndicator.remove();
      system.clueIndicator = null;
    }

    // Show completion celebration
    showHuntCompletion(system, hunt);
  } else {
    // Update clue indicator
    showClueIndicator(system, hunt);
  }

  saveProgress(system);
  return true;
}

/**
 * Show hunt completion celebration
 */
function showHuntCompletion(system: ScavengerSystem, hunt: Hunt): void {
  const overlay = document.createElement('div');
  overlay.id = 'scavenger-complete';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.5s;
  `;

  overlay.innerHTML = `
    <div style="
      text-align: center;
      transform: scale(0.5);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    " id="complete-content">
      <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
      <h2 style="
        font-family: system-ui, sans-serif;
        font-size: 24px;
        color: white;
        margin: 0 0 10px 0;
      ">Hunt Complete!</h2>
      <div style="
        font-family: system-ui, sans-serif;
        font-size: 16px;
        color: #4ade80;
        margin-bottom: 20px;
      ">${hunt.name}</div>
      <div style="
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.3));
        border: 1px solid rgba(255, 215, 0, 0.5);
        border-radius: 12px;
        padding: 20px 30px;
        margin-bottom: 25px;
      ">
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 12px;
          color: #888;
          margin-bottom: 5px;
        ">Reward Unlocked</div>
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 20px;
          color: #ffd700;
        ">${hunt.reward}</div>
      </div>
      <button id="complete-close" style="
        background: linear-gradient(135deg, #4ade80, #22c55e);
        border: none;
        border-radius: 20px;
        padding: 10px 30px;
        color: white;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
      ">Continue</button>
    </div>
  `;

  system.container.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    const content = document.getElementById('complete-content');
    if (content) {
      content.style.transform = 'scale(1)';
      content.style.opacity = '1';
    }
  });

  // Wire up close
  setTimeout(() => {
    const closeBtn = document.getElementById('complete-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
      };
    }
  }, 0);

  // Auto close after 8 seconds
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 8000);
}

/**
 * Close the scavenger menu
 */
export function closeScavenger(system: ScavengerSystem): void {
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
 * Get scavenger hunt stats
 */
export function getScavengerStats(system: ScavengerSystem): { completed: number; total: number } {
  const completed = Array.from(system.progress.values()).filter(p => p.completed).length;
  return { completed, total: system.hunts.length };
}

// ============================================================================
// Persistence
// ============================================================================

function loadProgress(): Map<string, HuntProgress> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as Array<{ huntId: string; foundDays: number[]; completed: boolean; completedAt?: number }>;
      const map = new Map<string, HuntProgress>();
      data.forEach(item => {
        map.set(item.huntId, {
          huntId: item.huntId,
          foundDays: new Set(item.foundDays),
          completed: item.completed,
          completedAt: item.completedAt,
        });
      });
      return map;
    }
  } catch {
    // localStorage may not be available
  }
  return new Map();
}

function saveProgress(system: ScavengerSystem): void {
  try {
    const data = Array.from(system.progress.values()).map(p => ({
      huntId: p.huntId,
      foundDays: Array.from(p.foundDays),
      completed: p.completed,
      completedAt: p.completedAt,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeScavengerSystem(system: ScavengerSystem): void {
  system.cleanup();
}
