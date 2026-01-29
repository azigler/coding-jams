/**
 * Leaderboard
 *
 * Track and display visitor rankings based on
 * various metrics like exhibits viewed, time spent, etc.
 */

// ============================================================================
// Types
// ============================================================================

export interface LeaderboardEntry {
  visitorId: string;
  nickname: string;
  avatar: string;
  score: number;
  exhibitsViewed: number;
  favoritesCount: number;
  screenshotsTaken: number;
  timeSpentMinutes: number;
  badgesEarned: number;
  lastActive: number;
}

export interface LeaderboardSystem {
  container: HTMLElement;
  localEntry: LeaderboardEntry;
  entries: LeaderboardEntry[];
  panel: HTMLElement | null;
  isOpen: boolean;
  currentCategory: 'overall' | 'exhibits' | 'time' | 'badges';
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-leaderboard';
const VISITOR_ID_KEY = 'genuary-museum-visitor-id';

const AVATARS = ['🎨', '🖼️', '👤', '🦊', '🐱', '🐶', '🦉', '🦋', '🌸', '⭐', '🌙', '🔮'];

// Simulated other visitors (for demo purposes)
const SIMULATED_ENTRIES: Omit<LeaderboardEntry, 'visitorId'>[] = [
  { nickname: 'ArtLover42', avatar: '🎨', score: 2850, exhibitsViewed: 31, favoritesCount: 28, screenshotsTaken: 45, timeSpentMinutes: 180, badgesEarned: 15, lastActive: Date.now() - 3600000 },
  { nickname: 'GenArtFan', avatar: '🖼️', score: 2400, exhibitsViewed: 31, favoritesCount: 20, screenshotsTaken: 30, timeSpentMinutes: 150, badgesEarned: 12, lastActive: Date.now() - 7200000 },
  { nickname: 'PixelWizard', avatar: '🔮', score: 2100, exhibitsViewed: 28, favoritesCount: 18, screenshotsTaken: 25, timeSpentMinutes: 120, badgesEarned: 10, lastActive: Date.now() - 14400000 },
  { nickname: 'CodeArtist', avatar: '⭐', score: 1800, exhibitsViewed: 25, favoritesCount: 15, screenshotsTaken: 20, timeSpentMinutes: 100, badgesEarned: 8, lastActive: Date.now() - 28800000 },
  { nickname: 'DigitalDreamer', avatar: '🌙', score: 1500, exhibitsViewed: 22, favoritesCount: 12, screenshotsTaken: 15, timeSpentMinutes: 80, badgesEarned: 6, lastActive: Date.now() - 43200000 },
  { nickname: 'AbstractMind', avatar: '🦋', score: 1200, exhibitsViewed: 18, favoritesCount: 10, screenshotsTaken: 12, timeSpentMinutes: 60, badgesEarned: 5, lastActive: Date.now() - 86400000 },
  { nickname: 'CreativeSpirit', avatar: '🌸', score: 900, exhibitsViewed: 15, favoritesCount: 8, screenshotsTaken: 8, timeSpentMinutes: 45, badgesEarned: 4, lastActive: Date.now() - 172800000 },
  { nickname: 'ArtExplorer', avatar: '🦉', score: 600, exhibitsViewed: 10, favoritesCount: 5, screenshotsTaken: 5, timeSpentMinutes: 30, badgesEarned: 3, lastActive: Date.now() - 259200000 },
];

// ============================================================================
// Leaderboard System Creation
// ============================================================================

/**
 * Create the leaderboard system
 */
export function createLeaderboardSystem(container: HTMLElement): LeaderboardSystem {
  const visitorId = getOrCreateVisitorId();
  const savedEntry = loadLocalEntry();

  const localEntry: LeaderboardEntry = savedEntry || {
    visitorId,
    nickname: 'You',
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    score: 0,
    exhibitsViewed: 0,
    favoritesCount: 0,
    screenshotsTaken: 0,
    timeSpentMinutes: 0,
    badgesEarned: 0,
    lastActive: Date.now(),
  };

  const system: LeaderboardSystem = {
    container,
    localEntry,
    entries: [],
    panel: null,
    isOpen: false,
    currentCategory: 'overall',
    cleanup: () => {
      closeLeaderboardPanel(system);
    },
  };

  // Initialize entries with simulated data plus local
  refreshEntries(system);

  return system;
}

/**
 * Update local entry stats
 */
export function updateLeaderboardStats(
  system: LeaderboardSystem,
  stats: Partial<Omit<LeaderboardEntry, 'visitorId' | 'nickname' | 'avatar' | 'score' | 'lastActive'>>
): void {
  Object.assign(system.localEntry, stats);
  system.localEntry.lastActive = Date.now();

  // Calculate score
  system.localEntry.score = calculateScore(system.localEntry);

  saveLocalEntry(system.localEntry);
  refreshEntries(system);
}

/**
 * Set nickname
 */
export function setLeaderboardNickname(system: LeaderboardSystem, nickname: string): void {
  system.localEntry.nickname = nickname.slice(0, 20) || 'Anonymous';
  saveLocalEntry(system.localEntry);
  refreshEntries(system);
}

/**
 * Set avatar
 */
export function setLeaderboardAvatar(system: LeaderboardSystem, avatar: string): void {
  system.localEntry.avatar = avatar;
  saveLocalEntry(system.localEntry);
  refreshEntries(system);
}

/**
 * Calculate score from stats
 */
function calculateScore(entry: LeaderboardEntry): number {
  return (
    entry.exhibitsViewed * 50 +
    entry.favoritesCount * 30 +
    entry.screenshotsTaken * 20 +
    entry.timeSpentMinutes * 2 +
    entry.badgesEarned * 100
  );
}

/**
 * Refresh entries list
 */
function refreshEntries(system: LeaderboardSystem): void {
  // Combine simulated entries with local entry
  const simulatedWithIds = SIMULATED_ENTRIES.map((e, i) => ({
    ...e,
    visitorId: `sim_${i}`,
  }));

  system.entries = [...simulatedWithIds, system.localEntry];

  // Sort by current category
  sortEntries(system);
}

/**
 * Sort entries by category
 */
function sortEntries(system: LeaderboardSystem): void {
  system.entries.sort((a, b) => {
    switch (system.currentCategory) {
      case 'exhibits':
        return b.exhibitsViewed - a.exhibitsViewed;
      case 'time':
        return b.timeSpentMinutes - a.timeSpentMinutes;
      case 'badges':
        return b.badgesEarned - a.badgesEarned;
      default:
        return b.score - a.score;
    }
  });
}

/**
 * Get local rank
 */
export function getLocalRank(system: LeaderboardSystem): number {
  const index = system.entries.findIndex(e => e.visitorId === system.localEntry.visitorId);
  return index + 1;
}

/**
 * Open leaderboard panel
 */
export function openLeaderboardPanel(system: LeaderboardSystem): void {
  closeLeaderboardPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'leaderboard-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
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

  const localRank = getLocalRank(system);

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
          🏆 Leaderboard
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Your rank: #${localRank} of ${system.entries.length}
        </div>
      </div>
      <button id="leaderboard-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Category tabs -->
    <div style="
      display: flex;
      border-bottom: 1px solid rgba(255, 200, 100, 0.1);
    ">
      ${(['overall', 'exhibits', 'time', 'badges'] as const).map(cat => `
        <button class="category-tab" data-category="${cat}" style="
          flex: 1;
          padding: 10px;
          background: ${cat === system.currentCategory ? 'rgba(255, 200, 100, 0.15)' : 'transparent'};
          border: none;
          border-bottom: 2px solid ${cat === system.currentCategory ? '#ffc864' : 'transparent'};
          color: ${cat === system.currentCategory ? '#ffc864' : '#888'};
          font-size: 11px;
          cursor: pointer;
          text-transform: capitalize;
        ">${cat}</button>
      `).join('')}
    </div>

    <!-- Local entry highlight -->
    <div style="
      padding: 12px 15px;
      background: rgba(255, 200, 100, 0.1);
      border-bottom: 1px solid rgba(255, 200, 100, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      <div style="
        width: 32px;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        color: #ffc864;
      ">#${localRank}</div>
      <div style="font-size: 24px;">${system.localEntry.avatar}</div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: bold; color: white;">
          ${system.localEntry.nickname}
          <span style="font-size: 10px; color: #ffc864; margin-left: 5px;">(You)</span>
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 2px;">
          Score: ${system.localEntry.score.toLocaleString()}
        </div>
      </div>
      <button id="edit-profile" style="
        background: rgba(255, 200, 100, 0.2);
        border: 1px solid rgba(255, 200, 100, 0.3);
        border-radius: 6px;
        padding: 6px 12px;
        color: #ffc864;
        font-size: 10px;
        cursor: pointer;
      ">Edit</button>
    </div>

    <!-- Entries list -->
    <div style="flex: 1; overflow-y: auto; padding: 10px 0;">
      ${system.entries.map((entry, index) => {
        const isLocal = entry.visitorId === system.localEntry.visitorId;
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

        return `
          <div style="
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: ${isLocal ? 'rgba(255, 200, 100, 0.05)' : 'transparent'};
            ${index < system.entries.length - 1 ? 'border-bottom: 1px solid rgba(100, 100, 100, 0.1);' : ''}
          ">
            <div style="
              width: 32px;
              text-align: center;
              font-size: ${rank <= 3 ? '18px' : '12px'};
              color: ${rank <= 3 ? '#ffc864' : '#666'};
            ">${medal || `#${rank}`}</div>
            <div style="font-size: 20px;">${entry.avatar}</div>
            <div style="flex: 1;">
              <div style="font-size: 12px; color: ${isLocal ? '#ffc864' : 'white'};">
                ${entry.nickname}
              </div>
              <div style="font-size: 10px; color: #666; margin-top: 2px;">
                ${getStatLabel(system.currentCategory, entry)}
              </div>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #888;">
              ${getStatValue(system.currentCategory, entry)}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(255, 200, 100, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Rankings update as you explore
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#leaderboard-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeLeaderboardPanel(system);

  // Wire up category tabs
  const tabs = panel.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    (tab as HTMLElement).onclick = () => {
      system.currentCategory = (tab as HTMLElement).dataset.category as typeof system.currentCategory;
      sortEntries(system);
      closeLeaderboardPanel(system);
      openLeaderboardPanel(system);
    };
  });

  // Wire up edit profile
  const editBtn = panel.querySelector('#edit-profile') as HTMLButtonElement;
  editBtn.onclick = () => {
    showProfileEditor(system);
  };

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLeaderboardPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Get stat label for category
 */
function getStatLabel(category: LeaderboardSystem['currentCategory'], entry: LeaderboardEntry): string {
  switch (category) {
    case 'exhibits':
      return `${entry.exhibitsViewed} exhibits viewed`;
    case 'time':
      return `${entry.timeSpentMinutes} min spent`;
    case 'badges':
      return `${entry.badgesEarned} badges earned`;
    default:
      return `${entry.exhibitsViewed} exhibits • ${entry.badgesEarned} badges`;
  }
}

/**
 * Get stat value for category
 */
function getStatValue(category: LeaderboardSystem['currentCategory'], entry: LeaderboardEntry): string {
  switch (category) {
    case 'exhibits':
      return `${entry.exhibitsViewed}`;
    case 'time':
      return `${entry.timeSpentMinutes}m`;
    case 'badges':
      return `${entry.badgesEarned}`;
    default:
      return entry.score.toLocaleString();
  }
}

/**
 * Show profile editor
 */
function showProfileEditor(system: LeaderboardSystem): void {
  const editor = document.createElement('div');
  editor.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background: rgba(20, 20, 30, 0.98);
    border: 2px solid rgba(255, 200, 100, 0.4);
    border-radius: 12px;
    padding: 20px;
    font-family: system-ui, sans-serif;
    z-index: 900;
  `;

  editor.innerHTML = `
    <div style="font-size: 14px; font-weight: bold; color: white; margin-bottom: 15px;">
      Edit Profile
    </div>

    <div style="margin-bottom: 15px;">
      <div style="font-size: 11px; color: #888; margin-bottom: 5px;">Nickname</div>
      <input type="text" id="edit-nickname" value="${system.localEntry.nickname}" maxlength="20" style="
        width: 100%;
        padding: 10px;
        background: rgba(100, 100, 100, 0.2);
        border: 1px solid rgba(255, 200, 100, 0.3);
        border-radius: 6px;
        color: white;
        font-size: 13px;
        box-sizing: border-box;
      " />
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Avatar</div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${AVATARS.map(avatar => `
          <button class="avatar-option" data-avatar="${avatar}" style="
            width: 36px;
            height: 36px;
            background: ${avatar === system.localEntry.avatar ? 'rgba(255, 200, 100, 0.3)' : 'rgba(100, 100, 100, 0.2)'};
            border: 2px solid ${avatar === system.localEntry.avatar ? '#ffc864' : 'transparent'};
            border-radius: 8px;
            font-size: 20px;
            cursor: pointer;
          ">${avatar}</button>
        `).join('')}
      </div>
    </div>

    <div style="display: flex; gap: 10px;">
      <button id="cancel-edit" style="
        flex: 1;
        padding: 10px;
        background: rgba(100, 100, 100, 0.3);
        border: none;
        border-radius: 6px;
        color: #888;
        font-size: 12px;
        cursor: pointer;
      ">Cancel</button>
      <button id="save-edit" style="
        flex: 1;
        padding: 10px;
        background: rgba(255, 200, 100, 0.3);
        border: none;
        border-radius: 6px;
        color: #ffc864;
        font-size: 12px;
        cursor: pointer;
      ">Save</button>
    </div>
  `;

  system.container.appendChild(editor);

  let selectedAvatar = system.localEntry.avatar;

  // Wire up avatar selection
  const avatarBtns = editor.querySelectorAll('.avatar-option');
  avatarBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      selectedAvatar = (btn as HTMLElement).dataset.avatar || selectedAvatar;
      avatarBtns.forEach(b => {
        (b as HTMLElement).style.background = 'rgba(100, 100, 100, 0.2)';
        (b as HTMLElement).style.borderColor = 'transparent';
      });
      (btn as HTMLElement).style.background = 'rgba(255, 200, 100, 0.3)';
      (btn as HTMLElement).style.borderColor = '#ffc864';
    };
  });

  // Wire up cancel
  const cancelBtn = editor.querySelector('#cancel-edit') as HTMLButtonElement;
  cancelBtn.onclick = () => editor.remove();

  // Wire up save
  const saveBtn = editor.querySelector('#save-edit') as HTMLButtonElement;
  saveBtn.onclick = () => {
    const nicknameInput = editor.querySelector('#edit-nickname') as HTMLInputElement;
    setLeaderboardNickname(system, nicknameInput.value);
    setLeaderboardAvatar(system, selectedAvatar);
    editor.remove();
    closeLeaderboardPanel(system);
    openLeaderboardPanel(system);
  };
}

/**
 * Close leaderboard panel
 */
function closeLeaderboardPanel(system: LeaderboardSystem): void {
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
 * Toggle leaderboard panel
 */
export function toggleLeaderboardPanel(system: LeaderboardSystem): void {
  if (system.isOpen) {
    closeLeaderboardPanel(system);
  } else {
    openLeaderboardPanel(system);
  }
}

// ============================================================================
// Persistence
// ============================================================================

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function loadLocalEntry(): LeaderboardEntry | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveLocalEntry(entry: LeaderboardEntry): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeLeaderboardSystem(system: LeaderboardSystem): void {
  system.cleanup();
}
