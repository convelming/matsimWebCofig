<template>
  <div class="page5">
    <h2>4. 保存方案后点击运行，进入配置页面，对模型进行参数配置后，等待模型运算完成后即可进入方案对比模块</h2>

    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/planAdjustment/video6.gif"),
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
