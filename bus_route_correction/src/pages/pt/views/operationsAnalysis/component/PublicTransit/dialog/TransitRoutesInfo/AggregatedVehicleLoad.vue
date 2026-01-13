<template>
  <el-tabs v-model="activeName" @tab-click="handleChange">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading"></div>
    </el-tab-pane>
    <el-tab-pane :label="$l('Data')" name="Data">
      <div style="margin-bottom: 10px">
        <el-button type="primary" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-table class="small" :data="list" border stripe height="calc(100vh - 400px)" v-loading="loading">
        <el-table-column :label="$l('Stop Name')" prop="stopName" show-overflow-tooltip />
        <el-table-column :label="$l('Stop Id')" prop="stopId" show-overflow-tooltip />
        <el-table-column :label="$l('min')" prop="min" />
        <el-table-column :label="$l('avg')" prop="avg" />
        <el-table-column :label="$l('max')" prop="max" />
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<language>
{
  "Chart":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "Data":{
    "zh-CN": "数据",
    "en-US": "Data"
  },
  "Stop Name":{
    "zh-CN": "站名",
    "en-US": "Stop Name"
  },
  "Stop Id":{
    "zh-CN": "站点编号",
    "en-US": "Stop Id"
  },
  "min":{
    "zh-CN": "最小",
    "en-US": "min"
  },
  "avg":{
    "zh-CN": "平均值",
    "en-US": "avg"
  },
  "max":{
    "zh-CN": "最大",
    "en-US": "max"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";
import * as echarts from "echarts";
import { aggregatedVehicleLoad } from "@/api/index";
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
      let _requestId = guid();
      this._requestId = _requestId;
      this.loading = true;
      aggregatedVehicleLoad(this.form)
        .then((res) => {
          if (this._requestId != _requestId) return;
          const obj = {};
          for (const [key, value] of Object.entries(res.data)) {
            for (const stop of value) {
              if (!obj[stop.stopId]) obj[stop.stopId] = { ...stop };
              obj[stop.stopId][key] = Number(stop.passengers).toFixed(5);
            }
          }
          this.list = Object.values(obj);
          this.updateChart();
          this.loading = false;
        })
        .catch((err) => {
          if (this._requestId != _requestId) return;
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
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        series: [
          {
            name: "min",
            type: "line",
            step: "middle",
            data: this.list.map((v) => v.min),
          },
          {
            name: "avg",
            type: "line",
            step: "middle",
            data: this.list.map((v) => v.avg),
          },
          {
            name: "max",
            type: "line",
            step: "middle",
            data: this.list.map((v) => v.max),
          },
        ],
      };
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"Stop Name","Stop Id","min","avg","max"`);
      for (const v1 of this.list) {
        const colList = [v1.stopName, v1.stopId, v1.min, v1.avg, v1.max];
        rowList.push(`"${colList.join(`","`)}"`);
      }
      const tableText = rowList.join("\n");
      var uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(tableText);
      var downloadLink = document.createElement("a");
      downloadLink.href = uri;
      downloadLink.download = `RouteFlows_${new Date().getTime()}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
