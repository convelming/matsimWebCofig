<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ $l("停车需求详情") }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading" ref="body">
      <div class="title">
        <span style="width: 100%">{{ $l("停车需求图表") }}</span>
        <el-button type="text" icon="el-icon-full-screen" @click.stop="showChart1Big = true" />
        <el-button type="text" icon="el-icon-caret-bottom" @click="handleOpenChart1" />
      </div>
      <div v-show="openChart1" ref="chart1" class="chart1"></div>
      <div v-show="showChart2">
        <div class="title">
          <span style="width: 100%">{{ $l("停车供给图表") }}</span>
          <el-button type="text" icon="el-icon-full-screen" @click.stop="showChart3Big = true" />
          <el-button type="text" icon="el-icon-caret-bottom" @click="handleOpenChart3" />
        </div>
        <div v-show="openChart3" ref="chart3" class="chart3"></div>
        <div class="title">
          <span style="width: 100%">{{ $l("停车供需比图表") }}</span>
          <el-button type="text" icon="el-icon-full-screen" @click.stop="showChart2Big = true" />
          <el-button type="text" icon="el-icon-caret-bottom" @click="handleOpenChart2" />
        </div>
        <div v-show="openChart2" ref="chart2" class="chart2"></div>
      </div>
    </div>
    <Dialog :title="$l('停车需求图表')" hideMinimize :visible.sync="showChart1Big" @open="handleOpenChart1Big" :left="120" :top="20" width="840px">
      <div class="chart1Big" ref="chart1Big"></div>
    </Dialog>
    <Dialog :title="$l('停车供给图表')" hideMinimize :visible.sync="showChart3Big" @open="handleOpenChart3Big" :left="150" :top="50" width="840px">
      <div class="chart3Big" ref="chart3Big"></div>
    </Dialog>
    <Dialog :title="$l('停车供需比图表')" hideMinimize :visible.sync="showChart2Big" @open="handleOpenChart2Big" :left="180" :top="80" width="840px">
      <div class="chart2Big" ref="chart2Big"></div>
    </Dialog>
  </el-collapse-item>
</template>

<language>
{
  "停车需求详情":{
    "zh-CN": "停车需求详情",
    "en-US": "Parking Demand Details"
  },
  "停车需求图表":{
    "zh-CN": "停车需求图表",
    "en-US": "Hourly Parking Demand"
  },
  "停车供给图表":{
    "zh-CN": "停车供给图表",
    "en-US": "Hourly Parking Supply"
  },
  "停车供需比图表":{
    "zh-CN": "停车供需比图表",
    "en-US": "Parking supply/demand Ratio"
  },
}
</language>

<script>
import * as echarts from "echarts";
import "echarts-gl";
import { rangeParking, rangeRequireRatio, rangeRequireRatio2 } from "@/api/index";
import { PolygonSelectLayer } from "../layer/PolygonSelectLayer";
export default {
  inject: ["rootVue"],
  props: {
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
    polgonParkingDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 1000);
        });
      },
      immediate: true,
      s_polgonParkingDetail: null,
    },
  },
  data() {
    return {
      loading: true,
      resData: null,
      showChart2: false,

      openChart1: true,
      openChart2: true,
      openChart3: true,
      rangeParkingData: null,
      rangeRequireRatioData: null,
      supplyData: null,
      showChart1Big: false,
      showChart2Big: false,
      showChart3Big: false,
    };
  },
  created() {
    this.s_polgonParkingDetail = JSON.parse(JSON.stringify(this.polgonParkingDetail));
    this._PolygonSelectLayer = new PolygonSelectLayer({ zIndex: 50 });
    this.rootVue.$on("Parking_Geojson_Uuid", this.handleChangeGeoId);
  },
  mounted() {
    this._chart1 = echarts.init(this.$refs.chart1);
    this._chart2 = echarts.init(this.$refs.chart2);
    this._chart3 = echarts.init(this.$refs.chart3);
    this._chart1Big = echarts.init(this.$refs.chart1Big);
    this._chart2Big = echarts.init(this.$refs.chart2Big);
    this._chart3Big = echarts.init(this.$refs.chart3Big);
    this.getDetail();
    this.handleChangeGeoId(this.s_polgonParkingDetail);
    this._resizeObserver = new ResizeObserver((entries) => {
      console.log("resize");

      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        if (this._chart1) this._chart1.resize();
        if (this._chart2) this._chart2.resize();
        if (this._chart3) this._chart3.resize();
        this._setSizeTimeout = null;
      }, 1000 / 120);
    });
    this._resizeObserver.observe(this.$refs.body);
  },
  beforeDestroy() {
    this.handleDisable();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._chart1) {
      this._chart1.dispose();
      this._chart1 = null;
    }
    if (this._chart2) {
      this._chart2.dispose();
      this._chart2 = null;
    }
    if (this._chart3) {
      this._chart3.dispose();
      this._chart3 = null;
    }
    this.rootVue.$off("Parking_Geojson_Uuid", this.handleChangeGeoId);
  },
  methods: {
    handleEnable() {
      this._Map.addLayer(this._PolygonSelectLayer);
      this._PolygonSelectLayer.setPath(this.s_polgonParkingDetail.xyarr);
    },
    handleDisable() {
      this._Map.removeLayer(this._PolygonSelectLayer);
    },
    handleChangeGeoId(data) {
      this.s_polgonParkingDetail.geoId = data.geoId;
      if (this.s_polgonParkingDetail.geoId) {
        rangeRequireRatio2(this.s_polgonParkingDetail).then((res) => {
          console.log("rangeRequireRatio2", res);
          this.rangeRequireRatioData = res.data.requireRatio;
          this._chart2.setOption(this.getChartOptions2(), true);
          this._chart2Big.setOption(this.getChartOptions2(), true);

          this.supplyData = res.data.supply;
          this._chart3.setOption(this.getChartOptions3(), true);
          this._chart3Big.setOption(this.getChartOptions3(), true);
          this.showChart2 = true;
          this.$nextTick(() => {
            this._chart2.resize();
            this._chart3.resize();
          });
        });
      } else {
        this.showChart2 = false;
      }
    },
    getDetail() {
      if (!this.s_polgonParkingDetail) return;
      this.loading = true;
      rangeParking(this.s_polgonParkingDetail).then((res) => {
        this.rangeParkingData = res.data;
        this._chart1.setOption(this.getChartOptions1(), true);
        this._chart1Big.setOption(this.getChartOptions1(), true);
        this._chart1.resize();
        this.loading = false;
      });
    },
    getChartOptions1() {
      // prettier-ignore
      const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a','7a', '8a', '9a', '10a', '11a','12p', '1p', '2p', '3p', '4p', '5p','6p', '7p', '8p', '9p', '10p', '11p'];
      // prettier-ignore
      const type = Array.from(Object.keys(this.rangeParkingData[0] || {}));
      // prettier-ignore
      const data = [];
      let maxValue = -1;
      for (let i = 0; i < hours.length; i++) {
        for (let j = 0; j < type.length; j++) {
          const hk = i,
            tk = type[j];
          const value = this.rangeParkingData[hk][tk];
          if (value > maxValue) maxValue = value;
          data.push({
            value: [hk, j, value],
          });
        }
      }
      return {
        tooltip: {},
        visualMap: {
          max: maxValue,
          inRange: {
            color: ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"],
          },
        },
        xAxis3D: {
          name: "hours",
          nameGap: 40,
          type: "category",
          data: hours,
        },
        yAxis3D: {
          name: "type",
          nameGap: 40,
          type: "category",
          data: type,
        },
        zAxis3D: {
          name: "value",
          type: "value",
        },
        grid3D: {
          boxWidth: hours.length * 10,
          boxDepth: type.length * 20,
          viewControl: {
            projection: "perspective",
            minDistance: 50,
            maxDistance: Math.max(hours.length * 10, type.length * 20) * 4,
            distance: Math.max(hours.length * 10, type.length * 20) * 1.5,
            beta: 10,
          },
        },
        series: [
          {
            type: "bar3D",
            data: data,
            shading: "lambert",
            label: {
              fontSize: 16,
              borderWidth: 1,
            },
            emphasis: {
              label: {
                fontSize: 20,
                color: "#900",
              },
              itemStyle: {
                color: "#900",
              },
            },
          },
        ],
      };
    },
    getChartOptions2() {
      const data = this.rangeRequireRatioData;
      // prettier-ignore
      const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a','7a', '8a', '9a', '10a', '11a','12p', '1p', '2p', '3p', '4p', '5p','6p', '7p', '8p', '9p', '10p', '11p'];
      return {
        tooltip: {},
        xAxis: {
          type: "category",
          data: hours,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: hours.map((v, i) => Number(data[i] || 0)),
            type: "bar",
          },
        ],
      };
    },
    getChartOptions3() {
      // prettier-ignore
      return {
        tooltip: {
          type:"item" 
        },
        xAxis: {
          type: "category",
          data: Array.from(Object.keys(this.supplyData)),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: Array.from(Object.values(this.supplyData)).map((v, i) => Number(v || 0)),
            type: "bar",
          },
        ],
      };
    },
    handleOpenChart1() {
      this.openChart1 = !this.openChart1;
      if (this._chart1) this._chart1.resize();
    },
    handleOpenChart2() {
      this.openChart2 = !this.openChart2;
      if (this._chart2) this._chart2.resize();
    },
    handleOpenChart3() {
      this.openChart3 = !this.openChart3;
      if (this._chart3) this._chart3.resize();
    },
    handleOpenChart1Big() {
      if (this._chart1Big) this._chart1Big.resize();
    },
    handleOpenChart2Big() {
      if (this._chart2Big) this._chart2Big.resize();
    },
    handleOpenChart3Big() {
      if (this._chart3Big) this._chart3Big.resize();
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  font-size: 13px;
  .toolbar_item_bodyer {
    .chart1,
    .chart2,
    .chart3 {
      width: 100%;
      height: 300px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 15px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
.chart1Big,
.chart2Big,
.chart3Big {
  width: 800px;
  height: 600px;
}
</style>
