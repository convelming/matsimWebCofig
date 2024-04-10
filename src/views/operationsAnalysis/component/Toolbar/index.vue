<template>
  <el-collapse v-model="activeName" accordion>
    <component
      v-for="item in list"
      :key="item.name"
      :is="item.type"
      :name="item.name"
      :show="item.name == activeName"
      v-bind="item.data"
    />
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
export default {
  components: {
    BuildDetail,
    CarDetail,
    BusDetail,
    RouteDetail,
    StopAndRoute,
    StopDetail,
    RouteDepartures,
  },
  data() {
    return {
      activeName: "",
      list: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    add(type, data) {
      if (type == "BusDetail" || type == "CarDetail" || type == "BuildDetail") {
        const item = this.list.find((v) => v.data.uuid == data.uuid);
        if (item) {
          this.activeName = item.name;
          return;
        }
      }
      const item = {
        type: type,
        data: data,
        name: guid(),
      };
      this.activeName = item.name;
      this.list.unshift(item);
    },
  },
};
</script>

<style></style>
