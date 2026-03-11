import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV, VITE_APP_BASE_API, VITE_APP_PUBLIC_PATH } = env
  console.log(env)

  return {
    base: VITE_APP_PUBLIC_PATH,
    build: {
      outDir: fileURLToPath(new URL('./gzpi_official_website', import.meta.url)),
      emptyOutDir: true,
    },
    plugins: [
      vue(),
      autoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: false,
      }),
    ],
    // vite 相关配置
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        [VITE_APP_BASE_API]: {
          target: `http://192.168.60.231:8087`, // 测试服
          // target: `http://192.168.152.19:23104`, // 测试服
          changeOrigin: true,
          // rewrite: (p) => p.replace(/^\/dev-api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
