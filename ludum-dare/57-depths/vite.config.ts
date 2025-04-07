import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  base: "/coding-jams/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
  define: {
    "process.env": {
      DEBUG: JSON.stringify(process.env.NODE_ENV === "development"),
    },
  },
})
