import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fun-cup_v2/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Bohemian Fun Cup V2',
        short_name: 'Fun Cup V2',
        description: 'Bohemian Fun Cup – Version 2 Testumgebung',
        theme_color: '#3b82f6',
        background_color: '#f6f7f9',
        display: 'standalone',
        scope: '/fun-cup_v2/',
        start_url: '/fun-cup_v2/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
