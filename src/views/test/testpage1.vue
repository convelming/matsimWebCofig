<template>
  <div id="map" class="map">
    <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
  </div>
</template>

<script>
import { Map, MapLayer } from "@/mymap/index.js";
import { htmlToImage } from "@/mymap/utils/index";
import NewClock from "@/components/NewClock/index.vue";
import { CarMotionLayer } from "./layer/CarMotionLayer2.js";
import { TestLayer } from "./layer/TestLayer.js";
import { getCarPathArray } from "@/api/index";
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
      time: 40600,
      speed: 1,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
    };
  },
  created() {
    this.$store.dispatch("setDataBase", "guangzhou");
    this.$store.dispatch("setDataSource", "guangzhou/Nansha");
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
      this._CarMotionLayer.setTime(this.time);
    },
    // 初始化地图
    async initMap() {
      this._Map = new Map({
        rootId: "map",
        center: [12628397, 2655338.7],
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ zIndex: 0 });
      this._Map.addLayer(this._MapLayer);
      this._CarMotionLayer = new CarMotionLayer({ zIndex: 20 });
      this._Map.addLayer(this._CarMotionLayer);
      getCarPathArray(30000).then((res) => {
        this._CarMotionLayer.setData(res.data);
      });

      this._TestLayer = new TestLayer({ zIndex: 20 });
      this._Map.addLayer(this._TestLayer);
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
