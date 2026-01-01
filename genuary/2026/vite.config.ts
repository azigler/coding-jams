import { defineConfig } from 'vite';

export default defineConfig({
  base: "/coding-jams/genuary-2026/",
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  publicDir: 'public'
});
