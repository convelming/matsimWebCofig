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
        <Drawer show direction="right" :size="300">
          <el-collapse v-model="activeName" accordion>
            <el-collapse-item class="toolbar_item" name="name">
              <el-button type="primary" size="default" @click="handleSelectFile">选择文件</el-button>
            </el-collapse-item>
            <GeoJSONDetail v-for="item in GeoJSONIdList" :key="item" :name="item" :id="item" />
          </el-collapse>
        </Drawer>
      </div>
    </div>
  </div>
</template>

<script>
import { guid } from "@/utils/utils";
import { MyMap, MapLayer, MAP_LAYER_STYLE } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import GeoJSONDetail from "../operationsAnalysis/component/GeoJSON/toolbar/geoJSONDetail.vue";
import GeoJSONLayerWorker from "../operationsAnalysis/component/GeoJSON/worker/GeoJSONLayer.worker";

export default {
  components: {
    NewClock,
    GeoJSONDetail,
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
  created() {
    this.worker = new GeoJSONLayerWorker();
    this.worker.onmessage = (event) => {
      const { point, line, polygon } = event.data;

      this.pointData = point;
      this.lineData = line;
      this.polygonData = polygon;

      this.update();
    };
    this.worker.addEventListener("error", (error) => {
      console.log(error);
    });
  },
  async mounted() {
    this.initMap();
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
      this._Map = new MyMap({
        rootId: "mapRoot",
        // center: [12612545.3950225, 2617157.5169194015],
        center: [12631209.560373351, 2598756.097409454],
        center: [12600004.608731592, 2632755.69300154],
        center: [12635639.181374598, 2670202.457088065],
        zoom: 17,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);
    },
    handleSelectFile() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".geojson";
      input.style = "position:absolute;width:0;height:0;top: -100px;";
      document.body.appendChild(input);
      input.onchange = (e) => {
        const file = e.target.files[0];
        const GeoJSON = {
          id: guid(),
          _file: file,
          name: file.name,
        };
        this.GeoJSONList.push(GeoJSON);
      };
      input.click();
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
