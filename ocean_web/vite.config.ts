import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import autoImport from 'unplugin-auto-import/vite'
import svgLoader from 'vite-svg-loader'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue(),
      vueJsx(),
      // vueDevTools(),
      svgLoader(),
      autoImport({
        dts: 'auto-import-ts.d.ts', // 这里是生成的global函数文件
        imports: ['vue', 'vue-router', 'pinia'], // 需要自动导入的插件
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        // 解决eslint报错问题
        eslintrc: {
          // 这里先设置成true然后npm run dev 运行之后会生成 .eslintrc-auto-import.json 文件之后，在改为false
          enabled: true,
          filepath: './auto-import-eslintrc.json', // 生成的文件路径
          globalsPropValue: true,
        },
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
          ElementPlusResolver(),
        ],
      }),
    ],
    base: env.VITE_APP_PUBLIC_PATH,
    build: {
      outDir: fileURLToPath(new URL(env.VITE_APP_OUTPUT_DIR, import.meta.url)),
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
          additionalData: `@use "@/assets/style/func.scss" as func;@use "@/assets/style/variables.scss" as *;`,
        },
      },
    },
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        [env.VITE_APP_BASE_API]: {
          target: `http://192.168.60.231:8088`, // 测试服
          changeOrigin: true,
          rewrite: (p) => p.replace(env.VITE_APP_BASE_API, ''),
        },
      },
    },
  }
})
