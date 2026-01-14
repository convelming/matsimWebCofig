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
  "#entering-base":{
    "zh-CN": "上车人数-基础",
    "en-US": "#entering-base"
  },
  "#entering-contrast":{
    "zh-CN": "上车人数-对比",
    "en-US": "#entering-contrast"
  },
  "#entering-actual":{
    "zh-CN": "上车人数-实际",
    "en-US": "#entering-actual"
  },
  "#leaving":{
    "zh-CN": "下车人数",
    "en-US": "#leaving"
  },
  "#leaving-base":{
    "zh-CN": "下车人数-基础",
    "en-US": "#leaving-base"
  },
  "#leaving-contrast":{
    "zh-CN": "下车人数-对比",
    "en-US": "#leaving-contrast"
  },
  "#leaving-actual":{
    "zh-CN": "下车人数-实际",
    "en-US": "#leaving-actual"
  },
  "#passengers":{
    "zh-CN": "载客量",
    "en-US": "#passengers"
  },
  "#passengers-base":{
    "zh-CN": "载客量-基础",
    "en-US": "#passengers-base"
  },
  "#passengers-contrast":{
    "zh-CN": "载客量-对比",
    "en-US": "#passengers-contrast"
  },
  "#passengers-actual":{
    "zh-CN": "载客量-实际",
    "en-US": "#passengers-actual"
  },
  "站点上下客信息":{
    "zh-CN": "站点上下客信息",
    "en-US": "Stop Load..."
  },
  "车上乘客量":{
    "zh-CN": "车上乘客量",
    "en-US": "Transfers At Stop..."
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
import * as echarts from "@/utils/echarts.utils";
import { passengerEnteringAndLeaving } from "@/api/index";
import { passengerInfo } from "@/api/contrast";
import { color } from "d3";
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
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },

          formatter(params, ticket) {
            const obj = {};
            for (const v of params) {
              let [name1, name2] = v.seriesId.split("-");
              if (!obj[name2]) obj[name2] = { marker: v.marker, data: {} };
              obj[name2].data[name1] = v.data;
            }
            let l1 = [];
            for (const k1 in obj) {
              const v1 = obj[k1];
              const l2 = [];
              for (const k2 in v1.data) {
                const v2 = v1.data[k2];
                l2.push(`
                  <div>
                    <span style="display: inline-block;width: 100px;padding-left: 10px;">${k2}：</span>
                    <span style="display: inline-block;width: 50px;text-align:right">${v2}</span>
                  </div>
                `);
              }
              l1.push(`
                <div style="font-weight: bold;font-size:14px;">
                  ${v1.marker}
                  <span>${k1}</span>
                </div>
                <div style="font-size:12px;">\n${l2.join("\n")}\n</div>
              `);
            }
            return l1.join("<br/>\n");
          },
        },
        legend: {},
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
            id: this.$l("#entering-base"),
            name: this.$l("base"),
            color: "#91cc75",
            type: "bar",
            stack: "base",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.entering[0]),
          },
          {
            id: this.$l("#entering-contrast"),
            name: this.$l("contrast"),
            text: "1233",
            color: "#fac858",
            type: "bar",
            stack: "contrast",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.entering[1]),
          },
          {
            id: this.$l("#entering-actual"),
            name: this.$l("actual"),
            color: "#ee6666",
            type: "bar",
            stack: "actual",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.entering[2]),
          },
          {
            id: this.$l("#leaving-base"),
            name: this.$l("base"),
            color: "#91cc75",
            type: "bar",
            stack: "base",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.leaving[0] * -1),
          },
          {
            id: this.$l("#leaving-contrast"),
            name: this.$l("contrast"),
            color: "#fac858",
            type: "bar",
            stack: "contrast",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.leaving[1] * -1),
          },
          {
            id: this.$l("#leaving-actual"),
            name: this.$l("actual"),
            color: "#ee6666",
            type: "bar",
            stack: "actual",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.list.map((v) => v.leaving[2] * -1),
          },
          {
            id: this.$l("#passengers-base"),
            name: this.$l("base"),
            color: "#91cc75",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers[0]),
          },
          {
            id: this.$l("#passengers-contrast"),
            name: this.$l("contrast"),
            color: "#fac858",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers[1]),
          },
          {
            id: this.$l("#passengers-actual"),
            name: this.$l("actual"),
            color: "#ee6666",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers[2]),
          },
        ],
      };
    },
    // 导出csv
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
