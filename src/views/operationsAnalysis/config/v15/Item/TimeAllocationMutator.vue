<template>
  <div class="ConfigItem col_1 TimeAllocationMutator">
    <div class="ConfigItem_title" :style="`color:#000;`" title="TimeAllocationMutator">
      TimeAllocationMutator
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('Mutation Affects Duration')">
          <el-switch v-model="form.mutationAffectsDuration" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('Mutation Range')">
          <el-input v-model="form.mutationRange" clearable />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "Mutation Affects Duration": {
    "zh-CN":"Mutation Affects Duration",
    "en-US":"Mutation Affects Duration"
  },
  "Mutation Range": {
    "zh-CN":"Mutation Range",
    "en-US":"Mutation Range"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  mutationAffectsDuration: "",
  mutationRange: "",
};
const defaultXml = `
	<module name="TimeAllocationMutator" >
		<!-- Default:true; Defines whether time mutation changes an activity's duration. -->
		<param name="mutationAffectsDuration" value="true" />
		<!-- Default:1800.0; Defines how many seconds a time mutation can maximally shift a time. -->
		<param name="mutationRange" value="1800.0" />
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
          name: "TimeAllocationMutator",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.TimeAllocationMutator {
}
</style>
