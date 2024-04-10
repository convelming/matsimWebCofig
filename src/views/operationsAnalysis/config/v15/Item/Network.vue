<template>
  <div class="ConfigItem col_1 Network">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Network">
      Network
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('输入文件坐标系')">
          <el-input v-model="form.inputCRS" clearable />
        </el-form-item>
        <el-form-item :label="$l('输入路网文件')">
          <el-input v-model="form.inputNetworkFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('车道定义文件')">
          <el-input v-model="form.laneDefinitionsFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('是否为时变网络')">
          <el-switch v-model="form.timeVariantNetwork" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('输入变更事件文件')">
          <el-input v-model="form.inputChangeEventsFile" clearable />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "输入文件坐标系": {
    "zh-CN":"输入文件坐标系",
    "en-US":"输入文件坐标系"
  },
  "输入路网文件": {
    "zh-CN":"输入路网文件",
    "en-US":"输入路网文件"
  },
  "车道定义文件": {
    "zh-CN":"车道定义文件",
    "en-US":"车道定义文件"
  },
  "是否为时变网络": {
    "zh-CN":"是否为时变网络",
    "en-US":"是否为时变网络"
  },
  "输入变更事件文件": {
    "zh-CN":"输入变更事件文件",
    "en-US":"输入变更事件文件"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  inputCRS: "",
  inputChangeEventsFile: "",
  inputNetworkFile: "",
  laneDefinitionsFile: "",
  timeVariantNetwork: "",
};
const defaultXml = `
	<module name="network" >
		<!-- The Coordinates Reference System in which the coordinates are expressed in the input file. At import, the coordinates will be converted to the coordinate system defined in "global", and willbe converted back at export. If not specified, no conversion happens. -->
		<param name="inputCRS" value="null" />
		<param name="inputChangeEventsFile" value="null" />
		<param name="inputNetworkFile" value="null" />
		<param name="laneDefinitionsFile" value="null" />
		<param name="timeVariantNetwork" value="false" />
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
          name: "network",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Network {
}
</style>
