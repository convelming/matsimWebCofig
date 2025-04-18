<template>
  <!-- 出行时段 -->
  <Dialog class="TravelTime" ref="dialog" :title="$l('出行时段')" hideMinimize :visible="s_show" @close="close" :left="100 + this.offset" :top="20 + this.offset" width="640px">
    <div class="toolbar">
      <el-radio-group v-model="type" size="mini" @change="handleViewChange">
        <el-radio-button label="Chart">{{ $l("图表") }}</el-radio-button>
        <el-radio-button label="Detail">{{ $l("描述") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content" v-loading="loading">
      <transition name="el-zoom-in-center">
        <div v-show="type == 'Chart'" ref="chart" class="chart" key="chart"></div>
      </transition>
      <transition name="el-zoom-in-center">
        <div v-show="type == 'Detail'" class="detail" key="detail">{{ description }}</div>
      </transition>
    </div>
  </Dialog>
</template>

<language>
{
  "出行时段":{
    "zh-CN": "出发时间",
    "en-US": "Departure Time"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "Base Scenario"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "Compared Scheme"
  },
  "图表":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "描述":{
    "zh-CN": "描述",
    "en-US": "AIGC"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { travelTime } from "@/api/crt.js";

export default {
  name: "TravelTime",
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
    page_language() {
      this.updateChart();
    },
  },
  data() {
    return {
      s_show: true,
      loading: true,
      type: "Chart",
      description: "",
    };
  },
  created() {
    const { database1, datasource1, database2, datasource2 } = this.$route.params;
    travelTime({
      name1: database1 + "/" + datasource1,
      name2: database2 + "/" + datasource2,
    }).then((res) => {
      this.description = res.data.description;
      this._chartData = { before: res.data.before, after: res.data.after };
      this.updateChart();
      this.loading = false;
    });
  },
  mounted() {
    this.show();
  },
  beforeDestroy() {
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
  },
  methods: {
    // 显示弹窗
    show() {
      this.s_show = true;
      this.$nextTick(() => {
        this._chart = echarts.init(this.$refs.chart);
        this.updateChart();
      });
    },
    // 关闭弹窗
    close() {
      this.s_show = false;
      this.$emit("close");
    },
    // 更新图表
    updateChart() {
      if (this._chart && this._chartData) {
        this._chart.setOption(this.getChartOption(this._chartData), true);
        this._chart.resize();
      }
    },
    // 获取图表配置
    getChartOption(data) {
      const { after, before } = data;
      const keys = Array.from(new Set([Object.keys(after), Object.keys(before)].flat()));
      const afterList = keys.map((v) => after[v] || 0);
      const beforeList = keys.map((v) => before[v] || 0);
      return {
        title: {
          text: this.$l("出行时段"),
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          left: "center",
          top: 40,
        },
        grid: {
          top: 80,
          left: 20,
          right: 20,
          bottom: 20,
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            axisTick: { show: false },
            data: keys,
          },
        ],
        yAxis: [
          {
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
            name: this.$l("基础方案"),
            type: "bar",
            barGap: 0,
            emphasis: {
              focus: "series",
            },
            data: afterList,
          },
          {
            name: this.$l("对比方案"),
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: beforeList,
          },
        ],
      };
    },
    // 弹窗置顶
    toTop() {
      this.$refs.dialog.toTop();
    },
    // 弹窗视图改变（包括大小和显隐）
    handleViewChange() {
      if (this._chart) this._chart.resize();
    },
  },
};
</script>

<style lang="scss" scoped>
.TravelTime {
  .toolbar {
    display: flex;
    justify-content: center;
    padding-bottom: 10px;
  }
  .content {
    position: relative;
    width: 600px;
    height: 600px;
  }
  .detail,
  .chart {
    position: absolute;
    top: 0;
    left: 0;
    width: 600px;
    height: 600px;
    overflow-y: auto;
  }
}
</style>
