<!-- index10 -->
<template>
  <div id="mapRoot"></div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import { WindLineLayer } from "./layer/WindLineLayer.js";

import wind from "./data/wind.json";

export default {
  name: "index10",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12589820.87789668, 2528880.8548412393],
        zoom: 7,
        minPitch: -90,
        // mapZoomHeight: 600,
        enableRotate: true,
      });
      console.log(this._Map);

      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._WindLineLayer = new WindLineLayer({ zIndex: 20000, data: wind });
      this._Map.addLayer(this._WindLineLayer);
    },
  },
};
</script>

<style lang="scss" scoped>
#mapRoot {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
