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
  const canvas = (p as any).canvas as HTMLCanvasElement | undefined;
  const container = canvas?.parentElement;
  if (container && canvas) {
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
      
      // Detect mobile devices (matches CSS media query breakpoint)
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      
      // Max canvas display size is 800x800
      const maxDisplaySize = 800;
      const displayWidth = Math.min(width, maxDisplaySize);
      const displayHeight = Math.min(height, maxDisplaySize);
      
      let scale: number;
      let finalDisplayWidth: number;
      let finalDisplayHeight: number;
      
      if (isMobile) {
        // On mobile: enforce square aspect ratio (height = width)
        // Calculate scale based on width only to ensure square display
        scale = Math.min(
          (containerWidth * 0.95) / displayWidth,
          1 // Don't scale up, only down
        );
        
        // Use the width as the base for square dimensions
        finalDisplayWidth = displayWidth * scale;
        finalDisplayHeight = finalDisplayWidth; // Enforce square: height = width
      } else {
        // On desktop: maintain original aspect ratio
        scale = Math.min(
          (containerWidth * 0.95) / displayWidth,
          (containerHeight * 0.95) / displayHeight,
          1 // Don't scale up, only down
        );
        
        finalDisplayWidth = displayWidth * scale;
        finalDisplayHeight = displayHeight * scale;
      }
      
      // Apply scaling
      canvas.style.width = `${finalDisplayWidth}px`;
      canvas.style.height = `${finalDisplayHeight}px`;
      canvas.style.display = 'block';
      canvas.style.margin = 'auto';
      canvas.style.imageRendering = 'auto'; // Better quality scaling
    };
    
    // Initial scale
    updateScale();
    
    // Update on window resize (but canvas dimensions stay the same)
    const resizeHandler = () => updateScale();
    window.addEventListener('resize', resizeHandler);
    
    // Also listen for media query changes (e.g., when crossing mobile breakpoint)
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const mediaQueryHandler = () => updateScale();
    
    // Modern browsers support addEventListener on MediaQueryList
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', mediaQueryHandler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(mediaQueryHandler);
    }
    
    // Store cleanup function
    (canvas as any)._cleanupResize = () => {
      window.removeEventListener('resize', resizeHandler);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', mediaQueryHandler);
      } else {
        mediaQuery.removeListener(mediaQueryHandler);
      }
    };
  }
}

/**
 * Full screen canvas (responsive)
 */
export function fullScreenCanvas(p: p5): void {
  p.createCanvas(window.innerWidth, window.innerHeight);
}
