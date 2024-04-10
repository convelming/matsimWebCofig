<template>
  <div class="ConfigItem col_1 ChangeMode">
    <div class="ConfigItem_title" :style="`color:#000;`" title="ChangeMode" >ChangeMode</div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('ignoreCarAvailability')">
          <el-switch v-model="form.ignoreCarAvailability" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('modeSwitchBehavior')">
          <el-radio-group class="col" v-model="form.modeSwitchBehavior">
            <el-radio label="fromAllModesToSpecifiedModes">{{ $l("fromAllModesToSpecifiedModes") }}</el-radio>
            <el-radio label="fromSpecifiedModesToSpecifiedModes">{{ $l("fromSpecifiedModesToSpecifiedModes") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$l('modes')">
          <Tags v-model="form.modes" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "ignoreCarAvailability": {
    "zh-CN": "忽略是否可以使用私家车",
    "en-US": "Ignore Car Availability"
  },
  "ignoreCarAvailabilityHelp": {
  "zh-CN": "如果忽略，则方式选择时默认可选私家车出行",
  "en-US": "if ignore, every can choose car as travel mode"
  },
  "modeSwitchBehavior": {
    "zh-CN": "出行方式选择行为",
    "en-US": "Mode Switch Behavior"
  },
  "modeSwitchBehaviorHelp": {
  "zh-CN": "出行方式变化的选择策略",
  "en-US": "Mode Switch Behavior"
  },
  "fromAllModesToSpecifiedModes": {
    "zh-CN": "从所有方式到指定的方式",
    "en-US": "fromAllModesToSpecifiedModes"
  },
  "fromSpecifiedModesToSpecifiedModes": {
    "zh-CN": "从指定的方式到指定的方式",
    "en-US": "fromSpecifiedModesToSpecifiedModes"
  },
  "modes": {
    "zh-CN": "出行方式",
    "en-US": "Modes"
  },
  "modesHelp": {
  "zh-CN": "默认的出行方式有car，pt，walk，ride，其他出行方式要自定义",
  "en-US": "by default, only car, pt, walk and ride are allowed, other modes need to be configured in other modules!!"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  ignoreCarAvailability: "",
  modeSwitchBehavior: "",
  modes: "",
};
const defaultXml = `
	<module name="changeMode" >
		<!-- Defines whether car availability is considered be considered or not. An agent has no car only if it has no license, or never access to a car. Default: true -->
		<param name="ignoreCarAvailability" value="true" />
		<!-- Defines the mode switch behavior. Possible values [fromAllModesToSpecifiedModes, fromSpecifiedModesToSpecifiedModes] Default: fromSpecifiedModesToSpecifiedModes. -->
		<param name="modeSwitchBehavior" value="fromSpecifiedModesToSpecifiedModes" />
		<!-- Defines all the modes available, including chain-based modes, seperated by commas -->
		<param name="modes" value="car,pt" />
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
          name: "changeMode",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ChangeMode {
}
</style>
