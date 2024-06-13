<template>
  <div class="page3">
    <h2>3. 分析公交客流OD</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/comparativeAnalysis/image3.gif"),
    };
  },
};
</script>

<style lang="scss" scoped>
.page3 {
  .video {
    width: 100%;
  }
  .icon {
    width: 15px;
    height: 15px;
  }
}
</style>
