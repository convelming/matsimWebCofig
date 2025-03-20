<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <Dialog class="TravelAttribute" ref="dialog" hideMinimize hideClose :visible="showToolber" left="20" top="20" width="400px">
            <el-form label-width="120px" :inline="false" size="normal">
              <el-form-item label="车道文件">
                <input type="file" name="" id="" @change="handleChange1" />
              </el-form-item>
              <el-form-item label="车辆行驶文件">
                <input type="file" name="" id="" @change="handleChange2" />
              </el-form-item>
              <el-form-item label="无人机飞行文件">
                <input type="file" name="" id="" @change="handleChange3" />
              </el-form-item>
              <el-form-item label="无人机飞行视频">
                <input type="file" accept="video/*" name="" id="" @change="handleChange4" />
                <el-switch v-model="showVideo"></el-switch>
              </el-form-item>
              <el-form-item label="无人机飞行图表">
                <input type="file" name="" id="" @change="handleChange5" />
                <el-switch v-model="showVideoChart"></el-switch>
              </el-form-item>
              <el-form-item label="视角跟随车辆">
                <el-switch v-model="lockSelectVehicle"> </el-switch>
              </el-form-item>
              <el-form-item label="视角跟随无人机">
                <el-switch v-model="lockSelectUAV"> </el-switch>
              </el-form-item>
              <el-form-item label="车辆大小">
                <el-slider style="padding: 0 calc(2em - 10px)" v-model="modelSize" :step="0.1" :min="0" :max="20"> </el-slider>
              </el-form-item>
              <el-form-item label="时间">
                <el-slider style="padding: 0 calc(2em - 10px)" :value="time" :step="1" :min="0" :max="3600" @input="handleUpdateTime"> </el-slider>
              </el-form-item>
            </el-form>
          </Dialog>
          <Dialog class="TravelAttribute" title="无人机飞行视频" hideMinimize :visible.sync="showVideo" width="500px" keep-right top="100">
            <video style="height: 100%; width: 100%; background-color: #000" :src="videoUrl" controls @playing="handleVideoPlaying" @timeupdate="handleVideoTimeupdate"></video>
          </Dialog>
          <Dialog class="TravelAttribute" title="无人机飞行图表" hideMinimize :visible.sync="showVideoChart" width="500px" keep-right top="450">
            <div class="videoChart" ref="videoChart"></div>
          </Dialog>
          <Dialog class="TravelAttribute" title="车辆详情" hideMinimize :visible.sync="showVehicleDetail" left="20" top="20" width="400px">
            <el-form label-width="120px" :inline="false" size="normal" v-if="vehicleDetail">
              <el-form-item label="车辆ID">{{ vehicleDetail.id }}</el-form-item>
              <el-form-item label="车辆类型">{{ vehicleDetail.type }}</el-form-item>
              <el-form-item label="速度">{{ vehicleDetail.start.speed.toFixed(2) }} 米/秒</el-form-item>
              <el-form-item label="所在车道">{{ vehicleDetail.start.line_id }}</el-form-item>
              <el-form-item label="前车距离">{{ vehicleDetail.start.front_left }}米（左）&nbsp;&nbsp;{{ vehicleDetail.start.front_center }}米（中）&nbsp;&nbsp;{{ vehicleDetail.start.front_right }}米（右）</el-form-item>
              <el-form-item label="后车距离">{{ vehicleDetail.start.after_left }}米（左）&nbsp;&nbsp;{{ vehicleDetail.start.after_center }}米（中）&nbsp;&nbsp;{{ vehicleDetail.start.after_right }}米（右）</el-form-item>
              <el-form-item label="视角跟随车辆">
                <el-switch v-model="lockSelectVehicle"> </el-switch>
              </el-form-item>
            </el-form>
          </Dialog>
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
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT } from "@/mymap/index.js";
import NewClock from "@/components/NewClock/index.vue";
import { LineLayer } from "./layer/LineLayer";
import { CarLayer, CAR_LAYER_EVENT } from "./layer/CarLayer";
import { UAVLayer } from "./layer/UAVLayer";
import { JsonParse } from "@/utils";
import * as echarts from "echarts";

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
    showToolber() {
      return !this.showVehicleDetail;
    },
  },

  watch: {
    lockSelectVehicle: {
      handler(val) {
        this.lockSelectUAV = false;
        this._CarLayer.lockSelect = val;
      },
    },
    lockSelectUAV: {
      handler(val) {
        this.lockSelectVehicle = false;
        this._UAVLayer.lockSelect = val;
      },
    },
    modelSize: {
      handler(val) {
        this._CarLayer.setModelSize(val);
        this._UAVLayer.setModelSize(val);
      },
    },
    showVehicleDetail: {
      handler(val) {
        if (!val) this._CarLayer.setSelectCarId(null);
      },
    },
  },
  data() {
    return {
      time: 170,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 24,
      range: [],
      GeoJSONList: [],
      activeName: ["name", "GeoJSONDetail"],

      lockSelectVehicle: false,
      lockSelectUAV: true,
      modelSize: 10,
      showVideo: false,
      showVideoChart: false,
      showVehicleDetail: false,
      vehicleDetail: null,
      videoUrl: "",
      videoStartTime: 0,
    };
  },
  created() {},
  async mounted() {
    this.initMap();
    this._videoChart = echarts.init(this.$refs.videoChart);
    // this.initVideoChart();
  },
  methods: {
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {
      this.time = Number(Number(value).toFixed(3));
      this._CarLayer.setTime(value);
      this._UAVLayer.setTime(value);
    },
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        center: [12623039.8, 2647415.72],
        // center: WGS84ToMercator(113.48449873011836, 23.089910913887415),
        zoom: 16,
        minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[0], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._LineLayer = new LineLayer({});
      this._Map.addLayer(this._LineLayer);

      this._CarLayer = new CarLayer({
        lockSelect: this.lockSelectVehicle,
        modelSize: this.modelSize,
        event: {
          [CAR_LAYER_EVENT.SELECTED]: (e) => {
            this.showVehicleDetail = !!e.data;
          },
          [CAR_LAYER_EVENT.UPDATE_DETAIL]: (e) => {
            console.log(e);
            if (e.data) {
              e.data.start.front_left = (Math.random() * 5).toFixed(0);
              e.data.start.front_center = (Math.random() * 20).toFixed(0);
              e.data.start.front_right = (Math.random() * 5).toFixed(0);
              e.data.start.after_left = (Math.random() * 5).toFixed(0);
              e.data.start.after_center = (Math.random() * 20).toFixed(0);
              e.data.start.after_right = (Math.random() * 5).toFixed(0);
            }
            this.vehicleDetail = e.data;
          },
        },
      });
      this._Map.addLayer(this._CarLayer);

      this._UAVLayer = new UAVLayer({
        lockSelect: this.lockSelectUAV,
        modelSize: this.modelSize,
      });
      this._Map.addLayer(this._UAVLayer);
    },
    // 车道文件
    handleChange1(event) {
      if (!event.target.files[0]) return;
      let reader = new FileReader();

      reader.readAsText(event.target.files[0]);
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        this._LineLayer.setData(json);
      };
    },
    // 车辆行驶文件
    handleChange2(event) {
      if (!event.target.files[0]) return;
      let reader = new FileReader();
      reader.readAsArrayBuffer(event.target.files[0]);
      reader.onload = () => {
        const array = new Int8Array(reader.result);

        this._CarLayer.setData(array);
      };
    },
    // 无人机飞行文件
    handleChange3(event) {
      if (!event.target.files[0]) return;
      let reader = new FileReader();
      reader.readAsText(event.target.files[0]);
      reader.onload = () => {
        console.log(JsonParse(reader.result));

        const data = JsonParse(reader.result);
        this.videoStartTime = Number(data.video_start_time);

        this._UAVLayer.setData(data);
      };
    },
    handleChange4(event) {
      if (event.target.files[0]) {
        var url = URL.createObjectURL(event.target.files[0]);
        this.videoUrl = url;
        this.showVideo = true;
      } else {
        this.videoUrl = "";
        this.showVideo = false;
      }
    },
    handleChange5(event) {
      if (event.target.files[0]) {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0]);
        reader.onload = () => {
          this.showVideoChart = true;
          this.initVideoChart(JsonParse(reader.result));
        };
      } else {
        this.showVideoChart = false;
      }
    },
    initVideoChart(data) {
      console.log(data);
      const series = Array.from(Object.entries(data)).map(([key, item]) => {
        return {
          name: key,
          data: item.timeSpace,
          type: "line",
          color: "red",
          showSymbol: false,
        };
      });
      const options = {
        xAxis: {
          type: "value",
          min: 0,
        },
        yAxis: {
          type: "value",
          min: 0,
        },
        series: series,
        tooltip: {},
      };
      this._videoChart.setOption(options, false);
      this._videoChart.resize();
    },
    handleVideoPlaying(event) {
      console.log(event);
    },
    handleVideoTimeupdate(event) {
      // console.log(event.target.currentTime );
      this.handleUpdateTime(event.target.currentTime + this.videoStartTime);
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
  background-color: #ffffff99;
}

.TravelAttribute {
  background-color: #ffffff99;
}
.videoChart {
  width: 460px;
  height: 380px;
}
</style>
