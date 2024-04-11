<template>
  <div class="ConfigItem col_1 VspExperimental">
    <div class="ConfigItem_title" :style="`color:#000;`" title="VspExperimental">VspExperimental</div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('isAbleToOverwritePtInteractionParams')">
          <el-switch v-model="form.isAbleToOverwritePtInteractionParams" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('isGeneratingBoardingDeniedEvent')">
          <el-switch v-model="form.isGeneratingBoardingDeniedEvent" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('isUsingOpportunityCostOfTimeForLocationChoice')">
          <el-switch v-model="form.isUsingOpportunityCostOfTimeForLocationChoice" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('logitScaleParamForPlansRemoval')">
          <el-input-number v-model="form.logitScaleParamForPlansRemoval" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('vspDefaultsCheckingLevel')">
          <el-select v-model="form.vspDefaultsCheckingLevel" clearable>
            <el-option :label="$l('ignore')" value="ignore" />
            <el-option :label="$l('info')" value="info" />
            <el-option :label="$l('warn')" value="warn" />
            <el-option :label="$l('abort')" value="abort" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('writingOutputEvents')">
          <el-switch v-model="form.writingOutputEvents" active-value="true" inactive-value="false" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "isAbleToOverwritePtInteractionParams": {
    "zh-CN":"isAbleToOverwritePtInteractionParams",
    "en-US":"isAbleToOverwritePtInteractionParams"
  },
  "isGeneratingBoardingDeniedEvent": {
    "zh-CN":"isGeneratingBoardingDeniedEvent",
    "en-US":"isGeneratingBoardingDeniedEvent"
  },
  "isUsingOpportunityCostOfTimeForLocationChoice": {
    "zh-CN":"isUsingOpportunityCostOfTimeForLocationChoice",
    "en-US":"isUsingOpportunityCostOfTimeForLocationChoice"
  },
  "logitScaleParamForPlansRemoval": {
    "zh-CN":"logitScaleParamForPlansRemoval",
    "en-US":"logitScaleParamForPlansRemoval"
  },
  "vspDefaultsCheckingLevel": {
    "zh-CN":"vspDefaultsCheckingLevel",
    "en-US":"vspDefaultsCheckingLevel"
  },
  "ignore": {
    "zh-CN":"ignore",
    "en-US":"ignore"
  },
  "info": {
    "zh-CN":"info",
    "en-US":"info"
  },
  "warn": {
    "zh-CN":"warn",
    "en-US":"warn"
  },
  "abort": {
    "zh-CN":"abort",
    "en-US":"abort"
  },
  "writingOutputEvents": {
    "zh-CN":"writingOutputEvents",
    "en-US":"writingOutputEvents"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  isAbleToOverwritePtInteractionParams: "",
  isGeneratingBoardingDeniedEvent: "",
  isUsingOpportunityCostOfTimeForLocationChoice: "",
  logitScaleParamForPlansRemoval: "",
  vspDefaultsCheckingLevel: "",
  writingOutputEvents: "",
};
const defaultXml = `
	<module name="vspExperimental" >
		<!-- (do not use except of you have to) There was a problem with pt interaction scoring.  Some people solved it by overwriting the parameters of the pt interaction activity type.  Doing this now throws an Exception.  If you still insist on doing this, set the following to true. -->
		<param name="isAbleToOverwritePtInteractionParams" value="false" />
		<param name="isGeneratingBoardingDeniedEvent" value="false" />
		<!-- if an approximation of the opportunity cost of time is included into the radius calculation for location choice.'true' will be faster, but it is an approximation.  Default is 'true'; 'false' is available for backwards compatibility. -->
		<param name="isUsingOpportunityCostOfTimeForLocationChoice" value="true" />
		<param name="logitScaleParamForPlansRemoval" value="1.0" />
		<!-- Options: | ignore | info | warn | abort | .  When violating VSP defaults, this results in nothing, logfile infos, logfile warnings, or aborts.  Members of VSP should use 'abort' or talk to kai. -->
		<param name="vspDefaultsCheckingLevel" value="ignore" />
		<!-- if true then writes output_events in output directory.  default is 'false'. Will only work when lastIteration is multiple of events writing interval -->
		<param name="writingOutputEvents" value="true" />
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
          name: "vspExperimental",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.VspExperimental {
}
</style>
