import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/SDA-SermonMaker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Kerygma — Sermon Builder',
        short_name: 'Kerygma',
        description: 'Christ-centered sermon preparation, built for your phone.',
        theme_color: '#241B2F',
        background_color: '#14181F',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/SDA-SermonMaker/',
        icons: [
          { src: '/SDA-SermonMaker/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/SDA-SermonMaker/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/SDA-SermonMaker/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { cacheName: 'app-shell' }
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'font', 'image'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-assets' }
          }
        ]
      }
    })
  ],
  server: { port: 5173 }
})
