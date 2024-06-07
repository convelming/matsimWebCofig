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
        <el-table-column :label="$l('Stop Name')">
          <el-table-column :label="lineInfo.line" prop="stopName" min-width="150" show-overflow-tooltip />
        </el-table-column>
        <el-table-column :label="$l('Stop Id')">
          <el-table-column :label="lineInfo.routeId" prop="stopId" min-width="150" show-overflow-tooltip />
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
import { guid } from "@/utils/utils";
import * as echarts from "echarts";
import { routeTimeDiagram } from "@/api/index";
import { formatHour } from "@/utils/utils";
export default {
  props: {
    lineInfo: {
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
      tableList: [],
      rowList: [],
      colList: [],
      dataMap: {},
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
    // 请求数据
    getData() {
      let _requestId = guid();
      this._requestId = _requestId;
      this.loading = true;
      this.$nextTick(() => {
        routeTimeDiagram(this.form)
          .then((res) => {
            if (this._requestId != _requestId) return;
            const tableList = res.data[0].data
              .map((v) => [
                {
                  stopId: v.stopId,
                  stopName: v.stopName,
                  type: "arr",
                },
                {
                  stopId: v.stopId,
                  stopName: v.stopName,
                  type: "dep",
                },
              ])
              .flat();
            const rowList = res.data[0].data.map((v) => ({
              stopId: v.stopId,
              stopName: v.stopName,
            }));
            const colList = res.data.map((v) => ({
              departureId: v.departureId,
              time: v.time,
            }));
            const dataMap = {};

            for (const v1 of res.data) {
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
            this.tableList = tableList;
            this.rowList = rowList;
            this.colList = colList;
            this.dataMap = dataMap;
            this.updateChart();
            this.loading = false;
          })
          .catch((err) => {
            if (this._requestId != _requestId) return;
            this.tableList = [];
            this.rowList = [];
            this.colList = [];
            this.dataMap = {};
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
      const series = this.colList
        .map((v1) => {
          let arrScheduled = [];
          let arrSimulated = [];
          let depScheduled = [];
          let depSimulated = [];
          this.rowList.forEach((v2) => {
            arrScheduled.push(this.getValue(v2.stopId, v1.departureId, "arrScheduled"));
            arrSimulated.push(this.getValue(v2.stopId, v1.departureId, "arrSimulated"));
            depScheduled.push(this.getValue(v2.stopId, v1.departureId, "depScheduled"));
            depSimulated.push(this.getValue(v2.stopId, v1.departureId, "depSimulated"));
          });

          max = Math.max(max, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);
          min = Math.min(min, ...arrScheduled, ...arrSimulated, ...depScheduled, ...depSimulated);

          return [
            {
              name: "arrScheduled",
              type: "line",
              showSymbol: false,
              data: arrScheduled,
            },
            {
              name: "arrSimulated",
              type: "line",
              showSymbol: false,
              data: arrSimulated,
            },
            {
              name: "depScheduled",
              type: "line",
              showSymbol: false,
              data: depScheduled,
            },
            {
              name: "depSimulated",
              type: "line",
              showSymbol: false,
              data: depSimulated,
            },
          ];
        })
        .flat();
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
          bottom: 50,
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
        yAxis: {
          type: "category",
          data: this.rowList.map((v) => v.stopName).reverse(),
          axisLable: {
            interval: 0,
          },
        },
        series: series,
      };
    },
    // 获取值
    getValue(stopId, departureId, name) {
      try {
        return this.dataMap[`${stopId}-${departureId}`][name];
      } catch (error) {
        return "";
      }
    },
    handleExport() {
      const rowList = [];
      rowList.push(
        `"Stop Name","Stop Id","dep/arr","${this.colList
          .map((v) => [v.departureId, ""])
          .flat()
          .join(`","`)}"`
      );
      rowList.push(
        `"${this.lineInfo.line}","${this.lineInfo.routeId}","dep/arr","${this.colList
          .map((v) => ["scheduled", "simulated"])
          .flat()
          .join(`","`)}"`
      );
      for (const v1 of this.tableList) {
        const colList = [v1.stopName, v1.stopId, v1.type, ...this.colList.map((v2) => [this.getValue(v1.stopId, v2.departureId, v1.type + "Scheduled"), this.getValue(v1.stopId, v2.departureId, v1.type + "Simulated")]).flat()];
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
