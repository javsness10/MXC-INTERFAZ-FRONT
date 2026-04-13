import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.jsx'),
      name: 'MpcRegistroApp',
      formats: ['iife'],
      fileName: () => 'registro'
    },
    outDir: '../registro-dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true
  }
})
