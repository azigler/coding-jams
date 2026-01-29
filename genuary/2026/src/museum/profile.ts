/**
 * Visitor Profile
 *
 * Manages visitor preferences and personalizes the museum experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface VisitorProfile {
  nickname: string;
  avatarEmoji: string;
  preferredMood: string;
  visitCount: number;
  firstVisit: number;
  lastVisit: number;
  preferenceFlags: {
    showTips: boolean;
    autoPlayMusic: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

export interface ProfileSystem {
  container: HTMLElement;
  profile: VisitorProfile;
  popup: HTMLElement | null;
  isOpen: boolean;
  onProfileChange: ((profile: VisitorProfile) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-profile';

const AVATAR_EMOJIS = ['🎨', '🖼️', '✨', '🌟', '🎭', '🎪', '🌈', '🔮', '💎', '🦋', '🌸', '🍀'];

const DEFAULT_PROFILE: VisitorProfile = {
  nickname: 'Anonymous Visitor',
  avatarEmoji: '🎨',
  preferredMood: 'auto',
  visitCount: 1,
  firstVisit: Date.now(),
  lastVisit: Date.now(),
  preferenceFlags: {
    showTips: true,
    autoPlayMusic: false,
    reducedMotion: false,
    highContrast: false,
  },
};

// ============================================================================
// Profile System Creation
// ============================================================================

/**
 * Create the profile system
 */
export function createProfileSystem(container: HTMLElement): ProfileSystem {
  const saved = loadProfile();
  const profile = saved || { ...DEFAULT_PROFILE };

  // Update visit tracking
  profile.visitCount += 1;
  profile.lastVisit = Date.now();

  const system: ProfileSystem = {
    container,
    profile,
    popup: null,
    isOpen: false,
    onProfileChange: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Save updated profile
  saveProfile(system);

  // Toggle with Shift+P (Profile)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP' && event.shiftKey && event.ctrlKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeProfile(system);
      } else {
        openProfile(system);
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
 * Open the profile popup
 */
export function openProfile(system: ProfileSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'profile-popup';
  popup.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 900;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  const daysSinceFirstVisit = Math.floor(
    (Date.now() - system.profile.firstVisit) / 86400000
  );

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        Visitor Profile
      </div>
      <button id="profile-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px;">
      <!-- Avatar and Name -->
      <div style="
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
      ">
        <div id="avatar-picker" style="
          width: 50px;
          height: 50px;
          background: rgba(74, 158, 255, 0.2);
          border: 2px solid rgba(74, 158, 255, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
        ">${system.profile.avatarEmoji}</div>
        <div style="flex: 1;">
          <input type="text" id="nickname-input" value="${system.profile.nickname}"
            placeholder="Your nickname"
            style="
              width: 100%;
              padding: 8px 10px;
              background: rgba(40, 40, 60, 0.5);
              border: 1px solid rgba(100, 150, 255, 0.2);
              border-radius: 6px;
              color: white;
              font-size: 13px;
              outline: none;
            ">
        </div>
      </div>

      <!-- Stats -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(40, 40, 60, 0.3);
        border-radius: 8px;
      ">
        <div style="text-align: center;">
          <div style="font-size: 18px; color: #4a9eff; font-weight: bold;">
            ${system.profile.visitCount}
          </div>
          <div style="font-size: 10px; color: #888;">Visits</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 18px; color: #4a9eff; font-weight: bold;">
            ${daysSinceFirstVisit || 1}
          </div>
          <div style="font-size: 10px; color: #888;">Days as member</div>
        </div>
      </div>

      <!-- Preferences -->
      <div style="margin-bottom: 15px;">
        <div style="font-size: 11px; color: #888; margin-bottom: 10px; text-transform: uppercase;">
          Preferences
        </div>

        <label style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          cursor: pointer;
        ">
          <input type="checkbox" id="pref-tips" ${system.profile.preferenceFlags.showTips ? 'checked' : ''}>
          <span style="font-size: 12px;">Show helpful tips</span>
        </label>

        <label style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          cursor: pointer;
        ">
          <input type="checkbox" id="pref-music" ${system.profile.preferenceFlags.autoPlayMusic ? 'checked' : ''}>
          <span style="font-size: 12px;">Auto-play ambient music</span>
        </label>

        <label style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          cursor: pointer;
        ">
          <input type="checkbox" id="pref-motion" ${system.profile.preferenceFlags.reducedMotion ? 'checked' : ''}>
          <span style="font-size: 12px;">Reduced motion</span>
        </label>
      </div>

      <button id="profile-save" style="
        width: 100%;
        padding: 10px;
        background: rgba(74, 158, 255, 0.3);
        border: 1px solid rgba(74, 158, 255, 0.5);
        border-radius: 6px;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s;
      ">Save Changes</button>
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up interactions
  setTimeout(() => wireUpProfile(system), 0);
}

/**
 * Wire up profile interactions
 */
function wireUpProfile(system: ProfileSystem): void {
  if (!system.popup) return;

  const closeBtn = document.getElementById('profile-close');
  if (closeBtn) {
    closeBtn.onclick = () => closeProfile(system);
  }

  // Avatar picker
  const avatarPicker = document.getElementById('avatar-picker');
  if (avatarPicker) {
    avatarPicker.onclick = () => {
      const currentIndex = AVATAR_EMOJIS.indexOf(system.profile.avatarEmoji);
      const nextIndex = (currentIndex + 1) % AVATAR_EMOJIS.length;
      system.profile.avatarEmoji = AVATAR_EMOJIS[nextIndex];
      avatarPicker.textContent = system.profile.avatarEmoji;
    };
  }

  // Save button
  const saveBtn = document.getElementById('profile-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      // Update from inputs
      const nicknameInput = document.getElementById('nickname-input') as HTMLInputElement;
      const tipsCheck = document.getElementById('pref-tips') as HTMLInputElement;
      const musicCheck = document.getElementById('pref-music') as HTMLInputElement;
      const motionCheck = document.getElementById('pref-motion') as HTMLInputElement;

      if (nicknameInput) {
        system.profile.nickname = nicknameInput.value || 'Anonymous Visitor';
      }
      if (tipsCheck) {
        system.profile.preferenceFlags.showTips = tipsCheck.checked;
      }
      if (musicCheck) {
        system.profile.preferenceFlags.autoPlayMusic = musicCheck.checked;
      }
      if (motionCheck) {
        system.profile.preferenceFlags.reducedMotion = motionCheck.checked;
      }

      saveProfile(system);
      system.onProfileChange?.(system.profile);

      showProfileNotification(system, 'Profile saved!');
      closeProfile(system);
    };
  }

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeProfile(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the profile popup
 */
export function closeProfile(system: ProfileSystem): void {
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
 * Get the visitor profile
 */
export function getProfile(system: ProfileSystem): VisitorProfile {
  return { ...system.profile };
}

/**
 * Get preference value
 */
export function getPreference(
  system: ProfileSystem,
  key: keyof VisitorProfile['preferenceFlags']
): boolean {
  return system.profile.preferenceFlags[key];
}

/**
 * Show profile notification
 */
function showProfileNotification(system: ProfileSystem, message: string): void {
  const existing = document.getElementById('profile-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'profile-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(74, 158, 255, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  notification.textContent = message;

  system.container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
  });

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ============================================================================
// Persistence
// ============================================================================

function loadProfile(): VisitorProfile | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveProfile(system: ProfileSystem): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system.profile));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeProfileSystem(system: ProfileSystem): void {
  system.cleanup();
}
