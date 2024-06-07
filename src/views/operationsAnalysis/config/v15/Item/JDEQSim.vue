<template>
  <div class="ConfigItem col_1 JDEQSim">
    <div class="ConfigItem_title" :style="`color:#000;`" title="JDEQSim">
      JDEQSim
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('carSize')">
          <el-input-number v-model="form.carSize" :step="0.1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('endTime')">
          <el-time-picker v-model="form.endTime" value-format="HH:mm:ss" clearable />
        </el-form-item>
        <el-form-item :label="$l('flowCapacityFactor')">
          <el-input-number v-model="form.flowCapacityFactor" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('gapTravelSpeed')">
          <el-input-number v-model="form.gapTravelSpeed" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('minimumInFlowCapacity')">
          <el-input-number v-model="form.minimumInFlowCapacity" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('squeezeTime')">
          <el-input-number v-model="form.squeezeTime" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('storageCapacityFactor')">
          <el-input-number v-model="form.storageCapacityFactor" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "carSize": {
    "zh-CN":"车辆大小",
    "en-US":"carSize"
  },
  "endTime": {
    "zh-CN":"endTime",
    "en-US":"endTime"
  },
  "flowCapacityFactor": {
    "zh-CN":"路段流量系数",
    "en-US":"flowCapacityFactor"
  },
  "gapTravelSpeed": {
    "zh-CN":"gapTravelSpeed",
    "en-US":"gapTravelSpeed"
  },
  "minimumInFlowCapacity": {
    "zh-CN":"最小路段流量",
    "en-US":"minimumInFlowCapacity"
  },
  "squeezeTime": {
    "zh-CN":"squeezeTime",
    "en-US":"squeezeTime"
  },
  "storageCapacityFactor": {
    "zh-CN":"路段可容纳车辆系数",
    "en-US":"storageCapacityFactor"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  carSize: "",
  endTime: "",
  flowCapacityFactor: "",
  gapTravelSpeed: "",
  minimumInFlowCapacity: "",
  squeezeTime: "",
  storageCapacityFactor: "",
};
const defaultXml = `
	<module name="JDEQSim" >
		<param name="carSize" value="7.5" />
		<param name="endTime" value="undefined" />
		<param name="flowCapacityFactor" value="1.0" />
		<param name="gapTravelSpeed" value="15.0" />
		<param name="minimumInFlowCapacity" value="1800.0" />
		<param name="squeezeTime" value="1800.0" />
		<param name="storageCapacityFactor" value="1.0" />
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
      form: {},
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
      const { ..._data } = data;
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
          name: "JDEQSim",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.JDEQSim {
}
</style>
