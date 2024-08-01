<template>
  <div id="map" class="map">
    <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
  </div>
</template>

<script>
import { Map, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import { CarTravelLayer } from "@/views/operationsAnalysis/component/CarTravel/layer/CarTravelLayer.js";
import { CarTravelLayer2 } from "@/views/operationsAnalysis/component/CarTravel/layer/CarTravelLayer2.js";
import { CarTravelLayer3 } from "@/views/operationsAnalysis/component/CarTravel/layer/CarTravelLayer3.js";
import { CarTravelLayer4 } from "@/views/operationsAnalysis/component/CarTravel/layer/CarTravelLayer4.js";
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
      time: 66919,
      speed: 100,
      minTime: 0,
      maxTime: 3600 * 24.5,
      range: [],
      s_showLayer: true,
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
    this.handleShowLayer();
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
      this._CarTravelLayer.setTime(value);
      this._CarTravelLayer2.setTime(value);
      this._CarTravelLayer3.setTime(value);
    },
    // 初始化地图
    async initMap() {
      this._Map = new Map({
        rootId: "map",
        center: [12614648, 2654619.25],
        zoom: 13,
        minPitch: -90,
        event: {
          [MAP_EVENT.UPDATE_ZOOM]: this.handleShowLayer.bind(this),
        },
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);
      this._CarTravelLayer = new CarTravelLayer({ zIndex: 1, dataSource: "guangzhou/base" });
      this._CarTravelLayer2 = new CarTravelLayer2({ zIndex: 100, dataSource: "guangzhou/base", trailLength: 200, lineWidth: 100, color: "#ff0000" });
      this._CarTravelLayer3 = new CarTravelLayer3({ zIndex: 100, dataSource: "guangzhou/base", trailLength: 400, lineWidth: 200, color: "#00ff00" });
      this._CarTravelLayer4 = new CarTravelLayer4({ zIndex: 100, dataSource: "guangzhou/base", trailLength: 400, lineWidth: 200, color: "#00ff00" });
      this._CarTravelLayer4.init();
    },

    handleShowLayer() {
      return;
      try {
        if (this._Map.zoom < 11 && this.s_showLayer) {
          this._CarTravelLayer3.init();
          this._Map.addLayer(this._CarTravelLayer3);
        } else {
          this._Map.removeLayer(this._CarTravelLayer3);
        }
        if (11 <= this._Map.zoom && this._Map.zoom <= 15.5 && this.s_showLayer) {
          this._CarTravelLayer2.init();
          this._Map.addLayer(this._CarTravelLayer2);
        } else {
          this._Map.removeLayer(this._CarTravelLayer2);
        }
        if (15.5 < this._Map.zoom && this.s_showLayer) {
          this._Map.addLayer(this._CarTravelLayer);
        } else {
          this._Map.removeLayer(this._CarTravelLayer);
        }
      } catch (error) {}
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
