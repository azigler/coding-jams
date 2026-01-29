/**
 * Milestones
 *
 * Track and celebrate visitor milestones
 * throughout their museum journey.
 */

// ============================================================================
// Types
// ============================================================================

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (stats: MilestoneStats) => boolean;
  reward?: string;
}

export interface MilestoneStats {
  exhibitsViewed: number;
  totalVisits: number;
  screenshotsTaken: number;
  favoritesCount: number;
  timeSpentMinutes: number;
  streakDays: number;
  commentsAdded: number;
}

export interface UnlockedMilestone {
  milestoneId: string;
  timestamp: number;
}

export interface MilestonesSystem {
  container: HTMLElement;
  unlocked: Map<string, UnlockedMilestone>;
  onMilestoneUnlocked: ((milestone: Milestone) => void) | null;
  panel: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-milestones';

// ============================================================================
// Milestone Definitions
// ============================================================================

const MILESTONES: Milestone[] = [
  // Exploration milestones
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'View your first exhibit',
    icon: '👣',
    requirement: (stats) => stats.exhibitsViewed >= 1,
  },
  {
    id: 'curious_visitor',
    name: 'Curious Visitor',
    description: 'View 5 exhibits',
    icon: '🔍',
    requirement: (stats) => stats.exhibitsViewed >= 5,
  },
  {
    id: 'art_enthusiast',
    name: 'Art Enthusiast',
    description: 'View 15 exhibits',
    icon: '🎨',
    requirement: (stats) => stats.exhibitsViewed >= 15,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'View all 31 exhibits',
    icon: '🏆',
    requirement: (stats) => stats.exhibitsViewed >= 31,
  },

  // Visit milestones
  {
    id: 'returning_visitor',
    name: 'Returning Visitor',
    description: 'Visit the museum 3 times',
    icon: '🔄',
    requirement: (stats) => stats.totalVisits >= 3,
  },
  {
    id: 'regular',
    name: 'Regular',
    description: 'Visit the museum 10 times',
    icon: '🎫',
    requirement: (stats) => stats.totalVisits >= 10,
  },
  {
    id: 'museum_member',
    name: 'Museum Member',
    description: 'Visit the museum 25 times',
    icon: '💎',
    requirement: (stats) => stats.totalVisits >= 25,
  },

  // Photography milestones
  {
    id: 'shutterbug',
    name: 'Shutterbug',
    description: 'Take your first screenshot',
    icon: '📷',
    requirement: (stats) => stats.screenshotsTaken >= 1,
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Take 10 screenshots',
    icon: '📸',
    requirement: (stats) => stats.screenshotsTaken >= 10,
  },
  {
    id: 'archivist',
    name: 'Archivist',
    description: 'Take 50 screenshots',
    icon: '🗄️',
    requirement: (stats) => stats.screenshotsTaken >= 50,
  },

  // Favorites milestones
  {
    id: 'first_love',
    name: 'First Love',
    description: 'Add your first favorite',
    icon: '💕',
    requirement: (stats) => stats.favoritesCount >= 1,
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Add 10 favorites',
    icon: '❤️',
    requirement: (stats) => stats.favoritesCount >= 10,
  },

  // Time milestones
  {
    id: 'patient_viewer',
    name: 'Patient Viewer',
    description: 'Spend 15 minutes in the museum',
    icon: '⏳',
    requirement: (stats) => stats.timeSpentMinutes >= 15,
  },
  {
    id: 'deep_dive',
    name: 'Deep Dive',
    description: 'Spend 60 minutes in the museum',
    icon: '🌊',
    requirement: (stats) => stats.timeSpentMinutes >= 60,
  },

  // Streak milestones
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Achieve a 3-day visit streak',
    icon: '🔥',
    requirement: (stats) => stats.streakDays >= 3,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Achieve a 7-day visit streak',
    icon: '🔥🔥',
    requirement: (stats) => stats.streakDays >= 7,
  },

  // Engagement milestones
  {
    id: 'commentator',
    name: 'Commentator',
    description: 'Leave 5 comments',
    icon: '💬',
    requirement: (stats) => stats.commentsAdded >= 5,
  },
];

// ============================================================================
// Milestones System Creation
// ============================================================================

/**
 * Create the milestones system
 */
export function createMilestonesSystem(container: HTMLElement): MilestonesSystem {
  const saved = loadMilestones();

  const system: MilestonesSystem = {
    container,
    unlocked: saved,
    onMilestoneUnlocked: null,
    panel: null,
    isOpen: false,
    cleanup: () => {
      closeMilestones(system);
    },
  };

  return system;
}

/**
 * Check and unlock milestones based on current stats
 */
export function checkMilestones(system: MilestonesSystem, stats: MilestoneStats): void {
  for (const milestone of MILESTONES) {
    if (system.unlocked.has(milestone.id)) continue;

    if (milestone.requirement(stats)) {
      unlockMilestone(system, milestone);
    }
  }
}

/**
 * Unlock a milestone
 */
function unlockMilestone(system: MilestonesSystem, milestone: Milestone): void {
  system.unlocked.set(milestone.id, {
    milestoneId: milestone.id,
    timestamp: Date.now(),
  });

  saveMilestones(system.unlocked);

  if (system.onMilestoneUnlocked) {
    system.onMilestoneUnlocked(milestone);
  }
}

/**
 * Show milestone notification
 */
export function showMilestoneNotification(container: HTMLElement, milestone: Milestone): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 200, 100, 0.95);
    color: #1a1a2e;
    padding: 20px 30px;
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    text-align: center;
    z-index: 1000;
    animation: milestone-pop 3s ease-out forwards;
  `;

  notification.innerHTML = `
    <div style="font-size: 40px; margin-bottom: 10px;">${milestone.icon}</div>
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
      Milestone Unlocked!
    </div>
    <div style="font-size: 14px; font-weight: bold;">${milestone.name}</div>
    <div style="font-size: 12px; color: #333; margin-top: 5px;">
      ${milestone.description}
    </div>
  `;

  // Add animation
  if (!document.getElementById('milestone-animation')) {
    const style = document.createElement('style');
    style.id = 'milestone-animation';
    style.textContent = `
      @keyframes milestone-pop {
        0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
        20% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        30% { transform: translateX(-50%) scale(1); }
        80% { transform: translateX(-50%) scale(1); opacity: 1; }
        100% { transform: translateX(-50%) scale(0.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

/**
 * Open milestones panel
 */
export function openMilestones(system: MilestonesSystem): void {
  closeMilestones(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'milestones-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-height: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 200, 100, 0.3);
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

  const unlockedCount = system.unlocked.size;
  const totalCount = MILESTONES.length;

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 200, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          🏅 Milestones
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${unlockedCount}/${totalCount} unlocked
        </div>
      </div>
      <button id="milestones-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Progress bar -->
    <div style="padding: 15px 20px 0;">
      <div style="
        background: rgba(100, 100, 100, 0.3);
        border-radius: 4px;
        height: 8px;
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(90deg, #ffc864, #ff9632);
          height: 100%;
          width: ${(unlockedCount / totalCount) * 100}%;
          transition: width 0.5s;
        "></div>
      </div>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${MILESTONES.map(milestone => {
        const isUnlocked = system.unlocked.has(milestone.id);
        const unlockData = system.unlocked.get(milestone.id);
        return `
          <div style="
            display: flex;
            gap: 12px;
            padding: 12px;
            background: ${isUnlocked ? 'rgba(255, 200, 100, 0.1)' : 'rgba(40, 40, 60, 0.3)'};
            border: 1px solid ${isUnlocked ? 'rgba(255, 200, 100, 0.2)' : 'transparent'};
            border-radius: 8px;
            margin-bottom: 8px;
            opacity: ${isUnlocked ? '1' : '0.6'};
          ">
            <div style="
              font-size: 24px;
              width: 40px;
              text-align: center;
              filter: ${isUnlocked ? 'none' : 'grayscale(1)'};
            ">${milestone.icon}</div>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: bold; color: ${isUnlocked ? '#ffc864' : '#888'};">
                ${milestone.name}
              </div>
              <div style="font-size: 11px; color: #888; margin-top: 4px;">
                ${milestone.description}
              </div>
              ${isUnlocked && unlockData ? `
                <div style="font-size: 10px; color: #666; margin-top: 6px;">
                  Unlocked ${formatDate(unlockData.timestamp)}
                </div>
              ` : ''}
            </div>
            ${isUnlocked ? `
              <div style="
                color: #ffc864;
                font-size: 16px;
              ">✓</div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#milestones-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeMilestones(system);

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMilestones(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close milestones panel
 */
function closeMilestones(system: MilestonesSystem): void {
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
 * Toggle milestones panel
 */
export function toggleMilestones(system: MilestonesSystem): void {
  if (system.isOpen) {
    closeMilestones(system);
  } else {
    openMilestones(system);
  }
}

/**
 * Get unlock count
 */
export function getUnlockedCount(system: MilestonesSystem): number {
  return system.unlocked.size;
}

/**
 * Get total milestone count
 */
export function getTotalMilestoneCount(): number {
  return MILESTONES.length;
}

/**
 * Format date
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================================
// Persistence
// ============================================================================

function loadMilestones(): Map<string, UnlockedMilestone> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const arr = JSON.parse(saved) as UnlockedMilestone[];
      return new Map(arr.map(m => [m.milestoneId, m]));
    }
  } catch {
    // Ignore
  }
  return new Map();
}

function saveMilestones(unlocked: Map<string, UnlockedMilestone>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked.values())));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeMilestonesSystem(system: MilestonesSystem): void {
  system.cleanup();
}
