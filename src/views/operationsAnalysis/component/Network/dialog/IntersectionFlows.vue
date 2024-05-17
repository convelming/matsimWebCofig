<template>
  <Dialog class="IntersectionFlows" :title="$l('IntersectionFlows')" visible @close="$emit('close')" left="center" width="900px">
    <div class="IntersectionFlows__bodyer">
      <div class="row">
        <TimeRangeSlider :value="[startSecond, endSecond]" :start.sync="startSecond" :end.sync="endSecond" />
      </div>
      <el-tabs v-model="activeName" @tab-click="handleChange">
        <el-tab-pane :label="$l('Chart')" name="Chart">
          <div ref="chart" class="chart-container" v-loading="loading"></div>
        </el-tab-pane>
        <el-tab-pane :label="$l('Data')" name="Data">
          <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading">
            <el-table-column prop="fromLink.linkId" :label="$l('fromLink')" />
            <el-table-column prop="toLink.linkId" :label="$l('toLink')" />
            <el-table-column prop="vehicles" :label="$l('vehicles')" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Dialog>
</template>

<language>
{
  "IntersectionFlows":{
    "zh-CN": "IntersectionFlows",
    "en-US": "IntersectionFlows"
  },
  "Chart":{
    "zh-CN": "Chart",
    "en-US": "Chart"
  },
  "Data":{
    "zh-CN": "Data",
    "en-US": "Data"
  },
  "aggregateTo":{
    "zh-CN": "Aggregate To",
    "en-US": "Aggregate To"
  },
  "vehicles":{
    "zh-CN": "#Vehicles",
    "en-US": "#Vehicles"
  },
  "fromLink":{
    "zh-CN": "From Link",
    "en-US": "From Link"
  },
  "toLink":{
    "zh-CN": "To Link",
    "en-US": "To Link"
  },
}
</language>

<script>
import { formatHour } from "@/utils/utils";
import * as echarts from "echarts";
import { intersectionFlows } from "@/api/index";
export default {
  props: {
    nodeId: {
      type: [String, Number],
    },
  },
  data() {
    return {
      loading: false,
      activeName: "Chart",
      startSecond: 0,
      endSecond: 60 * 60 * 24,
      chartData: [],
      tableList: [],
    };
  },
  created() {
    this.getData();
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
    getData() {
      this.loading = true;
      intersectionFlows({
        nodeId: this.nodeId,
        startSecond: this.startSecond,
        endSecond: this.endSecond,
      })
        .then((res) => {
          this.chartData = res.data.histogram || [];
          this.tableList = res.data.flows || [];
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
        console.log(this.getChartOption());
        this._chart.setOption(this.getChartOption(), true);
        this._chart.resize();
      }
    },
    // 获取图表配置
    getChartOption() {
      return {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params, ticket, callback) {
            return `${formatHour(params[0].name * 3600)}  ${params[0].value}`;
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            name: this.$l("Time"),
            type: "category",
            data: this.chartData.map((v, i) => i),
            axisTick: {
              alignWithLabel: true,
            },
            axisLabel: {
              formatter: function (value, index) {
                return formatHour(value * 3600);
              },
            },
          },
        ],
        yAxis: [
          {
            name: this.$l("vehicles"),
            type: "value",
          },
        ],
        series: [
          {
            type: "bar",
            barWidth: "60%",
            data: this.chartData.map((v) => v),
          },
        ],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.IntersectionFlows__bodyer {
  font-size: 14px;
  color: #606266;
  .row {
    line-height: 35px;
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    .el-radio {
      line-height: 35px;
      display: block;
    }
    .button {
      background: #409eff;
      flex-shrink: 1;
      width: 30px;
      height: 32px;
    }
  }
  .chart-container {
    width: 100%;
    min-height: 300px;
    height: calc(100vh - 420px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }
}
</style>
