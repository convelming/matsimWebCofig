<template>
  <div class="ConfigItem col_1 PtCounts">
    <div class="ConfigItem_title" :style="`color:#000;`" title="PtCounts">
      PtCounts
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('countsScaleFactor')">
          <el-input-number v-model="form.countsScaleFactor" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('distanceFilter')">
          <el-input v-model="form.distanceFilter" clearable />
        </el-form-item>
        <el-form-item :label="$l('distanceFilterCenterNode')">
          <el-input v-model="form.distanceFilterCenterNode" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputAlightCountsFile')">
          <el-input v-model="form.inputAlightCountsFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputBoardCountsFile')">
          <el-input v-model="form.inputBoardCountsFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('inputOccupancyCountsFile')">
          <el-input v-model="form.inputOccupancyCountsFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('outputformat')">
          <el-radio-group v-model="form.outputformat">
            <el-radio label="null">{{ $l("null") }}</el-radio>
            <el-radio label="html">{{ $l("html") }}</el-radio>
            <el-radio label="kml">{{ $l("kml") }}</el-radio>
            <el-radio label="txt">{{ $l("txt") }}</el-radio>
            <el-radio label="all">{{ $l("all") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$l('ptCountsInterval')">
          <el-input-number v-model="form.ptCountsInterval" :step="1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "countsScaleFactor": {
    "zh-CN":"客流量权重系数",
    "en-US":"countsScaleFactor"
  },
  "distanceFilter": {
    "zh-CN":"距离筛选",
    "en-US":"distanceFilter"
  },
  "distanceFilterCenterNode": {
    "zh-CN":"distanceFilterCenterNode",
    "en-US":"distanceFilterCenterNode"
  },
  "inputAlightCountsFile": {
    "zh-CN":"上车客流量的文件路径",
    "en-US":"inputAlightCountsFile"
  },
  "inputBoardCountsFile": {
    "zh-CN":"下车客流量的文件路径",
    "en-US":"inputBoardCountsFile"
  },
  "inputOccupancyCountsFile": {
    "zh-CN":"载客量（车上乘客数量）的文件路径",
    "en-US":"inputOccupancyCountsFile"
  },
  "outputformat": {
    "zh-CN":"输出文件格式",
    "en-US":"outputformat"
  },
  "null": {
    "zh-CN":"null",
    "en-US":"null"
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
  "ptCountsInterval": {
    "zh-CN":"输出的迭代间隔数",
    "en-US":"ptCountsInterval"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  countsScaleFactor: "",
  distanceFilter: "",
  distanceFilterCenterNode: "",
  inputAlightCountsFile: "",
  inputBoardCountsFile: "",
  inputOccupancyCountsFile: "",
  outputformat: "",
  ptCountsInterval: "",
};
const defaultXml = `
	<module name="ptCounts" >
		<!-- factor by which to re-scale the simulated values.  necessary when simulation runs with something different from 100%.  needs to be adapted manually -->
		<param name="countsScaleFactor" value="1.0" />
		<!-- distance to distanceFilterCenterNode to include counting stations. The unit of distance is the Euclidean distance implied by the coordinate system -->
		<param name="distanceFilter" value="null" />
		<!-- node id for center node of distance filter -->
		<param name="distanceFilterCenterNode" value="null" />
		<!-- input file containing the alighting (getting off) counts for pt -->
		<param name="inputAlightCountsFile" value="null" />
		<!-- input file containing the boarding (getting on) counts for pt -->
		<param name="inputBoardCountsFile" value="null" />
		<!-- input file containing the occupancy counts for pt -->
		<param name="inputOccupancyCountsFile" value="null" />
		<!-- possible values: 'html', 'kml', 'txt', 'all' -->
		<param name="outputformat" value="null" />
		<!-- every how many iterations (starting with 0) counts comparisons are generated -->
		<param name="ptCountsInterval" value="10" />
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
          name: "ptCounts",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.PtCounts {
}
</style>
