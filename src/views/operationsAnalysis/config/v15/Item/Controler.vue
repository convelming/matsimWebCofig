<template>
  <div class="ConfigItem col_1 Controler">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Controler">
      Controler
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('压缩格式')">
          <el-select v-model="form.compressionType" clearable>
            <el-option :label="$l('gzip')" value="gzip" />
            <el-option :label="$l('none')" value="none" />
            <el-option :label="$l('lz4')" value="lz4" />
            <el-option :label="$l('zst')" value="zst" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('事件文件格式')">
          <el-checkbox-group :value="strToList(form.eventsFileFormat, ',')" @input="form.eventsFileFormat = listToStr($event, ',')">
            <el-checkbox label="xml">{{ $l("xml") }}</el-checkbox>
            <el-checkbox label="pb">{{ $l("pb") }}</el-checkbox>
            <el-checkbox label="json">{{ $l("json") }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$l('起始迭代次数')">
          <el-input-number v-model="form.firstIteration" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('终止迭代次数')">
          <el-input-number v-model="form.lastIteration" :min="Number(form.firstIteration)" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('移动仿真器')">
          <el-select v-model="form.mobsim" clearable>
            <el-option :label="$l('qsim')" value="qsim" />
            <el-option :label="$l('JDEQSim')" value="JDEQSim" />
            <el-option :label="$l('hermes')" value="hermes" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('路径规划算法')">
          <el-select v-model="form.routingAlgorithmType" clearable>
            <el-option :label="$l('AStarLandmarks')" value="AStarLandmarks" />
            <el-option :label="$l('Dijkstra')" value="Dijkstra" />
            <el-option :label="$l('FastDijkstra')" value="FastDijkstra" />
            <el-option :label="$l('FastAStarLandmarks')" value="FastAStarLandmarks" />
            <el-option :label="$l('SpeedyALT')" value="SpeedyALT" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('启用 link 到 link 的路径规划')">
          <el-switch v-model="form.enableLinkToLinkRouting" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('输出文件夹')">
          <el-input v-model="form.outputDirectory" clearable />
        </el-form-item>
        <el-form-item :label="$l('运行ID（输出文件的前缀）')">
          <el-input v-model="form.runId" clearable />
        </el-form-item>
        <el-form-item :label="$l('覆写文件设置')">
          <el-select v-model="form.overwriteFiles" clearable>
            <el-option :label="$l('文件存在时失败')" value="failIfDirectoryExists" />
            <el-option :label="$l('覆写现有的文件')" value="overwriteExistingFiles" />
            <el-option :label="$l('删除存在的目录')" value="deleteDirectoryIfExists" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('创建图表')">
          <el-switch v-model="form.createGraphs" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('结束时存储数据')">
          <el-switch v-model="form.dumpDataAtEnd" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('事件写入间隔')">
          <el-input-number v-model="form.writeEventsInterval" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('计划写入间隔')">
          <el-input-number v-model="form.writePlansInterval" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('行程写入间隔')">
          <el-input-number v-model="form.writeTripsInterval" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('快照格式')">
          <el-select v-model="form.snapshotFormat" clearable>
            <el-option :label="$l('transims')" value="transims" />
            <el-option :label="$l('googleearth')" value="googleearth" />
            <el-option :label="$l('otfvis')" value="otfvis" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('快照写入间隔')">
          <el-input-number v-model="form.writeSnapshotsInterval" :min="0" :step="1" step-strictly controls-position="right" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "压缩格式": {
    "zh-CN":"压缩格式",
    "en-US":"压缩格式"
  },
  "gzip": {
    "zh-CN":"gzip",
    "en-US":"gzip"
  },
  "none": {
    "zh-CN":"none",
    "en-US":"none"
  },
  "lz4": {
    "zh-CN":"lz4",
    "en-US":"lz4"
  },
  "zst": {
    "zh-CN":"zst",
    "en-US":"zst"
  },
  "事件文件格式": {
    "zh-CN":"事件文件格式",
    "en-US":"事件文件格式"
  },
  "xml": {
    "zh-CN":"xml",
    "en-US":"xml"
  },
  "pb": {
    "zh-CN":"pb",
    "en-US":"pb"
  },
  "json": {
    "zh-CN":"json",
    "en-US":"json"
  },
  "起始迭代次数": {
    "zh-CN":"起始迭代次数",
    "en-US":"起始迭代次数"
  },
  "终止迭代次数": {
    "zh-CN":"终止迭代次数",
    "en-US":"终止迭代次数"
  },
  "移动仿真器": {
    "zh-CN":"移动仿真器",
    "en-US":"移动仿真器"
  },
  "qsim": {
    "zh-CN":"qsim",
    "en-US":"qsim"
  },
  "JDEQSim": {
    "zh-CN":"JDEQSim",
    "en-US":"JDEQSim"
  },
  "hermes": {
    "zh-CN":"hermes",
    "en-US":"hermes"
  },
  "路径规划算法": {
    "zh-CN":"路径规划算法",
    "en-US":"路径规划算法"
  },
  "AStarLandmarks": {
    "zh-CN":"AStarLandmarks",
    "en-US":"AStarLandmarks"
  },
  "Dijkstra": {
    "zh-CN":"Dijkstra",
    "en-US":"Dijkstra"
  },
  "FastDijkstra": {
    "zh-CN":"FastDijkstra",
    "en-US":"FastDijkstra"
  },
  "FastAStarLandmarks": {
    "zh-CN":"FastAStarLandmarks",
    "en-US":"FastAStarLandmarks"
  },
  "SpeedyALT": {
    "zh-CN":"SpeedyALT",
    "en-US":"SpeedyALT"
  },
  "启用 link 到 link 的路径规划": {
    "zh-CN":"启用 link 到 link 的路径规划",
    "en-US":"启用 link 到 link 的路径规划"
  },
  "输出文件夹": {
    "zh-CN":"输出文件夹",
    "en-US":"输出文件夹"
  },
  "运行ID（输出文件的前缀）": {
    "zh-CN":"运行ID（输出文件的前缀）",
    "en-US":"运行ID（输出文件的前缀）"
  },
  "覆写文件设置": {
    "zh-CN":"覆写文件设置",
    "en-US":"覆写文件设置"
  },
  "文件存在时失败": {
    "zh-CN":"文件存在时失败",
    "en-US":"文件存在时失败"
  },
  "覆写现有的文件": {
    "zh-CN":"覆写现有的文件",
    "en-US":"覆写现有的文件"
  },
  "删除存在的目录": {
    "zh-CN":"删除存在的目录",
    "en-US":"删除存在的目录"
  },
  "创建图表": {
    "zh-CN":"创建图表",
    "en-US":"创建图表"
  },
  "结束时存储数据": {
    "zh-CN":"结束时存储数据",
    "en-US":"结束时存储数据"
  },
  "事件写入间隔": {
    "zh-CN":"事件写入间隔",
    "en-US":"事件写入间隔"
  },
  "计划写入间隔": {
    "zh-CN":"计划写入间隔",
    "en-US":"计划写入间隔"
  },
  "行程写入间隔": {
    "zh-CN":"行程写入间隔",
    "en-US":"行程写入间隔"
  },
  "快照格式": {
    "zh-CN":"快照格式",
    "en-US":"快照格式"
  },
  "transims": {
    "zh-CN":"transims",
    "en-US":"transims"
  },
  "googleearth": {
    "zh-CN":"googleearth",
    "en-US":"googleearth"
  },
  "otfvis": {
    "zh-CN":"otfvis",
    "en-US":"otfvis"
  },
  "快照写入间隔": {
    "zh-CN":"快照写入间隔",
    "en-US":"快照写入间隔"
  },
  "aaa": {
    "zh-CN":"aaa",
    "en-US":"aaa"
  },
  "aaa": {
    "zh-CN":"aaa",
    "en-US":"aaa"
  },
  "aaa": {
    "zh-CN":"aaa",
    "en-US":"aaa"
  },
  "aaa": {
    "zh-CN":"aaa",
    "en-US":"aaa"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml, strToList, listToStr } from "../utils";

const defaultForm = {
  compressionType: "",
  eventsFileFormat: "",
  firstIteration: "",
  lastIteration: "",
  mobsim: "",
  routingAlgorithmType: "",
  enableLinkToLinkRouting: "",
  outputDirectory: "",
  runId: "",
  overwriteFiles: "",
  createGraphs: "",
  dumpDataAtEnd: "",
  writeEventsInterval: "",
  writePlansInterval: "",
  writeTripsInterval: "",
  snapshotFormat: "",
  writeSnapshotsInterval: "",
};
const defaultXml = `
	<module name="controler" >
		<!-- Compression algorithm to use when writing out data to files. Possible values: [none, gzip, lz4, zst] -->
		<param name="compressionType" value="gzip" />
		<!-- Sets whether graphs showing some analyses should automatically be generated during the simulation. The generation of graphs usually takes a small amount of time that does not have any weight in big simulations, but add a significant overhead in smaller runs or in test cases where the graphical output is not even requested. -->
		<param name="createGraphs" value="true" />
		<!-- true if at the end of a run, plans, network, config etc should be dumped to a file -->
		<param name="dumpDataAtEnd" value="true" />
		<!-- Default=false. If enabled, the router takes travel times needed for turning moves into account. Cannot be used if the (Fast)AStarLandmarks routing or TravelTimeCalculator.separateModes is enabled. -->
		<param name="enableLinkToLinkRouting" value="false" />
		<!-- Default=xml; Specifies the file format for writing events. Currently supported: [xml, pb, json]
		Multiple values can be specified separated by commas (','). -->
		<param name="eventsFileFormat" value="xml" />
		<!-- Default=0. First Iteration of a simulation. -->
		<param name="firstIteration" value="0" />
		<!-- Default=1000. Last Iteration of a simulation. -->
		<param name="lastIteration" value="1000" />
		<!-- Defines which mobility simulation will be used. Currently supported: qsim JDEQSim hermes 
		Depending on the chosen mobsim, you'll have to add additional config modules to configure the corresponding mobsim.
		For 'qsim', add a module 'qsim' to the config. -->
		<param name="mobsim" value="qsim" />
		<param name="outputDirectory" value="./output" />
		<!-- Possible values: failIfDirectoryExists, overwriteExistingFiles, deleteDirectoryIfExists -->
		<param name="overwriteFiles" value="failIfDirectoryExists" />
		<!-- The type of routing (least cost path) algorithm used, may have the values: [Dijkstra, AStarLandmarks, FastDijkstra, FastAStarLandmarks, SpeedyALT] -->
		<param name="routingAlgorithmType" value="AStarLandmarks" />
		<!-- An identifier for the current run which is used as prefix for output files and mentioned in output xml files etc. -->
		<param name="runId" value="null" />
		<!-- Comma-separated list of visualizer output file formats. 'transims', 'googleearth', and 'otfvis'. -->
		<param name="snapshotFormat" value="" />
		<!-- iterationNumber % writeEventsInterval == 0 defines in which iterations events are written to a file. '0' disables events writing completely. -->
		<param name="writeEventsInterval" value="50" />
		<!-- iterationNumber % writePlansInterval == 0 defines (hopefully) in which iterations plans are written to a file. '0' disables plans writing completely.  Some plans in early iterations are always written -->
		<param name="writePlansInterval" value="50" />
		<!-- iterationNumber % writeSnapshotsInterval == 0 defines in which iterations snapshots are written to a file. '0' disables snapshots writing completely -->
		<param name="writeSnapshotsInterval" value="1" />
		<!-- iterationNumber % writeEventsInterval == 0 defines in which iterations trips CSV are written to a file. '0' disables trips writing completely. -->
		<param name="writeTripsInterval" value="50" />
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
          name: "controler",
        },
        nodes: nodes,
      });
    },
    strToList: strToList,
    listToStr: listToStr,
  },
};
</script>

<style lang="scss" scoped>
.Controler {
}
</style>
