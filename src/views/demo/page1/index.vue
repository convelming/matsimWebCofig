<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <div id="mapRoot">
            <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
          </div>
        </div>
        <!-- <Drawer show direction="right" :size="300">
        </Drawer> -->
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { guid } from "@/utils/utils";
import { MyMap, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";
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
  computed: {
    GeoJSONIdList() {
      return this.GeoJSONList.map((item) => item.id);
    },
  },
  data() {
    return {
      time: 3600 * 8,
      speed: 6,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
      GeoJSONList: [],
      activeName: ["name", "GeoJSONDetail"],
    };
  },
  created() {},
  async mounted() {
    this.initMap();
  },
  methods: {
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {
      this.time = value;
    },
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        zoom: 12,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);
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
