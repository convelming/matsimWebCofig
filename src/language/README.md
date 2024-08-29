Vue.js 版本 2++

vue.config.js 配置

module.exports = defineConfig({
  chainWebpack: (config) => {
    config.module
      .rule("language")
      .resourceQuery(/blockType=language/)
      .use("language")
      .loader(require.resolve("./src/language/loader.js"));
  }
})

main.js

import language from "./language/index.js";
Vue.use(language);


demo.vue

<template>
  <div>
    <div>{{ $l("测试") }}</div>
    <div>{{ $l("测试2") }}</div>
  </div>
</template>

<language>
{
  "测试": {
    "zh-CN": "测试",
    "en-US": "Test"
  },
  "测试2": {
    "zh-CN": "测试2",
    "en-US": "Test2"
  }
}
</language>

<script>
export default {
  watch: {
    page_language: {
      handler(val) {
        // 语言变化时的处理
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    setInterval(() => {
      if (this.page_language == "zh-CN") {
        this.$setLanguage("en-US");
      } else {
        this.$setLanguage("zh-CN");
      }
    }, 2000);
  },
};
</script>

<style></style>


非 .vue 文件中使用

import language from "@/language/index";

language.internationalize("网络异常")