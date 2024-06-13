<template>
  <div class="page1">
    <h2>1. 新建或修改已有的公交优化方案，方案中可修改多条线路</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/planAdjustment/video1.gif"),
    };
  },
};
</script>

<style lang="scss" scoped>
.page1 {
  .video {
    width: 100%;
  }
}
</style>
