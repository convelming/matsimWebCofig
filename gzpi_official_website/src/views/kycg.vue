<!-- kycg -->
<template>
  <div class="kycg">
    <MHeader />

    <div class="box1">
      <div class="text1">
        <div>News Center</div>
        <div>新闻中心</div>
      </div>
    </div>
    <MFooter />
  </div>
</template>

<script setup>
import MHeader from '@/components/MHeader.vue'
import MFooter from '@/components/MFooter.vue'
</script>

<style lang="scss" scoped>
.kycg {
  width: 100vw;
  min-height: 100vh;
}

.box1 {
  width: 100%;
  height: 520px;
  background: url('@/assets/image/xwzx/矩形 6091.jpg');
  background-size: cover;
  background-position: center;
  .text1 {
    padding-top: 180px;
    width: 80vw;
    margin: 0 auto;
    font-weight: 500;
    font-size: 72px;
    color: #ffffff;
    line-height: 112px;
  }
}
</style>
