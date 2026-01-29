/**
 * Daily Challenge
 *
 * A rotating daily challenge that gives visitors a themed objective.
 * New challenge each day, rewards for completion.
 */

// ============================================================================
// Types
// ============================================================================

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  checkProgress: (context: ChallengeContext) => number;
  reward: string;
}

export interface ChallengeContext {
  exhibitsViewed: Set<number>;
  favoritesCount: number;
  screenshotsTaken: number;
  journalEntriesCount: number;
  timeSpent: number;
  distanceWalked: number;
}

export interface ChallengeProgress {
  challengeId: string;
  date: string;
  completed: boolean;
  progress: number;
  completedAt?: number;
}

export interface ChallengeSystem {
  container: HTMLElement;
  currentChallenge: DailyChallenge | null;
  progress: ChallengeProgress | null;
  indicator: HTMLElement | null;
  popup: HTMLElement | null;
  isOpen: boolean;
  streak: number;
  totalCompleted: number;
  cleanup: () => void;
}

// ============================================================================
// Challenge Definitions
// ============================================================================

const CHALLENGES: DailyChallenge[] = [
  {
    id: 'explorer',
    title: 'Art Explorer',
    description: 'View 10 different exhibits today',
    icon: '🔭',
    targetCount: 10,
    checkProgress: (ctx) => ctx.exhibitsViewed.size,
    reward: 'Explorer Badge',
  },
  {
    id: 'collector',
    title: 'Art Collector',
    description: 'Add 3 exhibits to your favorites',
    icon: '💎',
    targetCount: 3,
    checkProgress: (ctx) => ctx.favoritesCount,
    reward: 'Collector Badge',
  },
  {
    id: 'photographer',
    title: 'Museum Photographer',
    description: 'Take 5 screenshots of exhibits',
    icon: '📸',
    targetCount: 5,
    checkProgress: (ctx) => ctx.screenshotsTaken,
    reward: 'Photographer Badge',
  },
  {
    id: 'curator',
    title: 'Junior Curator',
    description: 'Write journal notes for 3 exhibits',
    icon: '✍️',
    targetCount: 3,
    checkProgress: (ctx) => ctx.journalEntriesCount,
    reward: 'Curator Badge',
  },
  {
    id: 'wanderer',
    title: 'Museum Wanderer',
    description: 'Spend 15 minutes exploring',
    icon: '🚶',
    targetCount: 15 * 60 * 1000, // 15 minutes in ms
    checkProgress: (ctx) => ctx.timeSpent,
    reward: 'Wanderer Badge',
  },
  {
    id: 'marathon',
    title: 'Art Marathon',
    description: 'View 20 exhibits in one session',
    icon: '🏃',
    targetCount: 20,
    checkProgress: (ctx) => ctx.exhibitsViewed.size,
    reward: 'Marathon Badge',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'View all exhibits in one wing',
    icon: '✅',
    targetCount: 8,
    checkProgress: (ctx) => ctx.exhibitsViewed.size, // Simplified
    reward: 'Completionist Badge',
  },
];

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-challenge';

// ============================================================================
// Challenge System Creation
// ============================================================================

/**
 * Create the challenge system
 */
export function createChallengeSystem(container: HTMLElement): ChallengeSystem {
  const saved = loadChallengeState();

  // Get today's challenge
  const todayChallenge = getTodayChallenge();

  // Check if progress is from today
  const today = new Date().toISOString().split('T')[0];
  let progress = saved.progress;
  if (!progress || progress.date !== today) {
    progress = {
      challengeId: todayChallenge.id,
      date: today,
      completed: false,
      progress: 0,
    };
  }

  const system: ChallengeSystem = {
    container,
    currentChallenge: todayChallenge,
    progress,
    indicator: null,
    popup: null,
    isOpen: false,
    streak: saved.streak,
    totalCompleted: saved.totalCompleted,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Create indicator
  createChallengeIndicator(system);

  // Toggle with Shift+D (Daily)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyD' && event.shiftKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeChallenge(system);
      } else {
        openChallenge(system);
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
 * Get today's challenge based on date
 */
function getTodayChallenge(): DailyChallenge {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % CHALLENGES.length;
  return CHALLENGES[index];
}

/**
 * Create the challenge indicator
 */
function createChallengeIndicator(system: ChallengeSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'challenge-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 140px;
    right: 20px;
    background: ${system.progress?.completed ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 200, 100, 0.2)'};
    border: 1px solid ${system.progress?.completed ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 200, 100, 0.4)'};
    border-radius: 20px;
    padding: 8px 14px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: ${system.progress?.completed ? '#4ade80' : '#ffd700'};
    cursor: pointer;
    z-index: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  updateIndicatorContent(system, indicator);

  indicator.onclick = () => {
    if (system.isOpen) {
      closeChallenge(system);
    } else {
      openChallenge(system);
    }
  };

  indicator.onmouseover = () => {
    indicator.style.transform = 'scale(1.05)';
  };
  indicator.onmouseout = () => {
    indicator.style.transform = 'scale(1)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update indicator content
 */
function updateIndicatorContent(system: ChallengeSystem, indicator: HTMLElement): void {
  const challenge = system.currentChallenge;
  const progress = system.progress;

  if (!challenge || !progress) return;

  if (progress.completed) {
    indicator.innerHTML = `<span>${challenge.icon}</span> Complete!`;
    indicator.style.background = 'rgba(74, 222, 128, 0.2)';
    indicator.style.borderColor = 'rgba(74, 222, 128, 0.4)';
    indicator.style.color = '#4ade80';
  } else {
    const percent = Math.round((progress.progress / challenge.targetCount) * 100);
    indicator.innerHTML = `<span>${challenge.icon}</span> ${percent}%`;
  }
}

/**
 * Open the challenge popup
 */
export function openChallenge(system: ChallengeSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const challenge = system.currentChallenge;
  const progress = system.progress;
  if (!challenge || !progress) return;

  const popup = document.createElement('div');
  popup.id = 'challenge-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 200, 100, 0.4);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  const percent = Math.min(100, Math.round((progress.progress / challenge.targetCount) * 100));
  const progressText = formatProgress(challenge, progress.progress);

  popup.innerHTML = `
    <div style="
      padding: 25px;
      text-align: center;
      background: linear-gradient(135deg, rgba(255, 200, 100, 0.1), rgba(255, 140, 0, 0.1));
    ">
      <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
        Daily Challenge
      </div>
      <div style="font-size: 50px; margin-bottom: 15px;">${challenge.icon}</div>
      <h2 style="margin: 0 0 8px 0; font-size: 20px; color: white;">${challenge.title}</h2>
      <p style="margin: 0; font-size: 13px; color: #888;">${challenge.description}</p>
    </div>

    <div style="padding: 20px;">
      <div style="
        background: rgba(40, 40, 60, 0.5);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #888;">Progress</span>
          <span style="font-size: 12px; color: ${progress.completed ? '#4ade80' : '#ffd700'};">
            ${progressText}
          </span>
        </div>
        <div style="
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        ">
          <div style="
            width: ${percent}%;
            height: 100%;
            background: ${progress.completed
              ? 'linear-gradient(90deg, #4ade80, #22c55e)'
              : 'linear-gradient(90deg, #ffd700, #ff8c00)'};
            transition: width 0.5s;
          "></div>
        </div>
      </div>

      ${progress.completed ? `
        <div style="
          background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.2));
          border: 1px solid rgba(74, 222, 128, 0.4);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          margin-bottom: 15px;
        ">
          <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Reward Earned</div>
          <div style="font-size: 16px; color: #4ade80;">${challenge.reward}</div>
        </div>
      ` : ''}

      <div style="
        display: flex;
        justify-content: space-between;
        padding-top: 15px;
        border-top: 1px solid rgba(100, 100, 120, 0.3);
      ">
        <div style="text-align: center;">
          <div style="font-size: 20px; color: #ffd700; font-weight: bold;">${system.streak}</div>
          <div style="font-size: 10px; color: #666;">Day Streak</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 20px; color: #4a9eff; font-weight: bold;">${system.totalCompleted}</div>
          <div style="font-size: 10px; color: #666;">Total Complete</div>
        </div>
      </div>
    </div>

    <div style="
      padding: 15px 20px;
      border-top: 1px solid rgba(100, 100, 120, 0.3);
      display: flex;
      justify-content: center;
    ">
      <button id="challenge-close" style="
        background: rgba(100, 100, 120, 0.5);
        border: none;
        border-radius: 8px;
        padding: 10px 30px;
        color: white;
        font-size: 13px;
        cursor: pointer;
      ">Close</button>
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up close
  setTimeout(() => {
    const closeBtn = document.getElementById('challenge-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeChallenge(system);
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeChallenge(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the challenge popup
 */
export function closeChallenge(system: ChallengeSystem): void {
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
 * Update challenge progress
 */
export function updateChallengeProgress(system: ChallengeSystem, context: ChallengeContext): void {
  const challenge = system.currentChallenge;
  const progress = system.progress;

  if (!challenge || !progress || progress.completed) return;

  const newProgress = challenge.checkProgress(context);
  progress.progress = newProgress;

  // Check for completion
  if (newProgress >= challenge.targetCount) {
    progress.completed = true;
    progress.completedAt = Date.now();
    system.totalCompleted++;

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // This is a simplified streak check - in real implementation
    // you'd track the last completion date
    system.streak++;

    // Show completion notification
    showChallengeComplete(system, challenge);
  }

  // Update indicator
  if (system.indicator) {
    updateIndicatorContent(system, system.indicator);
  }

  // Save state
  saveChallengeState(system);
}

/**
 * Show challenge completion notification
 */
function showChallengeComplete(system: ChallengeSystem, challenge: DailyChallenge): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    background: rgba(15, 15, 25, 0.98);
    border: 2px solid rgba(74, 222, 128, 0.6);
    border-radius: 16px;
    padding: 30px 40px;
    font-family: system-ui, sans-serif;
    text-align: center;
    z-index: 2000;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  notification.innerHTML = `
    <div style="font-size: 50px; margin-bottom: 15px;">🎉</div>
    <div style="font-size: 18px; color: white; font-weight: bold; margin-bottom: 8px;">
      Challenge Complete!
    </div>
    <div style="font-size: 14px; color: #4ade80; margin-bottom: 15px;">
      ${challenge.title}
    </div>
    <div style="font-size: 12px; color: #888;">
      Reward: ${challenge.reward}
    </div>
  `;

  system.container.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Auto remove
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

/**
 * Format progress for display
 */
function formatProgress(challenge: DailyChallenge, progress: number): string {
  if (challenge.id === 'wanderer') {
    // Time-based challenge
    const minutes = Math.floor(progress / 60000);
    const target = Math.floor(challenge.targetCount / 60000);
    return `${minutes}/${target} min`;
  }
  return `${Math.min(progress, challenge.targetCount)}/${challenge.targetCount}`;
}

// ============================================================================
// Persistence
// ============================================================================

interface ChallengeState {
  progress: ChallengeProgress | null;
  streak: number;
  totalCompleted: number;
}

function loadChallengeState(): ChallengeState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return { progress: null, streak: 0, totalCompleted: 0 };
}

function saveChallengeState(system: ChallengeSystem): void {
  try {
    const state: ChallengeState = {
      progress: system.progress,
      streak: system.streak,
      totalCompleted: system.totalCompleted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeChallengeSystem(system: ChallengeSystem): void {
  system.cleanup();
}
