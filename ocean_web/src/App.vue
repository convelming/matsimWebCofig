<!-- App -->
<template>
  <ConfigProvider :locale="zhCn">
    <RouterView />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'

onMounted(() => {
  const root = document.documentElement

  // 初始化 CSS 变量
  // root.style.setProperty('--left-container-top', `${globeStore.thirdMenuHeight + 16 + 180}px`)
  // 监听 thirdMenuHeight 的变化并更新 CSS 变量
  // watch(
  //   () => globeStore.thirdMenuHeight,
  //   (newHeight) => {
  //     root.style.setProperty('--left-container-top', `${newHeight + 16 + 180}px`)
  //   }
  // )
})
</script>

<style lang="scss" scoped></style>
