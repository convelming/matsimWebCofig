<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ $l("停车需求详情") }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading" ref="body">
      <div class="title">
        <span>{{ $l("停车需求图表") }}</span>
        <el-button type="text" icon="el-icon-full-screen" @click="" />
      </div>
      <div ref="chart1" class="chart1"></div>
      <div v-show="showChart2">
        <div class="title">
          <span>{{ $l("停车供需比图表") }}</span>
          <el-button type="text" icon="el-icon-full-screen" @click="" />
        </div>
        <div ref="chart2" class="chart2"></div>
      </div>
    </div>
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
  "停车供需比图表":{
    "zh-CN": "停车供需比图表",
    "en-US": "Parking supply/demand Ratio"
  },
}
</language>

<script>
import * as echarts from "echarts";
import "echarts-gl";
import { rangeParking, rangeRequireRatio } from "@/api/index";
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
      rangeParkingData: null,
      rangeRequireRatioData: null,
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
    this.getDetail();
    this.handleChangeGeoId(this.s_polgonParkingDetail);
    this._resizeObserver = new ResizeObserver((entries) => {
      console.log("resize");

      // 节流
      if (this._setSizeTimeout) return;
      this._setSizeTimeout = setTimeout(() => {
        if (this._chart1) this._chart1.resize();
        if (this._chart2) this._chart2.resize();
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
        rangeRequireRatio(this.s_polgonParkingDetail).then((res) => {
          this.rangeRequireRatioData = res.data;
          this._chart2.setOption(this.getChartOptions2(), true);
          this.showChart2 = true;
          this.$nextTick(() => {
            this._chart2.resize();
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
        this._chart2.resize();
        this.loading = false;
      });
    },
    getChartOptions1() {
      // prettier-ignore
      const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a','7a', '8a', '9a', '10a', '11a','12p', '1p', '2p', '3p', '4p', '5p','6p', '7p', '8p', '9p', '10p', '11p'];
      // prettier-ignore
      const type = Array.from(Object.keys(this.rangeParkingData[0]));
      // prettier-ignore
      const data = [];
      for (let i = 0; i < hours.length; i++) {
        for (let j = 0; j < type.length; j++) {
          const hk = i,
            tk = type[j];
          const value = [hk, j, this.rangeParkingData[hk][tk]];
          data.push({
            value,
          });
        }
      }
      console.log(data);

      return {
        tooltip: {},
        visualMap: {
          max: 20,
          inRange: {
            color: ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"],
          },
        },
        xAxis3D: {
          name: "hours",
          type: "category",
          data: hours,
        },
        yAxis3D: {
          name: "type",
          type: "category",
          data: type,
        },
        zAxis3D: {
          name: "value",
          type: "value",
        },
        grid3D: {
          boxWidth: 200,
          boxDepth: 80,
          viewControl: {
            // projection: 'orthographic'
          },
          light: {
            main: {
              intensity: 1.2,
              shadow: true,
            },
            ambient: {
              intensity: 0.3,
            },
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
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  font-size: 13px;
  .toolbar_item_bodyer {
    .chart1,
    .chart2 {
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
</style>
