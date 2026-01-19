<template>
  <div class="page5">
    <h2>6. 添加本地数据辅助分析</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/systemEvaluation/image6.gif"),
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
