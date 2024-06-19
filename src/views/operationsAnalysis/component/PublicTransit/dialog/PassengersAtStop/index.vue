<template>
  <Dialog class="PassengersAtStop" :title="$l('Passengers At Stop')" visible @close="$emit('close')" left="center" width="900px">
    <div class="PassengersAtStop__bodyer">
      <div class="row">
        <el-checkbox v-model="aggregate">
          <span style="margin-right: 10px">{{ $l("Aggregate") }}</span>
          <el-select v-model="aggregateTime" size="mini">
            <el-option :label="$l('15 minutes')" :value="15"> </el-option>
            <el-option :label="$l('20 minutes')" :value="20"> </el-option>
            <el-option :label="$l('30 minutes')" :value="30"> </el-option>
            <el-option :label="$l('60 minutes')" :value="60"> </el-option>
          </el-select>
        </el-checkbox>
      </div>
      <el-table class="small" height="80vh" :data="tableList" border stripe>
        <el-table-column prop="line" :label="$l('Line')" />
        <el-table-column prop="route" :label="$l('Route')" />
        <el-table-column prop="routeStart" :label="$l('Route Start')" />
        <el-table-column prop="routeEnd" :label="$l('Route End')" />
        <el-table-column prop="arrivalTime" :label="$l('Arrival Time')" :formatter="tableFormatHour" />
        <el-table-column prop="departureTime" :label="$l('Departure Time')" :formatter="tableFormatHour" />
        <el-table-column prop="alightingPax" :label="$l('#Alighting Pax')" />
        <el-table-column prop="boardingPax" :label="$l('#Bording Pax')" />
      </el-table>
    </div>
  </Dialog>
</template>

<language>
{
  "Passengers At Stop":{
    "zh-CN": "停靠站点的乘客",
    "en-US": "Passengers At Stop"
  },
  "Aggregate":{
    "zh-CN": "总计",
    "en-US": "Aggregate"
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
  "Line":{
    "zh-CN": "线路",
    "en-US": "Line"
  },
  "Route":{
    "zh-CN": "路线",
    "en-US": "Route"
  },
  "Route Start":{
    "zh-CN": "路线起点",
    "en-US": "Route Start"
  },
  "Route End":{
    "zh-CN": "路线终点",
    "en-US": "Route End"
  },
  "Arrival Time":{
    "zh-CN": "抵达时间",
    "en-US": "Arrival Time"
  },
  "Departure Time":{
    "zh-CN": "出发时间",
    "en-US": "Departure Time"
  },
  "#Alighting Pax":{
    "zh-CN": "#下车的乘客",
    "en-US": "#Alighting Pax"
  },
  "#Bording Pax":{
    "zh-CN": "#上车的乘客",
    "en-US": "#Bording Pax"
  },
}
</language>

<script>
import { formatHour } from "@/utils/utils";
import { passengersAtStop } from "@/api";
export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      s_form: {},
      tableList: [],
      aggregate: false,
      aggregateTime: 15,
    };
  },
  created() {
    this.stopList = this.form.list || [];
    this.s_form = {
      stopId: this.stopList.map((v) => v.id).join(""),
    };
    this.getData();
  },
  mounted() {},
  methods: {
    tableFormatHour(row, column, cellValue, index) {
      return formatHour(row[column.property]);
    },
    getData() {
      passengersAtStop(this.s_form).then((res) => {
        this.tableList = res.data;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.PassengersAtStop__bodyer {
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
