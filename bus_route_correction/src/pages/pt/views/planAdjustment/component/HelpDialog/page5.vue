<template>
  <div class="page5">
    <h2>3-3. 修改公交线路：线路车辆发车频率，可按时段、日期批量或单独修改发车间隔</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/planAdjustment/video5.gif"),
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
