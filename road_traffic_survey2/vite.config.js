import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import autoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
    autoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
  ],
  base: '/',
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // vite 相关配置
  server: {
    port: 80,
    host: true,
    open: true,
    proxy: {
      // https://cn.vitejs.dev/config/#server-proxy
      '/dev-api': {
        target: 'http://localhost:8080',
        target: 'http://192.168.60.231:8080/',
        // target: 'http://192.168.31.103:8080/',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/dev-api/, ''),
      },
    },
  },
})
