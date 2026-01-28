import { defineConfig } from "vite"

export default defineConfig(({ command }) => ({
  // Use '/' for local dev, full path for production build (GitHub Pages)
  base: command === 'serve' ? '/' : '/coding-jams/genuary-2026/',
  server: {
    port: 3000,
    open: false, // Disabled for headless servers
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  publicDir: "public",
}))
