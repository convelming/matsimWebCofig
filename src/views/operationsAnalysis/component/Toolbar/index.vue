<template>
  <el-collapse :value="activeName" @input="handleChangeActive" accordion>
    <component v-for="item in list" :key="item.name" :is="item.type" :name="item.name" :show="item.name == activeName" v-bind="item.data" />
  </el-collapse>
</template>

<script>
import { guid } from "@/utils/utils";
import BuildDetail from "../Build3D/toolbar/buildDetail.vue";
import CarDetail from "../MotorizedTravel/toolbar/carDetail.vue";
import BusDetail from "../MotorizedTravel/toolbar/busDetail.vue";
import SubwayDetail from "../MotorizedTravel/toolbar/subwayDetail.vue";
import RouteDetail from "../PublicTransit/toolbar/routeDetail.vue";
import StopAndRoute from "../PublicTransit/toolbar/stopAndRoute.vue";
import StopDetail from "../PublicTransit/toolbar/stopDetail.vue";
import RouteDepartures from "../PublicTransit/toolbar/routeDepartures.vue";
import LineDetail from "../Network/toolbar/lineDetail.vue";
import NodeDetail from "../Network/toolbar/nodeDetail.vue";
import SelectLinkAnalysis from "../Network/toolbar/selectLinkAnalysis.vue";
import SelectBuildAnalysis from "../Build3D/toolbar/selectBuildAnalysis.vue";
import ActivityDetail from "../Activity3D/toolbar/ActivityDetail.vue";
export default {
  components: {
    BuildDetail,
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
    SelectBuildAnalysis,
    ActivityDetail,
  },
  inject: ["rootVue"],
  data() {
    return {
      activeName: "",
      // activeName: "c99bd891-f971-401b-9602-da776f58cad8",
      list: [
        // {
        //   type: "ActivityDetail",
        //   data: {
        //     uuid: 612,
        //     activityDetail: {
        //       actType: "home",
        //       coord: {
        //         x: 12635571,
        //         y: 2610971,
        //       },
        //       point: [28814, -40463],
        //       endTime: 27000,
        //       startTime: 0,
        //       personId: "6c9edbb3-4a24-466b-88e8-d8e75bf1e2ce",
        //       pickColor: 612,
        //     },
        //   },
        //   name: "c99bd891-f971-401b-9602-da776f58cad8",
        // },
      ],
    };
  },
  created() {
    this.rootVue.$on("clearSelectNetwork", this.handleClearSelectNetwork);
  },
  mounted() {},
  beforeDestroy() {
    this.rootVue.$off("clearSelectNetwork", this.handleClearSelectNetwork);
  },
  methods: {
    add(type, data) {
      switch (type) {
        case "ActivityDetail":
        case "SelectLinkAnalysis":
        case "SelectBuildAnalysis":
        case "BusDetail":
        case "CarDetail":
        case "SubwayDetail":
        case "BuildDetail":
        case "LineDetail":
        case "NodeDetail": {
          const item = this.list.find((v) => v.data.uuid == data.uuid && type == v.type);
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
    handleClearSelectNetwork() {
      let item = this.list.find((v) => v.name == this.activeName);
      if (item && item.type == "SelectLinkAnalysis") {
        this.activeName = "";
      }
    },
    handleChangeActive(activeName) {
      try {
        const index = this.list.findIndex((v) => v.name == activeName);
        if (index > -1) {
          const item = this.list[index];
          this.list.splice(index, 1);
          this.list.unshift(item);
        }
      } catch (error) {}
      this.activeName = activeName;
    },
  },
};
</script>

<style></style>
