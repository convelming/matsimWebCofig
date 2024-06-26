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
        <el-table-column :label="$l('#entering')" prop="entering" />
        <el-table-column :label="$l('#leaving')" prop="leaving" />
        <el-table-column :label="$l('#passengers')" prop="passengers" />
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
  "#entering":{
    "zh-CN": "上车人数",
    "en-US": "#entering"
  },
  "#leaving":{
    "zh-CN": "下车人数",
    "en-US": "#leaving"
  },
  "#passengers":{
    "zh-CN": "载客量",
    "en-US": "#passengers"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";
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
      let _requestId = guid();
      this._requestId = _requestId;
      this.loading = true;
      passengerEnteringAndLeaving(this.form)
        .then((res) => {
          if (this._requestId != _requestId) return;
          this.list = res.data || [];
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
      function changeName(name) {
        return name
          .split("")
          .map((v, i) => ((i + 1) % 5 == 0 ? v + "\n" : v))
          .join("");
      }

      return {
        title: [
          {
            text: this.$l("#entering").split("").join("\n"),
            left: 0,
            top: "20%",
            textStyle: {
              fontSize: 14,
            },
          },
          {
            text: this.$l("#leaving").split("").join("\n"),
            left: 0,
            top: "40%",
            textStyle: {
              fontSize: 14,
            },
          },
          {
            text: this.$l("#passengers").split("").join("\n"),
            left: 0,
            top: "72%",
            textStyle: {
              fontSize: 14,
            },
          },
        ],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          data: [this.$l("#entering"), this.$l("#leaving"), this.$l("#passengers")],
        },
        grid: [
          {
            top: 70,
            bottom: "42.5%",
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
          },
          {
            top: "67.5%",
            bottom: 70,
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
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
              formatter: changeName,
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
            name: this.$l("#entering"),
            type: "bar",
            stack: "Total",
            data: this.list.map((v) => v.entering),
          },
          {
            name: this.$l("#leaving"),
            type: "bar",
            stack: "Total",
            data: this.list.map((v) => v.leaving * -1),
          },
          {
            name: this.$l("#passengers"),
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers),
          },
        ],
      };
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"Stop Name","Stop Id","#entering","#leaving","#passengers"`);
      for (const v1 of this.list) {
        const colList = [v1.stopName, v1.stopId, v1.entering, v1.leaving, v1.passengers];
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
