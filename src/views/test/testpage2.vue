<template>
  <div id="map" class="map">
    <NewClock class="NewClock" :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
    <input type="file" @change="handleInputFile" />
  </div>
</template>

<script>
import { Map, MapLayer } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import { GeoJSONLayer } from "./layer/GeoJSONLayer.js";
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

    // const url = `http://192.168.60.231:23334/guangzhou/Nansha/pt/13`;
    // const row = 6664;
    // const col = 3530;
    // for (let i = row; i < row + 21; i++) {
    //   for (let j = col; j < col + 100; j++) {
    //     fetch(`${url}/${i}/${j}`)
    //       .then((res) => {
    //         console.log(res.status);
    //       })
    //       .catch((err) => {});
    //   }
    // }

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
    },
    // 初始化地图
    async initMap() {
      this._Map = new Map({
        rootId: "map",
        center: [12628397, 2655338.7],
        zoom: 17
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ zIndex: 0 });
      this._Map.addLayer(this._MapLayer);

      this._GeoJSONLayer = new GeoJSONLayer({ zIndex: 1 });
      this._Map.addLayer(this._GeoJSONLayer);
      window._Map = this._Map;
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
