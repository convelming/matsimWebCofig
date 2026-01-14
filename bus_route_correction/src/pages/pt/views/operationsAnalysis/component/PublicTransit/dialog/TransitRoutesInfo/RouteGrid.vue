<template>
  <div>
    <div class="row">
      <span>{{ $l("Show：") }}</span>
      <el-select v-model="dataName" @change="updateChart">
        <el-option :label="$l('entering')" value="entering" />
        <el-option :label="$l('leaving')" value="leaving" />
      </el-select>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleChange">
      <el-tab-pane :label="$l('Chart')" name="Chart">
        <div ref="chart" class="chart-container" v-loading="loading"></div>
      </el-tab-pane>
      <el-tab-pane :label="$l('Data')" name="Data">
        <div style="margin-bottom: 10px">
          <el-button type="primary" size="small" @click="handleExport">导出</el-button>
        </div>
        <el-table class="small" :data="tableList" border stripe min-height="300px" height="calc(100vh - 500px)" v-loading="loading">
          <el-table-column :label="$l('Stop Name')" prop="stopName" show-overflow-tooltip min-width="200" />
          <el-table-column :label="$l('Stop Id')" prop="stopId" show-overflow-tooltip min-width="200" />
          <el-table-column v-for="(v, k) in colList" :key="k" :label="v + ' ' + $l('hour')" show-overflow-tooltip width="80">
            <template slot-scope="{ row }">{{ getValue(v, row.stopName, dataName) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<language>
{
  "Show：":{
    "zh-CN": "显示：",
    "en-US": "Show："
  },
  "entering":{
    "zh-CN": "上车",
    "en-US": "entering"
  },
  "leaving":{
    "zh-CN": "下车",
    "en-US": "leaving"
  },
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
  "hour":{
    "zh-CN": "时",
    "en-US": "hour"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";
import * as echarts from "@/utils/echarts.utils";
import { routeGrid } from "@/api/index";
import { formatHour } from "@/utils/utils";
export default {
  props: {
    routeOptions: {
      type: Array,
      default: () => [],
    },
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
      tableList: [],
      rowList: [],
      colList: Object.keys(new Array(24).fill()),
      dataMap: {},
      loading: false,
      dataName: "entering",
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
      routeGrid(this.form)
        .then((res) => {
          if (this._requestId != _requestId) return;
          const rowList = res.data.stops.map((v) => v.name).reverse();
          const tableList = res.data.stops.map((v) => ({
            stopName: v.name,
            stopId: v.id,
          }));
          const dataMap = {};
          for (const [i1, v1] of Object.entries(res.data.data)) {
            for (const v2 of v1) {
              let key = `${i1}-${v2.stopName}`;
              dataMap[key] = v2;
            }
          }

          this.tableList = tableList;
          this.rowList = rowList;
          this.dataMap = dataMap;
          this.updateChart();
          this.loading = false;
        })
        .catch((err) => {
          if (this._requestId != _requestId) return;
          this.tableList = [];
          this.rowList = [];
          this.dataMap = {};
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
      // prettier-ignore
      const xAxisData = this.colList;
      // prettier-ignore
      const yAxisData = this.rowList;
      // prettier-ignore
      let minValue = Number.MAX_SAFE_INTEGER;
      let maxValue = Number.MIN_SAFE_INTEGER;
      const seriesData = xAxisData
        .map((v1, i1) => {
          return yAxisData.map((v2, i2) => {
            const passengers = this.getValue(v1, v2, this.dataName);
            if (minValue > passengers) minValue = passengers;
            if (maxValue < passengers) maxValue = passengers;
            return [i1, i2, passengers];
          });
        })
        .flat();
      const title = this.form.routeId;
      let subtitle = "";
      if (this.form.single) {
        const times = this.form.departureId.split("_");
        subtitle = `Departrue at ${times[times.length - 1]}`;
      } else {
        subtitle = `${this.routeOptions.length} departrue between ${formatHour(this.form.startSecond)} and ${formatHour(this.form.endSecond)}`;
      }

      return {
        title: {
          text: title,
          subtext: subtitle,
          left: "center",
        },
        tooltip: {
          position: "top",
        },
        grid: {
          top: 80,
          left: 0,
          right: 20,
          bottom: 80,
          containLabel: true,
        },
        xAxis: {
          position: "top",
          type: "category",
          data: xAxisData,
          splitArea: {
            show: true,
          },
          axisLabel: {
            interval: 0,
          },
        },
        yAxis: {
          type: "category",
          data: yAxisData,
          splitArea: {
            show: true,
          },
          axisLabel: {
            interval: 0,
          },
        },
        visualMap: {
          min: minValue,
          max: maxValue,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 0,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        series: [
          {
            type: "heatmap",
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
    },
    // 获取值
    getValue(v1, stopName, dataName) {
      try {
        return this.dataMap[`${v1}-${stopName}`][dataName] || 0;
      } catch (error) {
        return 0;
      }
    },
    handleExport() {
      const rowList = [];
      rowList.push(`"Stop Name","Stop Id","${this.colList.map((v) => v + "hour").join(`","`)}"`);
      for (const v1 of this.tableList) {
        const colList = [v1.stopName, v1.stopId, ...this.colList.map((v2) => this.getValue(v2, v1.stopName, this.dataName))];
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
  height: calc(100vh - 470px);
}
</style>
