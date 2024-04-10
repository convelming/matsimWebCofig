<template>
  <el-tabs v-model="activeName" @tab-click="handleChange">
    <el-tab-pane :label="$('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading"></div>
    </el-tab-pane>
    <el-tab-pane :label="$('Data')" name="Data">
      <el-table
        class="small"
        :data="list"
        border
        stripe
        height="calc(100vh - 400px)"
        v-loading="loading"
      >
        <el-table-column
          :label="$('Stop Name')"
          prop="stopName"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$('Stop Id')"
          prop="stopId"
          show-overflow-tooltip
        />
        <el-table-column :label="$('#entering')" prop="entering" />
        <el-table-column :label="$('#leaving')" prop="leaving" />
        <el-table-column :label="$('#passengers')" prop="passengers" />
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
  "#entering":{
    "zh-CN": "#entering",
    "en-US": "#entering"
  },
  "#leaving":{
    "zh-CN": "#leaving",
    "en-US": "#leaving"
  },
  "#passengers":{
    "zh-CN": "#passengers",
    "en-US": "#passengers"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { passengerEnteringAndLeaving } from "@/api/index";
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
      passengerEnteringAndLeaving(this.form)
        .then((res) => {
          this.list = res.data || [];
          this.updateChart();
          this.loading = false;
        })
        .catch((err) => {
          this.list = [];
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
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          data: ["entering", "leaving", "passengers"],
        },
        grid: [
          {
            top: 50,
            bottom: "42.5%",
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
            containLabel: true,
          },
          {
            top: "62.5%",
            bottom: "5%",
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
            containLabel: true,
          },
        ],
        axisPointer: {
          link: { xAxisIndex: [0, 1] },
        },
        xAxis: [
          {
            type: "category",
            show: false,
            data: this.list.map((v) => v.stopName),
            axisLabel: {
              show: false,
            },
          },
          {
            type: "category",
            gridIndex: 1,
            data: this.list.map((v) => v.stopName),
            axisLabel: {
              interval: 0,
              rotate: 90,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            splitNumber: 2,
          },
          {
            gridIndex: 1,
            type: "value",
            splitNumber: 1,
          },
        ],
        series: [
          {
            name: "entering",
            type: "bar",
            stack: "Total",
            data: this.list.map((v) => v.entering),
          },
          {
            name: "leaving",
            type: "bar",
            stack: "Total",
            data: this.list.map((v) => v.leaving * -1),
          },
          {
            name: "passengers",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers),
          },
        ],
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
