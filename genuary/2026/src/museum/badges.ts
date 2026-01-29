/**
 * Badges
 *
 * Collectible badges for various accomplishments.
 * Display your museum credentials.
 */

// ============================================================================
// Types
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number;
  condition: string;
}

export interface BadgesSystem {
  container: HTMLElement;
  badges: Badge[];
  unlockedBadges: Set<string>;
  panel: HTMLElement | null;
  isOpen: boolean;
  onBadgeUnlocked: ((badge: Badge) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Badge Definitions
// ============================================================================

const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  // Common badges
  {
    id: 'first_visit',
    name: 'First Steps',
    description: 'Entered the museum for the first time',
    icon: '🚪',
    rarity: 'common',
    condition: 'Enter the museum',
  },
  {
    id: 'first_exhibit',
    name: 'Art Appreciator',
    description: 'Viewed your first exhibit',
    icon: '👁️',
    rarity: 'common',
    condition: 'View any exhibit',
  },
  {
    id: 'first_favorite',
    name: 'Heart on Sleeve',
    description: 'Added your first favorite',
    icon: '❤️',
    rarity: 'common',
    condition: 'Favorite any exhibit',
  },
  {
    id: 'first_screenshot',
    name: 'Shutterbug',
    description: 'Took your first screenshot',
    icon: '📸',
    rarity: 'common',
    condition: 'Take a screenshot',
  },

  // Uncommon badges
  {
    id: 'explorer_10',
    name: 'Explorer',
    description: 'Viewed 10 different exhibits',
    icon: '🧭',
    rarity: 'uncommon',
    condition: 'View 10 exhibits',
  },
  {
    id: 'collector_5',
    name: 'Collector',
    description: 'Favorited 5 exhibits',
    icon: '💎',
    rarity: 'uncommon',
    condition: 'Favorite 5 exhibits',
  },
  {
    id: 'photographer_5',
    name: 'Photographer',
    description: 'Took 5 screenshots',
    icon: '📷',
    rarity: 'uncommon',
    condition: 'Take 5 screenshots',
  },
  {
    id: 'regular_3',
    name: 'Regular Visitor',
    description: 'Visited on 3 different days',
    icon: '🔁',
    rarity: 'uncommon',
    condition: 'Visit 3 days',
  },

  // Rare badges
  {
    id: 'explorer_20',
    name: 'Seasoned Explorer',
    description: 'Viewed 20 different exhibits',
    icon: '🗺️',
    rarity: 'rare',
    condition: 'View 20 exhibits',
  },
  {
    id: 'collector_15',
    name: 'Avid Collector',
    description: 'Favorited 15 exhibits',
    icon: '👑',
    rarity: 'rare',
    condition: 'Favorite 15 exhibits',
  },
  {
    id: 'marathon_30',
    name: 'Marathon Viewer',
    description: 'Spent 30 minutes in a single session',
    icon: '⏱️',
    rarity: 'rare',
    condition: 'Spend 30 minutes',
  },
  {
    id: 'streak_7',
    name: 'Weekly Streak',
    description: 'Visited 7 days in a row',
    icon: '🔥',
    rarity: 'rare',
    condition: '7-day streak',
  },

  // Epic badges
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Viewed all 31 exhibits',
    icon: '🏆',
    rarity: 'epic',
    condition: 'View all exhibits',
  },
  {
    id: 'super_fan',
    name: 'Super Fan',
    description: 'Favorited 25 or more exhibits',
    icon: '⭐',
    rarity: 'epic',
    condition: 'Favorite 25 exhibits',
  },
  {
    id: 'gallery_owner',
    name: 'Gallery Owner',
    description: 'Took 20 screenshots',
    icon: '🖼️',
    rarity: 'epic',
    condition: 'Take 20 screenshots',
  },
  {
    id: 'devoted_30',
    name: 'Devoted Patron',
    description: 'Visited on 30 different days',
    icon: '🏅',
    rarity: 'epic',
    condition: 'Visit 30 days',
  },

  // Legendary badges
  {
    id: 'master_curator',
    name: 'Master Curator',
    description: 'Unlocked 20 other badges',
    icon: '👨‍🎨',
    rarity: 'legendary',
    condition: 'Unlock 20 badges',
  },
  {
    id: 'true_believer',
    name: 'True Believer',
    description: 'Favorited all 31 exhibits',
    icon: '💝',
    rarity: 'legendary',
    condition: 'Favorite all exhibits',
  },
  {
    id: 'eternal_flame',
    name: 'Eternal Flame',
    description: 'Maintained a 31-day streak',
    icon: '🌟',
    rarity: 'legendary',
    condition: '31-day streak',
  },
  {
    id: 'secret_finder',
    name: 'Secret Finder',
    description: 'Discovered a hidden easter egg',
    icon: '🥚',
    rarity: 'legendary',
    condition: 'Find secret',
  },
];

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-badges';

const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common: '#aaaaaa',
  uncommon: '#64c896',
  rare: '#4a9eff',
  epic: '#a855f7',
  legendary: '#ffc864',
};

// ============================================================================
// Badges System Creation
// ============================================================================

/**
 * Create the badges system
 */
export function createBadgesSystem(container: HTMLElement): BadgesSystem {
  const unlockedIds = loadUnlockedBadges();

  const system: BadgesSystem = {
    container,
    badges: BADGE_DEFINITIONS.map(def => ({ ...def })),
    unlockedBadges: new Set(unlockedIds),
    panel: null,
    isOpen: false,
    onBadgeUnlocked: null,
    cleanup: () => {
      closeBadgesPanel(system);
    },
  };

  // Mark unlocked timestamps
  const timestamps = loadBadgeTimestamps();
  system.badges.forEach(badge => {
    if (system.unlockedBadges.has(badge.id) && timestamps[badge.id]) {
      badge.unlockedAt = timestamps[badge.id];
    }
  });

  return system;
}

/**
 * Check if a badge is unlocked
 */
export function isBadgeUnlocked(system: BadgesSystem, badgeId: string): boolean {
  return system.unlockedBadges.has(badgeId);
}

/**
 * Unlock a badge
 */
export function unlockBadge(system: BadgesSystem, badgeId: string): Badge | null {
  if (system.unlockedBadges.has(badgeId)) return null;

  const badge = system.badges.find(b => b.id === badgeId);
  if (!badge) return null;

  system.unlockedBadges.add(badgeId);
  badge.unlockedAt = Date.now();

  saveUnlockedBadges(Array.from(system.unlockedBadges));
  saveBadgeTimestamp(badgeId, badge.unlockedAt);

  // Show notification
  showBadgeNotification(system, badge);

  // Notify callback
  system.onBadgeUnlocked?.(badge);

  // Check for Master Curator badge
  if (system.unlockedBadges.size >= 20 && !system.unlockedBadges.has('master_curator')) {
    setTimeout(() => unlockBadge(system, 'master_curator'), 2000);
  }

  return badge;
}

/**
 * Show badge unlock notification
 */
function showBadgeNotification(system: BadgesSystem, badge: Badge): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: rgba(15, 15, 25, 0.98);
    border: 2px solid ${RARITY_COLORS[badge.rarity]};
    border-radius: 16px;
    padding: 30px 40px;
    font-family: system-ui, sans-serif;
    text-align: center;
    z-index: 1000;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  notification.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 15px;">${badge.icon}</div>
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${RARITY_COLORS[badge.rarity]}; margin-bottom: 8px;">
      ${badge.rarity} badge unlocked
    </div>
    <div style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 8px;">
      ${badge.name}
    </div>
    <div style="font-size: 13px; color: #888;">
      ${badge.description}
    </div>
  `;

  system.container.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Remove after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

/**
 * Get unlocked badges
 */
export function getUnlockedBadges(system: BadgesSystem): Badge[] {
  return system.badges.filter(b => system.unlockedBadges.has(b.id));
}

/**
 * Get locked badges
 */
export function getLockedBadges(system: BadgesSystem): Badge[] {
  return system.badges.filter(b => !system.unlockedBadges.has(b.id));
}

/**
 * Get badge count by rarity
 */
export function getBadgeCountByRarity(system: BadgesSystem): Record<Badge['rarity'], { unlocked: number; total: number }> {
  const counts: Record<Badge['rarity'], { unlocked: number; total: number }> = {
    common: { unlocked: 0, total: 0 },
    uncommon: { unlocked: 0, total: 0 },
    rare: { unlocked: 0, total: 0 },
    epic: { unlocked: 0, total: 0 },
    legendary: { unlocked: 0, total: 0 },
  };

  system.badges.forEach(badge => {
    counts[badge.rarity].total++;
    if (system.unlockedBadges.has(badge.id)) {
      counts[badge.rarity].unlocked++;
    }
  });

  return counts;
}

/**
 * Open badges panel
 */
export function openBadgesPanel(system: BadgesSystem): void {
  closeBadgesPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'badges-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    max-height: 600px;
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

  const unlocked = getUnlockedBadges(system);
  const locked = getLockedBadges(system);

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
          🏅 Badges
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${unlocked.length} / ${system.badges.length} collected
        </div>
      </div>
      <button id="badges-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${unlocked.length > 0 ? `
        <div style="font-size: 12px; color: #ffc864; margin-bottom: 10px;">Unlocked</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          ${unlocked.map(badge => `
            <div class="badge-item" data-id="${badge.id}" style="
              padding: 15px 10px;
              background: rgba(255, 200, 100, 0.1);
              border: 1px solid ${RARITY_COLORS[badge.rarity]};
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <div style="font-size: 28px; margin-bottom: 8px;">${badge.icon}</div>
              <div style="font-size: 11px; font-weight: bold; color: white;">${badge.name}</div>
              <div style="font-size: 9px; color: ${RARITY_COLORS[badge.rarity]}; text-transform: uppercase; margin-top: 4px;">
                ${badge.rarity}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${locked.length > 0 ? `
        <div style="font-size: 12px; color: #666; margin-bottom: 10px;">Locked</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${locked.map(badge => `
            <div class="badge-item locked" data-id="${badge.id}" style="
              padding: 15px 10px;
              background: rgba(100, 100, 100, 0.1);
              border: 1px solid rgba(100, 100, 100, 0.2);
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: all 0.2s;
              opacity: 0.5;
            ">
              <div style="font-size: 28px; margin-bottom: 8px; filter: grayscale(1);">❓</div>
              <div style="font-size: 11px; font-weight: bold; color: #666;">???</div>
              <div style="font-size: 9px; color: #444; text-transform: uppercase; margin-top: 4px;">
                ${badge.rarity}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(255, 200, 100, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Click a badge for details
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#badges-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeBadgesPanel(system);

  // Wire up badge clicks
  const badgeItems = panel.querySelectorAll('.badge-item');
  badgeItems.forEach(item => {
    (item as HTMLElement).onmouseover = () => {
      (item as HTMLElement).style.transform = 'scale(1.05)';
    };
    (item as HTMLElement).onmouseout = () => {
      (item as HTMLElement).style.transform = 'scale(1)';
    };
    (item as HTMLElement).onclick = () => {
      const badgeId = (item as HTMLElement).dataset.id || '';
      showBadgeDetails(system, badgeId);
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeBadgesPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Show badge details popup
 */
function showBadgeDetails(system: BadgesSystem, badgeId: string): void {
  const badge = system.badges.find(b => b.id === badgeId);
  if (!badge) return;

  const isUnlocked = system.unlockedBadges.has(badgeId);

  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 30, 0.98);
    border: 2px solid ${isUnlocked ? RARITY_COLORS[badge.rarity] : '#444'};
    border-radius: 16px;
    padding: 25px 35px;
    font-family: system-ui, sans-serif;
    text-align: center;
    z-index: 900;
    min-width: 250px;
  `;

  popup.innerHTML = `
    <div style="font-size: 56px; margin-bottom: 15px; ${!isUnlocked ? 'filter: grayscale(1); opacity: 0.5;' : ''}">${badge.icon}</div>
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: ${RARITY_COLORS[badge.rarity]}; margin-bottom: 8px;">
      ${badge.rarity}
    </div>
    <div style="font-size: 18px; font-weight: bold; color: ${isUnlocked ? 'white' : '#666'}; margin-bottom: 10px;">
      ${isUnlocked ? badge.name : '???'}
    </div>
    <div style="font-size: 13px; color: #888; margin-bottom: 15px;">
      ${isUnlocked ? badge.description : badge.condition}
    </div>
    ${isUnlocked && badge.unlockedAt ? `
      <div style="font-size: 10px; color: #666;">
        Unlocked ${formatDate(badge.unlockedAt)}
      </div>
    ` : ''}
  `;

  system.container.appendChild(popup);

  // Click anywhere to close
  const closeHandler = () => {
    popup.remove();
    document.removeEventListener('click', closeHandler);
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 100);
}

/**
 * Format date for display
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Close badges panel
 */
function closeBadgesPanel(system: BadgesSystem): void {
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
 * Toggle badges panel
 */
export function toggleBadgesPanel(system: BadgesSystem): void {
  if (system.isOpen) {
    closeBadgesPanel(system);
  } else {
    openBadgesPanel(system);
  }
}

// ============================================================================
// Persistence
// ============================================================================

function loadUnlockedBadges(): string[] {
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

function saveUnlockedBadges(badgeIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badgeIds));
  } catch {
    // Ignore
  }
}

function loadBadgeTimestamps(): Record<string, number> {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-timestamps`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return {};
}

function saveBadgeTimestamp(badgeId: string, timestamp: number): void {
  try {
    const timestamps = loadBadgeTimestamps();
    timestamps[badgeId] = timestamp;
    localStorage.setItem(`${STORAGE_KEY}-timestamps`, JSON.stringify(timestamps));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeBadgesSystem(system: BadgesSystem): void {
  system.cleanup();
}
