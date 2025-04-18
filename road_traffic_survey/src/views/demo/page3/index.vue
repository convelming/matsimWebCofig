<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot"></div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import NewClock from "@/components/NewClock/index.vue";
import { TTFLayer } from "./layer/TTFLayer";

export default {
  components: {
    NewClock,
  },
  provide() {
    return {
      rootVue: this,
    };
  },
  computed: {
    GeoJSONIdList() {
      return this.GeoJSONList.map((item) => item.id);
    },
  },
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.initMap();
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12606995.580320276, 2647865.9741280824],
        // center: WGS84ToMercator(113.4848520194447, 23.089866565806066),
        zoom: 11,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._Map.addLayer(new TTFLayer({ zIndex: 100 }));
    },
  },
};
</script>

<style lang="scss" scoped>
.index {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .grid_root {
    width: 100vw;
    height: 100vh;
  }

  .mapBox {
    position: relative;
    z-index: 20;

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}
.box {
  width: 400px;
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1500;
  background-color: #ffffffaa;
  user-select: none;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  .el-form-item {
    margin-bottom: 8px;
    // color: orange;
  }
}
</style>
