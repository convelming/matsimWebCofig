<template>
  <!-- 出行者机动车保有量 -->
  <Dialog class="TravelersCarLicense" ref="dialog" :title="$l('出行者机动车保有量')" hideMinimize :visible="s_show" @close="close" :left="100 + this.offset" :top="20 + this.offset" width="640px">
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
  "出行者机动车保有量":{
    "zh-CN": "出行者机动车保有量",
    "en-US": "Travelers Car License"
  },
  "图表":{
    "zh-CN": "图表",
    "en-US": "Chart"
  },
  "描述":{
    "zh-CN": "描述",
    "en-US": "description"
  },
  "有机动车":{
    "zh-CN": "有机动车",
    "en-US": "yes"
  },
  "无机动车":{
    "zh-CN": "无机动车",
    "en-US": "no"
  },
}
</language>

<script>
import * as echarts from "echarts";
import { travelersCarLicense } from "@/api/crt.js";

export default {
  name: "TravelersCarLicense",
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
    travelersCarLicense({
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
      return {
        title: {
          text: this.$l("出行者机动车保有量"),
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          left: "center",
          bottom: 0,
        },
        series: [
          {
            name: this.$l("出行者机动车保有量"),
            type: "pie",
            radius: "50%",
            label: {
              formatter: "{b}: {c}\n({d}%)",
            },
            data: [
              { value: data.yes, name: this.$l("有机动车") },
              { value: data.no, name: this.$l("无机动车") },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
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
.TravelersCarLicense {
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
