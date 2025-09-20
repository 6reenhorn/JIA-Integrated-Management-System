import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  root: resolve(__dirname, '.'), 
  build: {
    outDir: resolve(__dirname, '../dist-react'), 
    emptyOutDir: true, 
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})
