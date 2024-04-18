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
import { BloomTestLayer } from "./layer/BloomTestLayer";
import { OutlineTestLayer } from "./layer/OutlineTestLayer";
import { Line2DTestLayer } from "./layer/Line2DTestLayer";

export default {
  mounted() {
    this.initMap();
  },
  methods: {
    // 初始化地图
    initMap() {
      this._map = new Map({
        rootId: "map",
        // center: [12643420.551717436, 2601035.512601995],
        center: [1.262302803977593e7, 2648343.7701357277],
        minPitch: -90,
      });
      this._map.cameraControls.enableRotate = true;
      this._map.addLayer(new LocalMapLayer({ zIndex: 0 }));
      // this._map.addLayer(new Build3DLayer({ zIndex: 20 }));
      // this._map.addLayer(new LinkFlowLayer({ zIndex: 20 }));
      this._map.addLayer(new Line2DTestLayer({ zIndex: 20 }));
      // this._map.addLayer(new BloomTestLayer({ zIndex: 20 }));
      // this._map.addLayer(new OutlineTestLayer({ zIndex: 20 }));
      // import("@/assets/data/testpage2.data.json").then((res) => {
      //   const length = 5000; // res.length;
      //   this._map.addLayer(
      //     new HeatmMapLayer({
      //       zIndex: 10,
      //       data: res.default.map((v, i, l) => {
      //         v[0] = length * (Math.random() - 0.5) + this._map.center[0];
      //         v[1] = length * (Math.random() - 0.5) + this._map.center[1];
      //         return v;
      //       }),
      //     })
      //   );
      // });

      // this._map.addLayer(
      //   new PTALLayer({
      //     zIndex: 200,
      //   })
      // );
      let l1 = new Line2DTestLayer({ zIndex: 20,pickNum:1 })
      let l2 = new Line2DTestLayer({ zIndex: 20,pickNum:2 })
      let l3 = new Line2DTestLayer({ zIndex: 20,pickNum:3 })
      let l4 = new Line2DTestLayer({ zIndex: 20,pickNum:4 })
      let l5 = new Line2DTestLayer({ zIndex: 20,pickNum:5 })
      console.log(l1.pickNum);
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
