<template>
  <div class="ConfigItem col_1 SubtourModeChoice">
    <div class="ConfigItem_title" :style="`color:#000;`" title="SubtourModeChoice">
      SubtourModeChoice
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('Behavior')">
          <el-select v-model="form.behavior" clearable>
            <el-option :label="$l('fromAllModesToSpecifiedModes')" value="fromAllModesToSpecifiedModes" />
            <el-option :label="$l('fromSpecifiedModesToSpecifiedModes')" value="fromSpecifiedModesToSpecifiedModes" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('Chain Based Modes')">
          <Tags v-model="form.chainBasedModes" />
        </el-form-item>
        <el-form-item :label="$l('Consider Car Availability')">
          <el-switch v-model="form.considerCarAvailability" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('Modes')">
          <Tags v-model="form.modes" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "Behavior": {
    "zh-CN":"行为",
    "en-US":"Behavior"
  },
  "fromAllModesToSpecifiedModes": {
    "zh-CN":"从所有的方式到指定的出行方式",
    "en-US":"fromAllModesToSpecifiedModes"
  },
  "fromSpecifiedModesToSpecifiedModes": {
    "zh-CN":"从指定的到指定的出行方式",
    "en-US":"fromSpecifiedModesToSpecifiedModes"
  },
  "Chain Based Modes": {
    "zh-CN":"基于出行链的方式",
    "en-US":"Chain Based Modes"
  },
  "Consider Car Availability": {
    "zh-CN":"是否考虑出行者拥有私家车",
    "en-US":"Consider Car Availability"
  },
  "Modes": {
    "zh-CN":"出行方式",
    "en-US":"Modes"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  behavior: "",
  chainBasedModes: "",
  considerCarAvailability: "",
  modes: "",
};
const defaultXml = `
	<module name="subtourModeChoice" >
		<!-- Only for backwards compatibility.  Defines if only trips from modes list should change mode, or all trips.  Options: fromAllModesToSpecifiedModes fromSpecifiedModesToSpecifiedModes  -->
		<param name="behavior" value="fromSpecifiedModesToSpecifiedModes" />
		<!-- Defines the chain-based modes, seperated by commas -->
		<param name="chainBasedModes" value="car,bike" />
		<!-- Defines whether car availability must be considered or not. A agent has no car only if it has no license, or never access to a car -->
		<param name="considerCarAvailability" value="false" />
		<!-- Defines all the modes available, including chain-based modes, seperated by commas -->
		<param name="modes" value="car,pt,bike,walk" />
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
          name: "subtourModeChoice",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.SubtourModeChoice {
}
</style>
