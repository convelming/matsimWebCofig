<template>
  <!-- 出行者年龄 -->
  <Dialog class="TravelersAge" ref="dialog" :title="$l('出行者年龄')" hideMinimize :visible="s_show" @close="close" :left="100 + this.offset" :top="20 + this.offset" width="640px">
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
  "出行者年龄":{
    "zh-CN": "出行者年龄",
    "en-US": "Age"
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
import { travelersAge } from "@/api/crt.js";

export default {
  name: "TravelersAge",
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
    travelersAge({
      name1: database1 + "/" + datasource1,
      name2: database2 + "/" + datasource2,
    }).then((res) => {
      this.description = res.data.description;
      this._chartData = res.data.data;
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
      return {
        title: {
          text: this.$l("出行者年龄"),
          left: "center",
        },
        legend: {
          left: "center",
          bottom: 0,
        },
        grid: {
          top: 100,
          left: 20,
          right: 20,
          bottom: 20,
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            axisTick: { show: false },
            data: data.map((v) => v.name),
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
            data: data.map((v) => v.value),
            type: "bar",
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
.TravelersAge {
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
