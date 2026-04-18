import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Local dev uses root; production deploys under the coding-jams GH Pages sub-path
  base:
    command === 'serve' ? '/' : '/coding-jams/ld59/prototypes/phase-chorus/',
  server: {
    port: 3100,
    open: false,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
}));
