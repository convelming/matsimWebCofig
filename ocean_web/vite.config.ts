import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import autoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    svgLoader(),
    // vueDevTools(),
    autoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
  ],
  base: '/',
  build: {
    outDir: fileURLToPath(new URL('./ocean_web_dist', import.meta.url)),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/style/func.scss" as func;`,
      },
    },
  },
  server: {
    port: 80,
    host: true,
    open: true,
    proxy: {
      // https://cn.vitejs.dev/config/#server-proxy
      '/dev-api': {
        target: `http://192.168.60.231:23104`, // 测试服
        // target: `http://192.168.152.19:23104`, // 测试服
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/dev-api/, ''),
      },
    },
  },
})
