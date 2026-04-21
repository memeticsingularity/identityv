import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
    visualizer({
      open: false,
      gzipSize: true,
      filename: './stats.json',
      template: 'raw-data',
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // echarts + zrender
          if (id.includes('node_modules/echarts') || id.includes('node_modules/zrender') || id.includes('node_modules/vue-echarts')) {
            return 'vendor-echarts'
          }
          // element-plus
          if (id.includes('node_modules/element-plus')) {
            return 'vendor-element-plus'
          }
          // animation libs
          if (id.includes('node_modules/animejs') || id.includes('node_modules/gsap')) {
            return 'vendor-animation'
          }
          // all game data (characters, items, essences, analyses, maps, stories)
          if (id.includes('/src/data/')) {
            return 'game-data'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
