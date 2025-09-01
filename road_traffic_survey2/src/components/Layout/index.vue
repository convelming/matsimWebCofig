<!-- layout -->
<template>
  <div class="layout">
    <div class="header"></div>
    <div class="bottom">
      <div class="left"></div>
      <div class="right"></div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    height: 60px;
    background-color: #333;
  }
  .bottom {
    display: flex;
    height: 0;
    flex: 1;
    .left {
      width: 60px;
      height: 100%;
      background-color: #eee;
    }
    .right {
      flex: 1;
      height: 100%;
      background-color: #ddd;
    }
  }
}
</style>
