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
        <el-table-column :label="$l('#entering-base')" prop="entering" />
        <el-table-column :label="$l('#leaving-base')" prop="leaving" />
        <el-table-column :label="$l('#passengers-base')" prop="passengers" />
        <el-table-column :label="$l('#entering-actual')" prop="realEntering" />
        <el-table-column :label="$l('#leaving-actual')" prop="realLeaving" />
        <el-table-column :label="$l('#passengers-actual')" prop="realPassengers" />
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
  "站点上下客信息":{
    "zh-CN": "站点上下客信息",
    "en-US": "Stop Load..."
  },
  "车上乘客量":{
    "zh-CN": "车上乘客量",
    "en-US": "Transfers At Stop..."
  },
  "#entering-base":{
    "zh-CN": "上车人数-基础",
    "en-US": "#entering"
  },
  "#entering-actual":{
    "zh-CN": "上车人数-实际",
    "en-US": "#entering-actual"
  },
  "#leaving-base":{
    "zh-CN": "下车人数-基础",
    "en-US": "#leaving"
  },
  "#leaving-actual":{
    "zh-CN": "下车人数-实际",
    "en-US": "#leaving-actual"
  },
  "#passengers-base":{
    "zh-CN": "载客量-基础",
    "en-US": "passengers"
  },
  "#passengers-actual":{
    "zh-CN": "载客量-实际",
    "en-US": "#passengers-actual"
  },
  "base":{
    "zh-CN": "基础",
    "en-US": "base"
  },
  "contrast":{
    "zh-CN": "对比",
    "en-US": "contrast"
  },
  "actual":{
    "zh-CN": "实际",
    "en-US": "actual"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";
import * as echarts from "@/utils/echarts.utils";
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
    page_language: {
      handler(val) {
        // 语言变化时的处理
        this.updateChart();
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
  beforeDestroy() {
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
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
            text: this.$l("站点上下客信息"),
            left: "center",
            top: 40,
            textStyle: {
              fontSize: 14,
            },
          },
          {
            text: this.$l("车上乘客量"),
            left: "center",
            top: "61%",
            textStyle: {
              fontSize: 14,
            },
          },
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
        // tooltip: {
        //   trigger: "axis",
        //   axisPointer: {
        //     type: "shadow",
        //   },
        // },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },

          formatter(params, ticket) {
            console.log(params);
            let l1 = [`<div style="font-size:14px;margin-bottom: 5px;">${params[0].axisValue}</div>`];
            for (const v of params) {
              l1.push(`
                <div style="font-size:12px;">
                  ${v.marker}
                  <span style="display: inline-block;width: 100px;padding-left: 10px;">${v.seriesName}：</span>
                  <span style="display: inline-block;width: 50px;text-align:right">${v.data}</span>
                </div>
              `);
            }
            return l1.join("\n");
          },
        },
        legend: {
          top: 10,
        },
        grid: [
          {
            top: 80,
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
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        series: [
          {
            name: this.$l("#entering-base"),
            // name: this.$l("base"),
            // color: "#91cc75",
            type: "bar",
            // stack: "base",
            data: this.list.map((v) => v.entering),
          },
          {
            name: this.$l("#leaving-base"),
            // name: this.$l("base"),
            // color: "#91cc75",
            type: "bar",
            // stack: "base",
            data: this.list.map((v) => v.leaving * -1),
          },
          {
            name: this.$l("#passengers-base"),
            // name: this.$l("base"),
            // color: "#91cc75",
            type: "bar",
            // stack: "base",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers),
          },
          // 真实数据
          {
            name: this.$l("#entering-actual"),
            // name: this.$l("actual"),
            // color: "#ee6666",
            type: "bar",
            // stack: "actual",
            data: this.list.map((v) => v.realEntering),
          },
          {
            name: this.$l("#leaving-actual"),
            // name: this.$l("actual"),
            // color: "#ee6666",
            type: "bar",
            // stack: "actual",
            data: this.list.map((v) => v.realLeaving * -1),
          },
          {
            name: this.$l("#passengers-actual"),
            // name: this.$l("actual"),
            // color: "#ee6666",
            type: "bar",
            // stack: "actual",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.realPassengers),
          },
        ],
      };
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"Stop Name","Stop Id","#entering-base","#leaving-base","#passengers-base","#entering-actual","#leaving-actual","#passengers-actual"`);
      for (const v1 of this.list) {
        const colList = [v1.stopName, v1.stopId, v1.entering, v1.leaving, v1.passengers, v1.realEntering, v1.realLeaving, v1.realPassengers];
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
