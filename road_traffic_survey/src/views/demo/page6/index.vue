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
import { OBJLayer } from "./layer/OBJLayer.js";

export default {
  components: {},
  provide() {
    return {
      rootVue: this,
    };
  },
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
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        // center: [12707787.79, 2759380.11],
        center: [12716943.337189136, 2761023.0570991505],
        zoom: 15,
        mapZoomHeight: 600,
      });
      this._Map.cameraControls.enableRotate = true;
      // this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      // this._Map.addLayer(this._MapLayer);

      this._OBJLayer = new OBJLayer({ zIndex: 10 });
      this._Map.addLayer(this._OBJLayer);
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

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
