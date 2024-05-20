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
        <el-table-column :label="$l('Stop Name')" prop="stopName" width="150" show-overflow-tooltip />
        <el-table-column :label="$l('Stop Id')" prop="stopId" width="150" show-overflow-tooltip />
        <el-table-column :label="$l('#entering')" prop="entering">
          <el-table-column :label="$l('#entering-base')" width="150" prop="entering[0]" />
          <el-table-column :label="$l('#entering-contrast')" width="150" prop="entering[1]" />
          <el-table-column :label="$l('#entering-actual')" width="150" prop="entering[2]" />
        </el-table-column>
        <el-table-column :label="$l('#leaving')" prop="leaving">
          <el-table-column :label="$l('#leaving-base')" width="150" prop="leaving[0]" />
          <el-table-column :label="$l('#leaving-contrast')" width="150" prop="leaving[1]" />
          <el-table-column :label="$l('#leaving-actual')" width="150" prop="leaving[2]" />
        </el-table-column>
        <el-table-column :label="$l('#passengers')" prop="passengers">
          <el-table-column :label="$l('#passengers-base')" width="150" prop="passengers[0]" />
          <el-table-column :label="$l('#passengers-contrast')" width="180" prop="passengers[1]" />
          <el-table-column :label="$l('#passengers-actual')" width="180" prop="passengers[2]" />
        </el-table-column>
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
  "#entering-base":{
    "zh-CN": "#entering-base",
    "en-US": "#entering-base"
  },
  "#entering-contrast":{
    "zh-CN": "#entering-contrast",
    "en-US": "#entering-contrast"
  },
  "#entering-actual":{
    "zh-CN": "#entering-actual",
    "en-US": "#entering-actual"
  },
  "#leaving":{
    "zh-CN": "#leaving",
    "en-US": "#leaving"
  },
  "#leaving-base":{
    "zh-CN": "#leaving-base",
    "en-US": "#leaving-base"
  },
  "#leaving-contrast":{
    "zh-CN": "#leaving-contrast",
    "en-US": "#leaving-contrast"
  },
  "#leaving-actual":{
    "zh-CN": "#leaving-actual",
    "en-US": "#leaving-actual"
  },
  "#passengers":{
    "zh-CN": "#passengers",
    "en-US": "#passengers"
  },
  "#passengers-base":{
    "zh-CN": "#passengers-base",
    "en-US": "#passengers-base"
  },
  "#passengers-contrast":{
    "zh-CN": "#passengers-contrast",
    "en-US": "#passengers-contrast"
  },
  "#passengers-actual":{
    "zh-CN": "#passengers-actual",
    "en-US": "#passengers-actual"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { passengerEnteringAndLeaving } from "@/api/index";
import { passengerInfo } from "@/api/contrast";
export default {
  props: {
    routeInfo: {
      type: Object,
      default: () => ({}),
    },
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
      passengerInfo(this.form)
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
      function changeName(name) {
        return name
          .split("")
          .map((v, i) => ((i + 1) % 5 == 0 ? v + "\n" : v))
          .join("");
      }

      return {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {},
        grid: [
          {
            top: 70,
            bottom: "42.5%",
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
          },
          {
            top: "62.5%",
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
            gridIndex: 0,
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
            gridIndex: 0,
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
            name: this.$l("#entering-base"),
            type: "bar",
            stack: "base",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.entering[0]),
          },
          {
            name: this.$l("#entering-contrast"),
            type: "bar",
            stack: "contrast",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.entering[1]),
          },
          {
            name: this.$l("#entering-actual"),
            type: "bar",
            stack: "actual",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.entering[2]),
          },
          {
            name: this.$l("#leaving-base"),
            type: "bar",
            stack: "base",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.leaving[0] * -1),
          },
          {
            name: this.$l("#leaving-contrast"),
            type: "bar",
            stack: "contrast",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.leaving[1] * -1),
          },
          {
            name: this.$l("#leaving-actual"),
            type: "bar",
            stack: "actual",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.leaving[2] * -1),
          },
          {
            name: this.$l("#passengers-base"),
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers[0]),
          },
          {
            name: this.$l("#passengers-contrast"),
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers[1]),
          },
          {
            name: this.$l("#passengers-actual"),
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers[2]),
          },
        ],
      };
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"${this.routeInfo.routeId}"`);
      rowList.push(`"${this.routeInfo.lineName}"`);
      rowList.push(`"${this.form.startTime} - ${this.form.endTime}"`);
      rowList.push(`"base: ${this.form.name1}","contrast: ${this.form.name2}"`);
      rowList.push(``);
      rowList.push(`"Stop Name","Stop Id","#entering-base","#entering-contrast","#entering-actual","#leaving-base","#leaving-contrast","#leaving-actual","#passengers-base","#passengers-contrast","#passengers-actual"`);
      for (let i = 0, l = this.list.length; i < l; i++) {
        const colList = [];
        colList.push(this.list[i].stopName);
        colList.push(this.list[i].stopId);
        colList.push(this.list[i].entering[0] || 0);
        colList.push(this.list[i].entering[1] || 0);
        colList.push(this.list[i].entering[2] || 0);
        colList.push(this.list[i].leaving[0] || 0);
        colList.push(this.list[i].leaving[1] || 0);
        colList.push(this.list[i].leaving[2] || 0);
        colList.push(this.list[i].passengers[0] || 0);
        colList.push(this.list[i].passengers[1] || 0);
        colList.push(this.list[i].passengers[2] || 0);
        rowList.push(`"${colList.join('","')}"`);
      }
      const tableText = rowList.join("\n");
      var uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(tableText);
      var downloadLink = document.createElement("a");
      downloadLink.href = uri;
      downloadLink.download = `PassengersEnteringLeaving_${new Date().getTime()}.csv`;
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
  min-height: 400px;
  height: calc(100vh - 420px);
}
</style>
