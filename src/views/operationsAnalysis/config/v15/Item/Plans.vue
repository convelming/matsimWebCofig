<template>
  <div class="ConfigItem col_1 Plans">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Plans">
      Plans
    </div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-form-item :label="$l('输入文件坐标系')">
          <el-input v-model="form.inputCRS" clearable />
        </el-form-item>
        <el-form-item :label="$l('输入计划文件')">
          <el-input v-model="form.inputPlansFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('输入人员属性文件')">
          <el-input v-model="form.inputPersonAttributesFile" clearable />
        </el-form-item>
        <el-form-item :label="$l('路网路由类型')">
          <el-select v-model="form.networkRouteType" clearable>
            <el-option :label="$l('LinkNetworkRoute')" value="LinkNetworkRoute" />
            <el-option :label="$l('CompressedNetworkRoute')" value="CompressedNetworkRoute" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('处理没有路由的计划')">
          <el-select v-model="form.handlingOfPlansWithoutRoutingMode" clearable>
            <el-option :label="$l('丢弃')" value="reject" />
            <el-option :label="$l('使用主模式来填充')" value="useMainModeldentifier" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('删除未使用计划的属性')">
          <el-switch v-model="form.removingUnnecessaryPlanAttributes" active-value="true" inactive-value="false" />
        </el-form-item>
        <el-form-item :label="$l('行程持续时间')">
          <el-select v-model="form.tripDurationHandling" clearable>
            <el-option :label="$l('忽略延误，出发时间始终基于计划的上一活动的结束时间')" value="ignoreDelays" />
            <el-option :label="$l('延迟活动结束时间')" value="shiftActivityEndTimes" />
          </el-select>
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
  "输入计划文件": {
    "zh-CN":"输入计划文件",
    "en-US":"输入计划文件"
  },
  "输入人员属性文件": {
    "zh-CN":"输入人员属性文件",
    "en-US":"输入人员属性文件"
  },
  "路网路由类型": {
    "zh-CN":"路网路由类型",
    "en-US":"路网路由类型"
  },
  "LinkNetworkRoute": {
    "zh-CN":"LinkNetworkRoute",
    "en-US":"LinkNetworkRoute"
  },
  "CompressedNetworkRoute": {
    "zh-CN":"CompressedNetworkRoute",
    "en-US":"CompressedNetworkRoute"
  },
  "处理没有路由的计划": {
    "zh-CN":"处理没有路由的计划",
    "en-US":"处理没有路由的计划"
  },
  "丢弃": {
    "zh-CN":"丢弃",
    "en-US":"丢弃"
  },
  "使用主模式来填充": {
    "zh-CN":"使用主模式来填充",
    "en-US":"使用主模式来填充"
  },
  "删除未使用计划的属性": {
    "zh-CN":"删除未使用计划的属性",
    "en-US":"删除未使用计划的属性"
  },
  "行程持续时间": {
    "zh-CN":"行程持续时间",
    "en-US":"行程持续时间"
  },
  "忽略延误，出发时间始终基于计划的上一活动的结束时间": {
    "zh-CN":"忽略延误，出发时间始终基于计划的上一活动的结束时间",
    "en-US":"忽略延误，出发时间始终基于计划的上一活动的结束时间"
  },
  "延迟活动结束时间": {
    "zh-CN":"延迟活动结束时间",
    "en-US":"延迟活动结束时间"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  inputCRS: "",
  inputPlansFile: "",
  inputPersonAttributesFile: "",
  networkRouteType: "",
  handlingOfPlansWithoutRoutingMode: "",
  removingUnnecessaryPlanAttributes: "",
  tripDurationHandling: "",
};
const defaultXml = `
<module name="plans">
  <!-- 输入文件坐标系 -->
  <param name="inputCRS" value="null"/>
  <!-- 输入计划文件 -->
  <param name="inputPlansFile" value="null"/>
  <!-- 输入人员属性文件 -->
  <param name="inputPersonAttributesFile" value="null"/>
  <!-- 路网路由类型 -->
  <param name="networkRouteType" value="LinkNetworkRoute"/>
  <!-- 处理没有路由的计划 -->
  <param name="handlingOfPlansWithoutRoutingMode" value="reject"/>
  <!-- 删除未使用计划的属性 -->
  <param name="removingUnnecessaryPlanAttributes" value="false"/>
  <!-- 行程持续时间 -->
  <param name="tripDurationHandling" value="ignoreDelays"/>
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
      form: {
        Innovation: [],
        Selection: [],
      },
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
          name: "plans",
        },
        nodes: nodes,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.Plans {
}
</style>
