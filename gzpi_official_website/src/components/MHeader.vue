<!-- MHeader -->
<template>
  <div class="MHeader">
    <img src="@/assets/image/header/logo2.svg?url" alt="" class="logo" />
    <div class="btn_box">
      <a
        v-for="item in btn_list"
        :href="item.link"
        class="btn"
        :class="{ active: route.name == item.name }"
        >{{ item.title }}</a
      >
    </div>
    <div class="sreach">
      <input class="input" type="text" name="" id="" placeholder="输入关键词搜索" />
      <div class="line"></div>
      <img src="@/assets/image/header/搜索.svg?url" alt="" class="icon" />
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const btn_list = [
  { title: '首页', link: router.options.history.createHref('/'), name: 'home' },
  { title: '本院概况', link: router.options.history.createHref('/bygk'), name: 'bygk' },
  { title: '新闻中心', link: router.options.history.createHref('/xwzx'), name: 'xwzx' },
  { title: '项目展示', link: router.options.history.createHref('/xmzs'), name: 'xmzs' },
  { title: '科研成果', link: router.options.history.createHref('/kycg'), name: 'kycg' },
  { title: '人才招聘', link: router.options.history.createHref('/rczp'), name: 'rczp' },
]
</script>

<style lang="scss" scoped>
.MHeader {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;

  padding: 0 min(6.5vw, 120px);
  height: 120px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);

  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 24px;

  .logo {
    display: block;
    height: 62px;
  }

  .btn_box {
    display: flex;
    gap: min(64px, 2vw);
    .btn {
      text-wrap: nowrap;
      text-align: center;
      width: 64px;
      position: relative;
      height: 62px;
      line-height: 62px;
      color: #fff;
      text-decoration: none;
      &.active {
        color: #009491;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          width: 64px;
          height: 4px;
          background: #009491;
          border-radius: 0px 0px 0px 0px;
        }
      }
    }
  }

  .sreach {
    width: 328px;
    height: 48px;
    background: rgba($color: #fff, $alpha: 0.4);
    border-radius: 8px;
    border: 1px solid rgba($color: #fff, $alpha: 0.8);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    .input {
      font-size: 14px;
      color: #ffffff;
      line-height: 20px;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      width: 0;
      flex: 1;
      &::placeholder {
        color: #ffffff;
      }
    }
    .line {
      width: 1px;
      height: 20px;
      background: #ffffff;
    }
    .icon {
      display: block;
      width: 24px;
      height: 24px;
    }
  }
}
</style>
