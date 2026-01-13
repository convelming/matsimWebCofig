<template>
  <div class="page4">
    <h2>3-2.修改公交线路：站点路径修改，核准或修改两个站点公交车运行路径</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/planAdjustment/video4.gif"),
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
