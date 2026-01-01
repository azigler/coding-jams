/**
 * Recording utilities for capturing animations as GIFs using gif.js
 */

/**
 * Recording utilities for capturing animations as GIFs using gif.js
 */

import type p5 from 'p5';
// @ts-ignore - gif.js might not have types
import GIF from 'gif.js';
// @ts-ignore - Vite handles this as a URL
import workerScriptUrl from 'gif.js/dist/gif.worker.js?url';

export interface RecordingConfig {
  enabled: boolean;
  duration: number; // seconds
  filename: string;
}

let encoder: GIF | null = null;
let isRecording = false;
let recordingStartFrame = 0;
let recordingDuration = 0;
let framesCaptured = 0;
let lastCaptureTime = 0;
let captureInterval = 33.33; // ~30fps in milliseconds (1000/30)

/**
 * Initialize GIF encoder
 */
export function initEncoder(p: p5, config: RecordingConfig): GIF | null {
  const fps = 30;
  recordingDuration = config.duration * fps;
  captureInterval = 1000 / fps; // Calculate exact interval for fps
  
  try {
    // Get actual canvas dimensions (not CSS-scaled)
    const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
    if (!canvas) {
      console.error('Canvas not available');
      return null;
    }
    
    // Optionally downscale for better performance (0.5x = half size)
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
      totalFrames: recordingDuration
    });
    
    encoder = new GIF({
      workers: 2,
      quality: 10,
      width: canvasWidth,
      height: canvasHeight,
      workerScript: workerScriptUrl,
      repeat: 0 // Loop forever
    });
    
    console.log('GIF encoder created successfully');
    
    encoder.on('finished', (blob: Blob) => {
      console.log('✅ GIF encoding finished!', {
        blobSize: blob.size,
        framesCaptured: framesCaptured,
        expectedFrames: recordingDuration
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
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.filename}.gif`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ GIF created and downloaded!');
      
      // Update button if it exists
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
      
      isRecording = false;
      encoder = null;
      framesCaptured = 0;
    });
    
    encoder.on('progress', (progress: number) => {
      console.log(`GIF encoding progress: ${Math.round(progress * 100)}%`);
    });
    
    encoder.on('error', (error: Error) => {
      console.error('GIF encoding error:', error);
    });
    
    return encoder;
  } catch (error) {
    console.error('Error initializing GIF encoder:', error);
    return null;
  }
}

/**
 * Start recording
 */
export function startRecording(p: p5, config: RecordingConfig): void {
  if (!encoder) {
    encoder = initEncoder(p, config);
    if (!encoder) {
      console.error('Failed to initialize GIF encoder');
      return;
    }
  }
  
  recordingStartFrame = p.frameCount;
  isRecording = true;
  framesCaptured = 0;
  lastCaptureTime = performance.now(); // Initialize timing
  (p as any)._isRecording = true;
  (p as any)._recordingStartFrame = recordingStartFrame;
  
  console.log('🎬 Recording started...', {
    startFrame: recordingStartFrame,
    targetFrames: recordingDuration,
    fps: Math.round(1000 / captureInterval)
  });
}

/**
 * Capture current frame (call this in draw())
 * Throttled to capture exactly at the target fps
 */
export function captureFrame(p: p5): void {
  if (!isRecording || !encoder) {
    return;
  }
  
  // Throttle frame capture to exactly target fps
  const now = performance.now();
  if (framesCaptured > 0 && now - lastCaptureTime < captureInterval) {
    return; // Skip this frame to maintain target fps
  }
  lastCaptureTime = now;
  
  try {
    // Get canvas and its actual dimensions
    const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
    if (!canvas) {
      console.warn('Canvas not available');
      return;
    }
    
    // Get the 2D context - this gives us the actual canvas data
    // Use willReadFrequently for better performance
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }
    
    // Create an offscreen canvas for downscaling
    const scale = encoder!.options.width / canvas.width;
    const scaledWidth = encoder!.options.width;
    const scaledHeight = encoder!.options.height;
    
    // Create temporary canvas for scaling if needed
    if (scale !== 1) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (tempCtx) {
        // Use smooth scaling for better quality
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        // Draw scaled version
        tempCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);
        // Add the scaled frame
        encoder.addFrame(tempCtx, { copy: true, delay: Math.round(captureInterval) });
      } else {
        // Fallback to direct capture
        encoder.addFrame(ctx, { copy: true, delay: Math.round(captureInterval) });
      }
    } else {
      // No scaling needed, capture directly
      encoder.addFrame(ctx, { copy: true, delay: Math.round(captureInterval) });
    }
    
    framesCaptured++;
    
    // Log progress every 30 frames
    if (framesCaptured % 30 === 0) {
      console.log(`📹 Captured ${framesCaptured}/${recordingDuration} frames (${Math.round((framesCaptured / recordingDuration) * 100)}%)`);
    }
    
    // Log first frame details for debugging
    if (framesCaptured === 1) {
      console.log('📹 First frame captured:', {
        originalCanvasSize: `${canvas.width}x${canvas.height}`,
        scaledSize: `${scaledWidth}x${scaledHeight}`,
        scale: scale,
        delay: Math.round(captureInterval)
      });
    }
    
    // Stop recording after we've captured the target number of frames
    if (framesCaptured >= recordingDuration) {
      console.log(`📹 Recording complete! Captured ${framesCaptured}/${recordingDuration} frames, finalizing GIF...`);
      stopRecording(p);
    }
  } catch (error) {
    console.error('Error capturing frame:', error);
  }
}

/**
 * Stop recording and finalize GIF
 */
export function stopRecording(p?: p5): void {
  if (!isRecording || !encoder) {
    console.warn('stopRecording called but not recording or no encoder');
    return;
  }
  
  console.log(`🎬 Stopping recording (captured ${framesCaptured} frames), rendering GIF...`);
  isRecording = false;
  
  // Clear recording flags on p5 instance
  if (p) {
    (p as any)._isRecording = false;
  }
  
  // Render the GIF
  encoder.render();
  console.log('🎬 GIF rendering started...');
}

/**
 * Check if currently recording
 */
export function isCurrentlyRecording(): boolean {
  return isRecording;
}
