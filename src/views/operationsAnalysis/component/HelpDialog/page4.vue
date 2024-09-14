<template>
  <div class="page1">
    <h2>{{ $l("公交线路运营信息") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "公交线路运营信息":{
    "zh-CN": "公交线路运营信息",
    "en-US": "public transit lines"
  },
}
</language>
  
<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/opAndca/ptLines.gif"),
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
