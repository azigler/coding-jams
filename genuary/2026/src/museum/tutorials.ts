/**
 * Tutorials
 *
 * Interactive tutorials for new visitors.
 * Guide users through museum features step by step.
 */

// ============================================================================
// Types
// ============================================================================

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  action?: 'click' | 'key' | 'move' | 'wait';
  actionKey?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
}

export interface TutorialsSystem {
  container: HTMLElement;
  tutorials: Tutorial[];
  currentTutorial: Tutorial | null;
  currentStepIndex: number;
  overlay: HTMLElement | null;
  tooltip: HTMLElement | null;
  completedTutorials: Set<string>;
  isActive: boolean;
  onComplete: ((tutorialId: string) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Tutorial Definitions
// ============================================================================

const TUTORIALS: Tutorial[] = [
  {
    id: 'basics',
    name: 'Museum Basics',
    description: 'Learn how to navigate and explore',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to the Museum!',
        description: 'This tutorial will teach you the basics of exploring the Genuary 2026 Virtual Museum.',
        position: 'center',
      },
      {
        id: 'movement',
        title: 'Moving Around',
        description: 'Use WASD or arrow keys to walk around the museum. Try moving forward now!',
        position: 'bottom',
        action: 'key',
        actionKey: 'KeyW',
      },
      {
        id: 'looking',
        title: 'Looking Around',
        description: 'Click and drag to look around, or use your mouse to rotate the view.',
        position: 'center',
        action: 'move',
      },
      {
        id: 'exhibits',
        title: 'Viewing Exhibits',
        description: 'Walk up to any artwork and click on it to view it up close.',
        position: 'center',
        action: 'click',
      },
      {
        id: 'exit',
        title: 'Exiting View',
        description: 'Press Escape or click outside to exit the exhibit view.',
        position: 'center',
        action: 'key',
        actionKey: 'Escape',
      },
      {
        id: 'complete',
        title: 'Tutorial Complete!',
        description: 'You now know the basics. Explore more features in the Help menu (H key).',
        position: 'center',
      },
    ],
  },
  {
    id: 'features',
    name: 'Museum Features',
    description: 'Discover powerful features',
    steps: [
      {
        id: 'intro',
        title: 'Advanced Features',
        description: "Let's explore some powerful features that enhance your museum experience.",
        position: 'center',
      },
      {
        id: 'favorites',
        title: 'Favorites',
        description: 'Press F while viewing an exhibit to add it to your favorites.',
        position: 'center',
        action: 'key',
        actionKey: 'KeyF',
      },
      {
        id: 'screenshot',
        title: 'Screenshots',
        description: 'Press S while viewing to take a screenshot of the artwork.',
        position: 'center',
        action: 'key',
        actionKey: 'KeyS',
      },
      {
        id: 'minimap',
        title: 'Minimap',
        description: 'The minimap in the corner shows your location. Click it to toggle size.',
        position: 'bottom',
        targetSelector: '#minimap',
        highlight: true,
      },
      {
        id: 'search',
        title: 'Quick Search',
        description: 'Press / to open quick search and find any exhibit by name or number.',
        position: 'center',
        action: 'key',
        actionKey: 'Slash',
      },
      {
        id: 'complete',
        title: 'Features Unlocked!',
        description: 'There are many more features to discover. Press H for the full help menu.',
        position: 'center',
      },
    ],
  },
  {
    id: 'social',
    name: 'Social Features',
    description: 'Share your experience',
    steps: [
      {
        id: 'intro',
        title: 'Social Features',
        description: 'The museum has many ways to share and remember your visit.',
        position: 'center',
      },
      {
        id: 'gallery',
        title: 'Photo Gallery',
        description: 'Press G to view all your screenshots in a personal gallery.',
        position: 'center',
        action: 'key',
        actionKey: 'KeyG',
      },
      {
        id: 'badges',
        title: 'Badges',
        description: 'Press B to view your badges. Earn them by exploring!',
        position: 'center',
        action: 'key',
        actionKey: 'KeyB',
      },
      {
        id: 'leaderboard',
        title: 'Leaderboard',
        description: 'Press L to see how you rank against other visitors.',
        position: 'center',
        action: 'key',
        actionKey: 'KeyL',
      },
      {
        id: 'complete',
        title: 'Stay Connected!',
        description: 'Keep visiting to climb the leaderboard and earn all badges.',
        position: 'center',
      },
    ],
  },
];

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-tutorials';

// ============================================================================
// Tutorials System Creation
// ============================================================================

/**
 * Create the tutorials system
 */
export function createTutorialsSystem(container: HTMLElement): TutorialsSystem {
  const completed = loadCompletedTutorials();

  const system: TutorialsSystem = {
    container,
    tutorials: TUTORIALS,
    currentTutorial: null,
    currentStepIndex: 0,
    overlay: null,
    tooltip: null,
    completedTutorials: new Set(completed),
    isActive: false,
    onComplete: null,
    cleanup: () => {
      endTutorial(system);
    },
  };

  return system;
}

/**
 * Check if should show first-time tutorial
 */
export function shouldShowFirstTimeTutorial(system: TutorialsSystem): boolean {
  return !system.completedTutorials.has('basics');
}

/**
 * Start a tutorial
 */
export function startTutorial(system: TutorialsSystem, tutorialId: string): boolean {
  const tutorial = system.tutorials.find(t => t.id === tutorialId);
  if (!tutorial) return false;

  endTutorial(system);

  system.currentTutorial = tutorial;
  system.currentStepIndex = 0;
  system.isActive = true;

  showCurrentStep(system);
  return true;
}

/**
 * Show current step
 */
function showCurrentStep(system: TutorialsSystem): void {
  if (!system.currentTutorial) return;

  const step = system.currentTutorial.steps[system.currentStepIndex];
  if (!step) {
    completeTutorial(system);
    return;
  }

  // Remove existing tooltip
  if (system.tooltip) {
    system.tooltip.remove();
    system.tooltip = null;
  }

  // Create or update overlay
  if (!system.overlay) {
    system.overlay = document.createElement('div');
    system.overlay.id = 'tutorial-overlay';
    system.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 950;
      pointer-events: none;
    `;
    system.container.appendChild(system.overlay);
  }

  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'tutorial-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(15, 15, 25, 0.98);
    border: 2px solid rgba(100, 200, 255, 0.5);
    border-radius: 12px;
    padding: 20px;
    max-width: 320px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 960;
    pointer-events: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  `;

  // Position tooltip
  const positions: Record<string, string> = {
    center: 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
    top: 'top: 20%; left: 50%; transform: translateX(-50%);',
    bottom: 'bottom: 20%; left: 50%; transform: translateX(-50%);',
    left: 'top: 50%; left: 20%; transform: translateY(-50%);',
    right: 'top: 50%; right: 20%; transform: translateY(-50%);',
  };
  tooltip.style.cssText += positions[step.position] || positions.center;

  const progress = `${system.currentStepIndex + 1} / ${system.currentTutorial.steps.length}`;
  const isLastStep = system.currentStepIndex === system.currentTutorial.steps.length - 1;

  tooltip.innerHTML = `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    ">
      <div style="font-size: 11px; color: #64c8ff;">Step ${progress}</div>
      <button id="tutorial-skip" style="
        background: none;
        border: none;
        color: #666;
        font-size: 11px;
        cursor: pointer;
      ">Skip tutorial</button>
    </div>
    <div style="font-size: 16px; font-weight: bold; color: white; margin-bottom: 8px;">
      ${step.title}
    </div>
    <div style="font-size: 13px; color: #b0b0b0; line-height: 1.5; margin-bottom: 15px;">
      ${step.description}
    </div>
    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      ${system.currentStepIndex > 0 ? `
        <button id="tutorial-back" style="
          padding: 8px 16px;
          background: rgba(100, 100, 100, 0.3);
          border: none;
          border-radius: 6px;
          color: #888;
          font-size: 12px;
          cursor: pointer;
        ">Back</button>
      ` : ''}
      <button id="tutorial-next" style="
        padding: 8px 20px;
        background: rgba(100, 200, 255, 0.3);
        border: 1px solid rgba(100, 200, 255, 0.5);
        border-radius: 6px;
        color: #64c8ff;
        font-size: 12px;
        cursor: pointer;
        font-weight: bold;
      ">${isLastStep ? 'Finish' : 'Next →'}</button>
    </div>
  `;

  system.container.appendChild(tooltip);
  system.tooltip = tooltip;

  // Wire up buttons
  const skipBtn = tooltip.querySelector('#tutorial-skip') as HTMLButtonElement;
  const backBtn = tooltip.querySelector('#tutorial-back') as HTMLButtonElement;
  const nextBtn = tooltip.querySelector('#tutorial-next') as HTMLButtonElement;

  skipBtn.onclick = () => endTutorial(system);
  if (backBtn) backBtn.onclick = () => previousStep(system);
  nextBtn.onclick = () => nextStep(system);

  // Highlight target if specified
  if (step.targetSelector && step.highlight) {
    const target = document.querySelector(step.targetSelector) as HTMLElement;
    if (target) {
      target.style.position = 'relative';
      target.style.zIndex = '955';
      target.style.boxShadow = '0 0 0 4px rgba(100, 200, 255, 0.5), 0 0 20px rgba(100, 200, 255, 0.3)';
    }
  }

  // Set up action listener if needed
  if (step.action) {
    setupActionListener(system, step);
  }
}

/**
 * Set up listener for step action
 */
function setupActionListener(system: TutorialsSystem, step: TutorialStep): void {
  if (step.action === 'key' && step.actionKey) {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === step.actionKey) {
        document.removeEventListener('keydown', keyHandler);
        setTimeout(() => nextStep(system), 300);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }
}

/**
 * Go to next step
 */
export function nextStep(system: TutorialsSystem): void {
  if (!system.currentTutorial) return;

  system.currentStepIndex++;

  if (system.currentStepIndex >= system.currentTutorial.steps.length) {
    completeTutorial(system);
  } else {
    showCurrentStep(system);
  }
}

/**
 * Go to previous step
 */
export function previousStep(system: TutorialsSystem): void {
  if (!system.currentTutorial || system.currentStepIndex <= 0) return;

  system.currentStepIndex--;
  showCurrentStep(system);
}

/**
 * Complete current tutorial
 */
function completeTutorial(system: TutorialsSystem): void {
  if (!system.currentTutorial) return;

  const tutorialId = system.currentTutorial.id;
  system.completedTutorials.add(tutorialId);
  saveCompletedTutorials(Array.from(system.completedTutorials));

  system.onComplete?.(tutorialId);
  endTutorial(system);

  // Show completion notification
  showCompletionNotification(system, tutorialId);
}

/**
 * Show completion notification
 */
function showCompletionNotification(system: TutorialsSystem, tutorialId: string): void {
  const tutorial = system.tutorials.find(t => t.id === tutorialId);
  if (!tutorial) return;

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 40, 30, 0.95);
    border: 1px solid rgba(100, 200, 150, 0.4);
    border-radius: 10px;
    padding: 15px 25px;
    font-family: system-ui, sans-serif;
    z-index: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  notification.innerHTML = `
    <span style="font-size: 24px;">✅</span>
    <div>
      <div style="font-size: 13px; font-weight: bold; color: #64c896;">
        Tutorial Complete!
      </div>
      <div style="font-size: 11px; color: #888; margin-top: 2px;">
        ${tutorial.name}
      </div>
    </div>
  `;

  system.container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
  });

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * End tutorial without completing
 */
export function endTutorial(system: TutorialsSystem): void {
  system.isActive = false;
  system.currentTutorial = null;
  system.currentStepIndex = 0;

  if (system.overlay) {
    system.overlay.remove();
    system.overlay = null;
  }

  if (system.tooltip) {
    system.tooltip.remove();
    system.tooltip = null;
  }
}

/**
 * Open tutorial selection panel
 */
export function openTutorialPanel(system: TutorialsSystem): void {
  const panel = document.createElement('div');
  panel.id = 'tutorial-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(100, 200, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          📚 Tutorials
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Learn museum features
        </div>
      </div>
      <button id="tutorial-panel-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px;">
      ${system.tutorials.map(tutorial => {
        const isComplete = system.completedTutorials.has(tutorial.id);
        return `
          <div class="tutorial-option" data-id="${tutorial.id}" style="
            padding: 15px;
            background: rgba(100, 200, 255, 0.05);
            border: 1px solid ${isComplete ? 'rgba(100, 200, 150, 0.3)' : 'transparent'};
            border-radius: 10px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">${isComplete ? '✅' : '📖'}</span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: bold; color: white;">
                  ${tutorial.name}
                </div>
                <div style="font-size: 11px; color: #888; margin-top: 2px;">
                  ${tutorial.description} • ${tutorial.steps.length} steps
                </div>
              </div>
              ${isComplete ? '' : '<span style="color: #64c8ff;">Start →</span>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  system.container.appendChild(panel);

  // Wire up close
  const closeBtn = panel.querySelector('#tutorial-panel-close') as HTMLButtonElement;
  closeBtn.onclick = () => panel.remove();

  // Wire up tutorial options
  const options = panel.querySelectorAll('.tutorial-option');
  options.forEach(option => {
    (option as HTMLElement).onmouseover = () => {
      (option as HTMLElement).style.background = 'rgba(100, 200, 255, 0.1)';
    };
    (option as HTMLElement).onmouseout = () => {
      (option as HTMLElement).style.background = 'rgba(100, 200, 255, 0.05)';
    };
    (option as HTMLElement).onclick = () => {
      const tutorialId = (option as HTMLElement).dataset.id || '';
      panel.remove();
      startTutorial(system, tutorialId);
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      panel.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Check if tutorial is completed
 */
export function isTutorialCompleted(system: TutorialsSystem, tutorialId: string): boolean {
  return system.completedTutorials.has(tutorialId);
}

/**
 * Get completed tutorials count
 */
export function getCompletedTutorialsCount(system: TutorialsSystem): number {
  return system.completedTutorials.size;
}

// ============================================================================
// Persistence
// ============================================================================

function loadCompletedTutorials(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveCompletedTutorials(tutorialIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tutorialIds));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTutorialsSystem(system: TutorialsSystem): void {
  system.cleanup();
}
