<template>
  <!-- 出行属性 -->
  <Dialog class="TravelAttribute" ref="dialog" :title="$l('出行属性')" hideMinimize :visible="s_show" @close="close" :left="100 + this.offset / 2" :top="20 + this.offset" width="640px">
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
  "出行属性":{
    "zh-CN": "出行属性",
    "en-US": "Travel Attribute"
  },
  "在途时间":{
    "zh-CN": "在途时间",
    "en-US": "travel time"
  },
  "候车时间":{
    "zh-CN": "候车时间",
    "en-US": "waiting time"
  },
  "换乘次数":{
    "zh-CN": "换乘次数",
    "en-US": "transfer"
  },
  "费用":{
    "zh-CN": "费用",
    "en-US": "amount"
  },
  "出行距离":{
    "zh-CN": "出行距离",
    "en-US": "distance"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "base"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "contrast"
  },
  "图表":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "描述":{
    "zh-CN": "描述",
    "en-US": "description"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { travelAttribute } from "@/api/crt.js";

export default {
  name: "TravelAttribute",
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
    travelAttribute({
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
    show() {
      this.s_show = true;
      this.$nextTick(() => {
        this._chart = echarts.init(this.$refs.chart);
        this.updateChart();
      });
    },
    close() {
      this.s_show = false;
      this.$emit("close");
    },
    updateChart() {
      if (this._chart && this._chartData) {
        this._chart.setOption(this.getChartOption(this._chartData), true);
        this._chart.resize();
      }
    },
    getChartOption(data) {
      const { after, before, max = {} } = data;
      const keySet = new Set(this.form.value);
      const indicator = [],
        afterList = [],
        beforeList = [];
      if (keySet.has("2-1")) {
        indicator.push({ name: this.$l("在途时间"), max: max.travelTime });
        afterList.push(after.travelTime);
        beforeList.push(before.travelTime);
      }
      if (keySet.has("2-2")) {
        indicator.push({ name: this.$l("候车时间"), max: max.waitingTime });
        afterList.push(after.waitingTime);
        beforeList.push(before.waitingTime);
      }
      if (keySet.has("2-3")) {
        indicator.push({ name: this.$l("换乘次数"), max: max.transfer });
        afterList.push(after.transfer);
        beforeList.push(before.transfer);
      }
      if (keySet.has("2-4")) {
        indicator.push({ name: this.$l("费用"), max: max.amount });
        afterList.push(after.amount);
        beforeList.push(before.amount);
      }
      if (keySet.has("2-5")) {
        indicator.push({ name: this.$l("出行距离"), max: max.distance });
        afterList.push(after.distance);
        beforeList.push(before.distance);
      }
      return {
        title: {
          text: this.$l("出行属性"),
          left: "center",
        },
        legend: {
          left: "center",
          bottom: 0,
        },
        radar: {
          // shape: 'circle',
          indicator: indicator,
        },
        series: [
          {
            name: this.$l("出行属性"),
            type: "radar",
            data: [
              {
                value: afterList,
                name: this.$l("基础方案"),
              },
              {
                value: beforeList,
                name: this.$l("对比方案"),
              },
            ],
          },
        ],
      };
    },
    toTop() {
      this.$refs.dialog.toTop();
    },
    handleViewChange() {
      if (this._chart) this._chart.resize();
    },
  },
};
</script>

<style lang="scss" scoped>
.TravelAttribute {
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
