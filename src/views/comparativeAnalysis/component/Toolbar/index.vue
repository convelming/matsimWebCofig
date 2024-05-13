<template>
  <el-collapse v-model="activeName" accordion>
    <LinesChangeInfo name="LinesChangeInfo" />
    <component v-for="item in list" :key="item.name" :is="item.type" :name="item.name" :show="item.name == activeName" v-bind="item.data" />
  </el-collapse>
</template>

<script>
import { guid } from "@/utils/utils";
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
      activeName: "LinesChangeInfo",
      list: [],
      activeName: "888504ac-3217-4854-b170-88e7881a326e",
      list: [
        {
          type: "RouteFlows",
          data: {
            uuid: "夜121路(泮塘总站--地铁白云公园站总站)[all-day 21:30]",
            routeDetail: {
              lineId: "900000167888@900000167889",
              lineName: "夜121路",
              routeId: "夜121路(泮塘总站--地铁白云公园站总站)[all-day 21:30]",
              routeName: "夜121路(泮塘总站--地铁白云公园站总站)[all-day 21:30]",
              add: false,
              delete: true,
              path: true,
              time: true,
              stop: true,
              none: false,
            },
          },
          name: "888504ac-3217-4854-b170-88e7881a326e",
        },
      ],
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
