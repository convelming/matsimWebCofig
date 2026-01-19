<template>
  <div class="page1">
    <h2>{{ $l("私家车/公交车辆活动轨迹") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "私家车/公交车辆活动轨迹":{
    "zh-CN": "私家车/公交车辆活动轨迹",
    "en-US": "car tracks"
  },
}
</language>
  
<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/vehicles.gif"),
      // img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/vehicles.gif"),
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
