<template>
  <div id="map" class="map">
    <NewClock class="NewClock" />
    <div>{{ Map.context }}</div>
  </div>
</template>

<script>
import "@/mymap/style.css";
import { Map, LocalMapLayer } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  data() {
    return {};
  },
  mounted() {
    this.initMap();
  },
  methods: {
    // 初始化地图
    initMap() {
      this._Map = new Map({
        rootId: "map",
      });
      this._Map.cameraControls.enableRotate = true;
      this._Map.addLayer(new LocalMapLayer({ zIndex: 0 }));
    },
  },
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
