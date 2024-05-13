<template>
  <div class="PassengerFlowDialog">
    <Dialog ref="dialog" :title="$l('客流信息变化')" :visible="true" @close="$emit('close')" left="center" width="900px">
      <div class="PassengerFlowDialog__bodyer">
        <div class="row">{{ $l("线路编号：") }}{{ this.form.routeId }}</div>
        <div class="row">
          <span style="text-wrap: nowrap">{{ $l("分析类型：") }}</span>
          <el-select v-model="chartType" size="small" style="width: 100%; margin-left: 10px">
            <el-option v-for="item in route_info_analysis" :key="item.value" :label="$l(item.label)" :value="item.value"> </el-option>
          </el-select>
        </div>
        <!-- <el-radio-group style="width: 100%; display: block" v-model="s_form.single">
          <div class="row">
            <el-radio :label="true"> {{ $l("单个班车") }}</el-radio>
            <RouteSelect v-model="s_form.departureId" :options="routeOptions" valueKey="id" labelKey="id" />
          </div>
          <div class="row">
            <el-radio :label="false">{{ $l("时间段") }}</el-radio>
            <TimeRangeSlider :value="[this.s_form.startTime, this.s_form.endTime]" :start.sync="s_form.startTime" :end.sync="s_form.endTime" />
          </div>
        </el-radio-group> -->
        <div class="row">
          <span style="text-wrap: nowrap">{{ $l("时间段：") }}</span>
          <TimeRangeSlider :value="[this.s_form.startTime, this.s_form.endTime]" :start.sync="s_form.startTime" :end.sync="s_form.endTime" />
        </div>
        <PassengersEnteringLeaving v-if="chartType == `Passengers Entering / Leaving`" :form="s_form" />
        <RouteFlows v-if="chartType == `Route Flows`" :form="s_form" :routeInfo="form" />
      </div>
    </Dialog>
  </div>
</template>

<language>
{
  "客流信息变化":{
    "zh-CN": "客流信息变化",
    "en-US": "Changes in passenger flow"
  },
  "线路编号：":{
    "zh-CN": "线路编号：",
    "en-US": "Line Id: "
  },
  "分析类型：":{
    "zh-CN": "分析类型：",
    "en-US": "Analysis: "
  },
  "单个班车":{
    "zh-CN": "单个班车",
    "en-US": "Single"
  },
  "时间段":{
    "zh-CN": "时间段",
    "en-US": "Multiple"
  },
  "时间段：":{
    "zh-CN": "时间段：",
    "en-US": "Multiple: "
  },
}
</language>

<script>
import PassengersEnteringLeaving from "./PassengersEnteringLeaving.vue";
import RouteFlows from "./RouteFlows.vue";

const route_info_analysis = [
  { label: "Passengers Entering / Leaving", value: "Passengers Entering / Leaving" },
  { label: "Route Flows", value: "Route Flows" },
];

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
  components: {
    PassengersEnteringLeaving,
    RouteFlows,
  },
  computed: {},
  data() {
    return {
      route_info_analysis,
      chartType: "Passengers Entering / Leaving",
      routeOptions: [],
      s_form: {},
    };
  },
  created() {
    const { database1, datasource1, database2, datasource2 } = this.$route.params;
    this.s_form = {
      name1: database1 + "/" + datasource1,
      name2: database2 + "/" + datasource2,
      routeId: this.form.routeId,
      startTime: this.form.startTime || 0,
      endTime: this.form.endTime || 24 * 60 * 60,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
    });
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.PassengerFlowDialog__bodyer {
  font-size: 14px;
  color: #606266;
  .row {
    line-height: 35px;
    display: flex;
    margin-bottom: 10px;
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
}
</style>
