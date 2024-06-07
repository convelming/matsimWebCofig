<template>
  <div class="ConfigItem col_1 Plans">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Plans">
      Plans
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('inputCRS')">
          <el-input v-model="form.inputCRS" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputPlansFile')">
          <el-input v-model="form.inputPlansFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputPersonAttributesFile')">
          <el-input v-model="form.inputPersonAttributesFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('networkRouteType')">
          <el-select v-model="form.networkRouteType" clearable>
            <el-option :label="$l('LinkNetworkRoute')" value="LinkNetworkRoute" />
            <el-option :label="$l('CompressedNetworkRoute')" value="CompressedNetworkRoute" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('handlingOfPlansWithoutRoutingMode')">
          <el-select v-model="form.handlingOfPlansWithoutRoutingMode" clearable>
            <el-option :label="$l('reject')" value="reject" />
            <el-option :label="$l('useMainModeIdentifier')" value="useMainModeIdentifier" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('removingUnnecessaryPlanAttributes')">
          <el-switch v-model="form.removingUnnecessaryPlanAttributes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('tripDurationHandling')">
          <el-select v-model="form.tripDurationHandling" clearable>
            <el-option :label="$l('ignoreDelays')" value="ignoreDelays" />
            <el-option :label="$l('shiftActivityEndTimes')" value="shiftActivityEndTimes" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "inputCRS": {
    "zh-CN":"输入文件坐标系",
    "en-US":"inputCRS"
  },
  "inputPlansFile": {
    "zh-CN":"输入计划文件路径",
    "en-US":"inputPlansFile"
  },
  "inputPersonAttributesFile": {
    "zh-CN":"输入出行者属性文件路径",
    "en-US":"inputPersonAttributesFile"
  },
  "networkRouteType": {
    "zh-CN":"出行路径在内存中暂存的格式",
    "en-US":"networkRouteType"
  },
  "LinkNetworkRoute": {
    "zh-CN":"LinkNetworkRoute",
    "en-US":"LinkNetworkRoute"
  },
  "CompressedNetworkRoute": {
    "zh-CN":"CompressedNetworkRoute",
    "en-US":"CompressedNetworkRoute"
  },
  "handlingOfPlansWithoutRoutingMode": {
    "zh-CN":"如何处理没有出行路径的计划",
    "en-US":"handlingOfPlansWithoutRoutingMode"
  },
  "reject": {
    "zh-CN":"丢弃",
    "en-US":"reject"
  },
  "useMainModeIdentifier": {
    "zh-CN":"使用主要出行方式",
    "en-US":"useMainModeIdentifier"
  },
  "removingUnnecessaryPlanAttributes": {
    "zh-CN":"删除计划中不必要的属性",
    "en-US":"removingUnnecessaryPlanAttributes"
  },
  "tripDurationHandling": {
    "zh-CN":"行程持续时间处理方式",
    "en-US":"tripDurationHandling"
  },
  "ignoreDelays": {
    "zh-CN":"忽略延误，出发时间始终基于计划的上一活动的结束时间",
    "en-US":"ignoreDelays"
  },
  "shiftActivityEndTimes": {
    "zh-CN":"延迟活动结束时间",
    "en-US":"shiftActivityEndTimes"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  inputCRS: "",
  inputPlansFile: "",
  inputPersonAttributesFile: "",
  networkRouteType: "",
  handlingOfPlansWithoutRoutingMode: "",
  removingUnnecessaryPlanAttributes: "",
  tripDurationHandling: "",
};
const defaultXml = `
<module name="plans">
  <!-- 输入文件坐标系 -->
  <param name="inputCRS" value="null"/>
  <!-- 输入计划文件 -->
  <param name="inputPlansFile" value="null"/>
  <!-- 输入人员属性文件 -->
  <param name="inputPersonAttributesFile" value="null"/>
  <!-- 路网路由类型 -->
  <param name="networkRouteType" value="LinkNetworkRoute"/>
  <!-- 处理没有路由的计划 -->
  <param name="handlingOfPlansWithoutRoutingMode" value="reject"/>
  <!-- 删除未使用计划的属性 -->
  <param name="removingUnnecessaryPlanAttributes" value="false"/>
  <!-- 行程持续时间 -->
  <param name="tripDurationHandling" value="ignoreDelays"/>
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
          name: "plans",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Plans {
}
</style>
