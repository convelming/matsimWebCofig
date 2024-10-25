<template>
  <div class="toolbar-container">
    <div class="toolbar-header">
      <div class="btn el-icon-caret-left" @click="handleScroll(-150)"></div>
      <div class="list" ref="typeScroll">
        <div class="item" :id="PublicTransit.id" :class="{ active: activeModel === PublicTransit.id }" @click="handleActiveModel(PublicTransit.id)">{{ $l(PublicTransit.name) }}</div>
        <div class="item" :id="MotorizedTravel.id" :class="{ active: activeModel === MotorizedTravel.id }" @click="handleActiveModel(MotorizedTravel.id)">{{ $l(MotorizedTravel.name) }}</div>
        <div class="item" :id="Build3D.id" :class="{ active: activeModel === Build3D.id }" @click="handleActiveModel(Build3D.id)">{{ $l(Build3D.name) }}</div>
        <div class="item" :id="Network.id" :class="{ active: activeModel === Network.id }" @click="handleActiveModel(Network.id)">{{ $l(Network.name) }}</div>
        <div class="item" :id="Activity3D.id" :class="{ active: activeModel === Activity3D.id }" @click="handleActiveModel(Activity3D.id)">{{ $l(Activity3D.name) }}</div>
        <div class="item" :id="GeoJSON.id" :class="{ active: activeModel === GeoJSON.id }" @click="handleActiveModel(GeoJSON.id)">{{ $l(GeoJSON.name) }}</div>
        <div class="item" :id="Parking.id" :class="{ active: activeModel === Parking.id }" @click="handleActiveModel(Parking.id)">{{ $l(Parking.name) }}</div>
        <div class="item" :id="RegionalTraffic.id" :class="{ active: activeModel === RegionalTraffic.id }" @click="handleActiveModel(RegionalTraffic.id)">{{ $l(RegionalTraffic.name) }}</div>
      </div>
      <div class="btn el-icon-caret-right" @click="handleScroll(150)"></div>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === PublicTransit.id">
      <SreachStopRoute />
      <el-collapse class="toolbar-collapse" v-model="PublicTransit.activeName" accordion>
        <component v-for="item in PublicTransit.list" :show="item.name == PublicTransit.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === MotorizedTravel.id">
      <el-collapse class="toolbar-collapse" v-model="MotorizedTravel.activeName" accordion>
        <component v-for="item in MotorizedTravel.list" :show="item.name == MotorizedTravel.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Build3D.id">
      <SreachBuild />
      <el-collapse class="toolbar-collapse" v-model="Build3D.activeName" accordion>
        <component v-for="item in Build3D.list" :show="item.name == Build3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Network.id">
      <SreachLineNode />
      <el-collapse class="toolbar-collapse" v-model="Network.activeName" accordion>
        <component v-for="item in Network.list" :show="item.name == Network.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Activity3D.id">
      <el-collapse class="toolbar-collapse" v-model="Activity3D.activeName" accordion>
        <component v-for="item in Activity3D.list" :show="item.name == Activity3D.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === GeoJSON.id">
      <el-collapse class="toolbar-collapse" v-model="GeoJSON.activeName">
        <GeoJSONDetail v-for="item in GeoJSONIdList" :key="item" :name="item" :id="item" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === Parking.id">
      <ParkingGeoJSONDetail />
      <el-collapse class="toolbar-collapse" v-model="Parking.activeName" accordion>
        <component v-for="item in Parking.list" :show="item.name == Parking.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse>
    </div>
    <div class="toolbar-bodyer" v-show="activeModel === RegionalTraffic.id">
      <RegionalTrafficDetail />
      <!-- <el-collapse class="toolbar-collapse" v-model="RegionalTraffic.activeName" accordion>
        <component v-for="item in RegionalTraffic.list" :show="item.name == RegionalTraffic.activeName" :key="item.name" :is="item.type" :name="item.name" v-bind="item.data" />
      </el-collapse> -->
    </div>
  </div>
</template>

<language>
{
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
// GeoJson
import GeoJSONDetail from "../GeoJSON/toolbar/geoJSONDetail.vue";
// 停车供需
import PolgonParkingDetail from "../Parking/toolbar/PolgonParkingDetail.vue";
import ParkingActivityDetail from "../Parking/toolbar/ParkingActivityDetail.vue";
import ParkingGeoJSONDetail from "../Parking/toolbar/ParkingGeoJSONDetail.vue";
// 区域流量溯源
import RegionalTrafficDetail from "../RegionalTraffic/toolbar/RegionalTrafficDetail.vue";

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

    GeoJSONDetail,

    PolgonParkingDetail,
    ParkingActivityDetail,
    ParkingGeoJSONDetail,

    RegionalTrafficDetail,
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
      RegionalTraffic: {
        id: "RegionalTraffic",
        name: "区域流量溯源",
        components: ["RegionalTrafficDetail"],
        sreach: {},
        params: {},
        list: [],
        activeName: "",
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
        ParkingActivityDetail: "Parking",

        RegionalTrafficDetail: "RegionalTraffic",
      },
      activeModel: this.isDev ? "RegionalTraffic" : "PublicTransit",
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
  mounted() {
    this.handleActiveModel(this.activeModel);
  },
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

        case "ActivityDetail":
        case "ParkingActivityDetail":

        case "RegionalTrafficDetail": {
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
