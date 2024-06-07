<template>
  <div class="ConfigItem col_1 Vehicles">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Vehicles">Vehicles</div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('vehiclesFile')">
          <el-input v-model="form.vehiclesFile" clearable />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "vehiclesFile": {
    "zh-CN":"车辆文件的路径",
    "en-US":"vehiclesFile"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  vehiclesFile: "",
};
const defaultXml = `
	<module name="vehicles" >
		<param name="vehiclesFile" value="null" />
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
          name: "vehicles",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Vehicles {
}
</style>
