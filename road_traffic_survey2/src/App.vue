<!-- App -->
<template>
  <div class="App">
    <div class="header">
      <div class="title">交通数据采集应用平台</div>
      <div class="menu_item active">
        <el-icon><House /></el-icon>首页
      </div>
      <div class="menu_item">数据上传</div>
      <div class="menu_item">数据下载</div>
      <div class="menu_item">问题反馈</div>
    </div>
    <div class="bottom">
      <div class="left"></div>
      <div class="right">
        <RouterView class="App" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { House } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.App {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .header {
    position: relative;
    z-index: 20;
    width: 100%;
    height: 60px;

    background: #ffffff;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
    border: 1px solid #eeeeee;
    display: flex;
    .title {
      line-height: 60px;
      padding: 0 23px;
      color: #0c4031;
      font-weight: 700;
      font-size: 24px;
      margin-right: 100px;
    }
    .menu_list {
    }
    .menu_item {
      cursor: pointer;
      width: 128px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      color: #666666;
      font-size: 16px;
      &.active {
        color: #30b690;
        &::before {
          position: absolute;
          content: '';
          width: 44px;
          height: 3px;
          background: #41b997;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
        }
      }
    }
  }
  .bottom {
    position: relative;
    z-index: 10;
    display: flex;
    height: 0;
    flex: 1;
    .left {
      box-sizing: border-box;
      position: relative;
      z-index: 20;
      width: 60px;
      height: 100%;

      background: #ffffff;
      box-shadow: 0px 4px 5px 0px rgba(171, 51, 79, 0.1);
    }
    .right {
      position: relative;
      z-index: 10;
      flex: 1;
      width: 0;
      height: 100%;
      background-color: #ddd;
    }
  }
}
</style>
