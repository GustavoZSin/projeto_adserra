import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:5079',
        changeOrigin: true,
      },
      '/Auth': {
        target: 'http://localhost:5079',
        changeOrigin: true,
      },
      '/SolicitacaoIngresso': {
        target: 'http://localhost:5079',
        changeOrigin: true,
      },
    },
  },
})
