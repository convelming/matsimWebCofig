<template>
  <div class="page2">
    <h2>2. 输入线路名称，新建或选取已有线路进行修改</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>


<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/planAdjustment/video2.gif"),
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
