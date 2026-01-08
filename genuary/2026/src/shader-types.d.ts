/**
 * Type declarations for shader file imports
 * Vite supports importing files with ?raw suffix to get raw text content
 */

declare module '*.frag?raw' {
  const content: string;
  export default content;
}

declare module '*.vert?raw' {
  const content: string;
  export default content;
}

declare module '*.glsl?raw' {
  const content: string;
  export default content;
}
