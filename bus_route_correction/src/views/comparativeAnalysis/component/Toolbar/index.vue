<template>
  <div class="toolbar-container">
    <div class="toolbar-header">
      <div class="btn el-icon-caret-left" @click="handleScroll(-150)"></div>
      <div class="list" ref="typeScroll">
        <!-- 比对分析 专属功能 -->
        <div class="item" :id="LinesAnalysis.id" :class="{ active: activeModel === LinesAnalysis.id }" @click="handleActiveModel(LinesAnalysis.id)">{{ $l(LinesAnalysis.name) }}</div>
        <div class="item" :id="AnalysisReport.id" :class="{ active: activeModel === AnalysisReport.id }" @click="handleActiveModel(AnalysisReport.id)">{{ $l(AnalysisReport.name) }}</div>
        <!-- 比对分析 专属功能 -->
        <div class="item" :id="PublicTransit.id" :class="{ active: activeModel === PublicTransit.id }" @click="handleActiveModel(PublicTransit.id)">{{ $l(PublicTransit.name) }}</div>
        <div class="item" :id="MotorizedTravel.id" :class="{ active: activeModel === MotorizedTravel.id }" @click="handleActiveModel(MotorizedTravel.id)">{{ $l(MotorizedTravel.name) }}</div>
        <div class="item" :id="Build3D.id" :class="{ active: activeModel === Build3D.id }" @click="handleActiveModel(Build3D.id)">{{ $l(Build3D.name) }}</div>
        <div class="item" :id="Network.id" :class="{ active: activeModel === Network.id }" @click="handleActiveModel(Network.id)">{{ $l(Network.name) }}</div>
        <div class="item" :id="Activity3D.id" :class="{ active: activeModel === Activity3D.id }" @click="handleActiveModel(Activity3D.id)">{{ $l(Activity3D.name) }}</div>
        <div class="item" :id="GeoJSON.id" :class="{ active: activeModel === GeoJSON.id }" @click="handleActiveModel(GeoJSON.id)">{{ $l(GeoJSON.name) }}</div>
        <div class="item" :id="Parking.id" :class="{ active: activeModel === Parking.id }" @click="handleActiveModel(Parking.id)">{{ $l(Parking.name) }}</div>
        <div class="item" :id="TrafficRegionAnalysis.id" :class="{ active: activeModel === TrafficRegionAnalysis.id }" @click="handleActiveModel(TrafficRegionAnalysis.id)">{{ $l(TrafficRegionAnalysis.name) }}</div>
      </div>
      <div class="btn el-icon-caret-right" @click="handleScroll(150)"></div>
    </div>
    <!-- 比对分析 专属功能 -->
    <div class="toolbar-bodyer" v-show="activeModel === LinesAnalysis.id">
      <el-collapse class="toolbar-collapse" v-model="LinesAnalysis.activeName" accordion>
        <LinesChangeInfo name="LinesChangeInfo" />
        <component v-for="item in LinesAnalysis.list" :show="item.name == LinesAnalysis.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="LinesAnalysisItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === AnalysisReport.id">
      <el-collapse class="toolbar-collapse" v-model="AnalysisReport.activeName" accordion>
        <ReportToolbar name="ReportToolbar" />
        <component v-for="item in AnalysisReport.list" :show="item.name == AnalysisReport.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <!-- 比对分析 专属功能 -->

    <div class="toolbar-bodyer" v-show="activeModel === PublicTransit.id">
      <SreachStopRoute />
      <el-collapse class="toolbar-collapse" v-model="PublicTransit.activeName" accordion>
        <component v-for="item in PublicTransit.list" :show="item.name == PublicTransit.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="PublicTransitItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === MotorizedTravel.id">
      <el-collapse class="toolbar-collapse" v-model="MotorizedTravel.activeName" accordion>
        <component v-for="item in MotorizedTravel.list" :show="item.name == MotorizedTravel.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="MotorizedTravelItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Build3D.id">
      <SreachBuild />
      <el-collapse class="toolbar-collapse" v-model="Build3D.activeName" accordion>
        <component v-for="item in Build3D.list" :show="item.name == Build3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="Build3DItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Network.id">
      <SreachLineNode />
      <el-collapse class="toolbar-collapse" v-model="Network.activeName" accordion>
        <component v-for="item in Network.list" :show="item.name == Network.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="NetworkItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Activity3D.id">
      <SreachActivity />
      <el-collapse class="toolbar-collapse" v-model="Activity3D.activeName" accordion>
        <component v-for="item in Activity3D.list" :show="item.name == Activity3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="Activity3DItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === GeoJSON.id">
      <el-collapse class="toolbar-collapse" v-model="GeoJSON.activeName">
        <GeoJSONDetail v-for="item in GeoJSONIdList" :key="item" :name="item" :id="item" ref="GeoJSONItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Parking.id">
      <ParkingGeoJSONDetail />
      <el-collapse class="toolbar-collapse" v-model="Parking.activeName" accordion>
        <component v-for="item in Parking.list" :show="item.name == Parking.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="ParkingItem" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === TrafficRegionAnalysis.id">
      <TRAGeoJSONHeader />
      <el-collapse class="toolbar-collapse" v-model="TrafficRegionAnalysis.activeName" accordion>
        <component v-for="item in TrafficRegionAnalysis.list" :show="item.name == TrafficRegionAnalysis.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" :config="item.config" ref="TrafficRegionAnalysisItem" />
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
    "en-US": "Activity"
  },
  "3D建筑":{
    "zh-CN": "3D建筑",
    "en-US": "Building"
  },
  "导入GeoJSON":{
    "zh-CN": "导入GeoJSON",
    "en-US": "Import GeoJSON"
  },
  "机动化出行":{
    "zh-CN": "机动化出行",
    "en-US": "Motorized trips"
  },
  "路网":{
    "zh-CN": "路网",
    "en-US": "Network"
  },
  "公共交通":{
    "zh-CN": "公共交通",
    "en-US": "Public Transit"
  },
  "GeoJSON":{
    "zh-CN": "GeoJSON",
    "en-US": "GeoJSON"
  },
  "停车供需":{
    "zh-CN": "停车供需分析",
    "en-US": "Parking analysis"
  },
  "区域流量溯源":{
    "zh-CN": "区域流量溯源",
    "en-US": "Regional Traffic"
  },
  "区域交通分析":{
    "zh-CN": "区域交通分析",
    "en-US": "Traffic Region Analysis"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";

import ReportToolbar from "../AnalysisReport/toolbar/ReportToolbar.vue";
import LinesChangeInfo from "../LinesAnalysis/toolbar/LinesChangeInfo.vue";

import RouteFlows from "../LinesAnalysis/toolbar/RouteFlows.vue";

// 3D建筑
import SreachBuild from "../../../operationsAnalysis/component/Build3D/toolbar/sreachBuild.vue";
import BuildDetail from "../../../operationsAnalysis/component/Build3D/toolbar/buildDetail.vue";
import SelectBuildAnalysis from "../../../operationsAnalysis/component/Build3D/toolbar/selectBuildAnalysis.vue";
// 机动化出行
import CarDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/carDetail.vue";
import BusDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/busDetail.vue";
import SubwayDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/subwayDetail.vue";
// 公共交通
import SreachStopRoute from "../../../operationsAnalysis/component/PublicTransit/toolbar/sreachStopRoute.vue";
import RouteDetail from "../../../operationsAnalysis/component/PublicTransit/toolbar/routeDetail.vue";
import StopAndRoute from "../../../operationsAnalysis/component/PublicTransit/toolbar/stopAndRoute.vue";
import StopDetail from "../../../operationsAnalysis/component/PublicTransit/toolbar/stopDetail.vue";
import RouteDepartures from "../../../operationsAnalysis/component/PublicTransit/toolbar/routeDepartures.vue";
// 路网
import SreachLineNode from "../../../operationsAnalysis/component/Network/toolbar/sreachLineNode.vue";
import LineDetail from "../../../operationsAnalysis/component/Network/toolbar/lineDetail.vue";
import NodeDetail from "../../../operationsAnalysis/component/Network/toolbar/nodeDetail.vue";
import SelectLinkAnalysis from "../../../operationsAnalysis/component/Network/toolbar/selectLinkAnalysis.vue";
// 活动
import ActivityDetail from "../../../operationsAnalysis/component/Activity3D/toolbar/ActivityDetail.vue";
import SreachActivity from "../../../operationsAnalysis/component/Activity3D/toolbar/SreachActivity.vue";
// 私家车出行
import CarTravelDetail from "../../../operationsAnalysis/component/CarTravel/toolbar/carTravelDetail.vue";
// GeoJson
import GeoJSONDetail from "../../../operationsAnalysis/component/GeoJSON/toolbar/geoJSONDetail2.vue";
// 停车供需
import PolgonParkingDetail from "../../../operationsAnalysis/component/Parking/toolbar/PolgonParkingDetail.vue";
import ParkingActivityDetail from "../../../operationsAnalysis/component/Parking/toolbar/ParkingActivityDetail.vue";
import ParkingGeoJSONDetail from "../../../operationsAnalysis/component/Parking/toolbar/ParkingGeoJSONDetail.vue";
// 区域交通分析
import TRAGeoJSONHeader from "../../../operationsAnalysis/component/TrafficRegionAnalysis/toolbar/TRAGeoJSONHeader.vue";
import MultiplePathsDetail from "../../../operationsAnalysis/component/TrafficRegionAnalysis/toolbar/MultiplePathsDetail.vue";
import SinglePathDetail from "../../../operationsAnalysis/component/TrafficRegionAnalysis/toolbar/SinglePathDetail.vue";

export default {
  components: {
    ReportToolbar,
    LinesChangeInfo,

    RouteFlows,

    SreachBuild,
    BuildDetail,
    SelectBuildAnalysis,

    CarDetail,
    BusDetail,
    SubwayDetail,

    SreachStopRoute,
    RouteDetail,
    StopAndRoute,
    StopDetail,
    RouteDepartures,

    SreachLineNode,
    LineDetail,
    NodeDetail,
    SelectLinkAnalysis,

    ActivityDetail,
    SreachActivity,

    CarTravelDetail,

    GeoJSONDetail,

    PolgonParkingDetail,
    ParkingActivityDetail,
    ParkingGeoJSONDetail,

    TRAGeoJSONHeader,
    MultiplePathsDetail,
    SinglePathDetail,
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
        components: ["RouteDetail", "StopAndRoute", "StopDetail", "RouteDepartures"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      MotorizedTravel: {
        id: "MotorizedTravel",
        name: "机动化出行",
        components: ["CarDetail", "BusDetail", "SubwayDetail", "CarTravelDetail"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      Build3D: {
        id: "Build3D",
        name: "3D建筑",
        components: ["BuildDetail"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      Network: {
        id: "Network",
        name: "路网",
        components: ["LineDetail", "NodeDetail", "SelectLinkAnalysis"],
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
      GeoJSON: {
        id: "GeoJSON",
        name: "GeoJSON",
        components: [],
        sreach: {},
        params: {},
        list: [],
        activeName: [],
      },
      Parking: {
        id: "Parking",
        name: "停车供需",
        components: ["PolgonParkingDetail", "ParkingActivityDetail"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
      },
      TrafficRegionAnalysis: {
        id: "TrafficRegionAnalysis",
        name: "区域交通分析",
        components: ["MultiplePathsDetail", "SinglePathDetail"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
        // list: [
        //   {
        //     type: "SinglePathDetail",
        //     data: {
        //       uuid: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        //       singlePathDetail: {
        //         shape: [
        //           [12634435.302642914, 2645511.8325935453],
        //           [12633846.75084994, 2642668.8241874496],
        //           [12637717.231729725, 2642559.094078857],
        //           [12637846.913390191, 2646010.6062060306],
        //           [12634435.302642914, 2645511.8325935453],
        //         ],
        //         holes: [],
        //         type: "link",
        //       },
        //     },
        //     name: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
        //   },
        // ],
        // activeName: "38e4047c-7a67-4c49-9e3b-cb40a22d8bd3",
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
        SelectBuildAnalysis: "Build3D",

        LineDetail: "Network",
        NodeDetail: "Network",
        SelectLinkAnalysis: "Network",

        ActivityDetail: "Activity3D",

        CarTravelDetail: "MotorizedTravel",

        PolgonParkingDetail: "Parking",
        ParkingActivityDetail: "Parking",

        MultiplePathsDetail: "TrafficRegionAnalysis",
        SinglePathDetail: "TrafficRegionAnalysis",
      },
      activeModel: "LinesAnalysis",
      activeName: "",
      list: [],
    };
  },
  computed: {
    GeoJSONIdList() {
      try {
        return this.rootVue.GeoJSONList.map((v) => v.id);
      } catch (error) {
        console.log("geojsonLength", error);
        return 0;
      }
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    initByConfig(config) {
      this.activeName = config.toolbarActiveName || "PublicTransit";
      {
        const LinesAnalysisToolbar = config.LinesAnalysisToolbar || {};
        this.$set(this.LinesAnalysis, "sreach", LinesAnalysisToolbar.sreach || {});
        this.$set(this.LinesAnalysis, "params", LinesAnalysisToolbar.params || {});
        this.$set(this.LinesAnalysis, "activeName", LinesAnalysisToolbar.activeName || "");
        this.$set(this.LinesAnalysis, "list", LinesAnalysisToolbar.list || []);
      }
      {
        const AnalysisReportToolbar = config.AnalysisReportToolbar || {};
        this.$set(this.AnalysisReport, "sreach", AnalysisReportToolbar.sreach || {});
        this.$set(this.AnalysisReport, "params", AnalysisReportToolbar.params || {});
        this.$set(this.AnalysisReport, "activeName", AnalysisReportToolbar.activeName || "");
        this.$set(this.AnalysisReport, "list", AnalysisReportToolbar.list || []);
      }
      {
        const Activity3DToolbar = config.Activity3DToolbar || {};
        this.$set(this.Activity3D, "sreach", Activity3DToolbar.sreach || {});
        this.$set(this.Activity3D, "params", Activity3DToolbar.params || {});
        this.$set(this.Activity3D, "activeName", Activity3DToolbar.activeName || "");
        this.$set(this.Activity3D, "list", Activity3DToolbar.list || []);
      }
      {
        const Build3DToolbar = config.Build3DToolbar || {};
        this.$set(this.Build3D, "sreach", Build3DToolbar.sreach || {});
        this.$set(this.Build3D, "params", Build3DToolbar.params || {});
        this.$set(this.Build3D, "activeName", Build3DToolbar.activeName || "");
        this.$set(this.Build3D, "list", Build3DToolbar.list || []);
      }
      {
        const MotorizedTravelToolbar = config.MotorizedTravelToolbar || {};
        this.$set(this.MotorizedTravel, "sreach", MotorizedTravelToolbar.sreach || {});
        this.$set(this.MotorizedTravel, "params", MotorizedTravelToolbar.params || {});
        this.$set(this.MotorizedTravel, "activeName", MotorizedTravelToolbar.activeName || "");
        this.$set(this.MotorizedTravel, "list", MotorizedTravelToolbar.list || []);
      }
      {
        const NetworkToolbar = config.NetworkToolbar || {};
        this.$set(this.Network, "sreach", NetworkToolbar.sreach || {});
        this.$set(this.Network, "params", NetworkToolbar.params || {});
        this.$set(this.Network, "activeName", NetworkToolbar.activeName || "");
        this.$set(this.Network, "list", NetworkToolbar.list || []);
      }
      {
        const ParkingToolbar = config.ParkingToolbar || {};
        this.$set(this.Parking, "sreach", ParkingToolbar.sreach || {});
        this.$set(this.Parking, "params", ParkingToolbar.params || {});
        this.$set(this.Parking, "activeName", ParkingToolbar.activeName || "");
        this.$set(this.Parking, "list", ParkingToolbar.list || []);
      }
      {
        const PublicTransitToolbar = config.PublicTransitToolbar || {};
        this.$set(this.PublicTransit, "sreach", PublicTransitToolbar.sreach || {});
        this.$set(this.PublicTransit, "params", PublicTransitToolbar.params || {});
        this.$set(this.PublicTransit, "activeName", PublicTransitToolbar.activeName || "");
        this.$set(this.PublicTransit, "list", PublicTransitToolbar.list || []);
      }
      {
        const TrafficRegionAnalysisToolbar = config.TrafficRegionAnalysisToolbar || {};
        this.$set(this.TrafficRegionAnalysis, "sreach", TrafficRegionAnalysisToolbar.sreach || {});
        this.$set(this.TrafficRegionAnalysis, "params", TrafficRegionAnalysisToolbar.params || {});
        this.$set(this.TrafficRegionAnalysis, "activeName", TrafficRegionAnalysisToolbar.activeName || "");
        this.$set(this.TrafficRegionAnalysis, "list", TrafficRegionAnalysisToolbar.list || []);
      }
      {
        try {
          this.rootVue.handleClearGeoJSON();
          for (const item of config.GeoJSONList) {
            const file = {
              id: item.id,
              _file: stringToFile(item._file),
              name: item.name,
              show: item.show,
              config: item.config,
            };
            this.rootVue.handleAddGeoJSON(file, false);
          }
        } catch (error) {}
      }
    },
    async exportConfig() {
      const config = {
        toolbarActiveName: this.activeName,
      };
      {
        const list = [];
        const refs = this.$refs["LinesAnalysisItem"];
        for (const item of this.LinesAnalysis.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.LinesAnalysisToolbar = {
          sreach: this.LinesAnalysis.sreach,
          params: this.LinesAnalysis.params,
          activeName: this.LinesAnalysis.activeName,
          list: list,
        };
      }
      {
        const list = [];
        const refs = this.$refs["AnalysisReportItem"];
        for (const item of this.AnalysisReport.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.AnalysisReportToolbar = {
          sreach: this.AnalysisReport.sreach,
          params: this.AnalysisReport.params,
          activeName: this.AnalysisReport.activeName,
          list: list,
        };
      }
      {
        const list = [];
        const refs = this.$refs["Activity3DItem"];
        for (const item of this.Activity3D.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.Activity3DToolbar = {
          sreach: this.Activity3D.sreach,
          params: this.Activity3D.params,
          activeName: this.Activity3D.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["Build3DItem"];
        for (const item of this.Build3D.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.Build3DToolbar = {
          sreach: this.Build3D.sreach,
          params: this.Build3D.params,
          activeName: this.Build3D.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["MotorizedTravelItem"];
        for (const item of this.MotorizedTravel.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.MotorizedTravelToolbar = {
          sreach: this.MotorizedTravel.sreach,
          params: this.MotorizedTravel.params,
          activeName: this.MotorizedTravel.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["NetworkItem"];
        for (const item of this.Network.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.NetworkToolbar = {
          sreach: this.Network.sreach,
          params: this.Network.params,
          activeName: this.Network.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["ParkingItem"];
        for (const item of this.Parking.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.ParkingToolbar = {
          sreach: this.Parking.sreach,
          params: this.Parking.params,
          activeName: this.Parking.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["PublicTransitItem"];
        for (const item of this.PublicTransit.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.PublicTransitToolbar = {
          sreach: this.PublicTransit.sreach,
          params: this.PublicTransit.params,
          activeName: this.PublicTransit.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["TrafficRegionAnalysisItem"];
        for (const item of this.TrafficRegionAnalysis.list) {
          const ref = refs.find((v) => v.name == item.name);
          list.push({
            type: item.type,
            name: item.name,
            data: JSON.parse(JSON.stringify(item.data)),
            config: await ref.exportConfig(),
          });
        }
        config.TrafficRegionAnalysisToolbar = {
          sreach: this.TrafficRegionAnalysis.sreach,
          params: this.TrafficRegionAnalysis.params,
          activeName: this.TrafficRegionAnalysis.activeName,
          list: list,
        };
      }

      {
        const list = [];
        const refs = this.$refs["GeoJSONItem"];

        for (const item of this.rootVue.GeoJSONList) {
          const ref = refs.find((v) => v.name == item.id);
          list.push({
            id: item.id,
            _file: await fileToString(item._file),
            name: item.name,
            show: item.show,
            config: await ref.exportConfig(),
          });
        }
        config.GeoJSONList = list;
      }

      return config;
    },
    // 添加/显示控件
    add(type, data) {
      const model = this.modelMap[type];
      const obj = this[model];
      let activeName = "";
      let list = obj.list;
      switch (type) {
        case "RouteFlows":

        case "BuildDetail":
        case "SelectBuildAnalysis":

        case "CarDetail":
        case "BusDetail":
        case "SubwayDetail":

        case "RouteDetail":
        case "StopDetail":

        case "LineDetail":
        case "NodeDetail":
        case "SelectLinkAnalysis":

        case "ActivityDetail":
        case "ParkingActivityDetail":

        case "MultiplePathsDetail":
        case "SinglePathDetail": {
          const item = list.find((v) => v.data.uuid == data.uuid);
          if (item && data.uuid) {
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
      this.handleActiveModel(obj.id);
    },
    // 根据id切换到对应模块
    handleActiveModel(id) {
      this.activeModel = id;
      const doc = document.getElementById(id);
      if (doc) {
        doc.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
      }
    },
    handleScroll(v) {
      const scroll = this.$refs.typeScroll;
      if (scroll) {
        scroll.scrollTo({
          top: 0,
          left: scroll.scrollLeft + v,
          behavior: "smooth",
        });
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
    display: flex;
    height: 44px;
    border-bottom: 2px solid #bbc0cf;
    .btn {
      width: 24px;
      height: 44px;
      text-align: center;
      line-height: 44px;
      background: rgba(0, 0, 0, 0.05);
      cursor: pointer;
    }
    .list {
      width: calc(100% - 48px);
      overflow-x: scroll;
      overflow-y: hidden;
      text-wrap: nowrap;
      &::-webkit-scrollbar {
        display: none;
      }
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
