<template>
  <div class="ConfigItem col_1 LinkStats">
    <div class="ConfigItem_title" :style="`color:#000;`" title="LinkStats">
      LinkStats
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('averageLinkStatsOverIterations')">
          <el-input-number v-model="form.averageLinkStatsOverIterations" :step="1" step-strictly controls-position="right" />
        </el-form-item>
        <el-form-item :label="$l('writeLinkStatsInterval')">
          <el-input-number v-model="form.writeLinkStatsInterval" :step="1" step-strictly controls-position="right" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "averageLinkStatsOverIterations": {
    "zh-CN":"计算路段状况所使用的迭代次数",
    "en-US":"averageLinkStatsOverIterations"
  },
  "writeLinkStatsInterval": {
    "zh-CN":"保存路段状况的迭代间隔",
    "en-US":"writeLinkStatsInterval"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  averageLinkStatsOverIterations: "",
  writeLinkStatsInterval: "",
};
const defaultXml = `
	<module name="linkStats" >
		<!-- Specifies over how many iterations the link volumes should be averaged that are used for the link statistics. Use 1 or 0 to only use the link volumes of a single iteration. This values cannot be larger than the value specified for writeLinkStatsInterval -->
		<param name="averageLinkStatsOverIterations" value="5" />
		<!-- Specifies how often the link stats should be calculated and written. Use 0 to disable the generation of link stats. -->
		<param name="writeLinkStatsInterval" value="50" />
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
          name: "linkStats",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.LinkStats {
}
</style>
