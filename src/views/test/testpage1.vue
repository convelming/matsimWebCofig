<template>
  <div id="map" class="map"></div>
</template>

<script>
import "@/mymap/style.css";
import { Map, LocalMapLayer } from "@/mymap/index.js";
import { Build3DLayer } from "./layer/Build3DLayer";
import { HeatmMapLayer } from "./layer/HeatmMapLayer";
import { PTALLayer } from "./layer/PTALLayer";
import { LinkFlowLayer } from "./layer/LinkFlowLayer";

import testpage2Data from "@/assets/data/testpage2.data.json";


export default {
  mounted() {
    this.initLayer();
    this.initMap();
  },
  methods: {
    // 初始化地图
    initMap() {
      this._map = new Map({
        rootId: "map",
        center: [12643420.551717436, 2601035.512601995],
      });
      this._map.cameraControls.enableRotate = true;
      this._map.addLayer(this._LocalMapLayer);
      // this._map.addLayer(new Build3DLayer({ zIndex: 20 }));
      this._map.addLayer(new LinkFlowLayer({ zIndex: 20 }));
      // const length = 5000; // testpage2Data.length;
      // this._map.addLayer(
      //   new HeatmMapLayer({
      //     zIndex: 10,
      //     data: testpage2Data.map((v, i, l) => {
      //       v[0] = length * (Math.random() - 0.5) + this._map.center[0];
      //       v[1] = length * (Math.random() - 0.5) + this._map.center[1];
      //       return v;
      //     }),
      //   })
      // );
      // this._map.addLayer(
      //   new PTALLayer({
      //     zIndex: 200,
      //   })
      // );
    },
    // 初始化图层
    initLayer() {
      this._LocalMapLayer = new LocalMapLayer({
        zIndex: 0,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
