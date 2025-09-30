import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@monaco-editor/react'],
          ui: ['lucide-react', 'zustand'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@monaco-editor/react', 'lucide-react', 'zustand'],
  },
})
