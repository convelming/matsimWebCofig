<template>
  <el-tabs v-model="activeName" @tab-click="handleChange">
    <el-tab-pane :label="$l('Chart')" name="Chart">
      <div ref="chart" class="chart-container" v-loading="loading"></div>
    </el-tab-pane>
    <!-- <el-tab-pane :label="$l('Data')" name="Data">
      <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading">
        <el-table-column :label="$l('Stop Name')">
          <el-table-column :label="routeInfo.line" prop="stopName" min-width="150" show-overflow-tooltip />
        </el-table-column>
        <el-table-column :label="$l('Stop Id')">
          <el-table-column :label="routeInfo.routeId" prop="stopId" min-width="150" show-overflow-tooltip />
        </el-table-column>
        <el-table-column :label="$l('dep/arr')" prop="type" width="150" show-overflow-tooltip />
        <el-table-column v-for="(v, k) in colList" :label="v.departureId" :key="k">
          <el-table-column :label="$l('scheduled')" prop="type" width="150" show-overflow-tooltip>
            <template slot-scope="{ row }">{{ getValue(row.stopId, v.departureId, row.type + "Scheduled") }}</template>
          </el-table-column>
          <el-table-column :label="$l('simulated')" prop="type" width="150" show-overflow-tooltip>
            <template slot-scope="{ row }">{{ getValue(row.stopId, v.departureId, row.type + "Simulated") }}</template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-tab-pane> -->
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
  "dep/arr":{
    "zh-CN": "dep/arr",
    "en-US": "dep/arr"
  },
  "scheduled":{
    "zh-CN": "scheduled",
    "en-US": "scheduled"
  },
  "simulated":{
    "zh-CN": "simulated",
    "en-US": "simulated"
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
    changeData(data) {
      const tableList = data[0].data
        .map((v) => [
          { stopId: v.stopId, stopName: v.stopName, type: "arr" },
          { stopId: v.stopId, stopName: v.stopName, type: "dep" },
        ])
        .flat();
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
        }
      }
      return {
        tableList: tableList,
        rowList: rowList,
        colList: colList,
        dataMap: dataMap,
      };
    },
    // 请求数据
    getData() {
      this.loading = true;
      this.$nextTick(() => {
        routeTimeDiagram(this.form)
          .then((res) => {
            const oldLine = this.changeData(res.data.after);
            const newLine = this.changeData(res.data.before);

            this.oldTableList = oldLine.tableList;
            this.oldRowList = oldLine.rowList;
            this.oldColList = oldLine.colList;
            this.oldDataMap = oldLine.dataMap;

            this.newTableList = newLine.tableList;
            this.newRowList = newLine.rowList;
            this.newColList = newLine.colList;
            this.newDataMap = newLine.dataMap;

            this.updateChart();
            this.loading = false;
          })
          .catch((err) => {
            this.tableList = [];
            this.rowList = [];
            this.colList = [];
            this.dataMap = {};

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
          this.rowList.forEach((v2) => {
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
          this.rowList.forEach((v2) => {
            arrScheduled.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "arrScheduled"));
            arrSimulated.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "arrSimulated"));
            depScheduled.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "depScheduled"));
            depSimulated.push(this.getValue(this.newDataMap, v2.stopId, v1.departureId, "depSimulated"));
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
      const maxYAxisNum = Math.max(this.oldRowList.length, this.newRowList.length);
      console.log([this.oldColList, this.newColList]);
      return {
        title: {
          text: `Route-Time Diagram, route=${this.form.routeId}`,
        },
        tooltip: {
          trigger: "axis",
          valueFormatter: formatHour,
        },
        legend: {
          type: "scroll",
          bottom: 10,
          data: ["arrScheduled", "arrSimulated", "depScheduled", "depSimulated"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: 10,
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
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
    },
    // 获取值
    getValue(dataMap, stopId, departureId, name) {
      try {
        return dataMap[`${stopId}-${departureId}`][name];
      } catch (error) {
        return "";
      }
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
