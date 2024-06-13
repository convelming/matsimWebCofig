<template>
  <div class="page4">
    <h2>4. PTAL系列分析</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/operationsAnalysis/image5.png"),
    };
  },
};
</script>

<style lang="scss" scoped>
.page4 {
  .video {
    width: 100%;
  }
}
</style>
