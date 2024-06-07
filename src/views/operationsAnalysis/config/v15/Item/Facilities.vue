<template>
  <div class="ConfigItem col_1 Facilities">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Facilities">
      Facilities
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('facilitiesSource')">
          <el-select v-model="form.facilitiesSource" clearable>
            <el-option :label="$l('none')" value="none" />
            <el-option :label="$l('fromFile')" value="fromFile" />
            <el-option :label="$l('setInScenario')" value="setInScenario" />
            <el-option :label="$l('onePerActivityLinkInPlansFile')" value="onePerActivityLinkInPlansFile" />
            <el-option :label="
                $l('onePerActivityLinkInPlansFileExceptWhenCoordinatesAreGiven')
              " value="onePerActivityLinkInPlansFileExceptWhenCoordinatesAreGiven" />
            <el-option :label="$l('onePerActivityLocationInPlansFile')" value="onePerActivityLocationInPlansFile" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('idPrefix')">
          <el-input v-model="form.idPrefix" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputCRS')">
          <el-input v-model="form.inputCRS" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputFacilitiesFile')">
          <el-input v-model="form.inputFacilitiesFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputFacilityAttributesFile')">
          <el-input v-model="form.inputFacilityAttributesFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('insistingOnUsingDeprecatedFacilitiesAttributeFile')">
          <el-switch v-model="form.insistingOnUsingDeprecatedFacilitiesAttributeFile" active-value="true" inactive-value="false" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "facilitiesSource": {
    "zh-CN":"设施来源",
    "en-US":"facilitiesSource"
  },
  "none": {
    "zh-CN":"none",
    "en-US":"none"
  },
  "fromFile": {
    "zh-CN":"fromFile",
    "en-US":"fromFile"
  },
  "setInScenario": {
    "zh-CN":"setInScenario",
    "en-US":"setInScenario"
  },
  "onePerActivityLinkInPlansFile": {
    "zh-CN":"onePerActivityLinkInPlansFile",
    "en-US":"onePerActivityLinkInPlansFile"
  },
  "onePerActivityLinkInPlansFileExceptWhenCoordinatesAreGiven": {
    "zh-CN":"onePerActivityLinkInPlansFileExceptWhenCoordinatesAreGiven",
    "en-US":"onePerActivityLinkInPlansFileExceptWhenCoordinatesAreGiven"
  },
  "onePerActivityLocationInPlansFile": {
    "zh-CN":"onePerActivityLocationInPlansFile",
    "en-US":"onePerActivityLocationInPlansFile"
  },
  "idPrefix": {
    "zh-CN":"ID前缀",
    "en-US":"idPrefix"
  },
  "inputCRS": {
    "zh-CN":"输入坐标系",
    "en-US":"inputCRS"
  },
  "inputFacilitiesFile": {
    "zh-CN":"设施文件路径",
    "en-US":"inputFacilitiesFile"
  },
  "inputFacilityAttributesFile": {
    "zh-CN":"设施属性文件路径",
    "en-US":"inputFacilityAttributesFile"
  },
  "insistingOnUsingDeprecatedFacilitiesAttributeFile": {
    "zh-CN":"是否坚持使用已过时的设施属性文件",
    "en-US":"insistingOnUsingDeprecatedFacilitiesAttributeFile"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  facilitiesSource: "",
  idPrefix: "",
  inputCRS: "",
  inputFacilitiesFile: "",
  inputFacilityAttributesFile: "",
  insistingOnUsingDeprecatedFacilitiesAttributeFile: "",
};
const defaultXml = `
	<module name="facilities" >
		<!-- This defines how facilities should be created. Possible values: none fromFile setInScenario onePerActivityLinkInPlansFile onePerActivityLinkInPlansFileExceptWhenCoordinatesAreGiven onePerActivityLocationInPlansFile  -->
		<param name="facilitiesSource" value="none" />
		<!-- A prefix to be used for auto-generated IDs. -->
		<param name="idPrefix" value="f_auto_" />
		<!-- The Coordinates Reference System in which the coordinates are expressed in the input file. At import, the coordinates will be converted to the coordinate system defined in "global", and willbe converted back at export. If not specified, no conversion happens. -->
		<param name="inputCRS" value="null" />
		<param name="inputFacilitiesFile" value="null" />
		<param name="inputFacilityAttributesFile" value="null" />
		<param name="insistingOnUsingDeprecatedFacilitiesAttributeFile" value="false" />
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
          name: "facilities",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Facilities {
}
</style>
