<template>
  <Dialog
    :title="$l('Transit Stop Load')"
    class="StopLoad"
    :visible="true"
    @close="$emit('close')"
    left="center"
  >
    <div ref="StopLoadChart" class="chart" v-loading="loading"></div>
  </Dialog>
</template>

<language>
{
  "Transit Stop Load":{
    "zh-CN": "Transit Stop Load",
    "en-US": "Transit Stop Load"
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
  data() {
    return {
      loading: false,
      data: [],
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
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          data: tlist,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: seriesName,
            type: "line",
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
