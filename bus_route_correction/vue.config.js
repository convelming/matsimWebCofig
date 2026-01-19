const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  // 部署生产环境和开发环境下的URL。
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
  // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
  publicPath: "./",
  // 在npm run build 或 yarn build 时 ，生成文件的目录名称（要和baseUrl的生产环境路径一致）（默认dist）
  outputDir: "static",
  // 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
  assetsDir: "static",
  // 是否开启eslint保存检测，有效值：ture | false | 'error'
  lintOnSave: false,
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // webpack-dev-server 相关配置
  parallel: false,
  // dev环境代理
  devServer: {
    client: {
      overlay: false,
    },
    proxy: {
      "/": {
        ws: false,
        target: `http://192.168.60.231:23105`, // 测试服
        target: `http://192.168.28.43:23105`, // 本地调试
        // target: `http://localhost:23105`, // 测试服
        changeOrigin: true,
        // pathRewrite: {
        //   "/": "/",
        // },
      },
    },
  },

  pages: {
    pt: {
      entry: "./src/pages/pt/main.js",
      template: "./public/index.html",
      fliename: "pt.html",
      name: "pt",
      title: process.env.VUE_APP_TITLE,
    },
    index: {
      entry: "./src/pages/index/main.js",
      template: "./public/index.html",
      fliename: "index.html",
      name: "index",
      title: process.env.VUE_APP_TITLE,
    },
    home: {
      entry: "./src/pages/home/main.js",
      template: "./public/index.html",
      fliename: "home.html",
      name: "home",
      title: process.env.VUE_APP_TITLE,
    },
    feedback: {
      entry: "./src/pages/feedback/main.js",
      template: "./public/index.html",
      fliename: "feedback.html",
      name: "feedback",
      title: process.env.VUE_APP_TITLE,
    },
    user: {
      entry: "./src/pages/user/main.js",
      template: "./public/index.html",
      fliename: "user.html",
      name: "user",
      title: process.env.VUE_APP_TITLE,
    },
  },
  css: {
    // 配置css预处理器
    // loaderOptions: {
    //   scss: {
    //     additionalData: `@import "@/assets/css/element.variables.scss";`,
    //   },
    // },
  },
  configureWebpack: {
    externals: {
      // "proj4": "^2.9.0",
      proj4: "proj4",
    },
  },
  chainWebpack: (config) => {
    // 配置可以使用import导入webworker
    config.module
      .rule("worker")
      .test(/\.worker\.js$/) // 文件名必须要xxx.worker.js
      .use("worker")
      .loader("worker-loader");
    // 配置多语言切换
    config.module
      .rule("language")
      .resourceQuery(/blockType=language/)
      .use("language")
      .loader(require.resolve("./src/language/loader.js"));
    if (process.env.NODE_ENV === "production") {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // 移除console
              drop_debugger: true, // 移除debugger
            },
          },
        }),
      ];
    }
  },
});
