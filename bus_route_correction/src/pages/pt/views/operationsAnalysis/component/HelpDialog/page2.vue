<template>
  <div class="page1">
    <h2>{{ $l("建筑或日常活动层") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "建筑或日常活动层":{
    "zh-CN": "建筑或日常活动层",
    "en-US": "building or facilities"
  },
}
</language>
  
<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/facilities.gif"),
      // img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/facilities.gif"),
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
