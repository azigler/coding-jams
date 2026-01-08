/**
 * WebGL context manager for shader days
 * Zero dependencies, pure WebGL2
 */

export interface GLContext {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation>;
  destroy: () => void;
}

/**
 * Compile a shader from source
 */
export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Failed to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    console.error('Shader compile error:', error);
    // Format error for display
    displayShaderError(error, source);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Display shader compilation error with line numbers
 */
function displayShaderError(error: string | null, source: string): void {
  if (!error) return;

  // Parse line number from error (e.g., "ERROR: 0:12: ...")
  const lineMatch = error.match(/ERROR:\s*\d+:(\d+)/);
  if (lineMatch) {
    const errorLine = parseInt(lineMatch[1], 10);
    const lines = source.split('\n');
    console.error('--- Shader Source (error at line ' + errorLine + ') ---');
    lines.forEach((line, i) => {
      const lineNum = i + 1;
      const marker = lineNum === errorLine ? '>>> ' : '    ';
      console.error(`${marker}${lineNum.toString().padStart(3)}: ${line}`);
    });
    console.error('---');
  }
}

/**
 * Link a shader program from vertex and fragment shaders
 */
export function linkProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) {
    console.error('Failed to create program');
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * Default fullscreen quad vertex shader
 */
export const DEFAULT_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * Create a WebGL context with a shader program
 */
export function createGLContext(
  container: HTMLElement,
  width: number,
  height: number,
  fragmentShaderSource: string,
  vertexShaderSource?: string
): GLContext | null {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = `
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
  `;
  container.appendChild(canvas);

  // Get WebGL2 context
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true, // Needed for recording
  });

  if (!gl) {
    console.error('WebGL2 not supported');
    showFallbackMessage(container, canvas);
    return null;
  }

  // Compile shaders
  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource || DEFAULT_VERTEX_SHADER
  );
  if (!vertexShader) {
    canvas.remove();
    return null;
  }

  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShader) {
    gl.deleteShader(vertexShader);
    canvas.remove();
    return null;
  }

  // Link program
  const program = linkProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    canvas.remove();
    return null;
  }

  // Clean up shaders (they're now attached to program)
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  // Set up fullscreen quad
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]),
    gl.STATIC_DRAW
  );

  // Set up vertex attribute
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Collect uniform locations
  const uniforms = new Map<string, WebGLUniformLocation>();
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const uniformInfo = gl.getActiveUniform(program, i);
    if (uniformInfo) {
      const loc = gl.getUniformLocation(program, uniformInfo.name);
      if (loc) {
        uniforms.set(uniformInfo.name, loc);
      }
    }
  }

  // Use the program
  gl.useProgram(program);

  // Cleanup function
  const destroy = () => {
    gl.deleteProgram(program);
    gl.deleteBuffer(quadBuffer);
    canvas.remove();
  };

  return { canvas, gl, program, uniforms, destroy };
}

/**
 * Show fallback message if WebGL is not available
 */
function showFallbackMessage(container: HTMLElement, canvas: HTMLCanvasElement): void {
  canvas.remove();
  const fallback = document.createElement('div');
  fallback.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 800px;
    height: 800px;
    max-width: 100%;
    background: #1a1a1a;
    color: #e0e0e0;
    font-family: monospace;
    text-align: center;
    padding: 2rem;
    border: 1px solid #333;
    margin: 0 auto;
  `;
  fallback.innerHTML = `
    <div>
      <h2>WebGL2 Not Available</h2>
      <p>This shader-based artwork requires WebGL2.</p>
      <p>Please try a modern browser like Chrome, Firefox, or Edge.</p>
    </div>
  `;
  container.appendChild(fallback);
}

/**
 * Set a uniform value based on type
 */
export function setUniform(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation,
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'bool',
  value: number | number[]
): void {
  switch (type) {
    case 'float':
      gl.uniform1f(location, value as number);
      break;
    case 'int':
      gl.uniform1i(location, value as number);
      break;
    case 'bool':
      gl.uniform1i(location, value ? 1 : 0);
      break;
    case 'vec2':
      if (Array.isArray(value) && value.length >= 2) {
        gl.uniform2f(location, value[0], value[1]);
      }
      break;
    case 'vec3':
      if (Array.isArray(value) && value.length >= 3) {
        gl.uniform3f(location, value[0], value[1], value[2]);
      }
      break;
    case 'vec4':
      if (Array.isArray(value) && value.length >= 4) {
        gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      }
      break;
  }
}
