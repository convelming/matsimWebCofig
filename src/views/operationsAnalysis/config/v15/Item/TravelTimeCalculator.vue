<template>
  <div class="ConfigItem col_1 TravelTimeCalculator">
    <div class="ConfigItem_title" :style="`color:#000;`" title="TravelTimeCalculator">
      TravelTimeCalculator
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('analyzedModes')">
          <el-input v-model="form.analyzedModes" clearable />
        </el-form-item>
        <el-form-item :label="$l('calculateLinkToLinkTravelTimes')">
          <el-switch v-model="form.calculateLinkToLinkTravelTimes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('calculateLinkTravelTimes')">
          <el-switch v-model="form.calculateLinkTravelTimes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('filterModes')">
          <el-switch v-model="form.filterModes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('maxTime')">
          <el-input-number v-model="form.maxTime" :step="1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('separateModes')">
          <el-switch v-model="form.separateModes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('travelTimeAggregator')">
          <el-select v-model="form.travelTimeAggregator" clearable>
            <el-option :label="$l('optimistic')" value="optimistic" />
            <el-option :label="$l('experimental_LastMile')" value="experimental_LastMile" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('travelTimeBinSize')">
          <el-input-number v-model="form.travelTimeBinSize" :step="1" :min="0" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('travelTimeCalculator')">
          <el-select v-model="form.travelTimeCalculator" clearable>
            <el-option :label="$l('TravelTimeCalculatorArray')" value="TravelTimeCalculatorArray" />
            <el-option :label="$l('TravelTimeCalculatorHashMap')" value="TravelTimeCalculatorHashMap" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('travelTimeGetter')">
          <el-select v-model="form.travelTimeGetter" clearable>
            <el-option :label="$l('average')" value="average" />
            <el-option :label="$l('linearinterpolation')" value="linearinterpolation" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "analyzedModes": {
    "zh-CN":"analyzedModes",
    "en-US":"analyzedModes"
  },
  "calculateLinkToLinkTravelTimes": {
    "zh-CN":"calculateLinkToLinkTravelTimes",
    "en-US":"calculateLinkToLinkTravelTimes"
  },
  "calculateLinkTravelTimes": {
    "zh-CN":"calculateLinkTravelTimes",
    "en-US":"calculateLinkTravelTimes"
  },
  "filterModes": {
    "zh-CN":"filterModes",
    "en-US":"filterModes"
  },
  "maxTime": {
    "zh-CN":"maxTime",
    "en-US":"maxTime"
  },
  "separateModes": {
    "zh-CN":"separateModes",
    "en-US":"separateModes"
  },
  "travelTimeAggregator": {
    "zh-CN":"travelTimeAggregator",
    "en-US":"travelTimeAggregator"
  },
  "optimistic": {
    "zh-CN":"optimistic",
    "en-US":"optimistic"
  },
  "experimental_LastMile": {
    "zh-CN":"experimental_LastMile",
    "en-US":"experimental_LastMile"
  },
  "travelTimeBinSize": {
    "zh-CN":"travelTimeBinSize",
    "en-US":"travelTimeBinSize"
  },
  "travelTimeCalculator": {
    "zh-CN":"travelTimeCalculator",
    "en-US":"travelTimeCalculator"
  },
  "TravelTimeCalculatorArray": {
    "zh-CN":"TravelTimeCalculatorArray",
    "en-US":"TravelTimeCalculatorArray"
  },
  "TravelTimeCalculatorHashMap": {
    "zh-CN":"TravelTimeCalculatorHashMap",
    "en-US":"TravelTimeCalculatorHashMap"
  },
  "travelTimeGetter": {
    "zh-CN":"travelTimeGetter",
    "en-US":"travelTimeGetter"
  },
  "average": {
    "zh-CN":"average",
    "en-US":"average"
  },
  "linearinterpolation": {
    "zh-CN":"linearinterpolation",
    "en-US":"linearinterpolation"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  analyzedModes: "",
  calculateLinkToLinkTravelTimes: "",
  calculateLinkTravelTimes: "",
  filterModes: "",
  maxTime: "",
  separateModes: "",
  travelTimeAggregator: "",
  travelTimeBinSize: "",
  travelTimeCalculator: "",
  travelTimeGetter: "",
};
const defaultXml = `
	<module name="travelTimeCalculator" >
		<!-- (only for backwards compatibility; only used if separateModes==false && + filterModes==true)  Transport modes that will be respected by the travel time collector. 'car' is default which includes also buses from the pt simulation module. -->
		<param name="analyzedModes" value="car" />
		<param name="calculateLinkToLinkTravelTimes" value="false" />
		<param name="calculateLinkTravelTimes" value="true" />
		<!-- (only for backwards compatiblity; only used if separateModes==false)  Only modes included in analyzedModes are included. -->
		<param name="filterModes" value="false" />
		<!-- The lenght (in sec) of the time period that is splited into time bins; an additional time bin is created to aggregate all travel times collected after maxTime -->
		<param name="maxTime" value="108000" />
		<!-- (only for backwards compatibility) If false, link travel times are measured and aggregated over all vehicles using the link. -->
		<param name="separateModes" value="true" />
		<!-- How to deal with congested time bins that have no link entry events. 'optimistic' assumes free speed (too optimistic); 'experimental_LastMile' is experimental and probably too pessimistic. -->
		<param name="travelTimeAggregator" value="optimistic" />
		<!-- The size of the time bin (in sec) into which the link travel times are aggregated for the router -->
		<param name="travelTimeBinSize" value="900" />
		<!-- possible values: TravelTimeCalculatorArray TravelTimeCalculatorHashMap  -->
		<param name="travelTimeCalculator" value="TravelTimeCalculatorArray" />
		<!-- How to deal with link entry times at different positions during the time bin. Currently supported: average, linearinterpolation -->
		<param name="travelTimeGetter" value="average" />
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
          name: "travelTimeCalculator",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.TravelTimeCalculator {
}
</style>
