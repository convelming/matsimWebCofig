<template>
  <div class="page1">
    <h2>{{ $l("加载地理信息与停车层") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "加载地理信息与停车层":{
    "zh-CN": "加载地理信息与停车层",
    "en-US": "geojson layer and parking analysis"
  },
}
</language>

<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/opAndca/parkingGeojson.gif"),
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
