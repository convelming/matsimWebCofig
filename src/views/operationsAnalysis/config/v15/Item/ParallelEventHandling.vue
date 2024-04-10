<template>
  <div class="ConfigItem col_1 ParallelEventHandling">
    <div class="ConfigItem_title" :style="`color:#000;`" title="ParallelEventHandling">
      ParallelEventHandling
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('estimatedNumberOfEvents')">
          <el-input v-model="form.estimatedNumberOfEvents" clearable />
        </el-form-item>
        <el-form-item :label="$l('eventsQueueSize')">
          <el-input-number v-model="form.eventsQueueSize" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('numberOfThreads')">
          <el-input v-model="form.numberOfThreads" clearable />
        </el-form-item>
        <el-form-item :label="$l('oneThreadPerHandler')">
          <el-switch v-model="form.oneThreadPerHandler" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('synchronizeOnSimSteps')">
          <el-switch v-model="form.synchronizeOnSimSteps" active-value="true" inactive-value="false" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "estimatedNumberOfEvents": {
    "zh-CN":"estimatedNumberOfEvents",
    "en-US":"estimatedNumberOfEvents"
  },
  "eventsQueueSize": {
    "zh-CN":"eventsQueueSize",
    "en-US":"eventsQueueSize"
  },
  "numberOfThreads": {
    "zh-CN":"numberOfThreads",
    "en-US":"numberOfThreads"
  },
  "oneThreadPerHandler": {
    "zh-CN":"oneThreadPerHandler",
    "en-US":"oneThreadPerHandler"
  },
  "synchronizeOnSimSteps": {
    "zh-CN":"synchronizeOnSimSteps",
    "en-US":"synchronizeOnSimSteps"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  estimatedNumberOfEvents: "",
  eventsQueueSize: "",
  numberOfThreads: "",
  oneThreadPerHandler: "",
  synchronizeOnSimSteps: "",
};
const defaultXml = `
	<module name="parallelEventHandling" >
		<!-- Estimated number of events during mobsim run. An optional optimization hint for the framework. -->
		<param name="estimatedNumberOfEvents" value="null" />
		<!-- Size of the events Queue. Increase for very large scenarios -->
		<param name="eventsQueueSize" value="131072" />
		<!-- Number of threads for parallel events handler. _null_ means the framework decides by itself. 0 is currently not possible. -->
		<param name="numberOfThreads" value="null" />
		<!-- If enabled, each event handler is assigned to its own thread. Note that enabling this feature disabled the numberOfThreads option! This feature is still experimental! -->
		<param name="oneThreadPerHandler" value="false" />
		<!-- If enabled, it is ensured that all events that are created during a time step of the mobility simulation are processed before the next time step is simulated. E.g. neccessary when within-day replanning is used. -->
		<param name="synchronizeOnSimSteps" value="true" />
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
          name: "parallelEventHandling",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ParallelEventHandling {
}
</style>
