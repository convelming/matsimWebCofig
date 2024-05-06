<template>
  <div class="ConfigItem col_2 Strategy">
    <div class="ConfigItem_title" :style="`color:#000;`" title="Strategy">Strategy</div>
    <div class="ConfigItem_bodyer">
      <el-form class="scroll_y" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$l('ExternalExeConfigTemplate')">
              <el-input v-model="form.ExternalExeConfigTemplate" clearable />
            </el-form-item>
            <el-form-item :label="$l('ExternalExeTimeOut')">
              <el-input-number v-model="form.ExternalExeTimeOut" :min="0" :step="1" step-strictly controls-position="right" />
            </el-form-item>
            <el-form-item :label="$l('ExternalExeTmpFileRootDir')">
              <el-input v-model="form.ExternalExeTmpFileRootDir" clearable />
            </el-form-item>

            <el-form-item>
              <div class="collapse">
                <div class="collapse_add_btn" @click="handleAddInnovation">
                  <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                  <span>{{ $l("Parametersets: Innovation") }}</span>
                </div>
                <div class="collapse_list">
                  <div class="collapse_item" v-for="(item, index) in form.Innovation" :key="item.uuid">
                    <div class="collapse_item_title" :class="{ open: item.open }" @click="item.open = !item.open">
                      <div class="el-icon-arrow-right"></div>
                      <div class="text">{{ `${$l(item.type)} ${index}` }}</div>
                      <div class="el-icon-delete" @click.stop="handleDeleteInnovation(item.uuid)"></div>
                    </div>
                    <el-collapse-transition>
                      <div class="collapse_item_content" v-show="item.open">
                        <el-form-item :label="$l('strategyName')">
                          <el-input v-model="item.strategyName" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('weight')">
                          <el-input v-model="item.weight" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('subpopulation')">
                          <el-input v-model="item.subpopulation" clearable></el-input>
                        </el-form-item>
                      </div>
                    </el-collapse-transition>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$l('fractionOfIterationsToDisableInnovation')">
              <el-input-number v-model="form.fractionOfIterationsToDisableInnovation" :min="0" :max="1" :step="0.1" controls-position="right" />
            </el-form-item>
            <el-form-item :label="$l('maxAgentPlanMemorySize')">
              <el-input-number v-model="form.maxAgentPlanMemorySize" :min="0" :step="1" step-strictly controls-position="right" />
            </el-form-item>
            <el-form-item :label="$l('planSelectorForRemoval')">
              <el-select v-model="form.planSelectorForRemoval" clearable>
                <el-option :label="$l('WorstPlanSelector')" value="WorstPlanSelector" />
                <el-option :label="$l('SelectRandom')" value="SelectRandom" />
                <el-option :label="$l('SelectExpBetaforRemoval')" value="SelectExpBetaforRemoval" />
                <el-option :label="$l('ChangeExpBetaForRemoval')" value="ChangeExpBetaForRemoval" />
                <el-option :label="$l('PathSizeLogitSelectorForRemoval')" value="PathSizeLogitSelectorForRemoval" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="collapse">
                <div class="collapse_add_btn" @click="handleAddSelection">
                  <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                  <span>{{ $l("Parametersets: Selection") }}</span>
                </div>
                <div class="collapse_list">
                  <div class="collapse_item" v-for="(item, index) in form.Selection" :key="item.uuid">
                    <div class="collapse_item_title" :class="{ open: item.open }" @click="item.open = !item.open">
                      <div class="el-icon-arrow-right"></div>
                      <div class="text">{{ `${$l(item.type)} ${index}` }}</div>
                      <div class="el-icon-delete" @click.stop="handleDeleteSelection(item.uuid)"></div>
                    </div>
                    <el-collapse-transition>
                      <div class="collapse_item_content" v-show="item.open">
                        <el-form-item :label="$l('strategyName')">
                          <el-input v-model="item.strategyName" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('weight')">
                          <el-input v-model="item.weight" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('subpopulation')">
                          <el-input v-model="item.subpopulation" clearable></el-input>
                        </el-form-item>
                      </div>
                    </el-collapse-transition>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "ExternalExeConfigTemplate": {
    "zh-CN":"外部执行文件的模板",
    "en-US":"ExternalExeConfigTemplate"
  },
  "ExternalExeTimeOut": {
    "zh-CN":"外部执行文件响应时间阈值",
    "en-US":"ExternalExeTimeOut"
  },
  "ExternalExeTmpFileRootDir": {
    "zh-CN":"外部可执行文件生成的临时文件夹路径",
    "en-US":"ExternalExeTmpFileRootDir"
  },
  "Parametersets: Innovation": {
    "zh-CN":"Parametersets: Innovation",
    "en-US":"Parametersets: Innovation"
  },
  "Innovation": {
    "zh-CN":"Innovation",
    "en-US":"Innovation"
  },
  "strategyName": {
    "zh-CN":"策略名称",
    "en-US":"strategyName"
  },
  "weight": {
    "zh-CN":"比重",
    "en-US":"weight"
  },
  "subpopulation": {
    "zh-CN":"subpopulation",
    "en-US":"subpopulation"
  },
  "fractionOfIterationsToDisableInnovation": {
    "zh-CN":"计划选取策略重新计算比例",
    "en-US":"fractionOfIterationsToDisableInnovation"
  },
  "maxAgentPlanMemorySize": {
    "zh-CN":"最大出行总计划数",
    "en-US":"maxAgentPlanMemorySize"
  },
  "planSelectorForRemoval": {
    "zh-CN":"筛除多余计划策略",
    "en-US":"planSelectorForRemoval"
  },
  "WorstPlanSelector": {
    "zh-CN":"WorstPlanSelector",
    "en-US":"WorstPlanSelector"
  },
  "SelectRandom": {
    "zh-CN":"SelectRandom",
    "en-US":"SelectRandom"
  },
  "SelectExpBetaforRemoval": {
    "zh-CN":"SelectExpBetaforRemoval",
    "en-US":"SelectExpBetaforRemoval"
  },
  "ChangeExpBetaForRemoval": {
    "zh-CN":"ChangeExpBetaForRemoval",
    "en-US":"ChangeExpBetaForRemoval"
  },
  "PathSizeLogitSelectorForRemoval": {
    "zh-CN":"PathSizeLogitSelectorForRemoval",
    "en-US":"PathSizeLogitSelectorForRemoval"
  },
  "Parametersets: Selection": {
    "zh-CN":"选择参数集",
    "en-US":"Parametersets: Selection"
  },
  "Selection": {
    "zh-CN":"出行计划选择策略",
    "en-US":"Selection"
  },
  "strategyName": {
    "zh-CN":"策略名称",
    "en-US":"strategyName"
  },
  "比重": {
    "zh-CN":"比重",
    "en-US":"weight"
  },
  "subpopulation": {
    "zh-CN":"子出行群体ID",
    "en-US":"subpopulation"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  ExternalExeConfigTemplate: "",
  ExternalExeTimeOut: "",
  ExternalExeTmpFileRootDir: "",
  fractionOfIterationsToDisableInnovation: "",
  maxAgentPlanMemorySize: "",
  planSelectorForRemoval: "",
  Innovation: [],
  Selection: [],
};
const defaultXml = `
	<module name="strategy" >
		<!-- the external executable will be called with a config file as argument.  This is the pathname to a possible skeleton config, to which additional information will be added.  Can be null. -->
		<param name="ExternalExeConfigTemplate" value="null" />
		<!-- time out value (in seconds) after which matsim will consider the external strategy as failed -->
		<param name="ExternalExeTimeOut" value="3600" />
		<!-- root directory for temporary files generated by the external executable. Provided as a service; I don't think this is used by MATSim. -->
		<param name="ExternalExeTmpFileRootDir" value="null" />
		<!-- fraction of iterations where innovative strategies are switched off.  Something like 0.8 should be good.  E.g. if you run from iteration 400 to iteration 500, innovation is switched off at iteration 480 -->
		<param name="fractionOfIterationsToDisableInnovation" value="Infinity" />
		<!-- maximum number of plans per agent.  ''0'' means ''infinity''.  Currently (2010), ''5'' is a good number -->
		<param name="maxAgentPlanMemorySize" value="5" />
		<!-- strategyName of PlanSelector for plans removal.  Possible defaults: WorstPlanSelector SelectRandom SelectExpBetaForRemoval ChangeExpBetaForRemoval PathSizeLogitSelectorForRemoval . The current default, WorstPlanSelector is not a good choice from a discrete choice theoretical perspective. Alternatives, however, have not been systematically tested. kai, feb'12 -->
		<param name="planSelectorForRemoval" value="WorstPlanSelector" />
    <parameterset type="strategysettings">			
      <!-- iteration after which strategy will be disabled.  most
      useful for ''innovative'' strategies (new routes, new times, ...). Normally, better use
      fractionOfIterationsToDisableInnovation -->
      <param name="disableAfterIteration" value="-1" />			<!-- path to external executable (if
      applicable) -->
      <param name="executionPath" value="null" />			<!-- strategyName of strategy.  Possible default
      names: SelectRandom BestScore KeepLastSelected ChangeExpBeta SelectExpBeta SelectPathSizeLogit
      (selectors),
      ReRouteTimeAllocationMutatorTimeAllocationMutator_ReRouteChangeSingleTripModeChangeTripModeSubtourModeChoice
      (innovative strategies). -->
      <param name="strategyName" value="ChangeTripMode" />			<!-- subpopulation to which the strategy
      applies. "null" refers to the default population, that is, the set of persons for which no
      explicit subpopulation is defined (ie no subpopulation attribute) -->
      <param name="subpopulation" value="null" />			<!-- weight of a strategy: for each agent, a
      strategy will be selected with a probability proportional to its weight -->
      <param name="weight" value="0.6" />
    </parameterset>
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
      function getInnovationAndSelection(node) {
        const obj = {
          uuid: guid(),
          open: false,
        };
        for (const { attrs } of node.nodes) {
          obj[attrs.name] = attrs.value;
        }
        return obj;
      }
      const nodes = json.nodes[0].nodes;
      for (const node of nodes) {
        if (node.name == "param") {
          form[node.attrs.name] = node.attrs.value;
        } else if (node.name == "parameterset") {
          const item = getInnovationAndSelection(node);
          switch (item.strategyName) {
            case "TimeAllocationMutato":
            case "ReRoute":
            case "ChangeTripMode":
            case "ChangeSingleTripMode":
            case "TripSubtourModeChoice":
              item.index = form.Innovation.length + 1;
              item.name = item.index;
              item.type = "Innovation";
              form.Innovation.push(item);
              break;
            case "KeepLastSelected":
            case "BestScore":
            case "SelectExpBeta":
            case "ChangeExpBeta":
            case "SelectPathSizeLogit":
            case "SelectRandom":
              item.index = form.Selection.length + 1;
              item.name = item.index;
              item.type = "Selection";
              form.Selection.push(item);
              break;
          }
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

      function mapFunc(v) {
        const nodes = ["strategyName", "weight", "subpopulation"];
        return {
          name: "parameterset",
          attrs: {
            type: "strategysettings",
          },
          nodes: nodes
            .filter((v2) => v[v2] !== "" && v[v2] !== null && v[v2] !== "null")
            .map((v2) => ({
              name: "param",
              attrs: { name: v2, value: v[v2] },
            })),
        };
      }
      nodes.push(...Innovation.map(mapFunc));
      nodes.push(...Selection.map(mapFunc));
      return jsonToXml({
        name: "module",
        attrs: {
          name: "strategy",
        },
        nodes: nodes,
      });
    },
    handleAddInnovation() {
      let index = this.form.Innovation.length > 0 ? this.form.Innovation[this.form.Innovation.length - 1].index + 1 : 1;
      this.form.Innovation.push({
        open: false,
        name: index,
        index: index,
        type: "Innovation",
        uuid: guid(),
        strategyName: "",
        weight: 0.1,
        subpopulation: "null",
      });
    },
    handleDeleteInnovation(uuid) {
      let index = this.form.Innovation.findIndex((item) => item.uuid === uuid);
      if (index >= 0) this.form.Innovation.splice(index, 1);
    },
    handleAddSelection() {
      let index = this.form.Selection.length > 0 ? this.form.Selection[this.form.Selection.length - 1].index + 1 : 1;
      this.form.Selection.push({
        open: false,
        name: index,
        index: index,
        type: "Selection",
        uuid: guid(),
        strategyName: "",
        weight: 0.1,
        subpopulation: "null",
      });
    },
    handleDeleteSelection(uuid) {
      let index = this.form.Selection.findIndex((item) => item.uuid === uuid);
      if (index >= 0) this.form.Selection.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.Strategy {
  .box {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    justify-content: space-between;
    .el-form {
      width: 48%;
    }
  }
}
</style>
