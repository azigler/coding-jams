/**
 * Recording utilities for capturing animations as GIFs using gif.js
 * Refactored with async/await flow, status callbacks, and AbortController support
 */

import type p5 from 'p5';
// @ts-ignore - gif.js might not have types
import GIF from 'gif.js';
// @ts-ignore - Vite handles this as a URL
import workerScriptUrl from 'gif.js/dist/gif.worker.js?url';

// Type for anything that has a canvas property (p5 instance or wrapper)
export interface CanvasSource {
  canvas: HTMLCanvasElement;
}

/**
 * Recording status interface for tracking progress
 */
export interface RecordingStatus {
  state: 'idle' | 'recording' | 'encoding' | 'complete' | 'error';
  progress: number;        // 0-100
  message: string;         // Human-readable status
  startTime?: number;      // Recording start timestamp
  frameCount?: number;     // Frames captured so far
  fileSize?: number;       // Final GIF size in bytes
}

export type StatusCallback = (status: RecordingStatus) => void;

/**
 * Recording configuration
 */
export interface RecordingConfig {
  enabled: boolean;
  duration: number; // seconds (legacy, now ignored - fixed to 10s)
  filename: string;
}

// Constants
const FIXED_DURATION_MS = 10_000;  // Fixed 10-second duration
const FPS = 30;
const TOTAL_FRAMES = (FIXED_DURATION_MS / 1000) * FPS; // 300 frames
const SCALE = 0.5; // Downscale for better performance and smaller files

/**
 * Record a GIF from anything with a canvas property (p5 sketch or GLSL renderer wrapper)
 * Uses async/await for clean flow control
 */
export async function recordGif(
  source: CanvasSource,
  onStatus: StatusCallback,
  abortSignal?: AbortSignal
): Promise<Blob> {
  // Emit initial status
  onStatus({
    state: 'recording',
    progress: 0,
    message: 'Starting...',
    startTime: Date.now(),
    frameCount: 0,
  });

  // Get canvas from source
  const canvas = source.canvas;
  if (!canvas) {
    throw new Error('Canvas not available');
  }

  // Calculate scaled dimensions
  const scaledWidth = Math.floor(canvas.width * SCALE);
  const scaledHeight = Math.floor(canvas.height * SCALE);

  console.log('🎬 Recording started:', {
    originalSize: `${canvas.width}x${canvas.height}`,
    scaledSize: `${scaledWidth}x${scaledHeight}`,
    duration: `${FIXED_DURATION_MS / 1000}s`,
    totalFrames: TOTAL_FRAMES,
    fps: FPS,
  });

  // Initialize GIF encoder
  const encoder = new GIF({
    workers: 2,
    quality: 10,
    width: scaledWidth,
    height: scaledHeight,
    workerScript: workerScriptUrl,
    repeat: 0, // Loop forever
  });

  // Create reusable temp canvas for scaling (prevents memory leaks)
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = scaledWidth;
  tempCanvas.height = scaledHeight;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

  if (!tempCtx) {
    throw new Error('Failed to create temporary canvas context');
  }

  // Enable smooth scaling
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  const frameDelay = 1000 / FPS; // ~33.33ms

  // Capture frames
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    // Check for abort
    if (abortSignal?.aborted) {
      encoder.abort?.();
      throw new Error('Recording cancelled');
    }

    // Wait for next animation frame
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Draw scaled frame to temp canvas
    tempCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);

    // Add frame to encoder
    encoder.addFrame(tempCtx, { copy: true, delay: frameDelay });

    // Update status
    const progress = ((frame + 1) / TOTAL_FRAMES) * 100;
    const elapsed = ((frame + 1) / FPS).toFixed(1);

    onStatus({
      state: 'recording',
      progress,
      message: `Recording... ${elapsed}s / 10s`,
      frameCount: frame + 1,
      startTime: Date.now(),
    });

    // Log progress every 30 frames (1 second)
    if ((frame + 1) % 30 === 0) {
      console.log(`📹 Captured ${frame + 1}/${TOTAL_FRAMES} frames (${Math.round(progress)}%)`);
    }
  }

  console.log('📹 Frame capture complete, encoding GIF...');

  // Encoding phase
  onStatus({
    state: 'encoding',
    progress: 0,
    message: 'Encoding GIF...',
    frameCount: TOTAL_FRAMES,
  });

  // Wait for encoding to complete
  return new Promise((resolve, reject) => {
    // Check for abort during encoding
    if (abortSignal?.aborted) {
      encoder.abort?.();
      reject(new Error('Recording cancelled'));
      return;
    }

    // Set up abort listener for encoding phase
    const abortHandler = () => {
      encoder.abort?.();
      reject(new Error('Recording cancelled'));
    };
    abortSignal?.addEventListener('abort', abortHandler);

    // Progress callback
    encoder.on('progress', (p: number) => {
      onStatus({
        state: 'encoding',
        progress: p * 100,
        message: `Encoding... ${Math.round(p * 100)}%`,
        frameCount: TOTAL_FRAMES,
      });
    });

    // Completion callback
    encoder.on('finished', (blob: Blob) => {
      abortSignal?.removeEventListener('abort', abortHandler);

      console.log('✅ GIF encoding complete!', {
        size: `${(blob.size / 1024).toFixed(0)} KB`,
        frames: TOTAL_FRAMES,
      });

      onStatus({
        state: 'complete',
        progress: 100,
        message: `Done! ${(blob.size / 1024).toFixed(0)} KB`,
        fileSize: blob.size,
        frameCount: TOTAL_FRAMES,
      });

      resolve(blob);
    });

    // Error callback
    encoder.on('error', (error: Error) => {
      abortSignal?.removeEventListener('abort', abortHandler);
      console.error('❌ GIF encoding error:', error);

      onStatus({
        state: 'error',
        progress: 0,
        message: `Error: ${error.message}`,
      });

      reject(error);
    });

    // Start encoding
    encoder.render();
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  console.log(`✅ Downloaded: ${filename}`);
}

/**
 * Update the recording button state based on status
 */
export function updateRecordButton(status: RecordingStatus): void {
  const btn = document.getElementById('download-timelapse-btn') as HTMLButtonElement | null;
  if (!btn) return;

  switch (status.state) {
    case 'idle':
      btn.textContent = '🎬 Record GIF';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      break;
    case 'recording':
      btn.textContent = `⏺️ ${status.progress.toFixed(0)}%`;
      btn.disabled = true;
      btn.style.opacity = '0.8';
      btn.style.cursor = 'not-allowed';
      break;
    case 'encoding':
      btn.textContent = `⚙️ Encoding ${status.progress.toFixed(0)}%`;
      btn.disabled = true;
      btn.style.opacity = '0.8';
      btn.style.cursor = 'not-allowed';
      break;
    case 'complete':
      btn.textContent = '✅ Done!';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      // Reset after 3 seconds
      setTimeout(() => {
        if (btn.textContent === '✅ Done!') {
          updateRecordButton({ state: 'idle', progress: 0, message: '' });
        }
      }, 3000);
      break;
    case 'error':
      btn.textContent = '❌ Error';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      // Reset after 3 seconds
      setTimeout(() => {
        if (btn.textContent === '❌ Error') {
          updateRecordButton({ state: 'idle', progress: 0, message: '' });
        }
      }, 3000);
      break;
  }
}

// ============================================
// Legacy API for backwards compatibility
// ============================================

let legacyEncoder: GIF | null = null;
let legacyIsRecording = false;
let legacyRecordingDuration = 0;
let legacyFramesCaptured = 0;
let legacyLastCaptureTime = 0;
let legacyCaptureInterval = 33.33;

/**
 * @deprecated Use recordGif() instead
 */
export function initEncoder(p: p5, config: RecordingConfig): GIF | null {
  const fps = 30;
  legacyRecordingDuration = config.duration * fps;
  legacyCaptureInterval = 1000 / fps;

  try {
    const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
    if (!canvas) {
      console.error('Canvas not available');
      return null;
    }

    const scale = 0.5;
    const canvasWidth = Math.floor(canvas.width * scale);
    const canvasHeight = Math.floor(canvas.height * scale);

    console.log('Initializing GIF encoder:', {
      originalWidth: canvas.width,
      originalHeight: canvas.height,
      scaledWidth: canvasWidth,
      scaledHeight: canvasHeight,
      scale: scale,
      fps: fps,
      duration: config.duration,
      totalFrames: legacyRecordingDuration
    });

    legacyEncoder = new GIF({
      workers: 2,
      quality: 10,
      width: canvasWidth,
      height: canvasHeight,
      workerScript: workerScriptUrl,
      repeat: 0
    });

    console.log('GIF encoder created successfully');

    legacyEncoder.on('finished', (blob: Blob) => {
      console.log('✅ GIF encoding finished!', {
        blobSize: blob.size,
        framesCaptured: legacyFramesCaptured,
        expectedFrames: legacyRecordingDuration
      });

      if (blob.size === 0) {
        console.error('❌ GIF blob is empty!');
        const timelapseBtn = document.getElementById('download-timelapse-btn') as HTMLButtonElement | null;
        if (timelapseBtn) {
          timelapseBtn.textContent = '❌ Error: Empty GIF';
          timelapseBtn.disabled = false;
        }
        return;
      }

      downloadBlob(blob, `${config.filename}.gif`);

      const timelapseBtn = document.getElementById('download-timelapse-btn');
      if (timelapseBtn) {
        timelapseBtn.textContent = '✅ Done!';
        setTimeout(() => {
          if (timelapseBtn) {
            timelapseBtn.textContent = '🎬 Download Timelapse';
            (timelapseBtn as HTMLButtonElement).disabled = false;
          }
        }, 2000);
      }

      legacyIsRecording = false;
      legacyEncoder = null;
      legacyFramesCaptured = 0;
    });

    legacyEncoder.on('progress', (progress: number) => {
      console.log(`GIF encoding progress: ${Math.round(progress * 100)}%`);
    });

    legacyEncoder.on('error', (error: Error) => {
      console.error('GIF encoding error:', error);
    });

    return legacyEncoder;
  } catch (error) {
    console.error('Error initializing GIF encoder:', error);
    return null;
  }
}

/**
 * @deprecated Use recordGif() instead
 */
export function startRecording(p: p5, config: RecordingConfig): void {
  if (!legacyEncoder) {
    legacyEncoder = initEncoder(p, config);
    if (!legacyEncoder) {
      console.error('Failed to initialize GIF encoder');
      return;
    }
  }

  legacyIsRecording = true;
  legacyFramesCaptured = 0;
  legacyLastCaptureTime = performance.now();
  (p as any)._isRecording = true;

  console.log('🎬 Recording started...');
}

/**
 * @deprecated Use recordGif() instead
 */
export function captureFrame(p: p5): void {
  if (!legacyIsRecording || !legacyEncoder) {
    return;
  }

  const now = performance.now();
  if (legacyFramesCaptured > 0 && now - legacyLastCaptureTime < legacyCaptureInterval) {
    return;
  }
  legacyLastCaptureTime = now;

  try {
    const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
    if (!canvas) {
      console.warn('Canvas not available');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }

    const scale = legacyEncoder!.options.width / canvas.width;
    const scaledWidth = legacyEncoder!.options.width;
    const scaledHeight = legacyEncoder!.options.height;

    if (scale !== 1) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (tempCtx) {
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);
        legacyEncoder.addFrame(tempCtx, { copy: true, delay: Math.round(legacyCaptureInterval) });
      } else {
        legacyEncoder.addFrame(ctx, { copy: true, delay: Math.round(legacyCaptureInterval) });
      }
    } else {
      legacyEncoder.addFrame(ctx, { copy: true, delay: Math.round(legacyCaptureInterval) });
    }

    legacyFramesCaptured++;

    if (legacyFramesCaptured % 30 === 0) {
      console.log(`📹 Captured ${legacyFramesCaptured}/${legacyRecordingDuration} frames (${Math.round((legacyFramesCaptured / legacyRecordingDuration) * 100)}%)`);
    }

    if (legacyFramesCaptured >= legacyRecordingDuration) {
      console.log(`📹 Recording complete! Captured ${legacyFramesCaptured}/${legacyRecordingDuration} frames, finalizing GIF...`);
      stopRecording(p);
    }
  } catch (error) {
    console.error('Error capturing frame:', error);
  }
}

/**
 * @deprecated Use recordGif() instead
 */
export function stopRecording(p?: p5): void {
  if (!legacyIsRecording || !legacyEncoder) {
    console.warn('stopRecording called but not recording or no encoder');
    return;
  }

  console.log(`🎬 Stopping recording (captured ${legacyFramesCaptured} frames), rendering GIF...`);
  legacyIsRecording = false;

  if (p) {
    (p as any)._isRecording = false;
  }

  legacyEncoder.render();
  console.log('🎬 GIF rendering started...');
}

/**
 * @deprecated Use recordGif() instead
 */
export function isCurrentlyRecording(): boolean {
  return legacyIsRecording;
}
