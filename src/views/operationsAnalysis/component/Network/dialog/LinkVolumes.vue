<template>
  <div>
    <Dialog :title="$l('LinkVolumes')" visible @close="$emit('close')" left="center" width="900px">
      <div class="SelectLinkAnalysis__bodyer">
        <div class="row">
          <div style="margin-right: 10px">{{ $l("aggregateTo") }}</div>
          <el-select v-model="second" @click="getData">
            <el-option label="5 minutes" value="300" />
            <el-option label="15 minutes" value="900" />
            <el-option label="20 minutes" value="1200" />
            <el-option label="30 minutes" value="1800" />
            <el-option label="1 hour" value="3600" />
          </el-select>
        </div>
        <el-tabs v-model="activeName" @tab-click="handleChange">
          <el-tab-pane :label="$l('Chart')" name="Chart">
            <div ref="chart" class="chart-container" v-loading="loading"></div>
          </el-tab-pane>
          <el-tab-pane :label="$l('Data')" name="Data">
            <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading" :show-header="false"> </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </Dialog>
  </div>
</template>

<language>
{
  "LinkVolumes":{
    "zh-CN": "LinkVolumes",
    "en-US": "LinkVolumes"
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
}
</language>

<script>
import * as echarts from "echarts";
import { getLinkVolumes } from "@/api/index";
export default {
  props: {
    linkId: {
      type: [String, Number],
    },
  },
  data() {
    return {
      loading: false,
      activeName: "Chart",
      second: "1200",
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
      getLinkVolumes({
        linkId: this.linkId,
        second: this.second,
      })
        .then((res) => {
          this.tableList = res.data || [];
          console.log(res);
          // this.updateChart();
          this.loading = false;
        })
        .catch((err) => {
          this.list = [];
          // this.updateChart();
          this.loading = false;
        });
    },
    // 更新图表
    updateChart() {
      if (this._chart) {
        this._chart.setOption(this.getChartOption(), true).this._chart.resize();
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
        },
        legend: {
          data: ["entering", "leaving", "passengers"],
        },
        grid: [
          {
            top: 50,
            bottom: "42.5%",
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
            containLabel: true,
          },
          {
            top: "62.5%",
            bottom: "5%",
            left: 50,
            right: 10,
            backgroundColor: "#ccc",
            containLabel: true,
          },
        ],
        axisPointer: {
          link: { xAxisIndex: [0, 1] },
        },
        xAxis: [
          {
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
            },
          },
        ],
        yAxis: [
          {
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
            name: "entering",
            type: "bar",
            stack: "Total",
            data: this.list.map((v) => v.entering),
          },
          {
            name: "leaving",
            type: "bar",
            stack: "Total",
            data: this.list.map((v) => v.leaving * -1),
          },
          {
            name: "passengers",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.list.map((v) => v.passengers),
          },
        ],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.SelectLinkAnalysis__bodyer {
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
