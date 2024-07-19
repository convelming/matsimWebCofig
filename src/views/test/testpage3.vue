<template>
  <div id="map" class="map">
    <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
  </div>
</template>

<script>
import { Map, MapLayer } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import { CarTileLayer } from "@/views/operationsAnalysis/component/CarTravel/layer/CarTileLayer.js";
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
      time: 27046,
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

    // fetch("http://192.168.60.231:23334/guangzhou/Nansha/car/13/6673/3500", {})
    //   .then((response) => this.readReadableStream(response.body))
    //   .then((response) => {
    //     console.log(response);
    //     console.timeEnd("load file");
    //   });
  },
  methods: {
    async readReadableStream(stream) {
      const reader = stream.getReader();
      const list = [];
      let { done, value } = await reader.read();
      do {
        let numberOfFloats = value.byteLength / 4;
        let dataView = new DataView(value.buffer);
        for (let i = 0; i < numberOfFloats; i++) {
          list.push(dataView.getFloat32(i * 4, false));
        }
        ({ done, value } = await reader.read());
      } while (!done);
      return new Float32Array(list);
    },
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {
      this.time = value;
      // this._CarTileLayer.setTime(value);
    },
    // 初始化地图
    async initMap() {
      this._Map = new Map({
        rootId: "map",
        center: [12630459, 2653277.25],
        zoom: 16,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ zIndex: 0 });
      this._Map.addLayer(this._MapLayer);
      this._CarTileLayer = new CarTileLayer({ zIndex: 1, base: "guangzhou", scheme: "base" });
      this._Map.addLayer(this._CarTileLayer);
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
