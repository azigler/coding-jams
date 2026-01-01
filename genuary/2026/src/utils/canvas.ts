/**
 * Canvas utility functions
 */

import type p5 from 'p5';

/**
 * Create a fixed-size canvas that maintains aspect ratio
 * The canvas will be centered and scaled to fit the viewport, but won't resize
 */
export function createCanvas(p: p5, width: number = 1200, height: number = 1200): void {
  // Set pixel density to 1 to avoid high-DPI scaling issues
  p.pixelDensity(1);
  
  // Create canvas with fixed dimensions
  p.createCanvas(width, height);
  
  // Note: willReadFrequently is set in recording.ts when we get the context
  // This is the proper place to set it since p5.js manages the context internally
  
  // Center the canvas in the container
  const container = p.canvas.parentElement;
  if (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    
    // Function to update canvas scale
    const updateScale = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Max canvas display size is 800x800
      const maxDisplaySize = 800;
      const displayWidth = Math.min(width, maxDisplaySize);
      const displayHeight = Math.min(height, maxDisplaySize);
      
      // Calculate scale to fit container while maintaining aspect ratio
      // Use 95% of available space to ensure no clipping
      const scale = Math.min(
        (containerWidth * 0.95) / displayWidth,
        (containerHeight * 0.95) / displayHeight,
        1 // Don't scale up, only down
      );
      
      // Apply scaling
      p.canvas.style.width = `${displayWidth * scale}px`;
      p.canvas.style.height = `${displayHeight * scale}px`;
      p.canvas.style.display = 'block';
      p.canvas.style.margin = 'auto';
      p.canvas.style.imageRendering = 'auto'; // Better quality scaling
    };
    
    // Initial scale
    updateScale();
    
    // Update on window resize (but canvas dimensions stay the same)
    const resizeHandler = () => updateScale();
    window.addEventListener('resize', resizeHandler);
    
    // Store cleanup function
    (p.canvas as any)._cleanupResize = () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }
}

/**
 * Full screen canvas (responsive)
 */
export function fullScreenCanvas(p: p5): void {
  p.createCanvas(window.innerWidth, window.innerHeight);
}
