<template>
  <div class="ConfigItem col_1 TransitRouter">
    <div class="ConfigItem_title" :style="`color:#000;`" title="TransitRouter">
      TransitRouter
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('additionalTransferTime')">
          <el-input-number v-model="form.additionalTransferTime" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('directWalkFactor')">
          <el-input-number v-model="form.directWalkFactor" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('extensionRadius')">
          <el-input-number v-model="form.extensionRadius" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('maxBeelineWalkConnectionDistance')">
          <el-input-number v-model="form.maxBeelineWalkConnectionDistance" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('searchRadius')">
          <el-input-number v-model="form.searchRadius" :step="0.1" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "additionalTransferTime": {
    "zh-CN":"additionalTransferTime",
    "en-US":"additionalTransferTime"
  },
  "directWalkFactor": {
    "zh-CN":"directWalkFactor",
    "en-US":"directWalkFactor"
  },
  "extensionRadius": {
    "zh-CN":"extensionRadius",
    "en-US":"extensionRadius"
  },
  "maxBeelineWalkConnectionDistance": {
    "zh-CN":"maxBeelineWalkConnectionDistance",
    "en-US":"maxBeelineWalkConnectionDistance"
  },
  "searchRadius": {
    "zh-CN":"searchRadius",
    "en-US":"searchRadius"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  additionalTransferTime: "",
  directWalkFactor: "",
  extensionRadius: "",
  maxBeelineWalkConnectionDistance: "",
  searchRadius: "",
};
const defaultXml = `
	<module name="transitRouter" >
		<!-- additional time the router allocates when a line switch happens. Can be interpreted as a 'safety' time that agents need to safely transfer from one line to another -->
		<param name="additionalTransferTime" value="0.0" />
		<!-- Factor with which direct walk generalized cost is multiplied before it is compared to the pt generalized cost.  Set to a very high value to reduce direct walk results. -->
		<param name="directWalkFactor" value="1.0" />
		<!-- step size to increase searchRadius if no stops are found -->
		<param name="extensionRadius" value="200.0" />
		<!-- maximum beeline distance between stops that agents could transfer to by walking -->
		<param name="maxBeelineWalkConnectionDistance" value="100.0" />
		<!-- the radius in which stop locations are searched, given a start or target coordinate -->
		<param name="searchRadius" value="1000.0" />
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
          name: "transitRouter",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.TransitRouter {
}
</style>
