<template>
  <el-tabs v-model="activeName" @tab-click="handleChange">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading"></div>
    </el-tab-pane>
    <el-tab-pane :label="$l('Data')" name="Data">
      <div style="margin-bottom: 10px">
        <el-button type="primary" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading">
        <el-table-column :label="routeInfo.routeId" prop="stopId" min-width="150" show-overflow-tooltip>
          <el-table-column :label="routeInfo.lineName" prop="stopName" min-width="150" show-overflow-tooltip>
            <el-table-column :label="$l('Stop Name')" prop="stopName" min-width="150" show-overflow-tooltip />
            <el-table-column :label="$l('Stop Id')" prop="stopName" min-width="150" show-overflow-tooltip />
            <el-table-column :label="$l('Stop Index')" prop="index" width="100" show-overflow-tooltip />
            <el-table-column :label="$l('base/contrast')" prop="type" width="150" show-overflow-tooltip />

            <el-table-column :label="$l('arrScheduled')" prop="arrScheduled" width="150" show-overflow-tooltip>
              <template slot-scope="{ row }">{{ row.arrScheduled.join(":") }}</template>
            </el-table-column>
            <el-table-column :label="$l('depScheduled')" prop="depScheduled" width="150" show-overflow-tooltip>
              <template slot-scope="{ row }">{{ row.depScheduled.join(":") }}</template>
            </el-table-column>
            <el-table-column :label="$l('arrSimulated')" prop="arrSimulated" width="150" show-overflow-tooltip>
              <template slot-scope="{ row }">{{ row.arrSimulated.join(":") }}</template>
            </el-table-column>
            <el-table-column :label="$l('depSimulated')" prop="depSimulated" width="150" show-overflow-tooltip>
              <template slot-scope="{ row }">{{ row.depSimulated.join(":") }}</template>
            </el-table-column>
          </el-table-column>
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
  "Stop Index":{
    "zh-CN": "站点索引",
    "en-US": "Stop Index"
  },
  "Stop Id":{
    "zh-CN": "站点编号",
    "en-US": "Stop Id"
  },
  "base/contrast":{
    "zh-CN": "基色/对比色",
    "en-US": "base/contrast"
  },
  "arrScheduled":{
    "zh-CN": "安排日程",
    "en-US": "arrScheduled"
  },
  "depScheduled":{
    "zh-CN": "部署计划",
    "en-US": "depScheduled"
  },
  "arrSimulated":{
    "zh-CN": "排列模拟",
    "en-US": "arrSimulated"
  },
  "depSimulated":{
    "zh-CN": "描绘模拟",
    "en-US": "depSimulated"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { routeTimeDiagram } from "@/api/contrast";
import { formatHour } from "@/utils/utils";
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

      oldTableList: [],
      oldRowList: [],
      oldColList: [],
      oldDataMap: {},

      newTableList: [],
      newRowList: [],
      newColList: [],
      newDataMap: {},

      tableList: [],

      loading: false,
    };
  },
  computed: {},
  mounted() {
    this._chart = echarts.init(this.$refs.chart);
    this.updateChart();
  },
  methods: {
    // tab切换事件
    handleChange() {
      if (this._chart) {
        this.$nextTick(() => {
          this._chart.resize();
        });
      }
    },
    changeData(data, type) {
      try {
        const stopMap = new Map(data[0].data.map((v, i) => [v.stopId, { stopId: v.stopId, stopName: v.stopName, index: i + 1, type: type, arrScheduled: [], arrSimulated: [], depScheduled: [], depSimulated: [] }]));
        const rowList = data[0].data.map((v) => ({
          stopId: v.stopId,
          stopName: v.stopName,
        }));
        const colList = data.map((v) => ({
          departureId: v.departureId,
          time: v.time,
        }));
        const dataMap = {};
        for (const v1 of data) {
          for (const v2 of v1.data) {
            const key = `${v2.stopId}-${v1.departureId}`;
            dataMap[key] = {
              arrScheduled: v2.arrScheduled,
              arrSimulated: v2.arrSimulated,
              depScheduled: v2.depScheduled,
              depSimulated: v2.depSimulated,
            };

            const stop = stopMap.get(v2.stopId);
            stop.arrScheduled.push(v2.arrScheduled);
            stop.arrSimulated.push(v2.arrSimulated);
            stop.depScheduled.push(v2.depScheduled);
            stop.depSimulated.push(v2.depSimulated);
          }
        }
        return {
          tableList: Array.from(stopMap.values()),
          rowList: rowList,
          colList: colList,
          dataMap: dataMap,
        };
      } catch (error) {
        console.log(error);
        return {
          tableList: [],
          rowList: [],
          colList: [],
          dataMap: {},
        };
      }
    },
    // 请求数据
    getData() {
      this.loading = true;
      this.$nextTick(() => {
        routeTimeDiagram(this.form)
          .then((res) => {
            const oldLine = this.changeData(res.data.before, "base");
            const newLine = this.changeData(res.data.after, "contrast");

            this.oldTableList = oldLine.tableList;
            this.oldRowList = oldLine.rowList;
            this.oldColList = oldLine.colList;
            this.oldDataMap = oldLine.dataMap;

            this.newTableList = newLine.tableList;
            this.newRowList = newLine.rowList;
            this.newColList = newLine.colList;
            this.newDataMap = newLine.dataMap;
            this.tableList = [oldLine.tableList, newLine.tableList].flat();

            this.updateChart();
            this.loading = false;
          })
          .catch((err) => {
            this.tableList = [];

            this.oldTableList = [];
            this.oldRowList = [];
            this.oldColList = [];
            this.oldDataMap = {};

            this.newTableList = [];
            this.newRowList = [];
            this.newColList = [];
            this.newDataMap = {};

            this.updateChart();
            this.loading = false;
          });
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
      let max = 0;
      let min = 24 * 60 * 60;
      const oldSeries = this.oldColList
        .map((v1, i1) => {
          let arrScheduled = [];
          let arrSimulated = [];
          let depScheduled = [];
          let depSimulated = [];
          this.oldRowList.forEach((v2) => {
            arrScheduled.push(this.getValue(this.oldDataMap, v2.stopId, v1.departureId, "arrScheduled"));
            arrSimulated.push(this.getValue(this.oldDataMap, v2.stopId, v1.departureId, "arrSimulated"));
            depScheduled.push(this.getValue(this.oldDataMap, v2.stopId, v1.departureId, "depScheduled"));
            depSimulated.push(this.getValue(this.oldDataMap, v2.stopId, v1.departureId, "depSimulated"));
          });

          max = Math.max(max, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);
          min = Math.min(min, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);

          return [
            {
              name: "base-arrScheduled" + i1,
              type: "line",
              yAxisIndex: 0,
              showSymbol: false,
              data: arrScheduled,
            },
            {
              name: "base-arrSimulated" + i1,
              type: "line",
              yAxisIndex: 0,
              showSymbol: false,
              data: arrSimulated,
            },
            {
              name: "base-depScheduled" + i1,
              type: "line",
              yAxisIndex: 0,
              showSymbol: false,
              data: depScheduled,
            },
            {
              name: "base-depSimulated" + i1,
              type: "line",
              yAxisIndex: 0,
              showSymbol: false,
              data: depSimulated,
            },
          ];
        })
        .flat();
      const newSeries = this.newColList
        .map((v1, i1) => {
          let arrScheduled = [];
          let arrSimulated = [];
          let depScheduled = [];
          let depSimulated = [];
          this.newRowList.forEach((v2) => {
            arrScheduled.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "arrScheduled"));
            arrSimulated.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "arrSimulated"));
            depScheduled.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "depScheduled"));
            depSimulated.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "depSimulated"));
          });

          max = Math.max(max, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);
          min = Math.min(min, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);

          return [
            {
              name: "contrast-arrScheduled" + i1,
              type: "line",
              yAxisIndex: 1,
              showSymbol: false,
              data: arrScheduled,
            },
            {
              name: "contrast-arrSimulated" + i1,
              type: "line",
              yAxisIndex: 1,
              showSymbol: false,
              data: arrSimulated,
            },
            {
              name: "contrast-depScheduled" + i1,
              type: "line",
              yAxisIndex: 1,
              showSymbol: false,
              data: depScheduled,
            },
            {
              name: "contrast-depSimulated" + i1,
              type: "line",
              yAxisIndex: 1,
              showSymbol: false,
              data: depSimulated,
            },
          ];
        })
        .flat();
      const maxYAxisNum = Math.max(this.oldRowList.length, this.newRowList.length);
      const options = {
        title: {
          text: `Route-Time Diagram, route=${this.form.routeId}`,
        },
        tooltip: {
          trigger: "axis",
          valueFormatter: formatHour,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: 20,
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        dataZoom: [
          {
            start: 0,
            end: 100,
            yAxisIndex: [0, 1],
          },
          // {
          //   start: 0,
          //   end: 100,
          //   xAxisIndex: 0,
          // },
        ],
        xAxis: {
          type: "value",
          min: (Math.floor(min / 3600) - 1) * 3600,
          max: (Math.floor(max / 3600) + 1) * 3600,
          interval: 3600,
          axisLabel: {
            formatter: function (value, index) {
              return Math.floor(value / 3600) + "h";
            },
          },
        },
        yAxis: [
          {
            type: "category",
            data: new Array(maxYAxisNum).fill(0).map((v, i) => (this.oldRowList[i] ? this.oldRowList[i].stopName : "")),
            axisLable: {
              interval: 0,
            },
          },
          {
            type: "category",
            data: new Array(maxYAxisNum).fill(0).map((v, i) => (this.newRowList[i] ? this.newRowList[i].stopName : "")),
            axisLable: {
              interval: 0,
            },
          },
        ],
        series: [...oldSeries, ...newSeries],
      };
      return options;
    },
    // 获取值
    getValue(dataMap, stopId, departureId, name) {
      try {
        return dataMap[`${stopId}-${departureId}`][name];
      } catch (error) {
        return "";
      }
    },
    // 获取值
    getValueList(dataMap, stopId, name) {
      try {
        return dataMap[`${stopId}-${departureId}`][name];
      } catch (error) {
        return "";
      }
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"${this.routeInfo.routeId}"`);
      rowList.push(`"${this.routeInfo.lineName}"`);
      rowList.push(`"${this.form.startTime} - ${this.form.endTime}"`);
      rowList.push(`"base: ${this.form.name1}","contrast: ${this.form.name2}"`);
      rowList.push(``);
      rowList.push(`"Stop Name","Stop Id","Stop Index","base/contrast","arrScheduled","depScheduled","arrSimulated","depSimulated"`);
      for (const v of this.tableList) {
        const colList = [];
        colList.push(v.stopName);
        colList.push(v.stopId);
        colList.push(v.index);
        colList.push(v.type);
        colList.push(v.arrScheduled.join(":"));
        colList.push(v.depScheduled.join(":"));
        colList.push(v.arrSimulated.join(":"));
        colList.push(v.depSimulated.join(":"));
        rowList.push(`"${colList.join(`","`)}"`);
      }
      const tableText = rowList.join("\n");
      var uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(tableText);
      var downloadLink = document.createElement("a");
      downloadLink.href = uri;
      downloadLink.download = `RouteTimeDiagram_${new Date().getTime()}.csv`;
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
