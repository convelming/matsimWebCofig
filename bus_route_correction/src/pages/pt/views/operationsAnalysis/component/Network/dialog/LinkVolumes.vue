<template>
  <Dialog class="LinkVolumes" :title="$l('linkVolumes')" visible @close="$emit('close')" left="center" width="900px">
    <div class="LinkVolumes__bodyer">
      <div class="row">
        <div style="margin-right: 10px">{{ $l("aggregateTo") }}</div>
        <el-select v-model="second" @change="getData">
          <el-option label="5 minutes" value="300" />
          <el-option label="15 minutes" value="900" />
          <el-option label="20 minutes" value="1200" />
          <el-option label="30 minutes" value="1800" />
          <el-option label="1 hour" value="3600" />
        </el-select>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleChange">
        <el-tab-pane :label="$l('chart')" name="Chart">
          <div ref="chart" class="chart-container" v-loading="loading"></div>
        </el-tab-pane>
        <el-tab-pane :label="$l('data')" name="Data">
          <el-table class="small" :data="tableList" border stripe height="calc(100vh - 400px)" v-loading="loading">
            <el-table-column prop="time" :label="$l('time')" width="200" :formatter="timeFormatter" />
            <el-table-column prop="vehicles" :label="$l('vehicles')" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Dialog>
</template>

<language>
{
  "linkVolumes":{
    "zh-CN": "路段流量",
    "en-US": "Link Volumes"
  },
  "chart":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "data":{
    "zh-CN": "数据",
    "en-US": "Data"
  },
  "vehicles":{
    "zh-CN": "#车辆",
    "en-US": "Vehicles"
  },
  "Base":{
    "zh-CN": "基础",
    "en-US": "Base"
  },
  "Actual":{
    "zh-CN": "实际",
    "en-US": "Actual"
  },
  "time":{
    "zh-CN": "时间",
    "en-US": "Time"
  },
  "aggregateTo":{
    "zh-CN": "汇总至",
    "en-US": "Aggregate To"
  },
}
</language>

<script>
import { formatHour } from "@/utils/utils";
import * as echarts from "@/utils/echarts.utils";
import { getLinkVolumes } from "@/api/index";
export default {
  props: {
    linkId: {
      type: [String, Number],
    },
  },
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
    getData() {
      this.loading = true;
      const form = {
        linkId: this.linkId,
        second: this.second,
      };
      getLinkVolumes(form)
        .then((res) => {
          this.tableList = (res.data.real || []).map((v, i) => ({
            time: form.second * i,
            real: v,
            sim: res.data.sim[i],
          }));
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
      return {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params, ticket, callback) {
            console.log(params);
            const l1 = [`<div style="font-weight: bold;font-size:14px;">${formatHour(Number(params[0].name))}</div>`];
            for (const v of params) {
              l1.push(`<div style="font-size:12px;">${v.marker}<span style="margin-right: 10px;">${v.seriesName}</span><span >${v.data}</span></div>`);
            }
            return l1.join("\n");
          },
        },
        legend: {},
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
            data: this.tableList.map((v) => v.time),
            axisTick: {
              alignWithLabel: true,
            },
            interval: 3600,
            axisLabel: {
              formatter: function (value, index) {
                return Math.floor(value / 3600) + "h";
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
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        series: [
          {
            name: this.$l("Base"),
            type: "bar",
            barWidth: "60%",
            data: this.tableList.map((v) => v.sim),
          },
          {
            name: this.$l("Actual"),
            type: "bar",
            barWidth: "60%",
            data: this.tableList.map((v) => v.real),
          },
        ],
      };
    },
    timeFormatter(row) {
      return formatHour(row.time);
    },
  },
};
</script>

<style lang="scss" scoped>
.LinkVolumes__bodyer {
  font-size: 14px;
  color: var(--color-text-regular);
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
