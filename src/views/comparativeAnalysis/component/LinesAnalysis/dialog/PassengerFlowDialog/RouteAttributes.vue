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
        <el-table-column :label="$l('dataSource')" prop="dataSource">
          <template slot-scope="{ row }">{{ $l(row.dataSource) }}</template>
        </el-table-column>
        <el-table-column :label="$l('length')" prop="length"></el-table-column>
        <el-table-column :label="$l('interval')" prop="interval"></el-table-column>
        <el-table-column :label="$l('first')" prop="first"></el-table-column>
        <el-table-column :label="$l('last')" prop="last"></el-table-column>
        <el-table-column :label="$l('stopNum')" prop="stopNum"></el-table-column>
        <el-table-column :label="$l('slc')" prop="slc"></el-table-column>
        <el-table-column :label="$l('avgDist')" prop="avgDist"></el-table-column>
        <el-table-column :label="$l('passenger')" prop="passenger"></el-table-column>
        <el-table-column :label="$l('passenger')" prop="passenger"></el-table-column>
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
  "Route Attributes":{
    "zh-CN": "线路基础属性",
    "en-US": "Route Attributes"
  },
  "base":{
    "zh-CN": "基础方案",
    "en-US": "base"
  },
  "contrast":{
    "zh-CN": "对比方案",
    "en-US": "contrast"
  },
  "dataSource":{
    "zh-CN": "数据来源",
    "en-US": "dataSource"
  },
  "length":{
    "zh-CN": "线路长度",
    "en-US": "length"
  },
  "interval":{
    "zh-CN": "平均发车间隔",
    "en-US": "interval"
  },
  "first":{
    "zh-CN": "首班车时间",
    "en-US": "first"
  },
  "last":{
    "zh-CN": "末班车时间",
    "en-US": "last"
  },
  "stopNum":{
    "zh-CN": "站点数量",
    "en-US": "stopNum"
  },
  "slc":{
    "zh-CN": "直线系数",
    "en-US": "slc"
  },
  "avgDist":{
    "zh-CN": "平均站距",
    "en-US": "avgDist"
  },
  "passenger":{
    "zh-CN": "日均客流",
    "en-US": "passenger"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { routeAttributes } from "@/api/contrast";
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
      routeAttributes(this.form)
        .then((res) => {
          this._chart_data = {
            ...res.data,
            routeInfo: this.routeInfo,
          };
          this._chart_data.before.dataSource = "base";
          this._chart_data.after.dataSource = "contrast";
          this.list = [this._chart_data.before, this._chart_data.after];
          this.updateChart();
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.list = [];
          this._chart_data = {};
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
      const { after, before, max, labels, routeInfo } = Object.assign(
        {
          after: {},
          before: {},
          max: {},
          routeInfo: {},
          labels: ["length", "interval", "first", "last", "stopNum", "slc", "avgDist", "passenger"],
        },
        this._chart_data
      );
      console.log(this._chart_data);
      const keySet = new Set(labels);
      const indicator = [],
        afterList = [],
        beforeList = [];
      if (keySet.has("length")) {
        // 线路长度
        indicator.push({ name: this.$l("length"), max: max.length });
        afterList.push(after.length);
        beforeList.push(before.length);
      }
      if (keySet.has("interval")) {
        // 平均发车间隔
        indicator.push({ name: this.$l("interval"), max: max.interval });
        afterList.push(after.interval);
        beforeList.push(before.interval);
      }
      if (keySet.has("first")) {
        // 首班车时间
        indicator.push({ name: this.$l("first"), max: max.first });
        afterList.push(after.first);
        beforeList.push(before.first);
      }
      if (keySet.has("last")) {
        // 末班车时间
        indicator.push({ name: this.$l("last"), max: max.last });
        afterList.push(after.last);
        beforeList.push(before.last);
      }
      if (keySet.has("stopNum")) {
        // 站点数量
        indicator.push({ name: this.$l("stopNum"), max: max.stopNum });
        afterList.push(after.stopNum);
        beforeList.push(before.stopNum);
      }
      if (keySet.has("slc")) {
        // 直线系数
        indicator.push({ name: this.$l("slc"), max: max.slc });
        afterList.push(after.slc);
        beforeList.push(before.slc);
      }
      if (keySet.has("avgDist")) {
        // 平均站距
        indicator.push({ name: this.$l("avgDist"), max: max.avgDist });
        afterList.push(after.avgDist);
        beforeList.push(before.avgDist);
      }
      if (keySet.has("passenger")) {
        // 日均客流
        indicator.push({ name: this.$l("passenger"), max: max.passenger });
        afterList.push(after.passenger);
        beforeList.push(before.passenger);
      }
      return {
        title: {
          text: routeInfo.routeId + " " + this.$l(`Route Attributes`),
          left: "center",
        },
        legend: {
          left: "center",
          bottom: 0,
        },
        radar: {
          // shape: 'circle',
          indicator: indicator,
        },

        tooltip: {},
        series: [
          {
            name: this.$l("Route Attributes"),
            type: "radar",
            data: [
              {
                value: afterList,
                name: this.$l("base"),
              },
              {
                value: beforeList,
                name: this.$l("contrast"),
              },
            ],
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
      rowList.push(`"dataSource","length","interval","first","last","stopNum","slc","avgDist","passenger"`);
      for (let i = 0, l = this.list.length; i < l; i++) {
        const colList = [];
        colList.push(this.list[i].dataSource);
        colList.push(this.list[i].length);
        colList.push(this.list[i].interval);
        colList.push(this.list[i].first);
        colList.push(this.list[i].last);
        colList.push(this.list[i].stopNum);
        colList.push(this.list[i].slc);
        colList.push(this.list[i].avgDist);
        colList.push(this.list[i].passenger);
        colList.push(this.list[i].passenger);
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
