<template>
  <div class="page5">
    <h2>5. 基础信息查询</h2>
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
.page5 {
  .video {
    width: 100%;
  }
}
</style>
