import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Import ajouté

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. Plugin ajouté
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
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