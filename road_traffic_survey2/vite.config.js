import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import autoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV, VITE_APP_BASE_API } = env
  return {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'src/assets/**/*.{png,jpe,jpeg,gif,svg,webp}', // 匹配 assets 下的图片
            dest: 'assets', // 复制到 dist/assets 目录下
            rename: (name, ext, fullPath) => ({
              stripBase: true,
              name: fullPath.replace(fileURLToPath(new URL('src/assets/', import.meta.url)), ''),
            }),
          },
        ],
      }),
      vue(),
      svgLoader({ defaultImport: 'url' }),
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
      // rollupOptions: {
      //   output: {
      //     // 自定义资源文件的输出名称
      //     assetFileNames: (assetInfo) => {
      //       // 匹配常见的图片格式
      //       if (assetInfo.names.some((item) => /\.(png|jpe?g|gif|svg|webp)$/.test(item))) {
      //         // 保持原文件名和扩展名，不添加 hash
      //         return 'assets/[name].[ext]'
      //       }
      //       // 其他资源（如字体、视频等）保持默认的 hash 命名
      //       return 'assets/[name]-[hash].[ext]'
      //     },
      //   },
      // },
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
        [VITE_APP_BASE_API]: {
          target: `http://192.168.60.231:23104`, // 测试服
          // target: `http://192.168.152.19:23104`, // 测试服
          changeOrigin: true,
          rewrite: (p) => p.replace(new RegExp(`^${VITE_APP_BASE_API}`), ''),
        },
      },
    },
  }
})
