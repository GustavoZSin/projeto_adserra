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
      '/publicacao': {
        target: 'http://localhost:5079',
        changeOrigin: true,
      },
      '/usuarios': {
        target: 'http://localhost:5079',
        changeOrigin: true,
      },
      '/perfil': {
        target: 'http://localhost:5079',
        changeOrigin: true,
        bypass(req) {
          // Navegação de página → serve o index.html do React
          // Chamadas de API (fetch/axios) → encaminha ao backend
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        },
      },
    },
  },
})
