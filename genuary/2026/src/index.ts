/**
 * Main entry point for Genuary 2026
 * Dynamically loads and runs the selected day
 */

import p5 from 'p5';
import type { DayConfig } from './types';
import { createControlsContainer, removeControlsContainer, loadControls, setControlsProgrammatically } from './utils/controls';
import type { ControlState } from './utils/controls';

// Ensure the programmatic API is exposed
if (typeof window !== 'undefined') {
  (window as any).setGenuaryControls = function(day: number, values: Partial<ControlState>) {
    console.log('🔧 Wrapper function called, delegating to setControlsProgrammatically');
    return setControlsProgrammatically(day, values);
  };
  console.log('✅ setGenuaryControls exposed from index.ts');
  console.log('   Type:', typeof (window as any).setGenuaryControls);
  
  // Test that it's callable
  if (typeof (window as any).setGenuaryControls === 'function') {
    console.log('✅ Function is callable');
  } else {
    console.error('❌ Function is not callable!');
  }
}

// Import all day modules
import day01 from './days/01';
import day02 from './days/02';
import day03 from './days/03';
import day04 from './days/04';
import day05 from './days/05';
import day06 from './days/06';
import day07 from './days/07';
import day08 from './days/08';
import day09 from './days/09';
import day10 from './days/10';
import day11 from './days/11';
import day12 from './days/12';
import day13 from './days/13';
import day14 from './days/14';
import day15 from './days/15';
import day16 from './days/16';
import day17 from './days/17';
import day18 from './days/18';
import day19 from './days/19';
import day20 from './days/20';
import day21 from './days/21';
import day22 from './days/22';
import day23 from './days/23';
import day24 from './days/24';
import day25 from './days/25';
import day26 from './days/26';
import day27 from './days/27';
import day28 from './days/28';
import day29 from './days/29';
import day30 from './days/30';
import day31 from './days/31';

const days: DayConfig[] = [
  day01, day02, day03, day04, day05, day06, day07, day08,
  day09, day10, day11, day12, day13, day14, day15, day16,
  day17, day18, day19, day20, day21, day22, day23, day24,
  day25, day26, day27, day28, day29, day30, day31
];

let currentSketch: p5 | null = null;
let currentDay: number = 1;
let currentControlsContainer: HTMLElement | null = null;

/**
 * Keep CSS in sync with actual fixed header height.
 * Fixes canvas being clipped under the header when day-info wraps.
 */
function syncHeaderHeight(): void {
  const header = document.getElementById('header');
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${h}px`);
}

/**
 * Get day number from URL hash or default to current day
 */
function getDayFromURL(): number {
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/#day(\d+)/);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        return dayNum;
      }
    }
  }
  
  // Default to today's date in January, or day 1 if not in January
  const now = new Date();
  if (now.getMonth() === 0) { // January is month 0
    return now.getDate();
  }
  return 1;
}

/**
 * Clean up all containers and sketches
 */
function cleanupContainers(): void {
  // Clean up previous sketch
  if (currentSketch) {
    // Clean up resize listener if it exists
    const canvas = (currentSketch as any).canvas as HTMLCanvasElement | undefined;
    if (canvas && (canvas as any)._cleanupResize) {
      (canvas as any)._cleanupResize();
    }
    currentSketch.remove();
    currentSketch = null;
  }

  // Remove p5 canvas container
  const p5Container = document.getElementById('p5-canvas-container');
  if (p5Container) {
    p5Container.remove();
  }

  // Remove HTML-only container (Day 28)
  const htmlContainer = document.getElementById('html-only-container');
  if (htmlContainer) {
    htmlContainer.remove();
  }

  // Remove controls container
  if (currentControlsContainer) {
    currentControlsContainer.remove();
    currentControlsContainer = null;
  }
}

/**
 * Load and run a specific day
 */
function loadDay(dayNum: number): void {
  // Clean up everything first
  cleanupContainers();

  if (dayNum < 1 || dayNum > 31) {
    console.error(`Invalid day number: ${dayNum}`);
    return;
  }

  const dayConfig = days[dayNum - 1];
  if (!dayConfig) {
    console.error(`Day ${dayNum} not found`);
    return;
  }

  currentDay = dayNum;

  // Special handling for Day 28 (HTML only, no canvas)
  if (dayNum === 28) {
    loadDay28HTML();
    return;
  }

  // Update URL hash
  window.location.hash = `#day${dayNum}`;

  // Update page title and info
  updateDayInfo(dayConfig);

  // Get content area
  const contentArea = document.getElementById('content');
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  // Create new container
  const container = document.createElement('div');
  container.id = 'p5-canvas-container';
  contentArea.appendChild(container);

  // Import day module to check for controls
  import(`./days/${dayNum.toString().padStart(2, '0')}.ts`).then((dayModule: any) => {
    const controlConfigs = dayModule.controlConfigs;
    const defaultControls: ControlState = dayModule.defaultControls || {};
    
    // Load controls BEFORE creating sketch so they're available immediately
    let currentControls: ControlState = {};
    if (controlConfigs && defaultControls) {
      currentControls = loadControls(dayNum, defaultControls);
    }
    
    // Create p5 sketch in instance mode
    const sketch = (p: p5) => {
      // Store recording module on p5 instance so it's accessible
      (p as any)._recordingModule = null;
      
      // Preload recording module if enabled
      if (dayConfig.recording?.enabled) {
        import('./utils/recording.js').then((module) => {
          (p as any)._recordingModule = module;
        });
      }
      
      // Set up controls if day module exports them
      // IMPORTANT: Apply controls immediately so they're available in setup/draw
      if (controlConfigs && defaultControls) {
        // Set controls on p5 instance BEFORE setup runs
        (p as any)._controls = currentControls;
        
        // Get Claude's Choice function if available
        const getClaudesChoice = dayModule.getClaudesChoice;
        
        // Create controls UI
        const controlsContainer = createControlsContainer(
          dayNum,
          controlConfigs,
          (values: ControlState) => {
            // Update controls on p5 instance
            (p as any)._controls = values;
            // Reset data to regenerate with new count (works for both triangles and balls)
            const prevCount = currentControls.numTriangles || currentControls.numBalls || currentControls.numParticles || defaultControls.numTriangles || defaultControls.numBalls || defaultControls.numParticles || 120;
            if (values.numTriangles !== prevCount || values.numBalls !== prevCount || values.numParticles !== prevCount) {
              (p as any)._triangleData = null;
              (p as any)._lastTriangleCount = null;
              (p as any)._balls = null;
              (p as any)._lastBallCount = null;
              (p as any)._particles = null;
              (p as any)._lastParticleCount = null;
            }
            // Reset color mutation data if changed
            if (values.colorMutation !== currentControls.colorMutation) {
              (p as any)._lastColorMutation = null;
            }
            // Reset particle control tracking if changed
            if (values.spiralTightness !== currentControls.spiralTightness || 
                values.colorSpread !== currentControls.colorSpread) {
              (p as any)._lastSpiralTightness = null;
              (p as any)._lastColorSpread = null;
            }
            // Reset mode-specific data when mode changes
            if (values.mode !== currentControls.mode) {
              (p as any)._particles = null;
              (p as any)._lastParticleCount = null;
              (p as any)._waveSources = null;
              (p as any)._lastWaveCount = null;
            }
            currentControls = values;
            // Redraw
            if (p.isLooping()) {
              p.redraw();
            }
          },
          getClaudesChoice
        );
        
        // Add controls container to content area (below canvas), not as fixed overlay
        const contentArea = document.getElementById('content');
        if (contentArea) {
          contentArea.appendChild(controlsContainer);
          currentControlsContainer = controlsContainer;
        } else {
          // Fallback to body if content area not found
          document.body.appendChild(controlsContainer);
          currentControlsContainer = controlsContainer;
        }
      }
      
      // Define setup function
      p.setup = () => {
        // Ensure controls are set before setup runs
        if (controlConfigs && defaultControls && !(p as any)._controls) {
          (p as any)._controls = currentControls;
        }
        
        if (dayConfig.setup) {
          dayConfig.setup(p);
        }
      };

      // Define draw function
      p.draw = () => {
        if (dayConfig.draw) {
          dayConfig.draw(p);
        }
        
        // Capture frame if recording
        const recordingModule = (p as any)._recordingModule;
        if (recordingModule && recordingModule.isCurrentlyRecording()) {
          recordingModule.captureFrame(p);
        }
      };

      // Define optional event handlers
      if (dayConfig.windowResized) {
        p.windowResized = () => {
          // Don't resize canvas - maintain fixed dimensions
          // Just update display scaling if needed
          const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
          const container = canvas?.parentElement;
          if (container && canvas) {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const maxDisplaySize = 800;
            const displayWidth = Math.min(p.width, maxDisplaySize);
            const displayHeight = Math.min(p.height, maxDisplaySize);
            
            let scale: number;
            let finalWidth: number;
            let finalHeight: number;
            
            if (isMobile) {
              // On mobile: enforce square aspect ratio (height = width)
              scale = Math.min((container.clientWidth * 0.95) / displayWidth, 1);
              finalWidth = displayWidth * scale;
              finalHeight = finalWidth; // Square
            } else {
              // On desktop: maintain original aspect ratio
              scale = Math.min(
                container.clientWidth / p.width,
                container.clientHeight / p.height,
                1
              );
              finalWidth = p.width * scale;
              finalHeight = p.height * scale;
            }
            
            canvas.style.width = `${finalWidth}px`;
            canvas.style.height = `${finalHeight}px`;
          }
          dayConfig.windowResized!(p);
        };
      }

      if (dayConfig.mousePressed) {
        p.mousePressed = () => dayConfig.mousePressed!(p);
      }

      // Key handler with built-in recording/saving shortcuts
      p.keyPressed = () => {
        // Call day-specific key handler first
        if (dayConfig.keyPressed) {
          dayConfig.keyPressed(p);
        }
        
        // Built-in shortcuts (only if not handled by day config)
        // Press 's' to save current frame
        if (p.key === 's' || p.key === 'S') {
          p.save(`genuary-2026-day-${dayConfig.day.toString().padStart(2, '0')}-frame.png`);
        }
        
        // Press 'r' to start/stop recording
        if ((p.key === 'r' || p.key === 'R') && dayConfig.recording) {
          // Try global saveGif first
          const globalSaveGif = (window as any).saveGif;
          if (typeof globalSaveGif === 'function') {
            globalSaveGif(dayConfig.recording.filename, dayConfig.recording.duration);
          } else {
            // Fallback to saveFrames
            // @ts-ignore
            if (typeof p.saveFrames === 'function') {
              // @ts-ignore
              p.saveFrames(dayConfig.recording.filename, 'png', dayConfig.recording.duration, 30);
            }
          }
        }
      };
    };

    currentSketch = new p5(sketch, container);
  }).catch(() => {
    // Fallback: create sketch without controls if module doesn't exist or has no controls
    const sketch = (p: p5) => {
      // Store recording module on p5 instance so it's accessible
      (p as any)._recordingModule = null;
      
      // Preload recording module if enabled
      if (dayConfig.recording?.enabled) {
        import('./utils/recording.js').then((module) => {
          (p as any)._recordingModule = module;
        });
      }
      
      // Define setup function
      p.setup = () => {
        if (dayConfig.setup) {
          dayConfig.setup(p);
        }
      };

      // Define draw function
      p.draw = () => {
        if (dayConfig.draw) {
          dayConfig.draw(p);
        }
        
        // Capture frame if recording
        const recordingModule = (p as any)._recordingModule;
        if (recordingModule && recordingModule.isCurrentlyRecording()) {
          recordingModule.captureFrame(p);
        }
      };

      // Define optional event handlers
      if (dayConfig.windowResized) {
        p.windowResized = () => {
          // Don't resize canvas - maintain fixed dimensions
          // Just update display scaling if needed
          const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
          const container = canvas?.parentElement;
          if (container && canvas) {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const maxDisplaySize = 800;
            const displayWidth = Math.min(p.width, maxDisplaySize);
            const displayHeight = Math.min(p.height, maxDisplaySize);
            
            let scale: number;
            let finalWidth: number;
            let finalHeight: number;
            
            if (isMobile) {
              // On mobile: enforce square aspect ratio (height = width)
              scale = Math.min((container.clientWidth * 0.95) / displayWidth, 1);
              finalWidth = displayWidth * scale;
              finalHeight = finalWidth; // Square
            } else {
              // On desktop: maintain original aspect ratio
              scale = Math.min(
                container.clientWidth / p.width,
                container.clientHeight / p.height,
                1
              );
              finalWidth = p.width * scale;
              finalHeight = p.height * scale;
            }
            
            canvas.style.width = `${finalWidth}px`;
            canvas.style.height = `${finalHeight}px`;
          }
          dayConfig.windowResized!(p);
        };
      }

      if (dayConfig.mousePressed) {
        p.mousePressed = () => dayConfig.mousePressed!(p);
      }

      // Key handler with built-in recording/saving shortcuts
      p.keyPressed = () => {
        // Call day-specific key handler first
        if (dayConfig.keyPressed) {
          dayConfig.keyPressed(p);
        }
        
        // Built-in shortcuts (only if not handled by day config)
        // Press 's' to save current frame
        if (p.key === 's' || p.key === 'S') {
          p.save(`genuary-2026-day-${dayConfig.day.toString().padStart(2, '0')}-frame.png`);
        }
        
        // Press 'r' to start/stop recording
        if ((p.key === 'r' || p.key === 'R') && dayConfig.recording) {
          // Try global saveGif first
          const globalSaveGif = (window as any).saveGif;
          if (typeof globalSaveGif === 'function') {
            globalSaveGif(dayConfig.recording.filename, dayConfig.recording.duration);
          } else {
            // Fallback to saveFrames
            // @ts-ignore
            if (typeof p.saveFrames === 'function') {
              // @ts-ignore
              p.saveFrames(dayConfig.recording.filename, 'png', dayConfig.recording.duration, 30);
            }
          }
        }
      };
    };

    currentSketch = new p5(sketch, container);
  });
}

/**
 * Special handler for Day 28 (HTML only)
 */
function loadDay28HTML(): void {
  // Remove controls if any
  if (currentControlsContainer) {
    currentControlsContainer.remove();
    currentControlsContainer = null;
  }
  
  // Update URL hash
  window.location.hash = '#day28';

  // Update page title and info
  const dayConfig = days[27]; // Day 28 is index 27
  updateDayInfo(dayConfig);

  // Get content area
  const contentArea = document.getElementById('content');
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }
  
  // Reset content area margin
  contentArea.style.marginBottom = '0';

  // Create HTML-only container for Day 28
  const container = document.createElement('div');
  container.id = 'html-only-container';
  container.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;';
  contentArea.appendChild(container);

  // TODO: Implement Day 28 HTML-only content
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <h1>Day 28: HTML Only</h1>
      <p>This day uses only HTML elements, no canvas or libraries.</p>
      <p>Implementation coming soon...</p>
    </div>
  `;

  updateDayInfo(days[27]); // Day 28 is index 27
}

/**
 * Update the day info display
 */
function updateDayInfo(dayConfig: DayConfig): void {
  const infoEl = document.getElementById('day-info');
  if (infoEl) {
    const creditLink = `<a href="${dayConfig.creditUrl}" target="_blank" rel="noopener noreferrer">${dayConfig.creditName}</a>`;
    const timelapseDisabled = !dayConfig.recording?.enabled ? 'disabled' : '';
    const timelapseStyle = !dayConfig.recording?.enabled ? 'opacity: 0.5; cursor: not-allowed;' : '';
    
    infoEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <h2 style="margin: 0;">Day ${dayConfig.day}</h2>
        <div id="download-buttons" style="display: flex; gap: 0.5rem;">
          <button id="download-image-btn" style="padding: 0.5rem 1rem; background: #2a2a2a; color: #e0e0e0; border: 1px solid #444; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
            📷 Download Image
          </button>
          <button id="download-timelapse-btn" ${timelapseDisabled} style="padding: 0.5rem 1rem; background: #2a2a2a; color: #e0e0e0; border: 1px solid #444; border-radius: 4px; cursor: pointer; font-size: 0.9rem; ${timelapseStyle}">
            🎬 Download Timelapse
          </button>
        </div>
      </div>
      <p style="margin: 0.5rem 0 0.25rem 0;"><strong>Prompt:</strong> ${dayConfig.prompt}</p>
      <p style="margin: 0.25rem 0;"><strong>Prompt Credit:</strong> ${creditLink}</p>
    `;
    
    // Set up download button handlers
    setupDownloadButtons(dayConfig);

    // Header height can change due to wrapping; resync layout
    syncHeaderHeight();
  }
}

/**
 * Generate timestamp filename in YYYYMMDDHHmm format
 */
function generateTimestampFilename(day: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${year}${month}${date}${hours}${minutes}`;
  return `genuary-2026-day-${day.toString().padStart(2, '0')}-${timestamp}.png`;
}

/**
 * Download canvas as image without prompt
 */
function downloadCanvasImage(sketch: p5, filename: string): void {
  const canvas = (sketch as any).canvas as HTMLCanvasElement | undefined;
  if (!canvas) {
    console.error('Canvas not available');
    return;
  }
  
  // Convert canvas to blob and download
  canvas.toBlob((blob: Blob | null) => {
    if (!blob) {
      console.error('Failed to create blob from canvas');
      return;
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`✅ Image downloaded: ${filename}`);
  }, 'image/png');
}

/**
 * Set up download button handlers
 */
function setupDownloadButtons(dayConfig: DayConfig): void {
  const imageBtn = document.getElementById('download-image-btn');
  const timelapseBtn = document.getElementById('download-timelapse-btn');
  
  if (imageBtn) {
    imageBtn.addEventListener('click', () => {
      if (currentSketch) {
        const filename = generateTimestampFilename(dayConfig.day);
        
        // If renderFinal is defined, use it to render the final state
        if (dayConfig.renderFinal) {
          // Temporarily stop animation
          const wasLooping = currentSketch.isLooping();
          currentSketch.noLoop();
          
          // Render final state (this will use current control values)
          dayConfig.renderFinal(currentSketch);
          
          // Download the image with timestamp filename
          downloadCanvasImage(currentSketch, filename);
          
          // Redraw current state
          if (wasLooping) {
            currentSketch.loop();
          } else {
            currentSketch.redraw();
          }
        } else {
          // Fallback: save current frame
          downloadCanvasImage(currentSketch, filename);
        }
      }
    });
  }
  
  if (timelapseBtn && dayConfig.recording?.enabled) {
    timelapseBtn.addEventListener('click', () => {
      console.log('Timelapse button clicked');
      startTimelapseRecording(dayConfig);
    });
  }
}

/**
 * Start timelapse recording using gif.js
 */
function startTimelapseRecording(dayConfig: DayConfig): void {
  console.log('🎬 Start timelapse recording clicked');
  
  if (!dayConfig.recording) {
    console.error('Recording not enabled for this day');
    return;
  }
  
  const timelapseBtn = document.getElementById('download-timelapse-btn') as HTMLButtonElement | null;
  
  // Update button state
  if (timelapseBtn) {
    timelapseBtn.textContent = '⏹️ Recording...';
    timelapseBtn.disabled = true;
  }
  
  // Reload the day to restart the animation
  const dayNum = dayConfig.day;
  console.log('Reloading day', dayNum);
  
  // Clean up current sketch
  if (currentSketch) {
    currentSketch.remove();
    currentSketch = null;
  }
  
  // Small delay to ensure cleanup, then reload
  setTimeout(() => {
    loadDay(dayNum);
    
    // Wait for sketch to initialize, then start recording
    setTimeout(() => {
      if (!currentSketch) {
        console.error('Current sketch is null after reload');
        if (timelapseBtn) {
          timelapseBtn.textContent = '❌ Error';
          (timelapseBtn as HTMLButtonElement).disabled = false;
        }
        return;
      }
      
      console.log('Sketch loaded, importing recording module...');
      
      // Import and start recording
      import('./utils/recording.js').then((recording) => {
        console.log('✅ Recording module loaded');
        
        // Store recording module on sketch instance
        (currentSketch as any)._recordingModule = recording;
        
        // Ensure animation is running
        currentSketch!.loop();
        console.log('✅ Animation started');
        
        // IMPORTANT: Ensure controls are loaded and applied before recording
        // Import day module to get control defaults
        import(`./days/${dayNum.toString().padStart(2, '0')}.ts`).then((dayModule: any) => {
          const defaultControls: ControlState = dayModule.defaultControls || {};
          if (defaultControls && Object.keys(defaultControls).length > 0) {
            // Load saved controls and apply them immediately
            const savedControls = loadControls(dayNum, defaultControls);
            (currentSketch as any)._controls = savedControls;
            console.log('✅ Controls loaded for recording:', savedControls);
            
            // Reset triangle data so it regenerates with correct control values
            (currentSketch as any)._triangleData = null;
            (currentSketch as any)._lastTriangleCount = null;
          }
          
          // Reset frame count to start from beginning (after controls are set)
          currentSketch!.frameCount = 0;
          
          // Small delay to ensure first frame is drawn with correct controls
          setTimeout(() => {
            console.log('Initializing encoder...');
            const canvas = (currentSketch as any).canvas as HTMLCanvasElement | undefined;
            console.log('Canvas check:', {
              canvas: canvas ? 'exists' : 'missing',
              width: currentSketch!.width,
              height: currentSketch!.height,
              canvasWidth: canvas?.width,
              canvasHeight: canvas?.height,
              controls: (currentSketch as any)._controls
            });
            
            // Initialize encoder and start recording
            const encoder = recording.initEncoder(currentSketch!, dayConfig.recording!);
            if (encoder) {
              console.log('✅ Encoder initialized, starting recording...');
              recording.startRecording(currentSketch!, dayConfig.recording!);
            
            // Re-enable button after recording + encoding time
            setTimeout(() => {
              if (timelapseBtn) {
                timelapseBtn.textContent = '🎬 Download Timelapse';
                (timelapseBtn as HTMLButtonElement).disabled = false;
              }
            }, (dayConfig.recording?.duration || 8) * 1000 + 5000); // Extra time for encoding
            } else {
              console.error('❌ Failed to initialize GIF encoder');
              if (timelapseBtn) {
                timelapseBtn.textContent = '❌ Error';
                timelapseBtn.disabled = false;
              }
            }
          }, 300); // Delay to ensure canvas is fully ready with controls applied
        }).catch((error) => {
          console.error('❌ Error loading day module for controls:', error);
          // Continue anyway - controls might not be needed
          setTimeout(() => {
            currentSketch!.frameCount = 0;
            const encoder = recording.initEncoder(currentSketch!, dayConfig.recording!);
            if (encoder) {
              recording.startRecording(currentSketch!, dayConfig.recording!);
            }
          }, 300);
        });
      }).catch((error) => {
        console.error('❌ Error loading recording module:', error);
        if (timelapseBtn) {
          timelapseBtn.textContent = '❌ Error';
          (timelapseBtn as HTMLButtonElement).disabled = false;
        }
      });
    }, 500);
  }, 100);
}

/**
 * Initialize the app
 */
function init(): void {
  // Get initial day
  const dayNum = getDayFromURL();
  currentDay = dayNum;
  
  // Set up day navigation with initial day
  setupNavigation(dayNum);

  // Load initial day
  loadDay(dayNum);

  // Keep content offset accurate as header content changes
  syncHeaderHeight();
  const header = document.getElementById('header');
  if (header && 'ResizeObserver' in window) {
    const ro = new ResizeObserver(() => syncHeaderHeight());
    ro.observe(header);
  } else {
    window.addEventListener('resize', () => syncHeaderHeight());
  }

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const dayNum = getDayFromURL();
    loadDay(dayNum);
    const select = document.getElementById('day-selector') as HTMLSelectElement;
    if (select) {
      select.value = dayNum.toString();
    }
  });
}

/**
 * Set up navigation controls
 */
function setupNavigation(initialDay: number): void {
  const navEl = document.getElementById('day-navigation');
  if (!navEl) return;
    // Create day selector
    const select = document.createElement('select');
    select.id = 'day-selector';
    select.style.cssText = 'padding: 0.5rem; font-size: 1rem; margin: 1rem;';

    for (let i = 1; i <= 31; i++) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.textContent = `Day ${i}`;
      if (i === initialDay) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    select.addEventListener('change', (e) => {
      const dayNum = parseInt((e.target as HTMLSelectElement).value, 10);
      loadDay(dayNum);
      select.value = dayNum.toString(); // Keep selector in sync
    });

    navEl.appendChild(select);

    // Create prev/next buttons with circular navigation
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.style.cssText = 'padding: 0.5rem 1rem; font-size: 1rem; margin: 0.5rem;';
    prevBtn.addEventListener('click', () => {
      const newDay = currentDay === 1 ? 31 : currentDay - 1;
      loadDay(newDay);
      (select as HTMLSelectElement).value = newDay.toString();
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.style.cssText = 'padding: 0.5rem 1rem; font-size: 1rem; margin: 0.5rem;';
    nextBtn.addEventListener('click', () => {
      const newDay = currentDay === 31 ? 1 : currentDay + 1;
      loadDay(newDay);
      (select as HTMLSelectElement).value = newDay.toString();
    });

    navEl.appendChild(prevBtn);
    navEl.appendChild(nextBtn);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
