import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
    // CONFIGURACIÓN DEL PROXY:
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
