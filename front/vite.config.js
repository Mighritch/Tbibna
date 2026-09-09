import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Ces deux lignes sont importantes pour les cookies de session
        cookieDomainRewrite: 'localhost',
        // optionnel mais recommandé
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map(cookie =>
                cookie.replace(/; Secure/gi, '').replace(/Domain=[^;]+/gi, 'Domain=localhost')
              )
            }
          })
        },
      },
    },
  },
})