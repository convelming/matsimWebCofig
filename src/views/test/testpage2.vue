<template>
  <div id="map" class="map">
    <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
    <input type="file" @change="handleInputFile" />
  </div>
</template>

<script>
import { Map, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import { GeoJSONLayer } from "@/views/operationsAnalysis/component/GeoJSON/layer/GeoJSONLayer.js";
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
        // center: [12612545.3950225, 2617157.5169194015],
        center: [12599952, 2632734.5],
        zoom: 17,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._GeoJSONLayer = new GeoJSONLayer({ zIndex: 1 });
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleInputFile(e) {
      console.log(e.target.files);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = reader.result;
        this._GeoJSONLayer.setData(new Int8Array(arrayBuffer));
      };
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
input {
  position: absolute;
  z-index: 1000;
  left: 20px;
  top: 20px;
}
</style>
