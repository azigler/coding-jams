/**
 * Photo Gallery
 *
 * Stores and displays screenshots taken in the museum.
 * Uses IndexedDB for persistent storage.
 */

// ============================================================================
// Types
// ============================================================================

export interface PhotoGallery {
  container: HTMLElement;
  overlay: HTMLElement | null;
  photos: Photo[];
  isOpen: boolean;
  cleanup: () => void;
}

export interface Photo {
  id: string;
  dayNumber: number;
  dataUrl: string;
  timestamp: number;
  caption?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DB_NAME = 'genuary-museum-gallery';
const DB_VERSION = 1;
const STORE_NAME = 'photos';
const MAX_PHOTOS = 50; // Limit storage

// ============================================================================
// IndexedDB Helpers
// ============================================================================

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function loadPhotos(): Promise<Photo[]> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Sort by newest first
        const photos = (request.result as Photo[]).sort((a, b) => b.timestamp - a.timestamp);
        resolve(photos);
      };
    });
  } catch (e) {
    console.warn('Could not load photos:', e);
    return [];
  }
}

async function savePhoto(photo: Photo): Promise<void> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Add the new photo
      const request = store.add(photo);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (e) {
    console.warn('Could not save photo:', e);
  }
}

async function deletePhoto(id: string): Promise<void> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (e) {
    console.warn('Could not delete photo:', e);
  }
}

// ============================================================================
// Gallery System Creation
// ============================================================================

/**
 * Create the photo gallery system
 */
export function createPhotoGallery(container: HTMLElement): PhotoGallery {
  const gallery: PhotoGallery = {
    container,
    overlay: null,
    photos: [],
    isOpen: false,
    cleanup: () => {
      if (gallery.overlay) {
        gallery.overlay.remove();
        gallery.overlay = null;
      }
    },
  };

  // Load photos asynchronously
  loadPhotos().then(photos => {
    gallery.photos = photos;
  });

  // Handle Shift+G key for gallery
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyG' && event.shiftKey && !event.ctrlKey && !event.metaKey) {
      toggleGallery(gallery);
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = gallery.cleanup;
  gallery.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return gallery;
}

/**
 * Add a photo to the gallery
 */
export async function addPhotoToGallery(
  gallery: PhotoGallery,
  dataUrl: string,
  dayNumber: number
): Promise<void> {
  const photo: Photo = {
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dayNumber,
    dataUrl,
    timestamp: Date.now(),
  };

  // Add to local array
  gallery.photos.unshift(photo);

  // Limit array size
  if (gallery.photos.length > MAX_PHOTOS) {
    const removed = gallery.photos.pop();
    if (removed) {
      await deletePhoto(removed.id);
    }
  }

  // Save to IndexedDB
  await savePhoto(photo);
}

/**
 * Get photo count
 */
export function getPhotoCount(gallery: PhotoGallery): number {
  return gallery.photos.length;
}

/**
 * Toggle gallery view
 */
export function toggleGallery(gallery: PhotoGallery): void {
  if (gallery.isOpen) {
    closeGallery(gallery);
  } else {
    openGallery(gallery);
  }
}

/**
 * Open the gallery overlay
 */
function openGallery(gallery: PhotoGallery): void {
  if (gallery.overlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'photo-gallery-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 10, 20, 0.95);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(100, 150, 255, 0.2);
  `;
  header.innerHTML = `
    <div>
      <h2 style="color: white; margin: 0; font-family: system-ui, sans-serif;">
        📷 Photo Gallery
      </h2>
      <p style="color: #888; margin: 5px 0 0 0; font-size: 13px; font-family: system-ui, sans-serif;">
        ${gallery.photos.length} photo${gallery.photos.length !== 1 ? 's' : ''} • Press P while viewing exhibits to take screenshots
      </p>
    </div>
  `;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    transition: background 0.2s;
  `;
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => closeGallery(gallery);
  closeBtn.onmouseenter = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
  closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
  header.appendChild(closeBtn);

  overlay.appendChild(header);

  // Photo grid
  const grid = document.createElement('div');
  grid.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  `;

  if (gallery.photos.length === 0) {
    // Empty state
    grid.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-family: system-ui, sans-serif;
        text-align: center;
      ">
        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">📷</div>
        <h3 style="color: #888; margin: 0 0 10px 0;">No photos yet</h3>
        <p style="margin: 0; font-size: 14px;">
          Press <kbd style="background: rgba(60, 60, 80, 0.8); padding: 4px 8px; border-radius: 4px;">P</kbd>
          while viewing an exhibit to take a screenshot
        </p>
      </div>
    `;
  } else {
    // Photo grid
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    `;

    gallery.photos.forEach(photo => {
      const card = createPhotoCard(gallery, photo);
      gridContainer.appendChild(card);
    });

    grid.appendChild(gridContainer);
  }

  overlay.appendChild(grid);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeGallery(gallery);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  gallery.container.appendChild(overlay);
  gallery.overlay = overlay;
  gallery.isOpen = true;

  // Fade in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
}

/**
 * Create a photo card element
 */
function createPhotoCard(gallery: PhotoGallery, photo: Photo): HTMLElement {
  const card = document.createElement('div');
  card.style.cssText = `
    background: rgba(30, 30, 45, 0.8);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(100, 150, 255, 0.2);
    transition: transform 0.2s, border-color 0.2s;
    cursor: pointer;
  `;

  card.onmouseenter = () => {
    card.style.transform = 'scale(1.02)';
    card.style.borderColor = 'rgba(100, 150, 255, 0.5)';
  };
  card.onmouseleave = () => {
    card.style.transform = 'scale(1)';
    card.style.borderColor = 'rgba(100, 150, 255, 0.2)';
  };

  // Image
  const img = document.createElement('img');
  img.src = photo.dataUrl;
  img.style.cssText = `
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
  `;
  img.onclick = () => viewFullPhoto(gallery, photo);
  card.appendChild(img);

  // Info
  const info = document.createElement('div');
  info.style.cssText = `
    padding: 12px;
    font-family: system-ui, sans-serif;
  `;

  const date = new Date(photo.timestamp);
  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  info.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="color: white; font-weight: 500; font-size: 14px;">Day ${photo.dayNumber}</div>
        <div style="color: #888; font-size: 11px;">${dateStr}</div>
      </div>
      <div class="photo-actions" style="display: flex; gap: 8px;">
        <button class="download-btn" style="
          background: none;
          border: none;
          color: #4a9eff;
          cursor: pointer;
          padding: 4px;
          font-size: 14px;
        " title="Download">💾</button>
        <button class="delete-btn" style="
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          padding: 4px;
          font-size: 14px;
        " title="Delete">🗑️</button>
      </div>
    </div>
  `;

  // Download button
  const downloadBtn = info.querySelector('.download-btn') as HTMLButtonElement;
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    downloadPhoto(photo);
  };

  // Delete button
  const deleteBtn = info.querySelector('.delete-btn') as HTMLButtonElement;
  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    if (confirm('Delete this photo?')) {
      await deletePhoto(photo.id);
      gallery.photos = gallery.photos.filter(p => p.id !== photo.id);
      card.remove();
      // Update count in header
      const header = gallery.overlay?.querySelector('p');
      if (header) {
        header.textContent = `${gallery.photos.length} photo${gallery.photos.length !== 1 ? 's' : ''} • Press P while viewing exhibits to take screenshots`;
      }
    }
  };

  card.appendChild(info);
  return card;
}

/**
 * View a photo in full screen
 */
function viewFullPhoto(gallery: PhotoGallery, photo: Photo): void {
  const viewer = document.createElement('div');
  viewer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
  `;

  const img = document.createElement('img');
  img.src = photo.dataUrl;
  img.style.cssText = `
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
  `;

  viewer.appendChild(img);

  // Info bar
  const infoBar = document.createElement('div');
  infoBar.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.9);
    padding: 10px 20px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    color: white;
    display: flex;
    gap: 20px;
    align-items: center;
  `;

  const date = new Date(photo.timestamp);
  infoBar.innerHTML = `
    <span>Day ${photo.dayNumber}</span>
    <span style="color: #888;">•</span>
    <span style="color: #888;">${date.toLocaleString()}</span>
    <button style="
      background: #4a9eff;
      border: none;
      color: white;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
    ">💾 Download</button>
  `;

  const downloadBtn = infoBar.querySelector('button') as HTMLButtonElement;
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    downloadPhoto(photo);
  };

  viewer.appendChild(infoBar);

  // Close on click
  viewer.onclick = () => viewer.remove();

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      viewer.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(viewer);
}

/**
 * Download a photo
 */
function downloadPhoto(photo: Photo): void {
  const link = document.createElement('a');
  link.href = photo.dataUrl;
  link.download = `genuary-day-${photo.dayNumber}-${new Date(photo.timestamp).toISOString().slice(0, 10)}.png`;
  link.click();
}

/**
 * Close the gallery
 */
function closeGallery(gallery: PhotoGallery): void {
  if (!gallery.overlay) return;

  gallery.overlay.style.opacity = '0';
  const overlay = gallery.overlay;

  setTimeout(() => {
    overlay.remove();
    if (gallery.overlay === overlay) {
      gallery.overlay = null;
    }
  }, 300);

  gallery.isOpen = false;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose photo gallery
 */
export function disposePhotoGallery(gallery: PhotoGallery): void {
  gallery.cleanup();
}
