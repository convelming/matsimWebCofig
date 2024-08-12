<template>
  <div class="toolbar-container">
    <div ref="typeScroll" class="toolbar-header">
      <div class="list">
        <div class="item" id="PublicTransit" :class="{ active: activeModel === PublicTransit.name }" @click="handleActiveModel(PublicTransit)">{{ $l(PublicTransit.name) }}</div>
        <div class="item" id="MotorizedTravel" :class="{ active: activeModel === MotorizedTravel.name }" @click="handleActiveModel(MotorizedTravel)">{{ $l(MotorizedTravel.name) }}</div>
        <div class="item" id="Build3D" :class="{ active: activeModel === Build3D.name }" @click="handleActiveModel(Build3D)">{{ $l(Build3D.name) }}</div>
        <div class="item" id="Network" :class="{ active: activeModel === Network.name }" @click="handleActiveModel(Network)">{{ $l(Network.name) }}</div>
        <div class="item" id="Activity3D" :class="{ active: activeModel === Activity3D.name }" @click="handleActiveModel(Activity3D)">{{ $l(Activity3D.name) }}</div>
        <div class="item" id="Parking" :class="{ active: activeModel === Parking.name }" @click="handleActiveModel(Parking)">{{ $l(Parking.name) }}</div>
      </div>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === PublicTransit.name">
      <SreachStopRoute />
      <el-collapse class="toolbar-collapse" v-model="PublicTransit.activeName" accordion>
        <component v-for="item in PublicTransit.list" :show="item.name == PublicTransit.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === MotorizedTravel.name">
      <el-collapse class="toolbar-collapse" v-model="MotorizedTravel.activeName" accordion>
        <component v-for="item in MotorizedTravel.list" :show="item.name == MotorizedTravel.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Build3D.name">
      <SreachBuild />
      <el-collapse class="toolbar-collapse" v-model="Build3D.activeName" accordion>
        <component v-for="item in Build3D.list" :show="item.name == Build3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Network.name">
      <SreachLineNode />
      <el-collapse class="toolbar-collapse" v-model="Network.activeName" accordion>
        <component v-for="item in Network.list" :show="item.name == Network.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Activity3D.name">
      <el-collapse class="toolbar-collapse" v-model="Activity3D.activeName" accordion>
        <component v-for="item in Activity3D.list" :show="item.name == Activity3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Parking.name">
      <el-collapse class="toolbar-collapse" v-model="Parking.activeName" accordion>
        <component v-for="item in Parking.list" :show="item.name == Parking.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
  </div>
</template>

<language>
{
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
    "en-US": "Public transport"
  },
  "停车供需":{
    "zh-CN": "停车供需",
    "en-US": "Parking"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";
// 3D建筑
import SreachBuild from "../Build3D/toolbar/sreachBuild.vue";
import BuildDetail from "../Build3D/toolbar/buildDetail.vue";
import SelectBuildAnalysis from "../Build3D/toolbar/selectBuildAnalysis.vue";
// 机动化出行
import CarDetail from "../MotorizedTravel/toolbar/carDetail.vue";
import BusDetail from "../MotorizedTravel/toolbar/busDetail.vue";
import SubwayDetail from "../MotorizedTravel/toolbar/subwayDetail.vue";
// 公共交通
import SreachStopRoute from "../PublicTransit/toolbar/sreachStopRoute.vue";
import RouteDetail from "../PublicTransit/toolbar/routeDetail.vue";
import StopAndRoute from "../PublicTransit/toolbar/stopAndRoute.vue";
import StopDetail from "../PublicTransit/toolbar/stopDetail.vue";
import RouteDepartures from "../PublicTransit/toolbar/routeDepartures.vue";
// 路网
import SreachLineNode from "../Network/toolbar/sreachLineNode.vue";
import LineDetail from "../Network/toolbar/lineDetail.vue";
import NodeDetail from "../Network/toolbar/nodeDetail.vue";
import SelectLinkAnalysis from "../Network/toolbar/selectLinkAnalysis.vue";
// 活动
import ActivityDetail from "../Activity3D/toolbar/ActivityDetail.vue";
// 私家车出行
import CarTravelDetail from "../CarTravel/toolbar/carTravelDetail.vue";
// 停车供需
import PolgonParkingDetail from "../Parking/toolbar/PolgonParkingDetail.vue";

export default {
  components: {
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

    CarTravelDetail,

    PolgonParkingDetail,
  },
  inject: ["rootVue"],
  data() {
    return {
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
      Parking: {
        id: "Parking",
        name: "停车供需",
        components: ["PolgonParkingDetail"],
        sreach: {},
        params: {},
        list: [
          {
            type: "PolgonParkingDetail",
            data: {
              uuid: "b6978a48-3ca1-4f28-a33d-c74223a2abd5",
              polgonParkingDetail: {
                xyarr: [
                  [12614142.912075812, 2647049.121822725],
                  [12614089.274436189, 2646533.6038326165],
                  [12614855.10158639, 2646438.247928082],
                  [12614914.699183678, 2647198.115502744],
                ],
                geoId: null,
              },
            },
            name: "90061843-6de2-4302-a8f7-eb697d0ba0f0",
          },
        ],
        activeName: "",
        activeName: "90061843-6de2-4302-a8f7-eb697d0ba0f0",
      },
      modelMap: {
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
      },
      activeModel: "公共交通",
      activeModel: "停车供需",
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

        case "ActivityDetail": {
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
      this.handleActiveModel(obj);
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
