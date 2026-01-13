<template>
  <div class="ConfigItem col_1 Transit">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Transit">
      Transit
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('inputScheduleCRS')">
          <el-input v-model="form.inputScheduleCRS" clearable />
        </el-form-item>
        <el-form-item :label="$l('insistingOnUsingDeprecatedAttributeFiles')">
          <el-switch v-model="form.insistingOnUsingDeprecatedAttributeFiles" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('routingAlgorithmType')">
          <el-select v-model="form.routingAlgorithmType" clearable>
            <el-option :label="$l('DijkstraBased')" value="DijkstraBased" />
            <el-option :label="$l('SwissRailRaptor')" value="SwissRailRaptor" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('transitLinesAttributesFile')">
          <el-input v-model="form.transitLinesAttributesFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('transitModes')">
          <Tags v-model="form.transitModes" />
        </el-form-item>
        <el-form-item :label="$l('transitScheduleFile')">
          <el-input v-model="form.transitScheduleFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('transitStopsAttributesFile')">
          <el-input v-model="form.transitStopsAttributesFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('useTransit')">
          <el-switch v-model="form.useTransit" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('usingTransitInMobsim')">
          <el-switch v-model="form.usingTransitInMobsim" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('vehiclesFile')">
          <el-input v-model="form.vehiclesFile" clearable />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "inputScheduleCRS": {
    "zh-CN":"公交系统的坐标系",
    "en-US":"inputScheduleCRS"
  },
  "insistingOnUsingDeprecatedAttributeFiles": {
    "zh-CN":"是否坚持使用过期的属性文件",
    "en-US":"insistingOnUsingDeprecatedAttributeFiles"
  },
  "routingAlgorithmType": {
    "zh-CN":"公交路径选择算法类型",
    "en-US":"routingAlgorithmType"
  },
  "DijkstraBased": {
    "zh-CN":"基于迪杰斯特拉",
    "en-US":"DijkstraBased"
  },
  "SwissRailRaptor": {
    "zh-CN":"瑞士铁路公司",
    "en-US":"SwissRailRaptor"
  },
  "transitLinesAttributesFile": {
    "zh-CN":"公交线路的属性文件路径",
    "en-US":"transitLinesAttributesFile"
  },
  "transitModes": {
    "zh-CN":"公交线路的出行方式名称",
    "en-US":"transitModes"
  },
  "transitScheduleFile": {
    "zh-CN":"公交线路的文件路径",
    "en-US":"transitScheduleFile"
  },
  "transitStopsAttributesFile": {
    "zh-CN":"公交站点属性文件路径",
    "en-US":"transitStopsAttributesFile"
  },
  "useTransit": {
    "zh-CN":"是否使用公交出行方式",
    "en-US":"useTransit"
  },
  "usingTransitInMobsim": {
    "zh-CN":"是否在mobsim里使用公交系统",
    "en-US":"usingTransitInMobsim"
  },

  "vehiclesFile": {
    "zh-CN":"公交车辆文件路径",
    "en-US":"vehiclesFile"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  inputScheduleCRS: "",
  insistingOnUsingDeprecatedAttributeFiles: "",
  routingAlgorithmType: "",
  transitLinesAttributesFile: "",
  transitModes: "",
  transitScheduleFile: "",
  transitStopsAttributesFile: "",
  useTransit: "",
  usingTransitInMobsim: "",
  vehiclesFile: "",
};
const defaultXml = `
	<module name="transit" >
		<!-- The Coordinates Reference System in which the coordinates are expressed in the input file. At import, the coordinates will be converted to the coordinate system defined in "global", and willbe converted back at export. If not specified, no conversion happens. -->
		<param name="inputScheduleCRS" value="null" />
		<param name="insistingOnUsingDeprecatedAttributeFiles" value="false" />
		<!-- The type of transit routing algorithm used, may have the values: [DijkstraBased, SwissRailRaptor] -->
		<param name="routingAlgorithmType" value="SwissRailRaptor" />
		<!-- Optional input file containing additional attributes for transit lines, stored as ObjectAttributes. -->
		<param name="transitLinesAttributesFile" value="null" />
		<!-- Comma-separated list of transportation modes that are handled as transit. Defaults to 'pt'. -->
		<param name="transitModes" value="pt" />
		<!-- Input file containing the transit schedule to be simulated. -->
		<param name="transitScheduleFile" value="null" />
		<!-- Optional input file containing additional attributes for transit stop facilities, stored as ObjectAttributes. -->
		<param name="transitStopsAttributesFile" value="null" />
		<!-- Set this parameter to true if transit should be simulated, false if not. -->
		<param name="useTransit" value="false" />
		<param name="usingTransitInMobsim" value="true" />
		<!-- Input file containing the vehicles used by the departures in the transit schedule. -->
		<param name="vehiclesFile" value="null" />
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
          name: "transit",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Transit {
}
</style>
