import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: "https://skillbridge-ai-1uy8.onrender.com/api/auth/login";
        changeOrigin: true
      }
    }
  }
})
