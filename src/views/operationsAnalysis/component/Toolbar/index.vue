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
  },
  inject: ["rootVue"],
  data() {
    return {
      activeName: "2bdcc25c-6f77-44cd-9bcc-e7d412d5bf30",
      list: [
        // {
        //   type: "BusDetail",
        //   data: {
        //     busDetail: {
        //       uuid: "a497f5a9-e15d-46e0-bb72-42512bf24cfe",
        //       id: "南沙4路(蕉门公交总站--滨海公园站)[all-day 09:10]_09:10:30",
        //       desireSpeed: 6.944444444444445,
        //       startTime: 33030,
        //       endTime: 35913.28493872348,
        //       totalDistance: 20022.81207446862,
        //       pickColor: 83783,
        //     },
        //   },
        //   name: guid(),
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
        case "SelectLinkAnalysis":
        case "SelectBuildAnalysis":
        case "BusDetail":
        case "CarDetail":
        case "SubwayDetail":
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
