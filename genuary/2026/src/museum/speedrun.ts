/**
 * Speed Run Challenge
 *
 * A timed challenge to view all 31 exhibits as fast as possible.
 * Tracks personal best times and shows live progress.
 */

// ============================================================================
// Types
// ============================================================================

export interface SpeedRunSystem {
  container: HTMLElement;
  isActive: boolean;
  startTime: number;
  exhibitsViewed: Set<number>;
  personalBest: number | null;
  timerElement: HTMLElement | null;
  progressElement: HTMLElement | null;
  startPrompt: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const TOTAL_EXHIBITS = 31;
const STORAGE_KEY = 'genuary-museum-speedrun-pb';

// ============================================================================
// Speed Run System Creation
// ============================================================================

/**
 * Create the speed run system
 */
export function createSpeedRunSystem(container: HTMLElement): SpeedRunSystem {
  const savedPB = loadPersonalBest();

  const system: SpeedRunSystem = {
    container,
    isActive: false,
    startTime: 0,
    exhibitsViewed: new Set(),
    personalBest: savedPB,
    timerElement: null,
    progressElement: null,
    startPrompt: null,
    cleanup: () => {
      if (system.timerElement) {
        system.timerElement.remove();
        system.timerElement = null;
      }
      if (system.progressElement) {
        system.progressElement.remove();
        system.progressElement = null;
      }
      if (system.startPrompt) {
        system.startPrompt.remove();
        system.startPrompt = null;
      }
    },
  };

  // Toggle with Shift+R
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyR' && event.shiftKey) {
      event.preventDefault();
      if (system.isActive) {
        cancelSpeedRun(system);
      } else {
        showStartPrompt(system);
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
 * Show the start prompt dialog
 */
function showStartPrompt(system: SpeedRunSystem): void {
  if (system.startPrompt) return;

  const prompt = document.createElement('div');
  prompt.id = 'speedrun-start';
  prompt.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(15, 15, 25, 0.98);
    border: 2px solid rgba(255, 100, 100, 0.5);
    border-radius: 16px;
    padding: 30px 40px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    text-align: center;
    min-width: 320px;
  `;

  const pbText = system.personalBest
    ? `<div style="margin: 15px 0; color: #ffd700;">Personal Best: ${formatTime(system.personalBest)}</div>`
    : '';

  prompt.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 10px;">🏃 Speed Run Challenge</div>
    <div style="font-size: 14px; color: #888; margin-bottom: 15px;">
      View all 31 exhibits as fast as you can!
    </div>
    ${pbText}
    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
      The timer starts when you view your first exhibit.<br>
      Press Shift+R to cancel at any time.
    </div>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="speedrun-cancel" style="
        background: rgba(100, 100, 120, 0.5);
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        color: white;
        font-size: 14px;
        cursor: pointer;
      ">Cancel</button>
      <button id="speedrun-start-btn" style="
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        color: white;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
      ">Start Challenge</button>
    </div>
  `;

  system.container.appendChild(prompt);
  system.startPrompt = prompt;

  // Wire up buttons
  setTimeout(() => {
    const cancelBtn = document.getElementById('speedrun-cancel');
    const startBtn = document.getElementById('speedrun-start-btn');

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        prompt.remove();
        system.startPrompt = null;
      };
    }

    if (startBtn) {
      startBtn.onclick = () => {
        prompt.remove();
        system.startPrompt = null;
        startSpeedRun(system);
      };
    }
  }, 0);
}

/**
 * Start the speed run
 */
export function startSpeedRun(system: SpeedRunSystem): void {
  if (system.isActive) return;

  system.isActive = true;
  system.startTime = 0; // Will be set on first exhibit view
  system.exhibitsViewed = new Set();

  // Create timer display
  const timer = document.createElement('div');
  timer.id = 'speedrun-timer';
  timer.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    background: rgba(15, 15, 25, 0.95);
    border: 2px solid rgba(255, 100, 100, 0.6);
    border-radius: 12px;
    padding: 15px 20px;
    font-family: 'Courier New', monospace;
    color: #ff6b6b;
    z-index: 800;
    text-align: center;
    min-width: 140px;
  `;

  timer.innerHTML = `
    <div style="font-size: 10px; color: #888; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Speed Run</div>
    <div id="speedrun-time" style="font-size: 28px; font-weight: bold;">0:00.0</div>
    <div id="speedrun-progress" style="font-size: 12px; color: #888; margin-top: 5px;">0 / ${TOTAL_EXHIBITS}</div>
    <div style="
      margin-top: 10px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    ">
      <div id="speedrun-bar" style="
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #ff6b6b, #ff8e53);
        transition: width 0.3s;
      "></div>
    </div>
  `;

  system.container.appendChild(timer);
  system.timerElement = timer;

  // Start timer update loop
  startTimerLoop(system);
}

/**
 * Cancel the speed run
 */
export function cancelSpeedRun(system: SpeedRunSystem): void {
  if (!system.isActive) return;

  system.isActive = false;

  if (system.timerElement) {
    system.timerElement.remove();
    system.timerElement = null;
  }
}

/**
 * Record an exhibit view during speed run
 */
export function recordSpeedRunExhibit(system: SpeedRunSystem, dayNumber: number): void {
  if (!system.isActive) return;
  if (system.exhibitsViewed.has(dayNumber)) return;

  // Start timer on first exhibit
  if (system.exhibitsViewed.size === 0) {
    system.startTime = Date.now();
  }

  system.exhibitsViewed.add(dayNumber);

  // Update progress display
  updateSpeedRunProgress(system);

  // Check for completion
  if (system.exhibitsViewed.size >= TOTAL_EXHIBITS) {
    completeSpeedRun(system);
  }
}

/**
 * Update the progress display
 */
function updateSpeedRunProgress(system: SpeedRunSystem): void {
  const progressEl = document.getElementById('speedrun-progress');
  const barEl = document.getElementById('speedrun-bar');

  if (progressEl) {
    progressEl.textContent = `${system.exhibitsViewed.size} / ${TOTAL_EXHIBITS}`;
  }

  if (barEl) {
    const percent = (system.exhibitsViewed.size / TOTAL_EXHIBITS) * 100;
    barEl.style.width = `${percent}%`;
  }
}

/**
 * Start the timer update loop
 */
function startTimerLoop(system: SpeedRunSystem): void {
  const update = () => {
    if (!system.isActive) return;

    const timeEl = document.getElementById('speedrun-time');
    if (timeEl) {
      if (system.startTime === 0) {
        timeEl.textContent = '0:00.0';
      } else {
        const elapsed = Date.now() - system.startTime;
        timeEl.textContent = formatTime(elapsed);
      }
    }

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

/**
 * Complete the speed run
 */
function completeSpeedRun(system: SpeedRunSystem): void {
  const finalTime = Date.now() - system.startTime;
  const isNewRecord = !system.personalBest || finalTime < system.personalBest;

  if (isNewRecord) {
    system.personalBest = finalTime;
    savePersonalBest(finalTime);
  }

  system.isActive = false;

  // Show completion overlay
  showCompletionOverlay(system, finalTime, isNewRecord);

  // Remove timer display
  if (system.timerElement) {
    system.timerElement.remove();
    system.timerElement = null;
  }
}

/**
 * Show completion overlay
 */
function showCompletionOverlay(system: SpeedRunSystem, time: number, isNewRecord: boolean): void {
  const overlay = document.createElement('div');
  overlay.id = 'speedrun-complete';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.5s;
  `;

  const recordHTML = isNewRecord
    ? `<div style="
        font-size: 18px;
        color: #ffd700;
        margin-top: 10px;
        animation: pulse 1s ease-in-out infinite;
      ">🏆 NEW PERSONAL BEST! 🏆</div>`
    : `<div style="
        font-size: 14px;
        color: #888;
        margin-top: 10px;
      ">Personal Best: ${formatTime(system.personalBest!)}</div>`;

  overlay.innerHTML = `
    <div style="
      text-align: center;
      transform: scale(0.5);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    " id="speedrun-content">
      <div style="font-size: 60px; margin-bottom: 10px;">🏃💨</div>
      <h1 style="
        font-family: system-ui, sans-serif;
        font-size: 32px;
        color: white;
        margin: 0;
      ">CHALLENGE COMPLETE!</h1>
      <div style="
        font-family: 'Courier New', monospace;
        font-size: 48px;
        color: #ff6b6b;
        margin: 20px 0;
      ">${formatTime(time)}</div>
      ${recordHTML}
      <button id="speedrun-close" style="
        margin-top: 30px;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        border: none;
        border-radius: 25px;
        padding: 12px 40px;
        color: white;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
      ">Continue</button>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    </style>
  `;

  system.container.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    const content = document.getElementById('speedrun-content');
    if (content) {
      content.style.transform = 'scale(1)';
      content.style.opacity = '1';
    }
  });

  // Wire up close button
  setTimeout(() => {
    const closeBtn = document.getElementById('speedrun-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
      };
    }
  }, 0);

  // Auto-close after 10 seconds
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 10000);
}

/**
 * Format time in MM:SS.D format
 */
function formatTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds * 10) % 10);

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Check if speed run is active
 */
export function isSpeedRunActive(system: SpeedRunSystem): boolean {
  return system.isActive;
}

/**
 * Get personal best time
 */
export function getPersonalBest(system: SpeedRunSystem): number | null {
  return system.personalBest;
}

// ============================================================================
// Persistence
// ============================================================================

function loadPersonalBest(): number | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return parseInt(saved, 10);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function savePersonalBest(time: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, time.toString());
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSpeedRunSystem(system: SpeedRunSystem): void {
  system.cleanup();
}
