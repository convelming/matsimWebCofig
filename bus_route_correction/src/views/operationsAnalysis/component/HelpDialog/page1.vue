<template>
  <div class="page1">
    <h2>{{ $l("公交方案的前后对比方案") }}</h2>
    <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
  </div>
</template>

<language>
{
  "公交方案的前后对比方案":{
    "zh-CN": "公交方案的前后对比方案",
    "en-US": "MATSim PT optimization comparison report"
  },
}
</language>
  
<script>
export default {
  data() {
    return {
      img: require("@/assets/helpImages/opAndca/activities.gif"),
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
