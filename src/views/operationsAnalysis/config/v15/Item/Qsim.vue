<template>
  <div class="ConfigItem col_1 Qsim">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Qsim">Qsim</div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('线程数量')">
          <el-input-number v-model="form.numberOfThreads" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('开始时间')">
          <el-time-picker v-model="form.startTime" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('结束时间')">
          <el-time-picker v-model="form.endTime" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('时间步长')">
          <el-time-picker v-model="form.timeStepSize" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('仿真开始时间定义')">
          <el-select v-model="form.simStarttimeInterpretation" clearable>
            <el-option :label="$l('仅使用定义的开始时间')" value="onlyUseStarttime" />
            <el-option :label="$l('定义的开始时间和mobsim仿真的开始时间的最大值')" value="maxOfStarttimeAndEarliestActivityEnd" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('仿真结束时间定义')">
          <el-select v-model="form.simEndtimeInterpretation" clearable>
            <el-option :label="$l('仅使用定义的结束时间')" value="onlyUseEndtime" />
            <el-option :label="$l('定义的结束时间和mobsim仿真的结束时间的最大值')" value="minOfEndtimeAndMobsimFinished" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('流量容量系数')">
          <el-input-number v-model="form.flowCapacityFactor" :min="0" :max="1" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('存储容量系数（路段长度和车辆长度）')">
          <el-input-number v-model="form.storageCapacityFactor" :min="0" :max="1" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('在行驶车辆前插入等待的车辆')">
          <el-switch v-model="form.insertingWaitingVehiclesBeforeDrivingVehicles" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('渗透模式')">
          <el-input v-model="form.seepMode" />
        </el-form-item>
        <el-form-item :label="$l('限制渗透')">
          <el-switch v-model="form.isRestrictingSeepage" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('渗透模式不占空间')">
          <el-switch v-model="form.isSeepModeStorageFree" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('动态链接')">
          <el-select v-model="form.linkDynamics" clearable>
            <el-option :label="$l('FIFO')" value="FIFO" />
            <el-option :label="$l('PassingQ')" value="PassingQ" />
            <el-option :label="$l('SeepageQ')" value="SeepageQ" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('节点偏移量')">
          <el-input-number v-model="form.nodeOffset" :min="0" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('链接宽度')">
          <el-input-number v-model="form.linkWidth" :min="0" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('主要模式')">
          <el-input v-model="form.mainMode" clearable />
        </el-form-item>
        <el-form-item :label="$l('使用车道信息')">
          <el-switch v-model="form.useLanes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('使用个人ID替代缺失的车辆ID')">
          <el-switch v-model="form.usePersonIdForMissingVehicleId" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('停滞时间阈值')">
          <el-input-number v-model="form.stuckTime" :min="0" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('移除停滞车辆')">
          <el-switch v-model="form.removeStuckVehicles" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('动态交通流模型')">
          <el-select v-model="form.trafficDynamics">
            <el-option :label="$l('queue')" value="queue" />
            <el-option :label="$l('withHoles')" value="withHoles" />
            <el-option :label="$l('kinematicWaves')" value="kinematicWaves" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('使用快速容量更新')">
          <el-switch v-model="form.usingFastCapacityUpdate" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('不可用车辆行为')">
          <el-select v-model="form.vehicleBehavior" clearable>
            <el-option :label="$l('teleport')" value="teleport" />
            <el-option :label="$l('wait')" value="wait" />
            <el-option :label="$l('exception')" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('车辆来源')">
          <el-select v-model="form.vehiclesSource" clearable>
            <el-option :label="$l('defaultVehicle')" value="defaultVehicle" />
            <el-option :label="$l('modeVehicleTypesFromVehiclesData')" value="modeVehicleTypesFromVehiclesData" />
            <el-option :label="$l('fromVehiclesData')" value="fromVehiclesData" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('快照周期')">
          <el-time-picker v-model="form.snapshotperiod" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('快照的过滤器')">
          <el-select v-model="form.filterSnapshots" clearable>
            <el-option :label="$l('缺省')" value="null" />
            <el-option :label="$l('withLinkAttributes')" value="withLinkAttributes" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('快照的风格')">
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
  "线程数量": {
    "zh-CN":"线程数量",
    "en-US":"线程数量"
  },
  "开始时间": {
    "zh-CN":"开始时间",
    "en-US":"开始时间"
  },
  "结束时间": {
    "zh-CN":"结束时间",
    "en-US":"结束时间"
  },
  "时间步长": {
    "zh-CN":"时间步长",
    "en-US":"时间步长"
  },
  "仿真开始时间定义": {
    "zh-CN":"仿真开始时间定义",
    "en-US":"仿真开始时间定义"
  },
  "仅使用定义的开始时间": {
    "zh-CN":"仅使用定义的开始时间",
    "en-US":"仅使用定义的开始时间"
  },
  "定义的开始时间和mobsim仿真的开始时间的最大值": {
    "zh-CN":"定义的开始时间和mobsim仿真的开始时间的最大值",
    "en-US":"定义的开始时间和mobsim仿真的开始时间的最大值"
  },
  "仿真结束时间定义": {
    "zh-CN":"仿真结束时间定义",
    "en-US":"仿真结束时间定义"
  },
  "仅使用定义的结束时间": {
    "zh-CN":"仅使用定义的结束时间",
    "en-US":"仅使用定义的结束时间"
  },
  "定义的结束时间和mobsim仿真的结束时间的最大值": {
    "zh-CN":"定义的结束时间和mobsim仿真的结束时间的最大值",
    "en-US":"定义的结束时间和mobsim仿真的结束时间的最大值"
  },
  "流量容量系数": {
    "zh-CN":"流量容量系数",
    "en-US":"流量容量系数"
  },
  "存储容量系数（路段长度和车辆长度）": {
    "zh-CN":"存储容量系数（路段长度和车辆长度）",
    "en-US":"存储容量系数（路段长度和车辆长度）"
  },
  "在行驶车辆前插入等待的车辆": {
    "zh-CN":"在行驶车辆前插入等待的车辆",
    "en-US":"在行驶车辆前插入等待的车辆"
  },
  "渗透模式": {
    "zh-CN":"渗透模式",
    "en-US":"渗透模式"
  },
  "限制渗透": {
    "zh-CN":"限制渗透",
    "en-US":"限制渗透"
  },
  "渗透模式不占空间": {
    "zh-CN":"渗透模式不占空间",
    "en-US":"渗透模式不占空间"
  },
  "动态链接": {
    "zh-CN":"动态链接",
    "en-US":"动态链接"
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
  "节点偏移量": {
    "zh-CN":"节点偏移量",
    "en-US":"节点偏移量"
  },
  "链接宽度": {
    "zh-CN":"链接宽度",
    "en-US":"链接宽度"
  },
  "主要模式": {
    "zh-CN":"主要模式",
    "en-US":"主要模式"
  },
  "使用车道信息": {
    "zh-CN":"使用车道信息",
    "en-US":"使用车道信息"
  },
  "使用个人ID替代缺失的车辆ID": {
    "zh-CN":"使用个人ID替代缺失的车辆ID",
    "en-US":"使用个人ID替代缺失的车辆ID"
  },
  "停滞时间阈值": {
    "zh-CN":"停滞时间阈值",
    "en-US":"停滞时间阈值"
  },
  "移除停滞车辆": {
    "zh-CN":"移除停滞车辆",
    "en-US":"移除停滞车辆"
  },
  "动态交通流模型": {
    "zh-CN":"动态交通流模型",
    "en-US":"动态交通流模型"
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
  "使用快速容量更新": {
    "zh-CN":"使用快速容量更新",
    "en-US":"使用快速容量更新"
  },
  "不可用车辆行为": {
    "zh-CN":"不可用车辆行为",
    "en-US":"不可用车辆行为"
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
  "车辆来源": {
    "zh-CN":"车辆来源",
    "en-US":"车辆来源"
  },
  "defaultVehicle": {
    "zh-CN":"defaultVehicle",
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
  "快照周期": {
    "zh-CN":"快照周期",
    "en-US":"快照周期"
  },
  "快照的过滤器": {
    "zh-CN":"快照的过滤器",
    "en-US":"快照的过滤器"
  },
  "缺省": {
    "zh-CN":"缺省",
    "en-US":"缺省"
  },
  "withLinkAttributes": {
    "zh-CN":"withLinkAttributes",
    "en-US":"withLinkAttributes"
  },
  "快照的风格": {
    "zh-CN":"快照的风格",
    "en-US":"快照的风格"
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
      default: defaultXml,
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
      const form = defaultForm;
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
  },
};
</script>

<style lang="scss" scoped>
.Qsim {
}
</style>
