<template>
  <div id="map" class="map">
    <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
  </div>
</template>

<script>
import { Map, MapLayer } from "@/mymap/index.js";
import { htmlToImage } from "@/mymap/utils/index";
import NewClock from "@/components/NewClock/index.vue";
import { TestLayer } from "./layer/TestLayer.js";
import { getCarPathArray, getBusPathArray, getAllActivity } from "@/api/index";
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
    return {
      time: 3600 * 8,
      speed: 6,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
    };
  },
  created() {
    this.$store.dispatch("setDataBase", "guangzhou");
    this.$store.dispatch("setDataSource", "guangzhou/base");
  },
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
      this._Map = new Map({
        rootId: "map",
        center: [12628397, 2655338.7],
        // zoom: 11,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ zIndex: 0 });
      this._Map.addLayer(this._MapLayer);
    },
  },
};
</script>

<style lang="scss" scoped>
.img {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 1000;
}
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
