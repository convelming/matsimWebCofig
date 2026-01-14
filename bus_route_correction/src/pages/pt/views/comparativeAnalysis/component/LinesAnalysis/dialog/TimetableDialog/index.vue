<template>
  <Dialog class="TimetableDialog" ref="dialog" :title="$l('时刻表信息变动')" :visible="true" @close="$emit('close')" left="center" width="1300px">
    <div class="TimetableDialog__bodyer">
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>{{ $l("基础方案") }}</span>
              <span>{{ form.routeId }}</span>
            </div>
            <div class="_content">
              <div class="item" :class="{ active: selectOldDeparture == v.departureId }" v-for="(v, i) in oldColList" :key="i" @click="handleSelectOldDeparture(v)">{{ formatHour(v.time) }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>{{ $l("对比方案") }}</span>
              <span>{{ form.routeId }}</span>
            </div>
            <div class="_content">
              <div class="item" :class="{ active: selectNewDeparture == v.departureId }" v-for="(v, i) in newColList" :key="i" @click="handleSelectNewDeparture(v)">{{ formatHour(v.time) }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px">
        <el-card class="box-card">
          <div ref="chart" class="chart-container"></div>
        </el-card>
      </el-row>
    </div>
  </Dialog>
</template>

<language>
{
  "时刻表信息变动":{
    "zh-CN": "时刻表信息变动",
    "en-US": "Timetable Changes"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "Basic Scenario"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "Compared Scheme"
  },
  "vehicleId":{
    "zh-CN": "车辆标识",
    "en-US": "VehicleId"
  },
  "id":{
    "zh-CN": "ID",
    "en-US": "ID"
  },
  "departureTime":{
    "zh-CN": "出发时间",
    "en-US": "Departure Time"
  },
}
</language>

<script>
import * as echarts from "@/utils/echarts.utils";
import { formatHour } from "@/utils/utils";
import { departureChangeInfo, routeTimeDiagram } from "@/api/contrast";

export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    offset: {
      type: Number,
      default: 0,
    },
  },
  inject: ["rootVue"],
  components: {},
  computed: {},
  watch: {
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
      s_form: {},

      oldTableList: [],
      oldRowList: [],
      oldColList: [],
      oldDataMap: {},
      selectOldDeparture: "",

      newTableList: [],
      newRowList: [],
      newColList: [],
      newDataMap: {},
      selectNewDeparture: "",

      loading1: false,
    };
  },
  created() {
    this.getData();
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
    // 格式化时间
    formatHour,
    // 把数据处理成页面渲染需要的格式
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
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      this.$nextTick(() => {
        routeTimeDiagram({
          name1: database1 + "/" + datasource1,
          name2: database2 + "/" + datasource2,
          routeId: this.form.routeId,
          startTime: this.form.startTime || 0,
          endTime: this.form.endTime || 48 * 60 * 60,
        })
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
      const oldSeries = [{ departureId: this.selectOldDeparture }]
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

          if (v1.departureId) max = Math.max(max, ...arrScheduled);
          if (v1.departureId) min = Math.min(min, ...arrScheduled);
          return [
            {
              name: "base-arrScheduled",
              type: "line",
              yAxisIndex: 0,
              showSymbol: false,
              data: arrScheduled,
            },
          ];
        })
        .flat();
      const newSeries = [{ departureId: this.selectNewDeparture }]
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

          if (v1.departureId) max = Math.max(max, ...arrScheduled);
          if (v1.departureId) min = Math.min(min, ...arrScheduled);

          return [
            {
              name: "contrast-arrScheduled",
              type: "line",
              yAxisIndex: 1,
              showSymbol: false,
              data: arrScheduled,
            },
          ];
        })
        .flat();
      console.log(min);
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
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
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
    // 选择旧的出发时间
    handleSelectOldDeparture(v) {
      if (this.selectOldDeparture == v.departureId) {
        this.selectOldDeparture = "";
      } else {
        this.selectOldDeparture = v.departureId;
      }
      this.updateChart();
    },
    // 选择新的出发时间
    handleSelectNewDeparture(v) {
      if (this.selectNewDeparture == v.departureId) {
        this.selectNewDeparture = "";
      } else {
        this.selectNewDeparture = v.departureId;
      }
      this.updateChart();
    },
  },
};
</script>

<style lang="scss" scoped>
.TimetableDialog__bodyer {
  ._content {
    height: 200px;
    overflow-y: auto;
    font-size: 14px;
    display: flex;
    flex-wrap: wrap;
    .item {
      cursor: pointer;
      padding: 10px;
      box-sizing: border-box;
      width: 25%;
      border: 1px solid #000;
      word-break: break-all;
      &.active {
        background-color: #e6effb;
      }
    }
  }
  .chart-container {
    width: 100%;
    height: 420px;
  }
  .clearfix {
    display: flex;
    justify-content: space-between;
  }
}
</style>
