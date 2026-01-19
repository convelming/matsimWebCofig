<template>
  <div class="page1">
    <h2>{{ $l("公交路线优化对比") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "公交路线优化对比":{
    "zh-CN": "公交路线优化对比",
    "en-US": "MATSim PT optimization comparison"
  },
}
</language>
  
<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/ptComparison.gif"),
      // img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/ptComparison.gif"),
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
