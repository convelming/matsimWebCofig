<template>
  <div class="page2">
    <h2>2. 分析公交客流廊道</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/comparativeAnalysis/image2.gif"),
    };
  },
};
</script>

<style lang="scss" scoped>
.page2 {
  .video {
    width: 100%;
  }
}
</style>
