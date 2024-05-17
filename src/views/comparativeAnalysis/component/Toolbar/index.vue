<template>
  <el-collapse v-model="activeName" accordion>
    <ReportToolbar name="ReportToolbar" />
    <LinesChangeInfo name="LinesChangeInfo" />
    <component v-for="item in list" :key="item.name" :is="item.type" :name="item.name" :show="item.name == activeName" v-bind="item.data" />
  </el-collapse>
</template>

<script>
import { guid } from "@/utils/utils";

import ReportToolbar from "../AnalysisReport/toolbar/ReportToolbar.vue";

import RouteFlows from "../LinesAnalysis/toolbar/RouteFlows.vue";
import LinesChangeInfo from "../LinesAnalysis/toolbar/LinesChangeInfo.vue";

import BuildDetail from "../../../operationsAnalysis/component/Build3D/toolbar/buildDetail.vue";
import CarDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/carDetail.vue";
import BusDetail from "../../../operationsAnalysis/component/MotorizedTravel/toolbar/busDetail.vue";
import RouteDetail from "../../../operationsAnalysis/component/PublicTransit/toolbar/routeDetail.vue";
import StopAndRoute from "../../../operationsAnalysis/component/PublicTransit/toolbar/stopAndRoute.vue";
import StopDetail from "../../../operationsAnalysis/component/PublicTransit/toolbar/stopDetail.vue";
import RouteDepartures from "../../../operationsAnalysis/component/PublicTransit/toolbar/routeDepartures.vue";
import LineDetail from "../../../operationsAnalysis/component/Network/toolbar/lineDetail.vue";
import NodeDetail from "../../../operationsAnalysis/component/Network/toolbar/nodeDetail.vue";
import SelectLinkAnalysis from "../../../operationsAnalysis/component/Network/toolbar/selectLinkAnalysis.vue";
import SelectBuildAnalysis from "../../../operationsAnalysis/component/Build3D/toolbar/selectBuildAnalysis.vue";

export default {
  components: {
    ReportToolbar,

    RouteFlows,
    LinesChangeInfo,

    BuildDetail,
    CarDetail,
    BusDetail,
    RouteDetail,
    StopAndRoute,
    StopDetail,
    RouteDepartures,
    LineDetail,
    NodeDetail,
    SelectLinkAnalysis,
    SelectBuildAnalysis,
  },
  data() {
    return {
      activeName: "ReportToolbar",
      list: [],
      // activeName: "4231bd4e-831d-4705-994f-365bfc43eaf8",
      // list: [
      //   {
      //     type: "RouteFlows",
      //     data: {
      //       uuid: "广123路(革新路总站--半岛花园总站)[all-day 07:15]",
      //       routeDetail: {
      //         lineId: "440100015622@440100015623",
      //         lineName: "广123路",
      //         routeId: "广123路(革新路总站--半岛花园总站)[all-day 07:15]",
      //         routeName: "广123路(革新路总站--半岛花园总站)[all-day 07:15]",
      //         add: false,
      //         delete: false,
      //         path: false,
      //         time: true,
      //         stop: false,
      //         none: false,
      //       },
      //     },
      //     name: "4231bd4e-831d-4705-994f-365bfc43eaf8",
      //   },
      // ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    add(type, data) {
      console.log(type, data);
      switch (type) {
        case "RouteFlows":
        case "SelectLinkAnalysis":
        case "SelectBuildAnalysis":
        case "BusDetail":
        case "CarDetail":
        case "BuildDetail":
        case "LineDetail":
        case "NodeDetail": {
          const item = this.list.find((v) => v.data.uuid == data.uuid);
          console.log(item);
          if (item) {
            this.data = item.data;
            this.activeName = item.name;
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
            console.log(item);
            this.activeName = item.name;
            this.list.unshift(item);
          }
          break;
      }
      if (this.list.length > 15) {
        this.list.splice(15);
      }
    },
  },
};
</script>

<style></style>
