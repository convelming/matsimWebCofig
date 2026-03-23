<template>
  <div class="page4">
    <h2>4. 缩放至{{ SHOW_LINK_ZOOM }}级地图显示可录入路段</h2>
    <img class="video" src="@/assets/video/video4.gif" />
  </div>
</template>

<script>
import { SHOW_LINK_ZOOM } from "../../index.vue";
export default {
  data() {
    return {
      SHOW_LINK_ZOOM,
    };
  },
};
</script>

<style lang="scss" scoped>
.page4 {
  .video {
    width: 100%;
  }
}
</style>