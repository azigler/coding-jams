/**
 * Shader renderer for GLSL-based days
 * Handles the render loop, uniform updates, and mouse tracking
 */

import type { DayConfig, UniformConfig } from '../types';
import type { ControlState } from '../utils/controls';
import { createGLContext, setUniform, type GLContext } from './gl';

export interface ShaderRenderer {
  /** Update and render a frame */
  update: () => void;
  /** Clean up WebGL resources */
  destroy: () => void;
  /** Get the canvas element for recording */
  canvas: HTMLCanvasElement;
  /** Reset the start time (for recording) */
  resetTime: () => void;
  /** Set the current control values */
  setControls: (controls: ControlState) => void;
}

/**
 * Create a shader renderer for a GLSL day
 */
export function createShaderRenderer(
  config: DayConfig,
  container: HTMLElement,
  initialControls: ControlState
): ShaderRenderer | null {
  if (!config.fragmentShader) {
    console.error('No fragment shader provided for GLSL day');
    return null;
  }

  // Create WebGL context
  const ctx = createGLContext(
    container,
    800,
    800,
    config.fragmentShader,
    config.vertexShader
  );

  if (!ctx) {
    return null;
  }

  const { gl, canvas, uniforms } = ctx;

  // Track state
  let startTime = performance.now();
  let mouseX = 0.5;
  let mouseY = 0.5;
  let controls = { ...initialControls };

  // Mouse tracking
  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = 1 - (e.clientY - rect.top) / rect.height; // Flip Y for shader coordinates
  };

  const handleMouseLeave = () => {
    // Keep last mouse position
  };

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  // Build control uniform map: controlKey -> UniformConfig
  const controlUniformMap = new Map<string, UniformConfig>();
  if (config.uniforms) {
    for (const u of config.uniforms) {
      if (u.controlKey) {
        controlUniformMap.set(u.controlKey, u);
      }
    }
  }

  /**
   * Update and render a frame
   */
  function update(): void {
    const time = (performance.now() - startTime) / 1000;

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set auto-bound uniforms
    const uTime = uniforms.get('u_time');
    const uResolution = uniforms.get('u_resolution');
    const uMouse = uniforms.get('u_mouse');
    const uFrame = uniforms.get('u_frame');

    if (uTime) gl.uniform1f(uTime, time);
    if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouseX, mouseY);
    if (uFrame) gl.uniform1i(uFrame, Math.floor(time * 60)); // Approximate frame count

    // Set control-bound uniforms
    for (const [controlKey, uniformConfig] of controlUniformMap) {
      const value = controls[controlKey];
      if (value !== undefined) {
        const loc = uniforms.get(uniformConfig.name);
        if (loc) {
          setUniform(gl, loc, uniformConfig.type, value);
        }
      }
    }

    // Set uniforms with default values that aren't bound to controls
    if (config.uniforms) {
      for (const u of config.uniforms) {
        if (!u.controlKey && u.defaultValue !== undefined) {
          const loc = uniforms.get(u.name);
          if (loc) {
            setUniform(gl, loc, u.type, u.defaultValue);
          }
        }
      }
    }

    // Draw fullscreen quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Clean up
   */
  function destroy(): void {
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseleave', handleMouseLeave);
    // ctx is guaranteed non-null here since we return early if createGLContext fails
    ctx!.destroy();
  }

  /**
   * Reset start time (for recording)
   */
  function resetTime(): void {
    startTime = performance.now();
  }

  /**
   * Update controls
   */
  function setControls(newControls: ControlState): void {
    controls = { ...newControls };
  }

  return {
    update,
    destroy,
    canvas,
    resetTime,
    setControls,
  };
}
