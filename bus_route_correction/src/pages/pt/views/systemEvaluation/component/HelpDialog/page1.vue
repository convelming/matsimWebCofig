<template>
  <div class="page1">
    <h2>1. 加载模型数据</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
    <h4 style="color: red">备注：前后端开发人员需考虑如何预加载数据，可选方式：1) 默认加载某一文件 2) 可选择加载文件</h4>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/systemEvaluation/image1.png"),
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
