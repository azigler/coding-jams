# Task 1: Fix GIF Recorder with Visual Status

**Priority:** High
**Complexity:** Medium
**Files to Modify:** `src/utils/recording.ts`, `src/index.ts`, `index.html`

---

## Problem Statement

The current GIF recording system has several issues:

1. **No visual feedback** — Status only appears in console, users don't know what's happening
2. **Variable duration** — Each day can specify different durations, but users typically want 10 seconds
3. **Memory leaks** — Temporary canvases created per frame are not garbage collected
4. **Fragile timing** — 4 levels of nested `setTimeout` chains cause race conditions
5. **No progress indication** — Users stare at a frozen button wondering if it's working

---

## Requirements

### Functional
- Fixed **10-second GIF duration** for all days
- **On-canvas status overlay** showing:
  - Recording state (idle → recording → encoding → complete)
  - Progress bar during recording (0-100%)
  - Progress bar during encoding (0-100%)
  - Final file size when complete
- **Single button** that reflects current state
- **Cancellable** — User can abort mid-recording

### Non-Functional
- No memory leaks from frame capture
- Clean async/await flow (no callback hell)
- Proper cleanup on page navigation

---

## Technical Specification

### 1. Recording Status Interface

```typescript
// src/utils/recording.ts

interface RecordingStatus {
  state: 'idle' | 'recording' | 'encoding' | 'complete' | 'error';
  progress: number;        // 0-100
  message: string;         // Human-readable status
  startTime?: number;      // Recording start timestamp
  frameCount?: number;     // Frames captured so far
  fileSize?: number;       // Final GIF size in bytes
}

type StatusCallback = (status: RecordingStatus) => void;
```

### 2. Status Overlay Component

Create a canvas overlay that displays recording status:

```typescript
// src/utils/recording-overlay.ts

export function createRecordingOverlay(canvas: HTMLCanvasElement): {
  update: (status: RecordingStatus) => void;
  destroy: () => void;
} {
  const overlay = document.createElement('div');
  overlay.id = 'recording-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 20px;
  `;

  // Position relative to canvas
  canvas.parentElement?.appendChild(overlay);

  // ... implementation
}
```

Visual design for overlay:
```
┌─────────────────────────────────────┐
│                                     │
│          [Canvas Content]           │
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔴 Recording... 7.2s / 10s  │    │
│  │ ████████████░░░░░░░░ 72%    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 3. Refactored Recording Flow

Replace the current callback-based approach with async/await:

```typescript
// src/utils/recording.ts

export async function recordGif(
  p: p5,
  onStatus: StatusCallback,
  abortSignal?: AbortSignal
): Promise<Blob> {
  const DURATION_MS = 10_000;
  const FPS = 30;
  const TOTAL_FRAMES = (DURATION_MS / 1000) * FPS;

  onStatus({ state: 'recording', progress: 0, message: 'Starting...' });

  // Initialize encoder
  const encoder = new GIF({
    workers: 2,
    quality: 10,
    width: p.width,
    height: p.height,
  });

  // Reusable temp canvas (no memory leak)
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = p.width;
  tempCanvas.height = p.height;
  const tempCtx = tempCanvas.getContext('2d')!;

  // Capture frames
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    if (abortSignal?.aborted) {
      throw new Error('Recording cancelled');
    }

    // Wait for next frame
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Capture current canvas state
    tempCtx.drawImage(p.canvas as HTMLCanvasElement, 0, 0);
    encoder.addFrame(tempCtx, { copy: true, delay: 1000 / FPS });

    // Update status
    const progress = ((frame + 1) / TOTAL_FRAMES) * 100;
    const elapsed = ((frame + 1) / FPS).toFixed(1);
    onStatus({
      state: 'recording',
      progress,
      message: `Recording... ${elapsed}s / 10s`,
      frameCount: frame + 1,
    });
  }

  // Encode
  onStatus({ state: 'encoding', progress: 0, message: 'Encoding GIF...' });

  return new Promise((resolve, reject) => {
    encoder.on('progress', (p: number) => {
      onStatus({
        state: 'encoding',
        progress: p * 100,
        message: `Encoding... ${Math.round(p * 100)}%`,
      });
    });

    encoder.on('finished', (blob: Blob) => {
      onStatus({
        state: 'complete',
        progress: 100,
        message: `Done! ${(blob.size / 1024).toFixed(0)}KB`,
        fileSize: blob.size,
      });
      resolve(blob);
    });

    encoder.on('error', reject);
    encoder.render();
  });
}
```

### 4. Button State Management

Update the download button to reflect recording state:

```typescript
// In index.ts or as a separate component

function updateRecordButton(status: RecordingStatus) {
  const btn = document.getElementById('download-timelapse');
  if (!btn) return;

  switch (status.state) {
    case 'idle':
      btn.textContent = '🎬 Record GIF';
      btn.disabled = false;
      break;
    case 'recording':
      btn.textContent = `⏺️ ${status.progress.toFixed(0)}%`;
      btn.disabled = true;
      break;
    case 'encoding':
      btn.textContent = `⚙️ Encoding...`;
      btn.disabled = true;
      break;
    case 'complete':
      btn.textContent = '✅ Done!';
      btn.disabled = false;
      // Reset after 2 seconds
      setTimeout(() => updateRecordButton({ state: 'idle', progress: 0, message: '' }), 2000);
      break;
    case 'error':
      btn.textContent = '❌ Error';
      btn.disabled = false;
      break;
  }
}
```

### 5. Cleanup on Navigation

Use AbortController to cancel recording if user navigates away:

```typescript
// In index.ts

let recordingAbortController: AbortController | null = null;

async function startRecording(p: p5) {
  // Cancel any existing recording
  recordingAbortController?.abort();
  recordingAbortController = new AbortController();

  try {
    const blob = await recordGif(p, updateRecordButton, recordingAbortController.signal);
    downloadBlob(blob, `genuary-2026-day-${currentDay}.gif`);
  } catch (e) {
    if (e.message !== 'Recording cancelled') {
      console.error('Recording failed:', e);
      updateRecordButton({ state: 'error', progress: 0, message: e.message });
    }
  } finally {
    recordingAbortController = null;
  }
}

// In loadDay()
function loadDay(dayNum: number) {
  recordingAbortController?.abort(); // Cancel any recording
  // ... rest of cleanup
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/utils/recording.ts` | Rewrite | Async/await flow, status callbacks |
| `src/utils/recording-overlay.ts` | Create | Visual status overlay component |
| `src/index.ts` | Modify | Integrate new recording flow, abort handling |
| `index.html` | Modify | Update button styling for states |

---

## Testing Checklist

- [ ] Recording starts and shows progress overlay
- [ ] Progress updates smoothly during capture
- [ ] Encoding progress is shown
- [ ] Final GIF downloads automatically
- [ ] Navigating away cancels recording gracefully
- [ ] Button states update correctly
- [ ] No console errors or memory warnings
- [ ] Works on mobile (scaled canvas)

---

## Stretch Goals

- [ ] Quality selector (low/medium/high affecting scale factor)
- [ ] Duration selector (5s/10s/15s)
- [ ] Preview last frame before download
- [ ] Cancel button appears during recording
