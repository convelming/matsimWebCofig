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
import { guid } from "@/utils/utils";
import { MyMap, MapLayer, DEFAULT_MAP_LAYER_STYLE } from "@/mymap/index.js";
import { MapLayer as MapLayer2, DEFAULT_MAP_LAYER_STYLE as DEFAULT_MAP_LAYER_STYLE2 } from "@/mymap/layers/MapLayer2.js";

export default {
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
  async mounted() {
    this.initMap();
  },
  methods: {
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12635639.181374598, 2670202.457088065],
        center: [12622586.854946846, 2638453.8772939774],
        zoom: 14,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: DEFAULT_MAP_LAYER_STYLE, zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._MapLayer2 = new MapLayer2({ tileClass: DEFAULT_MAP_LAYER_STYLE2, zIndex: 10, opacity: 0.8 });
      this._Map.addLayer(this._MapLayer2);
      console.log(this._Map);
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

  .map_box {
    position: relative;
    z-index: 20;
  }

  .mapBox {
    position: relative;

    .NewClock {
      position: absolute;
      right: 20px;
      top: 20px;
      z-index: 1000;
    }

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
}
</style>
