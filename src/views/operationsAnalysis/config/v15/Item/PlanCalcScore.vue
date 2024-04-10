<template>
  <div class="ConfigItem col_2 PlanCalcScore">
    <div class="ConfigItem_title" :style="`color:#000;`" title="PlanCalcScore">PlanCalcScore</div>
    <div class="ConfigItem_bodyer">
      <el-form label-position="top">
        <el-row :gutter="20">
          <el-col :span="12" style="height: 100%">
            <div class="scroll_y">
              <el-form-item :label="$l('BrainExpBeta')">
                <el-input-number v-model="form.BrainExpBeta" :min="0" :step="0.1" controls-position="right" />
              </el-form-item>
              <el-form-item :label="$l('PathSizeLogitBeta')">
                <el-input-number v-model="form.PathSizeLogitBeta" :min="0" :step="0.1" controls-position="right" />
              </el-form-item>
              <el-form-item :label="$l('fractionOfIterationsToStartScoreMSA')">
                <el-input v-model="form.fractionOfIterationsToStartScoreMSA" clearable />
              </el-form-item>
              <el-form-item :label="$l('learningRate')">
                <el-input-number v-model="form.learningRate" :min="0" :step="0.1" controls-position="right" />
              </el-form-item>
              <el-form-item :label="$l('usingOldScoringBelowZeroUtilityDuration')">
                <el-switch v-model="form.usingOldScoringBelowZeroUtilityDuration" active-value="true" inactive-value="false" />
              </el-form-item>
              <el-form-item :label="$l('writeExperiencedPlans')">
                <el-switch v-model="form.writeExperiencedPlans" active-value="true" inactive-value="false" />
              </el-form-item>
            </div>
          </el-col>
          <el-col :span="12" style="height: 100%">
            <div class="scroll_y">
              <div class="collapse">
                <div class="collapse_add_btn" @click="handleAddScoring">
                  <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                  <span>{{ $l("Parametersets: Scoring") }}</span>
                </div>
                <div class="collapse_list">
                  <div class="collapse_item" v-for="item in form.Scoring" :key="item.uuid">
                    <div class="collapse_item_title" :class="{ open: item.open }" @click="item.open = !item.open">
                      <div class="el-icon-arrow-right"></div>
                      <div class="text">{{ item.name }}</div>
                      <div class="el-icon-delete" @click.stop="handleDeleteScoring(item.uuid)"></div>
                    </div>
                    <el-collapse-transition>
                      <div class="collapse_item_content" v-show="item.open">
                        <el-form-item :label="$l('earlyDeparture')">
                          <el-input-number v-model="item.earlyDeparture" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('lateArrival')">
                          <el-input-number v-model="item.lateArrival" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('marginalUtilityOfMoney')">
                          <el-input-number v-model="item.marginalUtilityOfMoney" :min="0" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('performing')">
                          <el-input-number v-model="item.performing" :min="0" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('subpopulation')">
                          <el-input v-model="item.subpopulation" clearable></el-input>
                        </el-form-item>
                        <el-form-item :label="$l('utilityOfLineSwitch')">
                          <el-input-number v-model="item.utilityOfLineSwitch" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('waiting')">
                          <el-input-number v-model="item.waiting" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item :label="$l('waitingPt')">
                          <el-input-number v-model="item.waitingPt" :step="0.1" controls-position="right" />
                        </el-form-item>
                        <el-form-item>
                          <div class="collapse">
                            <div class="collapse_add_btn" @click="handleAddActivity(item.uuid)" style="top: 75px; z-index: 980">
                              <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                              <span>{{ $l("Parametersets: Activity") }}</span>
                            </div>
                            <div class="collapse_add_btn" @click="handleAddMode(item.uuid)" style="top: 115px; z-index: 980">
                              <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                              <span>{{ $l("Parametersets: Mode") }}</span>
                            </div>
                            <div class="collapse_list">
                              <div class="collapse_item" v-for="amItem in item.ActivityOrMode" :key="amItem.uuid">
                                <div class="collapse_item_title" :class="{ open: amItem.open }" @click="amItem.open = !amItem.open" style="top: 155px; z-index: 970">
                                  <div class="el-icon-arrow-right"></div>
                                  <div class="text">{{ amItem.name }}</div>
                                  <div class="el-icon-delete" @click.stop="handleDeleteActivityOrMode(amItem.uuid)"></div>
                                </div>
                                <el-collapse-transition>
                                  <div v-show="amItem.open" v-if="amItem.type == 'Activity'" class="collapse_item_content">
                                    <el-form-item :label="$l('activityType')">
                                      <el-input v-model="amItem.activityType" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('closingTime')">
                                      <el-time-picker v-model="amItem.closingTime" value-format="HH:mm:ss" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('earliestEndTime')">
                                      <el-time-picker v-model="amItem.earliestEndTime" value-format="HH:mm:ss" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('latestStartTime')">
                                      <el-time-picker v-model="amItem.latestStartTime" value-format="HH:mm:ss" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('minimalDuration')">
                                      <el-time-picker v-model="amItem.minimalDuration" value-format="HH:mm:ss" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('openingTime')">
                                      <el-time-picker v-model="amItem.openingTime" value-format="HH:mm:ss" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('priority')">
                                      <el-input-number v-model="amItem.priority" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                    <el-form-item :label="$l('scoringThisActivityAtAll')">
                                      <el-switch v-model="amItem.scoringThisActivityAtAll" active-value="true" inactive-value="false" />
                                    </el-form-item>
                                    <el-form-item :label="$l('typicalDuration')">
                                      <el-time-picker v-model="amItem.typicalDuration" value-format="HH:mm:ss" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('typicalDurationScoreComputation')">
                                      <el-switch v-model="amItem.typicalDurationScoreComputation" active-value="true" inactive-value="false" />
                                    </el-form-item>
                                  </div>
                                  <div v-show="amItem.open" v-if="amItem.type == 'Mode'" class="collapse_item_content">
                                    <el-form-item :label="$l('constant')">
                                      <el-input-number v-model="amItem.constant" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                    <el-form-item :label="$l('dailyMonetaryConstant')">
                                      <el-input-number v-model="amItem.dailyMonetaryConstant" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                    <el-form-item :label="$l('dailyUtilityConstant')">
                                      <el-input-number v-model="amItem.dailyUtilityConstant" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                    <el-form-item :label="$l('marginalUtilityOfDistance_util_m')">
                                      <el-input-number v-model="amItem.marginalUtilityOfDistance_util_m" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                    <el-form-item :label="$l('marginalUtilityOfTraveling_util_hr')">
                                      <el-input-number v-model="amItem.marginalUtilityOfTraveling_util_hr" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                    <el-form-item :label="$l('mode')">
                                      <el-input v-model="amItem.mode" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$l('monetaryDistanceRate')">
                                      <el-input-number v-model="amItem.monetaryDistanceRate" :step="0.1" controls-position="right" />
                                    </el-form-item>
                                  </div>
                                </el-collapse-transition>
                              </div>
                            </div>
                          </div>
                        </el-form-item>
                      </div>
                    </el-collapse-transition>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "BrainExpBeta": {
    "zh-CN":"BrainExpBeta",
    "en-US":"BrainExpBeta"
  },
  "PathSizeLogitBeta": {
    "zh-CN":"PathSizeLogitBeta",
    "en-US":"PathSizeLogitBeta"
  },
  "fractionOfIterationsToStartScoreMSA": {
    "zh-CN":"fractionOfIterationsToStartScoreMSA",
    "en-US":"fractionOfIterationsToStartScoreMSA"
  },
  "learningRate": {
    "zh-CN":"learningRate",
    "en-US":"learningRate"
  },
  "usingOldScoringBelowZeroUtilityDuration": {
    "zh-CN":"usingOldScoringBelowZeroUtilityDuration",
    "en-US":"usingOldScoringBelowZeroUtilityDuration"
  },
  "writeExperiencedPlans": {
    "zh-CN":"writeExperiencedPlans",
    "en-US":"writeExperiencedPlans"
  },
  "Parametersets: Scoring": {
    "zh-CN":"Parametersets: Scoring",
    "en-US":"Parametersets: Scoring"
  },
  "Scoring": {
    "zh-CN":"Scoring",
    "en-US":"Scoring"
  },
  "earlyDeparture": {
    "zh-CN":"earlyDeparture",
    "en-US":"earlyDeparture"
  },
  "lateArrival": {
    "zh-CN":"lateArrival",
    "en-US":"lateArrival"
  },
  "marginalUtilityOfMoney": {
    "zh-CN":"marginalUtilityOfMoney",
    "en-US":"marginalUtilityOfMoney"
  },
  "performing": {
    "zh-CN":"performing",
    "en-US":"performing"
  },
  "subpopulation": {
    "zh-CN":"subpopulation",
    "en-US":"subpopulation"
  },
  "utilityOfLineSwitch": {
    "zh-CN":"utilityOfLineSwitch",
    "en-US":"utilityOfLineSwitch"
  },
  "waiting": {
    "zh-CN":"waiting",
    "en-US":"waiting"
  },
  "waitingPt": {
    "zh-CN":"waitingPt",
    "en-US":"waitingPt"
  },
  "Parametersets: Activity": {
    "zh-CN":"Parametersets: Activity",
    "en-US":"Parametersets: Activity"
  },
  "Activity": {
    "zh-CN":"Activity",
    "en-US":"Activity"
  },
  "Parametersets: Mode": {
    "zh-CN":"Parametersets: Mode",
    "en-US":"Parametersets: Mode"
  },
  "Mode": {
    "zh-CN":"Mode",
    "en-US":"Mode"
  },
  "activityType": {
    "zh-CN":"activityType",
    "en-US":"activityType"
  },
  "closingTime": {
    "zh-CN":"closingTime",
    "en-US":"closingTime"
  },
  "earliestEndTime": {
    "zh-CN":"earliestEndTime",
    "en-US":"earliestEndTime"
  },
  "latestStartTime": {
    "zh-CN":"latestStartTime",
    "en-US":"latestStartTime"
  },
  "minimalDuration": {
    "zh-CN":"minimalDuration",
    "en-US":"minimalDuration"
  },
  "openingTime": {
    "zh-CN":"openingTime",
    "en-US":"openingTime"
  },
  "priority": {
    "zh-CN":"priority",
    "en-US":"priority"
  },
  "scoringThisActivityAtAll": {
    "zh-CN":"scoringThisActivityAtAll",
    "en-US":"scoringThisActivityAtAll"
  },
  "typicalDuration": {
    "zh-CN":"typicalDuration",
    "en-US":"typicalDuration"
  },
  "typicalDurationScoreComputation": {
    "zh-CN":"typicalDurationScoreComputation",
    "en-US":"typicalDurationScoreComputation"
  },
  "constant": {
    "zh-CN":"constant",
    "en-US":"constant"
  },
  "dailyMonetaryConstant": {
    "zh-CN":"dailyMonetaryConstant",
    "en-US":"dailyMonetaryConstant"
  },
  "dailyUtilityConstant": {
    "zh-CN":"dailyUtilityConstant",
    "en-US":"dailyUtilityConstant"
  },
  "marginalUtilityOfDistance_util_m": {
    "zh-CN":"marginalUtilityOfDistance_util_m",
    "en-US":"marginalUtilityOfDistance_util_m"
  },
  "marginalUtilityOfTraveling_util_hr": {
    "zh-CN":"marginalUtilityOfTraveling_util_hr",
    "en-US":"marginalUtilityOfTraveling_util_hr"
  },
  "mode": {
    "zh-CN":"mode",
    "en-US":"mode"
  },
  "monetaryDistanceRate": {
    "zh-CN":"monetaryDistanceRate",
    "en-US":"monetaryDistanceRate"
  },
}
</language>

<script>
import { guid, xmlToJson, jsonToXml } from "../utils";

const defaultForm = {
  BrainExpBeta: "",
  PathSizeLogitBeta: "",
  fractionOfIterationsToStartScoreMSA: "",
  learningRate: "",
  usingOldScoringBelowZeroUtilityDuration: "",
  writeExperiencedPlans: "",
  Scoring: [
    // {
    //   earlyDeparture: "",
    //   lateArrival: "",
    //   marginalUtilityOfMoney: "",
    //   performing: "",
    //   subpopulation: "",
    //   utilityOfLineSwitch: "",
    //   waiting: "",
    //   waitingPt: "",
    //   ActivityOrMode: [],
    // },
  ],
};
const defaultXml = `
	<module name="planCalcScore" >
		<!-- logit model scale parameter. default: 1.  Has name and default value for historical reasons (see Bryan Raney's phd thesis). -->
		<param name="BrainExpBeta" value="1.0" />
		<param name="PathSizeLogitBeta" value="1.0" />
		<!-- fraction of iterations at which MSA score averaging is started. The matsim theory department suggests to use this together with switching off choice set innovation (where a similar switch exists), but it has not been tested yet. -->
		<param name="fractionOfIterationsToStartScoreMSA" value="null" />
		<!-- new_score = (1-learningRate)*old_score + learningRate * score_from_mobsim.  learning rates close to zero emulate score averaging, but slow down initial convergence -->
		<param name="learningRate" value="1.0" />
		<!-- There used to be a plateau between duration=0 and duration=zeroUtilityDuration. This caused durations to evolve to zero once they were below zeroUtilityDuration, causing problems.  Only use this switch if you need to be backwards compatible with some old results.  (changed nov'13) -->
		<param name="usingOldScoringBelowZeroUtilityDuration" value="false" />
		<!-- write a plans file in each iteration directory which contains what each agent actually did, and the score it received. -->
		<param name="writeExperiencedPlans" value="false" />
		<parameterset type="scoringParameters" >
			<param name="earlyDeparture" value="-0.0" />
			<param name="lateArrival" value="-18.0" />
			<param name="marginalUtilityOfMoney" value="1.0" />
			<param name="performing" value="6.0" />
			<param name="subpopulation" value="null" />
			<param name="utilityOfLineSwitch" value="-1.0" />
			<param name="waiting" value="-0.0" />
			<param name="waitingPt" value="-6.0" />
			<parameterset type="activityParams" >
				<param name="activityType" value="dummy" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="true" />
				<!-- typical duration of activity.  needs to be defined and non-zero.  in sec. -->
				<param name="typicalDuration" value="02:00:00" />
				<!-- method to compute score at typical duration.  Options: | uniform | relative | Use uniform for backwards compatibility (all activities same score; higher proba to drop long acts). -->
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="car interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="pt interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="bike interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="drt interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="taxi interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="other interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="activityParams" >
				<param name="activityType" value="walk interaction" />
				<param name="closingTime" value="undefined" />
				<param name="earliestEndTime" value="undefined" />
				<param name="latestStartTime" value="undefined" />
				<param name="minimalDuration" value="undefined" />
				<param name="openingTime" value="undefined" />
				<param name="priority" value="1.0" />
				<param name="scoringThisActivityAtAll" value="false" />
				<param name="typicalDuration" value="undefined" />
				<param name="typicalDurationScoreComputation" value="relative" />
			</parameterset>
			<parameterset type="modeParams" >
				<!-- [utils] alternative-specific constant.  Normally per trip, but that is probably buggy for multi-leg trips. -->
				<param name="constant" value="0.0" />
				<!-- [unit_of_money/day] Fixed cost of mode, per day. -->
				<param name="dailyMonetaryConstant" value="0.0" />
				<!-- [utils] daily utility constant. default=0 to be backwards compatible -->
				<param name="dailyUtilityConstant" value="0.0" />
				<!-- [utils/m] utility of traveling (e.g. walking or driving) per m, normally negative.  this is on top of the time (dis)utility. -->
				<param name="marginalUtilityOfDistance_util_m" value="0.0" />
				<!-- [utils/hr] additional marginal utility of traveling.  normally negative.  this comes on top of the opportunity cost of time -->
				<param name="marginalUtilityOfTraveling_util_hr" value="-6.0" />
				<param name="mode" value="car" />
				<!-- [unit_of_money/m] conversion of distance into money. Normally negative. -->
				<param name="monetaryDistanceRate" value="0.0" />
			</parameterset>
			<parameterset type="modeParams" >
				<param name="constant" value="0.0" />
				<param name="dailyMonetaryConstant" value="0.0" />
				<param name="dailyUtilityConstant" value="0.0" />
				<param name="marginalUtilityOfDistance_util_m" value="0.0" />
				<param name="marginalUtilityOfTraveling_util_hr" value="-6.0" />
				<param name="mode" value="pt" />
				<param name="monetaryDistanceRate" value="0.0" />
			</parameterset>
			<parameterset type="modeParams" >
				<param name="constant" value="0.0" />
				<param name="dailyMonetaryConstant" value="0.0" />
				<param name="dailyUtilityConstant" value="0.0" />
				<param name="marginalUtilityOfDistance_util_m" value="0.0" />
				<param name="marginalUtilityOfTraveling_util_hr" value="-6.0" />
				<param name="mode" value="walk" />
				<param name="monetaryDistanceRate" value="0.0" />
			</parameterset>
			<parameterset type="modeParams" >
				<param name="constant" value="0.0" />
				<param name="dailyMonetaryConstant" value="0.0" />
				<param name="dailyUtilityConstant" value="0.0" />
				<param name="marginalUtilityOfDistance_util_m" value="0.0" />
				<param name="marginalUtilityOfTraveling_util_hr" value="-6.0" />
				<param name="mode" value="bike" />
				<param name="monetaryDistanceRate" value="0.0" />
			</parameterset>
			<parameterset type="modeParams" >
				<param name="constant" value="0.0" />
				<param name="dailyMonetaryConstant" value="0.0" />
				<param name="dailyUtilityConstant" value="0.0" />
				<param name="marginalUtilityOfDistance_util_m" value="0.0" />
				<param name="marginalUtilityOfTraveling_util_hr" value="-6.0" />
				<param name="mode" value="ride" />
				<param name="monetaryDistanceRate" value="0.0" />
			</parameterset>
			<parameterset type="modeParams" >
				<param name="constant" value="0.0" />
				<param name="dailyMonetaryConstant" value="0.0" />
				<param name="dailyUtilityConstant" value="0.0" />
				<param name="marginalUtilityOfDistance_util_m" value="0.0" />
				<param name="marginalUtilityOfTraveling_util_hr" value="-6.0" />
				<param name="mode" value="other" />
				<param name="monetaryDistanceRate" value="0.0" />
			</parameterset>
		</parameterset>
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
        Scoring: [],
      },
    };
  },
  created() {},
  methods: {
    getForm(xml) {
      const json = xmlToJson(xml);
      const form = defaultForm;
      function getActivityPOrMode(node) {
        const obj = {
          uuid: guid(),
          open: false,
        };
        for (const { name, attrs } of node.nodes) {
          obj[attrs.name] = attrs.value;
        }
        return obj;
      }

      function getScoring(_node) {
        const obj = {
          uuid: guid(),
          open: false,

          ActivityOrMode: [],
        };
        for (const node of _node.nodes) {
          if (node.name == "param") {
            obj[node.attrs.name] = node.attrs.value;
          } else if (node.name == "parameterset" && node.attrs.type == "activityParams") {
            const item = getActivityPOrMode(node);
            item.index = obj.ActivityOrMode.length + 1;
            item.name = `Activity ${item.index}`;
            item.type = `Activity`;
            obj.ActivityOrMode.push(item);
          } else if (node.name == "parameterset" && node.attrs.type == "modeParams") {
            const item = getActivityPOrMode(node);
            item.index = obj.ActivityOrMode.length + 1;
            item.name = `Mode ${item.index}`;
            item.type = `Mode`;
            obj.ActivityOrMode.push(item);
          }
        }
        return obj;
      }
      const nodes = json.nodes[0].nodes;
      for (const node of nodes) {
        if (node.name == "param") {
          form[node.attrs.name] = node.attrs.value;
        } else if (node.name == "parameterset" && node.attrs.type == "scoringParameters") {
          const item = getScoring(node);
          console.log(item);
          item.index = form.Scoring.length + 1;
          item.name = `Scoring ${item.index}`;
          form.Scoring.push(item);
        }
      }
      return form;
    },
    getXml(data) {
      const { Scoring, ..._data } = data;
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

      nodes.push(
        ...Scoring.map((v) => {
          const nodes = ["earlyDeparture", "lateArrival", "marginalUtilityOfMoney", "performing", "subpopulation", "utilityOfLineSwitch", "waiting", "waitingPt"];
          const nodeList = nodes
            .filter((v2) => v[v2] !== "" && v[v2] !== null && v[v2] !== "null")
            .map((v2) => ({
              name: "param",
              attrs: { name: v2, value: v[v2] },
            }));

          nodeList.push(
            ...v.ActivityOrMode.map((v2) => {
              const typeMap = {
                Activity: "activityParams",
                Mode: "modeParams",
              };
              const nodesMap = {
                Activity: ["activityType", "closingTime", "earliestEndTime", "latestStartTime", "minimalDuration", "openingTime", "priority", "scoringThisActivityAtAll", "typicalDuration", "typicalDurationScoreComputation"],
                Mode: ["constant", "dailyMonetaryConstant", "dailyUtilityConstant", "marginalUtilityOfDistance_util_m", "marginalUtilityOfTraveling_util_hr", "mode", "monetaryDistanceRate"],
              };
              return {
                name: "parameterset",
                attrs: {
                  type: typeMap[v2.type],
                },
                nodes: nodesMap[v2.type]
                  .filter((v3) => v2[v3] !== "" && v2[v3] !== null && v2[v3] !== "null")
                  .map((v3) => ({
                    name: "param",
                    attrs: { name: v3, value: v2[v3] },
                  })),
              };
            })
          );

          return {
            name: "parameterset",
            attrs: {
              type: "scoringParameters",
            },
            nodes: nodeList,
          };
        })
      );
      return jsonToXml({
        name: "module",
        attrs: {
          name: "planCalcScore",
        },
        nodes: nodes,
      });
    },
    handleAddScoring() {
      let index = this.form.Scoring.length > 0 ? this.form.Scoring[this.form.Scoring.length - 1].index + 1 : 1;
      this.form.Scoring.push({
        open: false,
        name: `${this.$l("Scoring")} ${index}`,
        index: index,
        uuid: guid(),

        earlyDeparture: "",
        lateArrival: "",
        marginalUtilityOfMoney: "",
        performing: "",
        subpopulation: "",
        utilityOfLineSwitch: "",
        waiting: "",
        waitingPt: "",
        ActivityOrMode: [],
      });
    },
    handleDeleteScoring(uuid) {
      let index = this.form.Scoring.findIndex((item) => item.uuid === uuid);
      if (index >= 0) this.form.Scoring.splice(index, 1);
    },
    handleAddActivity(scoringUuid) {
      const scoring = this.form.ActivityOrMode.find((item) => item.uuid === scoringUuid);
      if (scoring) {
        let index = scoring.ActivityOrMode.length > 0 ? scoring.ActivityOrMode[scoring.ActivityOrMode.length - 1].index + 1 : 1;
        scoring.ActivityOrMode.push({
          open: false,
          name: `${this.$l("Activity")} ${index}`,
          type: "Activity",
          index: index,
          uuid: guid(),

          activityType: "",
          closingTime: "",
          earliestEndTime: "",
          latestStartTime: "",
          minimalDuration: "",
          openingTime: "",
          priority: "",
          scoringThisActivityAtAll: "",
          typicalDuration: "",
          typicalDurationScoreComputation: "",
        });
      }
    },
    handleAddMode(scoringUuid) {
      const scoring = this.form.ActivityOrMode.find((item) => item.uuid === scoringUuid);
      if (scoring) {
        let index = scoring.ActivityOrMode.length > 0 ? scoring.ActivityOrMode[scoring.ActivityOrMode.length - 1].index + 1 : 1;
        scoring.ActivityOrMode.push({
          open: false,
          name: `${this.$l("Mode")} ${index}`,
          type: "Mode",
          index: index,
          uuid: guid(),

          constant: "",
          dailyMonetaryConstant: "",
          dailyUtilityConstant: "",
          marginalUtilityOfDistance_util_m: "",
          marginalUtilityOfTraveling_util_hr: "",
          mode: "",
          monetaryDistanceRate: "",
        });
      }
    },
    handleDeleteActivityOrMode(uuid) {
      let index = this.form.ActivityOrMode.findIndex((item) => item.uuid === uuid);
      if (index >= 0) this.form.ActivityOrMode.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.PlanCalcScore {
}
</style>
