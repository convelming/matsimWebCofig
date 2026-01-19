<template>
  <div class="page1">
    <h2>{{ $l("路网路段层") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "路网路段层":{
    "zh-CN": "路网路段层",
    "en-US": "network and link volumes"
  },
}
</language>
  
<script>
export default {
  data() {
    return {
      img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/network.gif"),
      // img: (window.VUE_APP_EXTERNAL_FILE_PATH + "/ptHelpImages/opAndca/network.gif"),
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
