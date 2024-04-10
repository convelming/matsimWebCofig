<template>
  <el-tabs v-model="activeName" @tab-click="handleChange">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading"></div>
    </el-tab-pane>
    <el-tab-pane :label="$l('Data')" name="Data">
      <el-table
        class="small"
        :data="list"
        border
        stripe
        height="calc(100vh - 400px)"
        v-loading="loading"
      >
        <el-table-column
          :label="$l('Stop Name')"
          prop="stopName"
          show-overflow-tooltip
          min-width="200"
        />
        <el-table-column
          :label="$l('Stop Id')"
          prop="stopId"
          show-overflow-tooltip
          min-width="200"
        />
        <el-table-column
          v-for="v in timeList"
          :key="v"
          :label="v"
          :prop="v"
          width="150"
        />
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<language>
{
  "Chart":{
    "zh-CN": "Chart",
    "en-US": "Chart"
  },
  "Data":{
    "zh-CN": "Data",
    "en-US": "Data"
  },
  "Stop Name":{
    "zh-CN": "Stop Name",
    "en-US": "Stop Name"
  },
  "Stop Id":{
    "zh-CN": "Stop Id",
    "en-US": "Stop Id"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { vehicleLoad } from "@/api/index";
export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    form: {
      handler(val) {
        this.getData();
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      activeName: "Chart",
      list: [],
      timeList: [],
      loading: false,
    };
  },
  mounted() {
    this._chart = echarts.init(this.$refs.chart);
    this.updateChart();
  },
  methods: {
    // tab切换事件
    handleChange() {
      if (this._chart) {
        this.$nextTick(() => this._chart.resize());
      }
    },
    // 请求数据
    getData() {
      this.loading = true;
      vehicleLoad(this.form)
        .then((res) => {
          const obj = {};
          for (const [key, value] of Object.entries(res.data)) {
            for (const stop of value) {
              if (!obj[stop.stopId]) obj[stop.stopId] = { ...stop };
              obj[stop.stopId][key] = Number(stop.passengers).toFixed(5);
            }
          }

          this.list = Object.values(obj);
          this.timeList = Object.keys(res.data);
          this.updateChart();
          this.loading = false;
        })
        .catch((err) => {
          this.list = [];
          this.timeList = [];
          this.updateChart();
          this.loading = false;
        });
    },
    // 更新图表
    updateChart() {
      if (this._chart) {
        this._chart.setOption(this.getChartOption(), true);
        this._chart.resize();
      }
    },
    // 获取图表配置
    getChartOption() {
      return {
        title: {
          text: "Step Line",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          type: "scroll",
          bottom: 10,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: 50,
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          data: this.list.map((v) => v.stopName),
          axisLabel: {
            interval: 0,
            rotate: 90,
          },
        },
        yAxis: {
          type: "value",
        },
        series: this.timeList.map((v) => {
          return {
            name: v,
            type: "line",
            step: "start",
            data: this.list.map((v2) => v2[v]),
          };
        }),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  min-height: 300px;
  height: calc(100vh - 420px);
}
</style>
