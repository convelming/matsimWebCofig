import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import autoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV, VUE_APP_BASE_API } = env
  return {
    plugins: [
      vue(),
      svgLoader(),
      // vueDevTools(),
      autoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: false,
      }),
    ],
    base: '/',
    build: {
      outDir: fileURLToPath(new URL('./road_traffic_survey2', import.meta.url)),
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
    // vite 相关配置
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        [VUE_APP_BASE_API]: {
          target: `http://192.168.60.231:23104`, // 测试服
          // target: `http://192.168.152.19:23104`, // 测试服
          changeOrigin: true,
          rewrite: (p) => p.replace(VUE_APP_BASE_API, ''),
        },
      },
    },
  }
})
