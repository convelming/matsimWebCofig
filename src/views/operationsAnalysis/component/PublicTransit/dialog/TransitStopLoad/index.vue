<template>
  <Dialog :title="$l('Transit Stop Load')" class="TransitStopLoad" :visible="true" @close="$emit('close')" left="center">
    <div>
      <el-select v-model="second" @change="getData">
        <el-option label="5 minutes" value="300" />
        <el-option label="15 minutes" value="900" />
        <el-option label="20 minutes" value="1200" />
        <el-option label="30 minutes" value="1800" />
        <el-option label="1 hour" value="3600" />
      </el-select>
    </div>
    <div ref="StopLoadChart" class="chart" v-loading="loading"></div>
  </Dialog>
</template>

<language>
{
  "Transit Stop Load":{
    "zh-CN": "转运站加载",
    "en-US": "Transit Stop Load"
  },
  "5 minutes":{
    "zh-CN": "5 分钟",
    "en-US": "5 minutes"
  },
  "15 minutes":{
    "zh-CN": "15 分钟",
    "en-US": "15 minutes"
  },
  "20 minutes'":{
    "zh-CN": "20 分钟",
    "en-US": "20 minutes'"
  },
  "30 minutes":{
    "zh-CN": "30 分钟",
    "en-US": "30 minutes"
  },
  "60 minutes":{
    "zh-CN": "60 分钟",
    "en-US": "60 minutes"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { transitStopLoad } from "@/api/index";
import { formatHour } from "@/utils/utils";
export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
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
      data: [],
      second: "1200",
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      if (this.loading) return;
      this.loading = true;
      transitStopLoad({
        second: this.second,
        stopIds: this.form.list.map((v) => v.id),
      })
        .then((res) => {
          this.data = res.data;
          this.updateChart();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateChart() {
      this.$nextTick(() => {
        if (!this._chart) {
          this._chart = echarts.init(this.$refs.StopLoadChart);
        }
        const option = this.getChartOption();
        this._chart.setOption(option);
        this._chart.resize();
      });
    },
    getChartOption() {
      const data = this.data || [];
      const plist = data.map((v) => v.passengers);
      const tlist = data.map((v) => formatHour(v.time));

      const stop = this.form.list[0];
      let seriesName = `Stop ${stop.name} (${stop.id})`;

      if (this.form.list.length > 1) {
        seriesName += ` and ${this.form.list.length} more stops`;
      }
      return {
        title: {
          text: "Transit Stop Load By Time",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          bottom: 5,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "50",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: tlist,
        },
        yAxis: {
          type: "value",
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        series: [
          {
            name: seriesName,
            type: "bar",
            step: "start",
            data: plist,
          },
        ],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.chart {
  width: 900px;
  height: 500px;
}
</style>
