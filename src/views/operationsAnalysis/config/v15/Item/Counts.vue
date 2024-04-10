<template>
  <div class="ConfigItem col_1 Counts">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Counts">
      Counts
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('analyzedModes')">
          <el-input v-model="form.analyzedModes" clearable />
        </el-form-item>

        <el-form-item :label="$l('averageCountsOverIterations')">
          <el-input-number v-model="form.averageCountsOverIterations" :step="1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('countsScaleFactor')">
          <el-input-number v-model="form.countsScaleFactor" :step="0.1" :min="0" :max="1" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('distanceFilter')">
          <el-input v-model="form.distanceFilter" clearable />
        </el-form-item>
        <el-form-item :label="$l('distanceFilterCenterNode')">
          <el-input v-model="form.distanceFilterCenterNode" clearable />
        </el-form-item>
        <el-form-item :label="$l('filterModes')">
          <el-switch v-model="form.filterModes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('inputCRS')">
          <el-input v-model="form.inputCRS" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputCountsFile')">
          <el-input v-model="form.inputCountsFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('outputformat')">
          <el-radio-group v-model="form.outputformat">
            <el-radio label="html">{{ $l("html") }}</el-radio>
            <el-radio label="kml">{{ $l("kml") }}</el-radio>
            <el-radio label="txt">{{ $l("txt") }}</el-radio>
            <el-radio label="all">{{ $l("all") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$l('writeCountsInterval')">
          <el-input-number v-model="form.writeCountsInterval" :step="1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "analyzedModes": {
    "zh-CN":"需要分析的出行方式",
    "en-US":"analyzedModes"
  },
  "averageCountsOverIterations": {
    "zh-CN":"指定取平均的迭代次数",
    "en-US":"averageCountsOverIterations"
  },
  "countsScaleFactor": {
    "zh-CN":"调整系数",
    "en-US":"countsScaleFactor"
  },
  "distanceFilter": {
    "zh-CN":"筛选距离",
    "en-US":"distanceFilter"
  },
  "distanceFilterCenterNode": {
    "zh-CN":"distanceFilterCenterNode",
    "en-US":"distanceFilterCenterNode"
  },
  "filterModes": {
    "zh-CN":"出行方式筛选",
    "en-US":"filterModes"
  },
  "inputCRS": {
    "zh-CN":"输入坐标系",
    "en-US":"inputCRS"
  },
  "inputCountsFile": {
    "zh-CN":"流量输入文件路径",
    "en-US":"inputCountsFile"
  },
  "outputformat": {
    "zh-CN":"输出文件格式",
    "en-US":"outputformat"
  },
  "html": {
    "zh-CN":"html",
    "en-US":"html"
  },
  "kml": {
    "zh-CN":"kml",
    "en-US":"kml"
  },
  "txt": {
    "zh-CN":"txt",
    "en-US":"txt"
  },
  "all": {
    "zh-CN":"all",
    "en-US":"all"
  },
  "writeCountsInterval": {
    "zh-CN":"流量写入的迭代间隔",
    "en-US":"writeCountsInterval"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  analyzedModes: "",
  averageCountsOverIterations: "",
  countsScaleFactor: "",
  distanceFilter: "",
  distanceFilterCenterNode: "",
  filterModes: "",
  inputCRS: "",
  inputCountsFile: "",
  outputformat: "",
  writeCountsInterval: "",
};
const defaultXml = `
	<module name="counts" >
		<!-- Transport modes that will be respected for the counts comparison. 'car' is default, which includes also bussed from the pt simulation module. Use this parameter in combination with 'filterModes' = true! -->
		<param name="analyzedModes" value="car" />
		<!-- Specifies over how many iterations the link volumes should be averaged that are used for the counts comparison. Use 1 or 0 to only use the link volumes of a single iteration. This values cannot be larger than the value specified for writeCountsInterval -->
		<param name="averageCountsOverIterations" value="5" />
		<!-- factor by which to re-scale the simulated values.  necessary when simulation runs with something different from 100%.  needs to be adapted manually -->
		<param name="countsScaleFactor" value="1.0" />
      <!-- distance to distanceFilterCenterNode to include counting stations. The unit of distance is the Euclidean distance implied by the coordinate system -->
      <param name="distanceFilter" value="null" />
		<!-- node id for center node of distance filter -->
		<param name="distanceFilterCenterNode" value="null" />
		<!-- If true, link counts from legs performed on modes not included in the 'analyzedModes' parameter are ignored. -->
		<param name="filterModes" value="false" />
		<!-- The Coordinates Reference System in which the coordinates are expressed in the input file. At import, the coordinates will be converted to the coordinate system defined in "global", and willbe converted back at export. If not specified, no conversion happens. -->
		<param name="inputCRS" value="null" />
		<!-- input file name to counts package -->
		<param name="inputCountsFile" value="null" />
		<!-- possible values: 'html', 'kml', 'txt', 'all' -->
		<param name="outputformat" value="txt" />
		<!-- Specifies how often the counts comparison should be calculated and written. -->
		<param name="writeCountsInterval" value="10" />
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
          name: "counts",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Counts {
}
</style>
