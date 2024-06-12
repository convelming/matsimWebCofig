<template>
  <Dialog class="TransitRoutesInfo" :title="$l('Transit Routes Info')" :visible="true" @close="$emit('close')" left="center" width="900px">
    <div class="TransitRoutesInfo__bodyer">
      <div class="row">{{ $l("Analyzed Route：") }}{{ this.form.routeId }}</div>
      <div class="row">
        <span>{{ $l("Analysis：") }}</span>
        <el-select v-model="chartType" size="small" style="width: 100%; margin-left: 10px">
          <el-option v-for="item in route_info_analysis" :key="item.value" :label="$l(item.label)" :value="item.value"> </el-option>
        </el-select>
      </div>
      <el-radio-group style="width: 100%; display: block" v-model="s_form.single">
        <div class="row">
          <el-radio :label="true"> {{ $l("Single") }}</el-radio>
          <RouteSelect v-model="s_form.departureId" :options="routeOptions" valueKey="id" labelKey="id" />
        </div>
        <div class="row">
          <el-radio :label="false">{{ $l("Multiple") }}</el-radio>
          <TimeRangeSlider :value="[this.s_form.startSecond, this.s_form.endSecond]" :start.sync="s_form.startSecond" :end.sync="s_form.endSecond" />
        </div>
      </el-radio-group>
      <PassengersEnteringLeaving v-if="chartType == 'Passengers Entering / Leaving'" :form="s_form" />
      <VehicleLoad v-if="chartType == 'Vehicle Load'" :form="s_form" />
      <AggregatedVehicleLoad v-if="chartType == 'Aggregated Vehicle Load'" :form="s_form" />
      <RouteGrid v-if="chartType == 'Route Grid'" :form="s_form" />
      <RouteFlows v-if="chartType == 'Route Flows'" :form="s_form" :lineInfo="form" :routeOptions="routeOptions" />
      <RouteTimeDiagram v-if="chartType == 'Route-Time Diagram'" :form="s_form" :lineInfo="form" />
    </div>
  </Dialog>
</template>

<language>
{
  "Transit Routes Info":{
    "zh-CN": "公交线路信息",
    "en-US": "Transit Routes Info"
  },
  "Analyzed Route：":{
    "zh-CN": "分析路线：",
    "en-US": "Analyzed Route："
  },
  "Analysis：":{
    "zh-CN": "分析：",
    "en-US": "Analysis："
  },
  "Single":{
    "zh-CN": "单个",
    "en-US": "Single"
  },
  "Multiple":{
    "zh-CN": "多个",
    "en-US": "Multiple"
  },
  "Passengers Entering / Leaving":{
    "zh-CN": "乘客进出",
    "en-US": "Passengers Entering / Leaving"
  },
  "Vehicle Load":{
    "zh-CN": "车辆加载",
    "en-US": "Vehicle Load"
  },
  "Aggregated Vehicle Load":{
    "zh-CN": "车辆总负载",
    "en-US": "Aggregated Vehicle Load"
  },
  "Route Grid":{
    "zh-CN": "路线图",
    "en-US": "Route Grid"
  },
  "Route Flows":{
    "zh-CN": "路线流量",
    "en-US": "Route Flows"
  },
  "Route-Time Diagram":{
    "zh-CN": "路线-时间图",
    "en-US": "Route-Time Diagram"
  },
}
</language>

<script>
import { route_info_analysis } from "../../enum";
import PassengersEnteringLeaving from "./PassengersEnteringLeaving";
import VehicleLoad from "./VehicleLoad";
import AggregatedVehicleLoad from "./AggregatedVehicleLoad";
import RouteGrid from "./RouteGrid";
import RouteFlows from "./RouteFlows";
import RouteTimeDiagram from "./RouteTimeDiagram";
export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    PassengersEnteringLeaving,
    VehicleLoad,
    AggregatedVehicleLoad,
    RouteGrid,
    RouteFlows,
    RouteTimeDiagram,
  },
  computed: {
    timeSlider: {
      get() {
        try {
          return [this.s_form.startSecond, this.s_form.endSecond];
        } catch (error) {
          return [0, 86400];
        }
      },
      set(val) {
        this.s_form.startSecond = val[0];
        this.s_form.endSecond = val[1];
      },
    },
  },
  data() {
    return {
      route_info_analysis,
      chartType: "",
      routeOptions: [],
      s_form: {},
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$nextTick(() => {
        const form = this.form || {};
        let departureItem = form.departures[0] || {};

        this.chartType = "Passengers Entering / Leaving";
        this.routeOptions = form.departures || [];
        this.s_form = {
          single: true,
          departureId: departureItem.id || "",
          routeId: form.routeId || "",
          startSecond: 0,
          endSecond: 86400,
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.TransitRoutesInfo__bodyer {
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
