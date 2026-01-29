/**
 * Exhibit Playlist
 *
 * Create custom playlists of exhibits
 * for curated viewing experiences.
 */

// ============================================================================
// Types
// ============================================================================

export interface Playlist {
  id: string;
  name: string;
  description: string;
  exhibits: number[];
  createdAt: number;
  lastPlayed?: number;
}

export interface PlaylistSystem {
  container: HTMLElement;
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  currentIndex: number;
  isPlaying: boolean;
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-playlists';

// Pre-defined curated playlists
const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'beginner',
    name: 'Beginner\'s Tour',
    description: 'Great starting points for new visitors',
    exhibits: [1, 7, 15, 21, 31],
    createdAt: 0,
  },
  {
    id: 'colorful',
    name: 'Color Explosion',
    description: 'The most vibrant and colorful exhibits',
    exhibits: [3, 8, 12, 19, 25],
    createdAt: 0,
  },
  {
    id: 'abstract',
    name: 'Abstract Journey',
    description: 'Mind-bending abstract pieces',
    exhibits: [5, 11, 16, 22, 28],
    createdAt: 0,
  },
  {
    id: 'technical',
    name: 'Technical Marvels',
    description: 'Complex algorithmic achievements',
    exhibits: [2, 9, 14, 20, 27],
    createdAt: 0,
  },
];

// ============================================================================
// Playlist System Creation
// ============================================================================

/**
 * Create the playlist system
 */
export function createPlaylistSystem(container: HTMLElement): PlaylistSystem {
  const savedPlaylists = loadPlaylists();

  const system: PlaylistSystem = {
    container,
    playlists: [...DEFAULT_PLAYLISTS, ...savedPlaylists],
    currentPlaylist: null,
    currentIndex: 0,
    isPlaying: false,
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closePlaylistPanel(system);
    },
  };

  return system;
}

/**
 * Create new playlist
 */
export function createPlaylist(
  system: PlaylistSystem,
  name: string,
  description: string = ''
): Playlist {
  const playlist: Playlist = {
    id: `custom_${Date.now()}`,
    name,
    description,
    exhibits: [],
    createdAt: Date.now(),
  };

  system.playlists.push(playlist);
  savePlaylists(system.playlists.filter(p => p.createdAt > 0));

  return playlist;
}

/**
 * Add exhibit to playlist
 */
export function addToPlaylist(system: PlaylistSystem, playlistId: string, dayNumber: number): boolean {
  const playlist = system.playlists.find(p => p.id === playlistId);
  if (!playlist) return false;

  if (!playlist.exhibits.includes(dayNumber)) {
    playlist.exhibits.push(dayNumber);
    if (playlist.createdAt > 0) {
      savePlaylists(system.playlists.filter(p => p.createdAt > 0));
    }
  }

  return true;
}

/**
 * Remove exhibit from playlist
 */
export function removeFromPlaylist(system: PlaylistSystem, playlistId: string, dayNumber: number): boolean {
  const playlist = system.playlists.find(p => p.id === playlistId);
  if (!playlist) return false;

  const index = playlist.exhibits.indexOf(dayNumber);
  if (index !== -1) {
    playlist.exhibits.splice(index, 1);
    if (playlist.createdAt > 0) {
      savePlaylists(system.playlists.filter(p => p.createdAt > 0));
    }
  }

  return true;
}

/**
 * Delete custom playlist
 */
export function deletePlaylist(system: PlaylistSystem, playlistId: string): boolean {
  const index = system.playlists.findIndex(p => p.id === playlistId && p.createdAt > 0);
  if (index === -1) return false;

  system.playlists.splice(index, 1);
  savePlaylists(system.playlists.filter(p => p.createdAt > 0));

  if (system.currentPlaylist?.id === playlistId) {
    system.currentPlaylist = null;
    system.isPlaying = false;
  }

  return true;
}

/**
 * Start playing a playlist
 */
export function startPlaylist(system: PlaylistSystem, playlistId: string): boolean {
  const playlist = system.playlists.find(p => p.id === playlistId);
  if (!playlist || playlist.exhibits.length === 0) return false;

  system.currentPlaylist = playlist;
  system.currentIndex = 0;
  system.isPlaying = true;
  playlist.lastPlayed = Date.now();

  // Navigate to first exhibit
  if (system.onNavigate) {
    system.onNavigate(playlist.exhibits[0]);
  }

  return true;
}

/**
 * Go to next exhibit in playlist
 */
export function playlistNext(system: PlaylistSystem): number | null {
  if (!system.currentPlaylist || !system.isPlaying) return null;

  system.currentIndex++;
  if (system.currentIndex >= system.currentPlaylist.exhibits.length) {
    system.currentIndex = 0; // Loop
  }

  const dayNumber = system.currentPlaylist.exhibits[system.currentIndex];
  if (system.onNavigate) {
    system.onNavigate(dayNumber);
  }

  return dayNumber;
}

/**
 * Go to previous exhibit in playlist
 */
export function playlistPrev(system: PlaylistSystem): number | null {
  if (!system.currentPlaylist || !system.isPlaying) return null;

  system.currentIndex--;
  if (system.currentIndex < 0) {
    system.currentIndex = system.currentPlaylist.exhibits.length - 1;
  }

  const dayNumber = system.currentPlaylist.exhibits[system.currentIndex];
  if (system.onNavigate) {
    system.onNavigate(dayNumber);
  }

  return dayNumber;
}

/**
 * Stop playlist
 */
export function stopPlaylist(system: PlaylistSystem): void {
  system.isPlaying = false;
  system.currentPlaylist = null;
  system.currentIndex = 0;
}

/**
 * Open playlist panel
 */
export function openPlaylistPanel(system: PlaylistSystem): void {
  closePlaylistPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'playlist-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    max-height: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(200, 100, 255, 0.3);
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

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(200, 100, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          🎵 Playlists
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${system.playlists.length} playlists
        </div>
      </div>
      <button id="playlist-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    ${system.isPlaying && system.currentPlaylist ? `
      <!-- Now playing -->
      <div style="
        padding: 15px;
        background: rgba(200, 100, 255, 0.1);
        border-bottom: 1px solid rgba(200, 100, 255, 0.1);
      ">
        <div style="font-size: 10px; color: #888; margin-bottom: 5px;">Now Playing</div>
        <div style="font-size: 13px; font-weight: bold; color: white;">
          ${system.currentPlaylist.name}
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${system.currentIndex + 1} of ${system.currentPlaylist.exhibits.length}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button id="playlist-prev" style="
            flex: 1;
            padding: 8px;
            background: rgba(200, 100, 255, 0.2);
            border: 1px solid rgba(200, 100, 255, 0.3);
            border-radius: 6px;
            color: white;
            font-size: 11px;
            cursor: pointer;
          ">◀ Prev</button>
          <button id="playlist-stop" style="
            flex: 1;
            padding: 8px;
            background: rgba(255, 100, 100, 0.2);
            border: 1px solid rgba(255, 100, 100, 0.3);
            border-radius: 6px;
            color: white;
            font-size: 11px;
            cursor: pointer;
          ">⏹ Stop</button>
          <button id="playlist-next" style="
            flex: 1;
            padding: 8px;
            background: rgba(200, 100, 255, 0.2);
            border: 1px solid rgba(200, 100, 255, 0.3);
            border-radius: 6px;
            color: white;
            font-size: 11px;
            cursor: pointer;
          ">Next ▶</button>
        </div>
      </div>
    ` : ''}

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${system.playlists.map(playlist => `
        <div class="playlist-item" data-id="${playlist.id}" style="
          padding: 12px;
          background: ${system.currentPlaylist?.id === playlist.id ? 'rgba(200, 100, 255, 0.2)' : 'rgba(200, 100, 255, 0.08)'};
          border: 1px solid ${system.currentPlaylist?.id === playlist.id ? 'rgba(200, 100, 255, 0.3)' : 'transparent'};
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-size: 13px; font-weight: bold; color: white;">
                ${playlist.name}
              </div>
              <div style="font-size: 11px; color: #888; margin-top: 4px;">
                ${playlist.exhibits.length} exhibits
              </div>
              ${playlist.description ? `
                <div style="font-size: 10px; color: #666; margin-top: 4px;">
                  ${playlist.description}
                </div>
              ` : ''}
            </div>
            <button class="playlist-play" data-id="${playlist.id}" style="
              background: rgba(100, 200, 100, 0.2);
              border: 1px solid rgba(100, 200, 100, 0.3);
              border-radius: 50%;
              width: 32px;
              height: 32px;
              color: white;
              cursor: pointer;
              font-size: 12px;
            ">▶</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(200, 100, 255, 0.1);
    ">
      <button id="create-playlist" style="
        width: 100%;
        padding: 10px;
        background: rgba(200, 100, 255, 0.2);
        border: 1px solid rgba(200, 100, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 12px;
        cursor: pointer;
      ">+ Create New Playlist</button>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#playlist-close') as HTMLButtonElement;
  closeBtn.onclick = () => closePlaylistPanel(system);

  // Wire up now playing controls
  const prevBtn = panel.querySelector('#playlist-prev') as HTMLButtonElement;
  const stopBtn = panel.querySelector('#playlist-stop') as HTMLButtonElement;
  const nextBtn = panel.querySelector('#playlist-next') as HTMLButtonElement;

  if (prevBtn) prevBtn.onclick = () => playlistPrev(system);
  if (stopBtn) {
    stopBtn.onclick = () => {
      stopPlaylist(system);
      closePlaylistPanel(system);
      openPlaylistPanel(system);
    };
  }
  if (nextBtn) nextBtn.onclick = () => playlistNext(system);

  // Wire up play buttons
  const playBtns = panel.querySelectorAll('.playlist-play');
  playBtns.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id || '';
      startPlaylist(system, id);
      closePlaylistPanel(system);
    };
  });

  // Wire up item hover
  const items = panel.querySelectorAll('.playlist-item');
  items.forEach(item => {
    (item as HTMLElement).onmouseover = () => {
      if ((item as HTMLElement).dataset.id !== system.currentPlaylist?.id) {
        (item as HTMLElement).style.background = 'rgba(200, 100, 255, 0.15)';
      }
    };
    (item as HTMLElement).onmouseout = () => {
      if ((item as HTMLElement).dataset.id !== system.currentPlaylist?.id) {
        (item as HTMLElement).style.background = 'rgba(200, 100, 255, 0.08)';
      }
    };
  });

  // Wire up create playlist (simplified - just shows notification)
  const createBtn = panel.querySelector('#create-playlist') as HTMLButtonElement;
  createBtn.onclick = () => {
    const name = prompt('Enter playlist name:');
    if (name) {
      createPlaylist(system, name);
      closePlaylistPanel(system);
      openPlaylistPanel(system);
    }
  };

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePlaylistPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close playlist panel
 */
function closePlaylistPanel(system: PlaylistSystem): void {
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
 * Toggle playlist panel
 */
export function togglePlaylistPanel(system: PlaylistSystem): void {
  if (system.isOpen) {
    closePlaylistPanel(system);
  } else {
    openPlaylistPanel(system);
  }
}

// ============================================================================
// Persistence
// ============================================================================

function loadPlaylists(): Playlist[] {
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

function savePlaylists(playlists: Playlist[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposePlaylistSystem(system: PlaylistSystem): void {
  system.cleanup();
}
