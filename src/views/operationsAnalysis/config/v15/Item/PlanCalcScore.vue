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
                <el-input-number v-model="form.PathSizeLogitBeta" :min="0" :step="0.1" :max="1" controls-position="right" />
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
                  <div class="collapse_item" v-for="(item, index) in form.Scoring" :key="item.uuid">
                    <div class="collapse_item_title" :class="{ open: item.open }" @click="item.open = !item.open">
                      <div class="el-icon-arrow-right"></div>
                      <div class="text">{{ `${$l(item.type)} ${index}` }}</div>
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
                            <div class="collapse_list">
                              <template v-for="(amItem, amIndex) in item.Activitys">
                                <div class="collapse_item" :key="amItem.uuid" v-if="amItem.type == 'Activity'">
                                  <div class="collapse_item_title" :class="{ open: amItem.open }" @click="amItem.open = !amItem.open" style="top: 155px; z-index: 970">
                                    <div class="el-icon-arrow-right"></div>
                                    <div class="text">{{ `${$l(amItem.type)} ${amIndex}` }}</div>
                                    <div class="el-icon-delete" @click.stop="handleDeleteActivity(item.uuid, amItem.uuid)"></div>
                                  </div>
                                  <el-collapse-transition>
                                    <div v-show="amItem.open" class="collapse_item_content">
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
                                        <el-select v-model="amItem.typicalDurationScoreComputation">
                                          <!-- uniform | relative -->
                                          <el-option :label="$l(`uniform`)" value="uniform" />
                                          <el-option :label="$l(`relative`)" value="relative" />
                                        </el-select>
                                        <!-- <el-switch v-model="amItem.typicalDurationScoreComputation" active-value="true" inactive-value="false" /> -->
                                      </el-form-item>
                                    </div>
                                  </el-collapse-transition>
                                </div>
                              </template>
                            </div>
                            <div class="collapse_add_btn" @click="handleAddMode(item.uuid)" style="top: 115px; z-index: 980">
                              <i class="el-icon-circle-plus-outline"></i>&nbsp;&nbsp;
                              <span>{{ $l("Parametersets: Mode") }}</span>
                            </div>
                            <div class="collapse_list">
                              <template v-for="(amItem, amIndex) in item.Modes">
                                <div class="collapse_item" :key="amItem.uuid" v-if="amItem.type == 'Mode'">
                                  <div class="collapse_item_title" :class="{ open: amItem.open }" @click="amItem.open = !amItem.open" style="top: 155px; z-index: 970">
                                    <div class="el-icon-arrow-right"></div>
                                    <div class="text">{{ `${$l(amItem.type)} ${amIndex}` }}</div>
                                    <div class="el-icon-delete" @click.stop="handleDeleteMode(item.uuid, amItem.uuid)"></div>
                                  </div>
                                  <el-collapse-transition>
                                    <div v-show="amItem.open" class="collapse_item_content">
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
                              </template>
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
    "zh-CN":"PathSizeLogit参数，貌似现版本不兼容",
    "en-US":"PathSizeLogitBeta"
  },
  "fractionOfIterationsToStartScoreMSA": {
    "zh-CN":"重新计算出行方式在迭代次数的百分比",
    "en-US":"fractionOfIterationsToStartScoreMSA"
  },
  "learningRate": {
    "zh-CN":"学习率",
    "en-US":"learningRate"
  },
  "usingOldScoringBelowZeroUtilityDuration": {
    "zh-CN":"使用旧的停留时间小于0的效用计算方式",
    "en-US":"usingOldScoringBelowZeroUtilityDuration"
  },
  "writeExperiencedPlans": {
    "zh-CN":"是否保存每个迭代过程中实际出行计划与评分",
    "en-US":"writeExperiencedPlans"
  },
  "Parametersets: Scoring": {
    "zh-CN":"参数集: 效用评分",
    "en-US":"Parametersets: Scoring"
  },
  "Scoring": {
    "zh-CN":"评分",
    "en-US":"Scoring"
  },
  "earlyDeparture": {
    "zh-CN":"提前出发",
    "en-US":"earlyDeparture"
  },
  "lateArrival": {
    "zh-CN":"迟到",
    "en-US":"lateArrival"
  },
  "marginalUtilityOfMoney": {
    "zh-CN":"费用（钱）的边际效用",
    "en-US":"marginalUtilityOfMoney"
  },
  "performing": {
    "zh-CN":"活动进行",
    "en-US":"performing"
  },
  "subpopulation": {
    "zh-CN":"子群体ID",
    "en-US":"subpopulation"
  },
  "utilityOfLineSwitch": {
    "zh-CN":"换乘效用项的参数",
    "en-US":"utilityOfLineSwitch"
  },
  "waiting": {
    "zh-CN":"等待效用值的参数",
    "en-US":"waiting"
  },
  "waitingPt": {
    "zh-CN":"等待（公交）效用值的参数",
    "en-US":"waitingPt"
  },
  "Parametersets: Activity": {
    "zh-CN":"活动参数集",
    "en-US":"Parametersets: Activity"
  },
  "Activity": {
    "zh-CN":"活动",
    "en-US":"Activity"
  },
  "Parametersets: Mode": {
    "zh-CN":"出行方式参数集",
    "en-US":"Parametersets: Mode"
  },
  "Mode": {
    "zh-CN":"出行方式",
    "en-US":"Mode"
  },
  "activityType": {
    "zh-CN":"活动类型",
    "en-US":"activityType"
  },
  "closingTime": {
    "zh-CN":"关闭时间",
    "en-US":"closingTime"
  },
  "earliestEndTime": {
    "zh-CN":"最早的结束时刻",
    "en-US":"earliestEndTime"
  },
  "latestStartTime": {
    "zh-CN":"最晚的开始时刻",
    "en-US":"latestStartTime"
  },
  "minimalDuration": {
    "zh-CN":"最小停留时间段",
    "en-US":"minimalDuration"
  },
  "openingTime": {
    "zh-CN":"开门（营业）时间",
    "en-US":"openingTime"
  },
  "priority": {
    "zh-CN":"优先级",
    "en-US":"priority"
  },
  "scoringThisActivityAtAll": {
    "zh-CN":"是否计算此活动的效用值",
    "en-US":"scoringThisActivityAtAll"
  },
  "typicalDuration": {
    "zh-CN":"典型的停留时间",
    "en-US":"typicalDuration"
  },
  "typicalDurationScoreComputation": {
    "zh-CN":"计算停留效用值的方法",
    "en-US":"typicalDurationScoreComputation"
  },
  "constant": {
    "zh-CN":"产量",
    "en-US":"constant"
  },
  "dailyMonetaryConstant": {
    "zh-CN":"日常费用常数",
    "en-US":"dailyMonetaryConstant"
  },
  "dailyUtilityConstant": {
    "zh-CN":"日常效用常数",
    "en-US":"dailyUtilityConstant"
  },
  "marginalUtilityOfDistance_util_m": {
    "zh-CN":"出行距离的边际效用参数（以米计）",
    "en-US":"marginalUtilityOfDistance_util_m"
  },
  "marginalUtilityOfTraveling_util_hr": {
    "zh-CN":"出行时间边际效用参数（以小时计）",
    "en-US":"marginalUtilityOfTraveling_util_hr"
  },
  "mode": {
    "zh-CN":"出行方式",
    "en-US":"mode"
  },
  "monetaryDistanceRate": {
    "zh-CN":"出行费用的距离折算率参数",
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
          Activitys: [],
          Modes: [],
        };
        for (const node of _node.nodes) {
          if (node.name == "param") {
            obj[node.attrs.name] = node.attrs.value;
          } else if (node.name == "parameterset" && node.attrs.type == "activityParams") {
            const item = getActivityPOrMode(node);
            item.index = obj.Activitys.length + 1;
            item.name = item.index;
            item.type = `Activity`;
            obj.Activitys.push(item);
          } else if (node.name == "parameterset" && node.attrs.type == "modeParams") {
            const item = getActivityPOrMode(node);
            item.index = obj.Modes.length + 1;
            item.name = item.index;
            item.type = `Mode`;
            obj.Modes.push(item);
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
          item.name = item.index;
          item.type = `Scoring`;
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
            ...v.Activitys.map((v2) => {
              return {
                name: "parameterset",
                attrs: {
                  type: "activityParams",
                },
                nodes: ["activityType", "closingTime", "earliestEndTime", "latestStartTime", "minimalDuration", "openingTime", "priority", "scoringThisActivityAtAll", "typicalDuration", "typicalDurationScoreComputation"]
                  .filter((v3) => v2[v3] !== "" && v2[v3] !== null && v2[v3] !== "null")
                  .map((v3) => ({
                    name: "param",
                    attrs: { name: v3, value: v2[v3] },
                  })),
              };
            }),
            ...v.Modes.map((v2) => {
              return {
                name: "parameterset",
                attrs: {
                  type: "modeParams",
                },
                nodes: ["constant", "dailyMonetaryConstant", "dailyUtilityConstant", "marginalUtilityOfDistance_util_m", "marginalUtilityOfTraveling_util_hr", "mode", "monetaryDistanceRate"]
                  .filter((v3) => v2[v3] !== "" && v2[v3] !== null && v2[v3] !== "null")
                  .map((v3) => ({
                    name: "param",
                    attrs: { name: v3, value: v2[v3] },
                  })),
              };
            })
            // ...v.ActivityOrMode.map((v2) => {
            //   const typeMap = {
            //     Activity: "activityParams",
            //     Mode: "modeParams",
            //   };
            //   const nodesMap = {
            //     Activity: ["activityType", "closingTime", "earliestEndTime", "latestStartTime", "minimalDuration", "openingTime", "priority", "scoringThisActivityAtAll", "typicalDuration", "typicalDurationScoreComputation"],
            //     Mode: ["constant", "dailyMonetaryConstant", "dailyUtilityConstant", "marginalUtilityOfDistance_util_m", "marginalUtilityOfTraveling_util_hr", "mode", "monetaryDistanceRate"],
            //   };
            //   return {
            //     name: "parameterset",
            //     attrs: {
            //       type: typeMap[v2.type],
            //     },
            //     nodes: nodesMap[v2.type]
            //       .filter((v3) => v2[v3] !== "" && v2[v3] !== null && v2[v3] !== "null")
            //       .map((v3) => ({
            //         name: "param",
            //         attrs: { name: v3, value: v2[v3] },
            //       })),
            //   };
            // })
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
      const scoring = this.form.Scoring.find((item) => item.uuid === scoringUuid);
      if (scoring) {
        let index = scoring.Activitys.length > 0 ? scoring.Activitys[scoring.Activitys.length - 1].index + 1 : 1;
        scoring.Activitys.push({
          open: false,
          name: index,
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
      const scoring = this.form.Scoring.find((item) => item.uuid === scoringUuid);
      if (scoring) {
        let index = scoring.Modes.length > 0 ? scoring.Modes[scoring.Modes.length - 1].index + 1 : 1;
        scoring.Modes.push({
          open: false,
          name: index,
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
    handleDeleteActivity(scoringUuid, uuid) {
      const scoring = this.form.Scoring.find((item) => item.uuid === scoringUuid);
      let index = scoring.Activitys.findIndex((item) => item.uuid === uuid);
      if (index >= 0) scoring.Activitys.splice(index, 1);
    },
    handleDeleteMode(scoringUuid, uuid) {
      const scoring = this.form.Scoring.find((item) => item.uuid === scoringUuid);
      let index = scoring.Modes.findIndex((item) => item.uuid === uuid);
      if (index >= 0) scoring.Modes.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.PlanCalcScore {
}
</style>
