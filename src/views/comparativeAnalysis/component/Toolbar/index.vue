<template>
  <div class="toolbar-container">
    <div ref="typeScroll" class="toolbar-header">
      <div class="list">
        <div class="item" id="LinesAnalysis" :class="{ active: activeModel === LinesAnalysis.name }" @click="handleActiveModel(LinesAnalysis)">{{ $l(LinesAnalysis.name) }}</div>
        <div class="item" id="AnalysisReport" :class="{ active: activeModel === AnalysisReport.name }" @click="handleActiveModel(AnalysisReport)">{{ $l(AnalysisReport.name) }}</div>
        <div class="item" id="PublicTransit" :class="{ active: activeModel === PublicTransit.name }" @click="handleActiveModel(PublicTransit)">{{ $l(PublicTransit.name) }}</div>
        <div class="item" id="MotorizedTravel" :class="{ active: activeModel === MotorizedTravel.name }" @click="handleActiveModel(MotorizedTravel)">{{ $l(MotorizedTravel.name) }}</div>
        <div class="item" id="Build3D" :class="{ active: activeModel === Build3D.name }" @click="handleActiveModel(Build3D)">{{ $l(Build3D.name) }}</div>
        <div class="item" id="Network" :class="{ active: activeModel === Network.name }" @click="handleActiveModel(Network)">{{ $l(Network.name) }}</div>
        <div class="item" id="Activity3D" :class="{ active: activeModel === Activity3D.name }" @click="handleActiveModel(Activity3D)">{{ $l(Activity3D.name) }}</div>
      </div>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === LinesAnalysis.name">
      <el-collapse class="toolbar-collapse" v-model="LinesAnalysis.activeName" accordion>
        <LinesChangeInfo name="LinesChangeInfo" />
        <!-- <el-collapse class="toolbar-collapse" :value="LinesAnalysis.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in LinesAnalysis.list" :show="item.name == LinesAnalysis.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === AnalysisReport.name">
      <el-collapse class="toolbar-collapse" v-model="AnalysisReport.activeName" accordion>
        <ReportToolbar name="ReportToolbar" />
        <!-- <el-collapse class="toolbar-collapse" :value="AnalysisReport.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in AnalysisReport.list" :show="item.name == AnalysisReport.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === PublicTransit.name">
      <!-- <div class="toolbar-search">
        <el-select v-model="" value-key="" placeholder="" clearable filterable @change=""> </el-select>
      </div> -->
      <el-collapse class="toolbar-collapse" v-model="PublicTransit.activeName" accordion>
        <!-- <el-collapse class="toolbar-collapse" :value="PublicTransit.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in PublicTransit.list" :show="item.name == PublicTransit.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === MotorizedTravel.name">
      <!-- <div class="toolbar-search">
        <el-select v-model="" value-key="" placeholder="" clearable filterable @change=""> </el-select>
      </div> -->
      <el-collapse class="toolbar-collapse" v-model="MotorizedTravel.activeName" accordion>
        <!-- <el-collapse class="toolbar-collapse" :value="MotorizedTravel.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in MotorizedTravel.list" :show="item.name == MotorizedTravel.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Build3D.name">
      <!-- <div class="toolbar-search">
        <el-select v-model="" value-key="" placeholder="" clearable filterable @change=""> </el-select>
      </div> -->
      <el-collapse class="toolbar-collapse" v-model="Build3D.activeName" accordion>
        <!-- <el-collapse class="toolbar-collapse" :value="Build3D.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in Build3D.list" :show="item.name == Build3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Network.name">
      <!-- <div class="toolbar-search">
        <el-select v-model="" value-key="" placeholder="" clearable filterable @change=""> </el-select>
      </div> -->
      <el-collapse class="toolbar-collapse" v-model="Network.activeName" accordion>
        <!-- <el-collapse class="toolbar-collapse" :value="Network.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in Network.list" :show="item.name == Network.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Activity3D.name">
      <!-- <div class="toolbar-search">
        <el-select v-model="" value-key="" placeholder="" clearable filterable @change=""> </el-select>
      </div> -->
      <el-collapse class="toolbar-collapse" v-model="Activity3D.activeName" accordion>
        <!-- <el-collapse class="toolbar-collapse" :value="Activity3D.activeName" @input="handleChangeActive" accordion> -->
        <component v-for="item in Activity3D.list" :show="item.name == Activity3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
  </div>
</template>

<language>
{
  "线路比对分析":{
    "zh-CN": "线路比对分析",
    "en-US": "Line comparison analysis"
  },
  "公交出行影响对比分析报告":{
    "zh-CN": "公交出行影响对比分析报告",
    "en-US": "Transit Travel Impact Comparison Analysis Report"
  },
  "活动":{
    "zh-CN": "活动",
    "en-US": "Activity3D"
  },
  "3D建筑":{
    "zh-CN": "3D建筑",
    "en-US": "3DBuilding"
  },
  "导入GeoJSON":{
    "zh-CN": "导入GeoJSON",
    "en-US": "Import GeoJSON"
  },
  "机动化出行":{
    "zh-CN": "机动化出行",
    "en-US": "Motorized travel"
  },
  "路网":{
    "zh-CN": "路网",
    "en-US": "Network"
  },
  "公共交通":{
    "zh-CN": "公共交通",
    "en-US": "public transport"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";

import ReportToolbar from "../AnalysisReport/toolbar/ReportToolbar.vue";
import LinesChangeInfo from "../LinesAnalysis/toolbar/LinesChangeInfo.vue";

import RouteFlows from "../LinesAnalysis/toolbar/RouteFlows.vue";

// 3D建筑
import BuildDetail from "../../../operationsAnalysis/component/Build3D/toolbar/buildDetail.vue";
import SelectBuildAnalysis from "../../../operationsAnalysis/component/Build3D/toolbar/selectBuildAnalysis.vue";
// 机动化出行
import CarDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/carDetail.vue";
import BusDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/busDetail.vue";
import SubwayDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/subwayDetail.vue";
// 公共交通
import RouteDetail from "../../../operationsAnalysis/component/PublicTransit/toolbar/routeDetail.vue";
import StopAndRoute from "../../../operationsAnalysis/component/PublicTransit/toolbar/stopAndRoute.vue";
import StopDetail from "../../../operationsAnalysis/component/PublicTransit/toolbar/stopDetail.vue";
import RouteDepartures from "../../../operationsAnalysis/component/PublicTransit/toolbar/routeDepartures.vue";
// 路网
import LineDetail from "../../../operationsAnalysis/component/Network/toolbar/lineDetail.vue";
import NodeDetail from "../../../operationsAnalysis/component/Network/toolbar/nodeDetail.vue";
import SelectLinkAnalysis from "../../../operationsAnalysis/component/Network/toolbar/selectLinkAnalysis.vue";
// 活动
import ActivityDetail from "../../../operationsAnalysis/component/Activity3D/toolbar/ActivityDetail.vue";
export default {
  components: {
    ReportToolbar,
    LinesChangeInfo,

    RouteFlows,

    BuildDetail,
    SelectBuildAnalysis,

    CarDetail,
    BusDetail,
    SubwayDetail,

    RouteDetail,
    StopAndRoute,
    StopDetail,
    RouteDepartures,

    LineDetail,
    NodeDetail,
    SelectLinkAnalysis,

    ActivityDetail,
  },
  inject: ["rootVue"],
  data() {
    return {
      LinesAnalysis: {
        id: "LinesAnalysis",
        name: "线路比对分析",
        sreach: {},
        params: {},
        list: [],
        activeName: "LinesChangeInfo",
      },
      AnalysisReport: {
        id: "AnalysisReport",
        name: "公交出行影响对比分析报告",
        sreach: {},
        params: {},
        list: [],
        activeName: "ReportToolbar",
      },
      PublicTransit: {
        id: "PublicTransit",
        name: "公共交通",
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      MotorizedTravel: {
        id: "MotorizedTravel",
        name: "机动化出行",
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      Build3D: {
        id: "Build3D",
        name: "3D建筑",
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      Network: {
        id: "Network",
        name: "路网",
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      Activity3D: {
        id: "Activity3D",
        name: "活动",
        components: ["ActivityDetail"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      modelMap: {
        RouteFlows: "LinesAnalysis",
        RouteDetail: "PublicTransit",
        StopAndRoute: "PublicTransit",
        StopDetail: "PublicTransit",
        RouteDepartures: "PublicTransit",

        CarDetail: "MotorizedTravel",
        BusDetail: "MotorizedTravel",
        SubwayDetail: "MotorizedTravel",

        BuildDetail: "Build3D",

        LineDetail: "Network",
        NodeDetail: "Network",
        SelectLinkAnalysis: "Network",

        ActivityDetail: "Activity3D",
      },
      activeModel: "线路比对分析",
      activeName: "",
      list: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    add(type, data) {
      const model = this.modelMap[type];
      const obj = this[model];
      let activeName = "";
      let list = obj.list;
      switch (type) {
        case "RouteFlows":

        case "ActivityDetail":
        case "SelectLinkAnalysis":
        case "SelectBuildAnalysis":
        case "BusDetail":
        case "CarDetail":
        case "SubwayDetail":
        case "BuildDetail":
        case "LineDetail":
        case "NodeDetail": {
          const index = list.findIndex((v) => v.name == activeName);
          if (index > -1) {
            const item = list[index];
            list.splice(index, 1);
            list.unshift(item);
            activeName = item.name;
            break;
          }
        }
        default:
          {
            const item = {
              type: type,
              data: data,
              name: guid(),
            };
            list.unshift(item);
            activeName = item.name;
          }
          break;
      }

      if (list.length > 15) {
        list.splice(15);
      }

      this.$set(obj, "list", list);
      this.$set(obj, "activeName", activeName);
      this.handleActiveModel(obj);
    },
    // handleChangeActive(activeName) {
    //   try {
    //     const index = this.list.findIndex((v) => v.name == activeName);
    //     if (index > -1) {
    //       const item = this.list[index];
    //       this.list.splice(index, 1);
    //       this.list.unshift(item);
    //     }
    //   } catch (error) {}
    //   this.activeName = activeName;
    // },
    handleActiveModel(type) {
      this.activeModel = type.name;
      const doc = document.getElementById(type.id);
      if (doc) {
        doc.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar-container {
  background-color: #eef2fd;
  height: 100vh;
  overflow: hidden;
  .toolbar-header {
    height: 46px;
    .list {
      width: 100%;
      border-bottom: 2px solid #bbc0cf;
      overflow-y: scroll;
      &::-webkit-scrollbar {
        display: none;
      }
      text-wrap: nowrap;
      .item {
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        box-sizing: border-box;
        padding: 12px;
        height: 44px;
        line-height: 20px;
        text-wrap: nowrap;
        color: rgba(0, 0, 0, 0.3);
        cursor: pointer;
        &.active {
          color: #000;
        }
      }
    }
  }
  .toolbar-bodyer {
    display: flex;
    flex-direction: column;
    height: calc(100% - 46px);
    .toolbar-search {
      border-bottom: 2px solid #bbc0cf;
      flex-shrink: 0;
    }

    .toolbar-collapse {
      flex-grow: 1;
      overflow-y: scroll;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
