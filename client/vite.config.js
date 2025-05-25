import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://care-bridge-onz4.onrender.com'
  : 'http://localhost:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy': `
        default-src 'self';
        connect-src 'self' ${API_URL} wss://*.onrender.com http://localhost:* ws://localhost:*;
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
      `.replace(/\s+/g, ' ').trim()
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
