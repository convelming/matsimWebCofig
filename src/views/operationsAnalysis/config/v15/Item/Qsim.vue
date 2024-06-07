<template>
  <div class="ConfigItem col_1 Qsim">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Qsim">Qsim</div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('numberOfThreads')">
          <el-input-number v-model="form.numberOfThreads" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('startTime')">
          <el-time-picker v-model="form.startTime" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('endTime')">
          <el-time-picker v-model="form.endTime" :min="timeStringToNumber(form.startTime)" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('timeStepSize')">
          <el-time-picker v-model="form.timeStepSize" :max="timeStringToNumber(form.endTime) - timeStringToNumber(form.startTime)" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('simStarttimeInterpretation')">
          <el-select v-model="form.simStarttimeInterpretation" clearable>
            <el-option :label="$l('onlyUseStartTime')" value="onlyUseStartTime" />
            <el-option :label="$l('maxOfStarttimeAndEarliestActivityEnd')" value="maxOfStarttimeAndEarliestActivityEnd" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('simEndtimeInterpretation')">
          <el-select v-model="form.simEndtimeInterpretation" clearable>
            <el-option :label="$l('maxOfStarttimeAndEarliestActivityEnd')" value="onlyUseEndtime" />
            <el-option :label="$l('minOfEndtimeAndMobsimFinished')" value="minOfEndtimeAndMobsimFinished" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('flowCapacityFactor')">
          <el-input-number v-model="form.flowCapacityFactor" :min="0" :max="1" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('storageCapacityFactor')">
          <el-input-number v-model="form.storageCapacityFactor" :min="0" :max="1" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('insertingWaitingVehiclesBeforeDrivingVehicles')">
          <el-switch v-model="form.insertingWaitingVehiclesBeforeDrivingVehicles" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('seepMode')">
          <el-input v-model="form.seepMode" />
        </el-form-item>
        <el-form-item :label="$l('isRestrictingSeepage')">
          <el-switch v-model="form.isRestrictingSeepage" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('isSeepModeStorageFree')">
          <el-switch v-model="form.isSeepModeStorageFree" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('linkDynamics')">
          <el-select v-model="form.linkDynamics" clearable>
            <el-option :label="$l('FIFO')" value="FIFO" />
            <el-option :label="$l('PassingQ')" value="PassingQ" />
            <el-option :label="$l('SeepageQ')" value="SeepageQ" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('nodeOffset')">
          <el-input-number v-model="form.nodeOffset" :min="0" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('linkWidth')">
          <el-input-number v-model="form.linkWidth" :min="0" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('mainMode')">
          <el-input v-model="form.mainMode" clearable />
        </el-form-item>
        <el-form-item :label="$l('useLanes')">
          <el-switch v-model="form.useLanes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('usePersonIdForMissingVehicleId')">
          <el-switch v-model="form.usePersonIdForMissingVehicleId" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('stuckTime')">
          <el-input-number v-model="form.stuckTime" :min="0" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('removeStuckVehicles')">
          <el-switch v-model="form.removeStuckVehicles" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('trafficDynamics')">
          <el-select v-model="form.trafficDynamics">
            <el-option :label="$l('queue')" value="queue" />
            <el-option :label="$l('withHoles')" value="withHoles" />
            <el-option :label="$l('kinematicWaves')" value="kinematicWaves" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('usingFastCapacityUpdate')">
          <el-switch v-model="form.usingFastCapacityUpdate" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('vehicleBehavior')">
          <el-select v-model="form.vehicleBehavior" clearable>
            <el-option :label="$l('teleport')" value="teleport" />
            <el-option :label="$l('wait')" value="wait" />
            <el-option :label="$l('exception')" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('vehiclesSource')">
          <el-select v-model="form.vehiclesSource" clearable>
            <el-option :label="$l('defaultVehicle')" value="defaultVehicle" />
            <el-option :label="$l('modeVehicleTypesFromVehiclesData')" value="modeVehicleTypesFromVehiclesData" />
            <el-option :label="$l('fromVehiclesData')" value="fromVehiclesData" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('snapshotperiod')">
          <el-time-picker v-model="form.snapshotperiod" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('filterSnapshots')">
          <el-select v-model="form.filterSnapshots" clearable>
            <el-option :label="$l('withLinkAttributes')" value="null" />
            <el-option :label="$l('withLinkAttributes')" value="withLinkAttributes" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('snapshotStyle')">
          <el-select v-model="form.snapshotStyle" clearable>
            <el-option :label="$l('equiDist')" value="equiDist" />
            <el-option :label="$l('queue')" value="queue" />
            <el-option :label="$l('withHoles')" value="withHoles" />
            <el-option :label="$l('withHolesAndShowHoles')" value="withHolesAndShowHoles" />
            <el-option :label="$l('kinematicWaves')" value="kinematicWaves" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
"numberOfThreads": {
"zh-CN":"线程数量",
"en-US":"numberOfThreads"
},
"startTime": {
"zh-CN":"仿真开始时间",
"en-US":"startTime"
},
"endTime": {
"zh-CN":"仿真结束时间",
"en-US":"endTime"
},
"timeStepSize": {
"zh-CN":"仿真步长",
"en-US":"timeStepSize"
},
"simStarttimeInterpretation": {
"zh-CN":"仿真开始时间定义",
"en-US":"simStarttimeInterpretation"
},
"onlyUseStartTime": {
"zh-CN":"仅使用定义的开始时间",
"en-US":"onlyUseStartTime"
},
"maxOfStarttimeAndEarliestActivityEnd": {
"zh-CN":"定义的开始时间和mobsim仿真的开始时间的最大值",
"en-US":"maxOfStarttimeAndEarliestActivityEnd"
},
"simEndtimeInterpretation": {
"zh-CN":"仿真结束时间定义",
"en-US":"simEndtimeInterpretation"
},
"onlyUseEndtime": {
"zh-CN":"仅使用定义的结束时间",
"en-US":"onlyUseEndtime"
},
"minOfEndtimeAndMobsimFinished": {
"zh-CN":"定义的结束时间和mobsim仿真的结束时间的最大值",
"en-US":"minOfEndtimeAndMobsimFinished"
},
"flowCapacityFactor": {
"zh-CN":"路段流量调整系数",
"en-US":"flowCapacityFactor"
},
"storageCapacityFactor": {
"zh-CN":"路段车辆调整系数",
"en-US":"storageCapacityFactor"
},
"insertingWaitingVehiclesBeforeDrivingVehicles": {
"zh-CN":"在行驶车辆前插入等待的车辆",
"en-US":"insertingWaitingVehiclesBeforeDrivingVehicles"
},
"seepMode": {
"zh-CN":"渗透模式（自行车机动车混行时）",
"en-US":"seepMode"
},
"isRestrictingSeepage": {
"zh-CN":"限制渗透",
"en-US":"isRestrictingSeepage"
},
"isSeepModeStorageFree": {
"zh-CN":"渗透模式不占空间",
"en-US":"isSeepModeStorageFree"
},
"linkDynamics": {
"zh-CN":"交通流模拟方式",
"en-US":"linkDynamics"
},
"FIFO": {
"zh-CN":"FIFO",
"en-US":"FIFO"
},
"PassingQ": {
"zh-CN":"PassingQ",
"en-US":"PassingQ"
},
"SeepageQ": {
"zh-CN":"SeepageQ",
"en-US":"SeepageQ"
},
"nodeOffset": {
"zh-CN":"节点偏移量",
"en-US":"nodeOffset"
},
"linkWidth": {
"zh-CN":"路段宽度",
"en-US":"linkWidth"
},
"mainMode": {
"zh-CN":"主要出行方式",
"en-US":"mainMode"
},
"useLanes": {
"zh-CN":"使用车道信息",
"en-US":"useLanes"
},
"usePersonIdForMissingVehicleId": {
"zh-CN":"使用个人ID替代缺失的车辆ID",
"en-US":"usePersonIdForMissingVehicleId"
},
"stuckTime": {
"zh-CN":"车辆停滞时间阈值",
"en-US":"stuckTime"
},
"removeStuckVehicles": {
"zh-CN":"移除卡滞的车辆",
"en-US":"removeStuckVehicles"
},
"trafficDynamics": {
"zh-CN":"交通流模拟方式",
"en-US":"trafficDynamics"
},
"queue": {
"zh-CN":"queue",
"en-US":"queue"
},
"withHoles": {
"zh-CN":"withHoles",
"en-US":"withHoles"
},
"kinematicWaves": {
"zh-CN":"kinematicWaves",
"en-US":"kinematicWaves"
},
"usingFastCapacityUpdate": {
"zh-CN":"使用快速的路段容量更新方式",
"en-US":"usingFastCapacityUpdate"
},
"vehicleBehavior": {
"zh-CN":"不可用车辆行为",
"en-US":"vehicleBehavior"
},
"teleport": {
"zh-CN":"teleport",
"en-US":"teleport"
},
"wait": {
"zh-CN":"wait",
"en-US":"wait"
},
"exception": {
"zh-CN":"exception",
"en-US":"exception"
},
"vehiclesSource": {
"zh-CN":"车辆来源",
"en-US":"vehiclesSource"
},
"defaultVehicle": {
"zh-CN":"默认",
"en-US":"defaultVehicle"
},
"modeVehicleTypesFromVehiclesData": {
"zh-CN":"modeVehicleTypesFromVehiclesData",
"en-US":"modeVehicleTypesFromVehiclesData"
},
"fromVehiclesData": {
"zh-CN":"fromVehiclesData",
"en-US":"fromVehiclesData"
},
"snapshotperiod": {
"zh-CN":"快照周期",
"en-US":"snapshotperiod"
},
"filterSnapshots": {
"zh-CN":"快照的过滤器",
"en-US":"filterSnapshots"
},
"缺省": {
"zh-CN":"缺省",
"en-US":"缺省"
},
"withLinkAttributes": {
"zh-CN":"withLinkAttributes",
"en-US":"withLinkAttributes"
},
"snapshotStyle": {
"zh-CN":"快照的风格",
"en-US":"snapshotStyle"
},
"equiDist": {
"zh-CN":"equiDist",
"en-US":"equiDist"
},
"queue": {
"zh-CN":"queue",
"en-US":"queue"
},
"withHoles": {
"zh-CN":"withHoles",
"en-US":"withHoles"
},
"withHolesAndShowHoles": {
"zh-CN":"withHolesAndShowHoles",
"en-US":"withHolesAndShowHoles"
},
"kinematicWaves": {
"zh-CN":"kinematicWaves",
"en-US":"kinematicWaves"
},
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  numberOfThreads: "",
  startTime: "",
  endTime: "",
  timeStepSize: "",
  simStarttimeInterpretation: "",
  simEndtimeInterpretation: "",
  flowCapacityFactor: "",
  storageCapacityFactor: "",
  insertingWaitingVehiclesBeforeDrivingVehicles: "",
  seepMode: "",
  isRestrictingSeepage: "",
  isSeepModeStorageFree: "",
  linkDynamics: "",
  nodeOffset: "",
  linkWidth: "",
  mainMode: "",
  useLanes: "",
  usePersonIdForMissingVehicleId: "",
  stuckTime: "",
  removeStuckVehicles: "",
  trafficDynamics: "",
  usingFastCapacityUpdate: "",
  vehicleBehavior: "",
  vehiclesSource: "",
  snapshotperiod: "",
  filterSnapshots: "",
  snapshotStyle: "",
};
const defaultXml = `
<module name="qsim">
  <!-- 线程数量 -->
  <param name="numberOfThreads" value="1"/>
  <!-- 开始时间 -->
  <param name="startTime" value="undefined"/>
  <!-- 结束时间 -->
  <param name="endTime" value="undefined"/>
  <!-- 时间步长 -->
  <param name="timeStepSize" value="00:00:01"/>
  <!-- 仿真开始时间定义 -->
  <param name="simStarttimeInterpretation" value="maxOfStarttimeAndEarliestActivityEnd"/>
  <!-- 仿真结束时间定义 -->
  <param name="simEndtimeInterpretation" value="null"/>

  <!-- 流量容量系数 -->
  <param name="flowCapacityFactor" value="1.0"/>
  <!-- 存储容量系数（路段长度和车辆长度） -->
  <param name="storageCapacityFactor" value="1.0"/>
  <!-- 在行驶车辆前插入等待的车辆 -->
  <param name="insertingWaitingVehiclesBeforeDrivingVehicles" value="true"/>

  <!-- 渗透模式 -->
  <param name="seepMode" value="bike"/>
  <!-- 限制渗透 -->
  <param name="isRestrictingSeepage" value="true"/>
  <!-- 渗透模式不占空间 -->
  <param name="isSeepModeStorageFree" value="false"/>

  <!-- 动态链接 -->
  <param name="linkDynamics" value="FIFO"/>
  <!-- 节点偏移量 -->
  <param name="nodeOffset" value="0.0"/>
  <!-- 链接宽度 -->
  <param name="linkWidth" value="30.0"/>
  <!-- 主要模式（？） -->
  <param name="mainMode" value="car"/>
  <!-- 使用车道信息 -->
  <param name="useLanes" value="false"/>
  <!-- 使用个人ID替代缺失的车辆ID -->
  <param name="usePersonIdForMissingVehicleId" value="true"/>

  <!-- 停滞时间阈值 -->
  <param name="stuckTime" value="10.0"/>
  <!-- 移除停滞车辆 -->
  <param name="removeStuckVehicles" value="false"/>

  <!-- 动态交通流模型 -->
  <param name="trafficDynamics" value="queue"/>
  <!-- 使用快速容量更新 -->
  <param name="usingFastCapacityUpdate" value="true"/>
  <!-- 不可用车辆行为 -->
  <param name="vehicleBehavior" value="teleport"/>
  <!-- 车辆来源 -->
  <param name="vehiclesSource" value="defaultVehicle"/>

  <!-- 快照周期 -->
  <param name="snapshotperiod" value="00:00:00"/>
  <!-- 快照的过滤器 -->
  <param name="filterSnapshots" value="no"/>
  <!-- 快照的风格 -->
  <param name="snapshotStyle" value="equiDist"/>
</module>
`;
export default {
  props: {
    xml: {
      type: String,
      default: "",
    },
  },
  components: {},
  watch: {
    form: {
      handler(val) {
        this.s_xml = this.getXml(val);
        this.$emit("update:xml", this.s_xml);
      },
      deep: true,
    },
    xml: {
      handler(val) {
        if (val != this.s_xml) {
          this.form = this.getForm(val);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      form: {
        Innovation: [],
        Selection: [],
      },
    };
  },
  created() {},
  methods: {
    getForm(xml) {
      const json = xmlToJson(xml);
      const form = JSON.parse(JSON.stringify(defaultForm));
      const nodes = json.nodes[0].nodes;
      for (const node of nodes) {
        if (node.name == "param") {
          form[node.attrs.name] = node.attrs.value;
        }
      }
      return form;
    },
    getXml(data) {
      const { Innovation, Selection, ..._data } = data;
      const nodes = [];
      for (const key in _data) {
        const value = _data[key];
        if (value !== "" && value !== null && value !== "null") {
          nodes.push({
            name: "param",
            attrs: {
              name: key,
              value: _data[key],
            },
          });
        }
      }
      return jsonToXml({
        name: "module",
        attrs: {
          name: "qsim",
        },
        nodes: nodes,
      });
    },
    timeStringToNumber(str) {
      let arr = str.split(":");
      if (arr.length == 3) {
        return parseInt(arr[0]) * 3600 + parseInt(arr[1]) * 60 + parseInt(arr[2]);
      } else if (arr.length == 2) {
        return parseInt(arr[0]) * 60 + parseInt(arr[1]);
      } else if (arr.length == 1) {
        return parseInt(arr[0]);
      } else {
        return 0;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.Qsim {
}
</style>
