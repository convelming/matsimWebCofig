<template>
  <el-collapse v-model="activeName" accordion>
    <component v-for="item in list" :key="item.name" :is="item.type" :name="item.name" :show="item.name == activeName" v-bind="item.data" />
  </el-collapse>
</template>

<script>
import { guid } from "@/utils/utils";
import BuildDetail from "../Build3D/toolbar/buildDetail.vue";
import CarDetail from "../MotorizedTravel/toolbar/carDetail.vue";
import BusDetail from "../MotorizedTravel/toolbar/busDetail.vue";
import RouteDetail from "../PublicTransit/toolbar/routeDetail.vue";
import StopAndRoute from "../PublicTransit/toolbar/stopAndRoute.vue";
import StopDetail from "../PublicTransit/toolbar/stopDetail.vue";
import RouteDepartures from "../PublicTransit/toolbar/routeDepartures.vue";
import LineDetail from "../Network/toolbar/lineDetail.vue";
import NodeDetail from "../Network/toolbar/nodeDetail.vue";
import SelectLinkAnalysis from "../Network/toolbar/selectLinkAnalysis.vue";
import SelectBuildAnalysis from "../Build3D/toolbar/selectBuildAnalysis.vue";
export default {
  components: {
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
      activeName: "",
      list: [
        {
          name: "BuildDetail2233",
          type: "BuildDetail",
          data: {
            buildDetail: {
              id: "building_473739",
            },
          },
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
        case "SelectLinkAnalysis":
        case "SelectBuildAnalysis":
        case "BusDetail":
        case "CarDetail":
        case "BuildDetail":
        case "LineDetail":
        case "NodeDetail": {
          const item = this.list.find((v) => v.data.uuid == data.uuid);
          if (item) {
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
