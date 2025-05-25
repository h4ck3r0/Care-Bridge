import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production'
          ? 'https://tourmaline-unicorn-570ae9.netlify.app'
          : 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // Add headers for proper MIME type handling
  headers: {
    '*.js': {
      'Content-Type': 'application/javascript'
    },
    '*.mjs': {
      'Content-Type': 'application/javascript'
    }
  }
})
