<template>
  <div class="ConfigItem col_1 Global">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Global">
      Global
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('coordinateSystem')">
          <el-input v-model="form.coordinateSystem" clearable />
        </el-form-item>
        <el-form-item :label="$l('defaultDelimiter')">
          <el-input v-model="form.defaultDelimiter" clearable />
        </el-form-item>
        <el-form-item :label="$l('randomSeed')">
          <el-input-number v-model="form.randomSeed" :step="1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('numberOfThreads')">
          <el-input-number v-model="form.numberOfThreads" :step="1" :min="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('insistingOnDeprecatedConfigVersion')">
          <el-switch v-model="form.insistingOnDeprecatedConfigVersion" active-value="true" inactive-value="false" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "coordinateSystem": {
    "zh-CN":"坐标系",
    "en-US":"coordinateSystem"
  },
  "defaultDelimiter": {
    "zh-CN":"默认分隔符",
    "en-US":"defaultDelimiter"
  },
  "randomSeed": {
    "zh-CN":"随机种子",
    "en-US":"randomSeed"
  },
  "numberOfThreads": {
    "zh-CN":"线程数",
    "en-US":"numberOfThreads"
  },
  "insistingOnDeprecatedConfigVersion": {
    "zh-CN":"坚持使用弃用的配置版本",
    "en-US":"insistingOnDeprecatedConfigVersion"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  coordinateSystem: "",
  defaultDelimiter: "",
  randomSeed: "",
  numberOfThreads: "",
  insistingOnDeprecatedConfigVersion: "",
};
const defaultXml = `
	<module name="global" >
		<param name="coordinateSystem" value="Atlantis" />
		<param name="defaultDelimiter" value=";" />
		<param name="insistingOnDeprecatedConfigVersion" value="true" />
		<!-- "global" number of threads.  This number is used, e.g., for replanning, but NOT in QSim.  This can typically be set to as many cores as you have available, or possibly even slightly more. -->
		<param name="numberOfThreads" value="2" />
		<param name="randomSeed" value="4711" />
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
      form: {},
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
          name: "global",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Global {
}
</style>
