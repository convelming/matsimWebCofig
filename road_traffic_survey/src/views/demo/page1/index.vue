<template>
  <div class="index">
    <div class="grid_root">
      <div class="Drawer_row">
        <div></div>
        <div class="mapBox">
          <Dialog class="TravelAttribute" title="基础设置" hideMinimize :visible.sync="showToolber" left="520" top="20" width="400px">
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
              </el-form-item>
              <el-form-item label="无人机飞行图表">
                <input type="file" name="" id="" @change="handleChange5" />
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
          <div id="mapRoot"></div>
          <NewClock class="NewClock" open :time="time" :speed.sync="speed" :minTime="minTime" :maxTime="maxTime" @update:time="handleUpdateTime" @showHelp="handleShowHelp"></NewClock>
          <div class="box_base box1">
            <div class="box_header">车辆详情</div>
            <div class="box_bodyer" v-if="vehicleDetail">
              <div class="row">
                <div class="label">车辆ID</div>
                <div class="value">
                  <span class="f25">{{ vehicleDetail.id || "未知" }}</span>
                </div>
              </div>
              <div class="row">
                <div class="label">车辆类型</div>
                <div class="value">
                  <span class="f25">{{ vehicleDetail.type || "未知" }}</span>
                </div>
              </div>
              <template v-if="vehicleDetail.start">
                <div class="row">
                  <div class="label">速度</div>
                  <div class="value">
                    <span class="f25 n">{{ vehicleDetail.start.speed.toFixed(2) }}</span>
                    <span class="f16">&nbsp;&nbsp;米/秒</span>
                  </div>
                </div>
                <div class="row">
                  <div class="label">所在车道</div>
                  <div class="value">
                    <span class="f25">{{ vehicleDetail.start.line_id || "未知" }}</span>
                  </div>
                </div>
                <div class="row">
                  <div class="label">前车距离</div>
                  <div class="value" style="display: flex; justify-content: space-between; align-items: flex-end">
                    <div>
                      <span class="f25 n">{{ vehicleDetail.start.front_left }}</span>
                      <span class="f16">&nbsp;&nbsp;米（左）</span>
                    </div>
                    <div>
                      <span class="f25 n">{{ vehicleDetail.start.front_center }}</span>
                      <span class="f16">&nbsp;&nbsp;米（中）</span>
                    </div>
                    <div>
                      <span class="f25 n">{{ vehicleDetail.start.front_right }}</span>
                      <span class="f16">&nbsp;&nbsp;米（右）</span>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="label">后车距离</div>
                  <div class="value" style="display: flex; justify-content: space-between; align-items: flex-end">
                    <div>
                      <span class="f25 n">{{ vehicleDetail.start.after_left }}</span>
                      <span class="f16">&nbsp;&nbsp;米（左）</span>
                    </div>
                    <div>
                      <span class="f25 n">{{ vehicleDetail.start.after_center }}</span>
                      <span class="f16">&nbsp;&nbsp;米（中）</span>
                    </div>
                    <div>
                      <span class="f25 n">{{ vehicleDetail.start.after_right }}</span>
                      <span class="f16">&nbsp;&nbsp;米（右）</span>
                    </div>
                  </div>
                </div>
              </template>
              <div class="row">
                <div class="label">视角跟随车辆</div>
                <div class="value">
                  <el-switch v-model="lockSelectVehicle"> </el-switch>
                </div>
              </div>
            </div>
            <div v-else class="noData">请选择车辆</div>
          </div>
          <div class="box_base box2">
            <div class="box_header">无人机飞行视频</div>
            <template v-if="videoUrl">
              <video class="video" :src="videoUrl" controls @playing="handleVideoPlaying" @timeupdate="handleVideoTimeupdate" @pause="handleVideoPause"></video>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px">
                <div class="label">视角跟随无人机</div>
                <div class="value"><el-switch v-model="lockSelectUAV"> </el-switch></div>
              </div>
            </template>
            <div v-else class="noData">请选择视频</div>
          </div>
          <div class="box_base box3">
            <div class="box_header">时空轨迹图</div>
            <div v-show="videoChartData" class="videoChart" ref="videoChart"></div>
            <div v-show="!videoChartData" class="noData">请选择图表数据</div>
          </div>
          <div class="box_base box4 el-icon-s-tools" @click="showToolber = !showToolber"></div>
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
import { WGS84ToMercator } from "@/mymap/utils/LngLatUtils";
import NewClock from "@/components/NewClock/index.vue";
import { LineLayer } from "./layer/LineLayer";
import { CarLayer, CAR_LAYER_EVENT } from "./layer/CarLayer";
import { UAVLayer } from "./layer/UAVLayer";
import { JsonParse } from "@/utils";
import * as echarts from "echarts";

import roadLane from "./data/roadLane";
import uavTrackHPdemo from "./data/uavTrackHPdemo";
import vehTrackHPdemoTraj2 from "./data/vehTrackHPdemoTraj2";

const VIDEO_URL = require("./data/uavVideo3.mp4");

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
  watch: {
    lockSelectVehicle: {
      handler(val) {
        if (val && this.lockSelectUAV) {
          this.lockSelectUAV = false;
        }
        this._CarLayer.lockSelect = val;
      },
    },
    lockSelectUAV: {
      handler(val) {
        if (val && this.lockSelectVehicle) {
          this.lockSelectVehicle = false;
        }
        this._UAVLayer.lockSelect = val;
      },
    },
    modelSize: {
      handler(val) {
        this._CarLayer.setModelSize(val);
        this._UAVLayer.setModelSize(val * 0.5);
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
      time: 0,
      speed: 0,
      minTime: 0,
      maxTime: 3600 * 24,

      lockSelectVehicle: false,
      lockSelectUAV: true,
      modelSize: 1,
      vehicleDetail: null,
      videoUrl: "",
      videoStartTime: 0,
      showToolber: false,
      videoChartData: false,
    };
  },
  created() {},
  async mounted() {
    this.initMap();
    this._videoChart = echarts.init(this.$refs.videoChart);
    uavTrackHPdemo.track.forEach((item) => {
      item.time = Number(item.time - 0.95);
    });
    uavTrackHPdemo.track = uavTrackHPdemo.track.filter((item) => item.time >= Number(uavTrackHPdemo.video_start_time));

    this.videoUrl = VIDEO_URL;
    this.videoStartTime = Number(uavTrackHPdemo.video_start_time);
    this._UAVLayer.setData(uavTrackHPdemo);

    this._LineLayer.setData(roadLane);

    const array = new TextEncoder().encode(JSON.stringify(vehTrackHPdemoTraj2));
    this._CarLayer.setData(array);

    this._chart_data = vehTrackHPdemoTraj2;
    this.videoChartData = !!this._chart_data;
    this.updateVideoChart(this._chart_data, this.time);

    this.handleUpdateTime(this.time);
  },
  methods: {
    handleShowHelp() {
      console.log("handleShowHelp");
    },
    handleUpdateTime(value) {
      this.time = Number(Number(value).toFixed(3));
      this._CarLayer.setTime(value);
      this._UAVLayer.setTime(value);
      this.updateVideoChart(this._chart_data, value);
    },
    // 初始化地图
    async initMap() {
      this._Map = new MyMap({
        rootId: "mapRoot",
        // center: [12623039.8, 2647415.72],
        center: WGS84ToMercator(113.4848520194447, 23.089866565806066),
        zoom: 18.5,
        // minPitch: -90,
      });
      this._Map.cameraControls.enableRotate = true;
      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
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
            this.vehicleDetail = e.data;
          },
        },
      });
      this._Map.addLayer(this._CarLayer);

      this._UAVLayer = new UAVLayer({
        lockSelect: this.lockSelectUAV,
        modelSize: this.modelSize * 0.5,
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
        // const data = JSON.parse(new TextDecoder().decode(array))
        // Array.from(Object.values(data)).forEach((v1) => {
        //   v1.track = v1.track.map((v2) => {
        //     return {
        //       time: v2[0],
        //       point: [v2[1], v2[2]],
        //       line_id: v2[3],
        //       front_left: (Math.random() * 5).toFixed(0),
        //       front_center: (Math.random() * 20).toFixed(0),
        //       front_right: (Math.random() * 5).toFixed(0),
        //       after_left: (Math.random() * 5).toFixed(0),
        //       after_center: (Math.random() * 20).toFixed(0),
        //       after_right: (Math.random() * 5).toFixed(0),
        //     };
        //   });
        // });
        // console.log(data);

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
          this._chart_data = JsonParse(reader.result);
          this.videoChartData = !!this._chart_data;
          this.updateVideoChart(this._chart_data, this.time);
        };
      } else {
        this.showVideoChart = false;
      }
    },
    updateVideoChart(data, time) {
      if (!data) return;
      let xMax = 0;
      let yMax = 0;
      const series = Array.from(Object.entries(data)).map(([key, item]) => {
        // xMax = Math.max(
        //   xMax,
        //   item.timeSpace.reduce((a, b) => Math.max(a, b[0]), 0)
        // );
        // yMax = Math.max(
        //   yMax,
        //   item.timeSpace.reduce((a, b) => Math.max(a, b[1]), 0)
        // );
        return {
          name: key,
          data: item.timeSpace.filter((item2) => item2[0] <= time).map((v) => [v[0], v[1] * 100000]),
          type: "line",
          color: "red",
          showSymbol: false,
        };
      });
      const options = {
        animation: false,
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "4%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          min: 0,
          max: 50, //Math.floor(xMax),
          axisLine: {
            lineStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            lineStyle: {
              color: "#fff",
            },
          },
          axisLabel: {
            color: "#fff",
          },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 1000,
          axisLine: {
            lineStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            lineStyle: {
              color: "#fff",
            },
          },
          axisLabel: {
            color: "#fff",
          },
        },
        series: series,
        tooltip: {},
      };
      this._videoChart.setOption(options, true);
      this._videoChart.resize();
    },
    handleVideoPlaying(event) {
      this.speed = 1;
      console.log(event);
    },
    handleVideoTimeupdate(event) {
      // console.log(event.target.currentTime );
      this.handleUpdateTime(event.target.currentTime + this.videoStartTime);
    },
    handleVideoPause(event) {
      this.speed = 0;
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

  .mapBox {
    position: relative;
    z-index: 20;

    #mapRoot {
      width: 100%;
      height: 100%;
    }
  }
}

.box_base {
  position: absolute;
  z-index: 1000;
  color: #fff;
  .box_header {
    font-size: 20px;
    font-weight: bold;
    padding: 10px 0;
    border-bottom: 1px solid #ffffff99;
  }
}
.box1 {
  width: 400px;
  left: 20px;
  top: 20px;
  .box_bodyer {
    .row {
      margin: 15px 0;
      .label {
        border-left: 2px solid #ffffff99;
        padding-left: 10px;
        font-size: 16px;
      }
      .value {
        padding: 10px;
        border: 1px solid #ffffff99;
        border-radius: 2px;
        background-color: #ffffff22;
        margin-top: 10px;
        .f25 {
          font-size: 25px;
        }
        .f12 {
          font-size: 12px;
        }
        .n {
          font-family: wending;
        }
      }
    }
  }
}

.NewClock {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1500;
  background-color: #ffffffaa;
  // color: #fff;
}

.box2 {
  width: 385px;
  height: 300px;
  top: 130px;
  right: 20px;
  .video {
    box-sizing: border-box;
    margin-top: 10px;
    width: 100%;
    height: 200px;
    background-color: #000;
    border: 1px solid #ffffff99;
    border-radius: 2px;
  }
}

.box3 {
  width: 385px;
  top: 450px;
  right: 20px;
  .videoChart {
    box-sizing: border-box;
    margin-top: 10px;
    width: 100%;
    height: 380px;
    background-color: #ffffff22;
    border: 1px solid #ffffff99;
    border-radius: 2px;
  }
}
.box4 {
  bottom: 20px;
  left: 20px;
  font-size: 40px;
  color: #fff;
  cursor: pointer;
}
.noData {
  margin-top: 10px;
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  font-weight: bold;
  background-color: #ffffff22;
  border: 1px solid #ffffff99;
  color: #fff;
}
</style>
