<template>
  <div class="MapStyle">
    <div id="map-switch">
      <img class="icon" style="margin-right: 4px" src="@/assets/image/map_icon.png" />
      <span class="text">{{ $l("地图") }}</span>
    </div>
    <div ref="mapSwitchList" id="map-switch-list"></div>
  </div>
</template>

<language>
{
  "地图":{
    "zh-CN": "地图",
    "en-US": "Map"
  },
}
</language>

<script>
export default {
  name: "MapStyle",
  props: {},
  components: {},
  computed: {
    _MapLayer() {
      return this.rootVue._MapLayer;
    },
  },
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$refs.mapSwitchList.appendChild();
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.MapStyle {
  cursor: pointer;
  position: relative;
  height: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;

  #map-switch {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  .text {
    font-weight: 400;
    font-size: 14px;
    color: #434343;
    line-height: 20px;
  }

  .map-switch-list {
  }
}
</style>
