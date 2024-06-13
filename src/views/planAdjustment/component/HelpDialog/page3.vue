<template>
  <div class="page3">
    <h2>3-1. 修改公交线路：修改站点信息，可对比第三方地图进行修改调整</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/planAdjustment/video3.gif"),
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
