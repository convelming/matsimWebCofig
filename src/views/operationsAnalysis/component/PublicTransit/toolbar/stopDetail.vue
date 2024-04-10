<template>
  <el-collapse-item class="BusStopToolbar" :name="name">
    <template v-if="stopDetail">
      <div class="collapse_item_title" slot="title">
        {{ `${$l("Stop")} ${stopDetail.name}(${stopDetail.id})` }}
      </div>
      <div class="BusStopToolbar_bodyer">
        <div class="stop_title">
          <div>{{ stopDetail.name }}</div>
          <el-color-picker
            size="mini"
            :predefine="predefineColors"
            v-model="stopColor"
          />
        </div>
        <div class="routes_type">
          <el-select v-model="routesType" size="small">
            <el-option
              v-for="item in routesTypeOptions"
              :key="item.value"
              :label="$l(item.label)"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <div class="routes_table">
          <el-table class="small" :data="routeList" border stripe height="250">
            <el-table-column
              :label="$l('Line')"
              prop="line"
              show-overflow-tooltip
            />
            <el-table-column
              :label="$l('Route')"
              prop="routeId"
              show-overflow-tooltip
            />
            <el-table-column width="50">
              <el-dropdown
                slot-scope="{ row }"
                trigger="click"
                @command="handleRouteManu({ data: row, command: $event })"
              >
                <span
                  class="el-dropdown-link el-icon-arrow-down el-icon--right"
                />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="v in route_menu"
                    :key="v.value"
                    :command="v.value"
                    >{{ $l(v.label) }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </el-table-column>
          </el-table>
        </div>
        <div class="stop_title">
          <el-checkbox v-model="showTransitLines">{{
            $l("Show Transit Lines")
          }}</el-checkbox>
          <el-color-picker
            size="mini"
            :predefine="predefineColors"
            v-model="transitLinesColor"
          />
        </div>
        <div class="stop_title">
          <el-checkbox v-model="showReachableStops">{{
            $l("Show Reachable Stops")
          }}</el-checkbox>
          <el-color-picker
            size="mini"
            :predefine="predefineColors"
            v-model="reachableStopsColor"
          />
        </div>
      </div>
      <StopMenu
        :visible.sync="showBusStopMenu"
        :list="[stopDetail]"
        :style="busStopMenuStyle"
        @commandOne="
          handleOneStopMenu({ data: stopDetail, command: $event.command })
        "
      />
    </template>
  </el-collapse-item>
</template>

<language>
{
  "公共交通":{
    "zh-CN": "公共交通",
    "en-US": "公共交通"
  },
  "图标大小：":{
    "zh-CN": "图标大小：",
    "en-US": "图标大小："
  },
  "显示站点名称":{
    "zh-CN": "显示站点名称",
    "en-US": "显示站点名称"
  },
  "公交站点颜色":{
    "zh-CN": "公交站点颜色",
    "en-US": "公交站点颜色"
  },
  "公交线路查询":{
    "zh-CN": "公交线路查询",
    "en-US": "公交线路查询"
  },
  "公交站点选取":{
    "zh-CN": "公交站点选取",
    "en-US": "公交站点选取"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index.js";
import { SelectStopLayer } from "../layer/SelectStopLayer";
import { TransitLinesLayer } from "../layer/TransitLinesLayer";
import { ReachableStopsLayer } from "../layer/ReachableStopsLayer";

import StopMenu from "../menu/Stop.vue";
import TransitStopLoad from "../dialog/TransitStopLoad.vue";
import Transfers from "../dialog/Transfers.vue";
import PassengersAtStop from "../dialog/PassengersAtStop.vue";
import TransitRoutesInfo from "../dialog/TransitRoutesInfo.vue";
import { one_stop_menu, many_stop_menu, route_menu } from "../enum";

import {
  getOverlappingStopFacilities,
  getRouteByFacilities,
} from "@/api/index";

import * as Bean from "@/utils/Bean";

import { copyText } from "@/utils/utils";

import Vue from "vue";
import store from "@/store";

const TransitStopLoadExtend = Vue.extend(TransitStopLoad);
const TransfersExtend = Vue.extend(Transfers);
const TransitRoutesInfoExtend = Vue.extend(TransitRoutesInfo);
const PassengersAtStopExtend = Vue.extend(PassengersAtStop);

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    stopId: {
      type: [String, Number],
    },
    stopData: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["rootVue"],
  components: {
    StopMenu,
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    // stopId: {
    //   handler(val) {
    //     console.log(val);
    //     this.getStopDetail();
    //   },
    //   immediate: true,
    //   deep: true,
    // },
    stopData: {
      handler(val) {
        this.$nextTick(() => {
          this.stopDetail = val;
          this.routeList = [];
          this._SelectStopLayer.setData([this.stopDetail].filter((v) => !!v));
          this._TransitLinesLayer.setData(this.routeList);
          this._ReachableStopsLayer.setData(this.routeList);
          this.getRouteList();
        });
      },
      immediate: true,
      deep: true,
    },
    stopColor: {
      handler(val) {
        this._SelectStopLayer.setColor(val);
      },
    },
    showTransitLines: {
      handler(val) {
        if (val) {
          this._TransitLinesLayer.show();
        } else {
          this._TransitLinesLayer.hide();
        }
      },
    },
    transitLinesColor: {
      handler(val) {
        this._TransitLinesLayer.setColor(val);
      },
    },
    showReachableStops: {
      handler(val) {
        if (val) {
          this._ReachableStopsLayer.show();
        } else {
          this._ReachableStopsLayer.hide();
        }
      },
    },
    reachableStopsColor: {
      handler(val) {
        this._ReachableStopsLayer.setColor(val);
      },
    },
    show: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 1000);
        });
      },
      immediate: true,
    },
  },
  data() {
    return {
      stopDetail: null,
      routeList: [],

      one_stop_menu,
      many_stop_menu,
      route_menu,

      routesType: "Transit Lines",
      routesTypeOptions: [
        {
          label: "Attributes",
          value: "Attributes",
        },
        {
          label: "Transit Lines",
          value: "Transit Lines",
        },
        {
          label: "Departures",
          value: "Departures",
        },
        {
          label: "Waiting Passengers",
          value: "Waiting Passengers",
        },
        {
          label: "Statistics",
          value: "Statistics",
        },
      ],

      stopColor: "#ff8c00",
      showBusStopMenu: false,
      busStopMenuStyle: "top:100px;left:100px;z-index:1000;",

      showTransitLines: false,
      transitLinesColor: "#ff8c00",

      showReachableStops: false,
      reachableStopsColor: "#ff8c00",

      _transitStopLoadList: [],
      _transitRoutesInfoList: [],
      _transferList: [],
      _passengersAtStop: [],

      showTransitRoutesInfo: false,
      formTransitRoutesInfo: undefined,

      predefineColors: [
        "#ff4500",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#409eff",
        "#c71585",
      ],

      _SelectStopLayer: undefined,
      _TransitLinesLayer: undefined,
      _ReachableStopsLayer: undefined,
    };
  },
  created() {
    this._transferList = [];
    this._transitRoutesInfoList = [];
    this._transitStopLoadList = [];
    this._passengersAtStop = [];
    this._SelectStopLayer = new SelectStopLayer({
      zIndex: 50,
      color: this.stopColor,
    });
    this._TransitLinesLayer = new TransitLinesLayer({
      zIndex: 30,
      color: this.transitLinesColor,
      visible: this.showTransitLines,
    });
    this._ReachableStopsLayer = new ReachableStopsLayer({
      zIndex: 40,
      color: this.reachableStopsColor,
      visible: this.showReachableStops,
    });
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
  },
  methods: {
    getStopDetail() {
      this.$nextTick(async () => {
        if (this.stopId) {
          let res = await getOverlappingStopFacilities(this.stopId);
          this.stopDetail = res.data.find((v) => v.id == this.stopId);
          this.routeList = [];
        } else {
          this.stopDetail = null;
          this.routeList = [];
        }
        this._SelectStopLayer.setData([this.stopDetail].filter((v) => !!v));
        this._TransitLinesLayer.setData(this.routeList);
        this._ReachableStopsLayer.setData(this.routeList);
        this.getRouteList();
      });
    },
    getRouteList() {
      this.$nextTick(async () => {
        if (this.stopDetail) {
          let res = await getRouteByFacilities([this.stopDetail.id]);
          this.routeList = res.data.map((v) => new Bean.TransitRoute(v));
        } else {
          this.routeList = [];
        }

        this._TransitLinesLayer.setData(this.routeList);
        this._ReachableStopsLayer.setData(this.routeList);
      });
    },
    handleEnable() {
      this._MapEvnetId1 = this._Map.addEventListener(
        MAP_EVENT.HANDLE_CLICK_RIGHT,
        this.handleOpenMenu
      );
      this._Map.addLayer(this._SelectStopLayer);
      this._Map.addLayer(this._TransitLinesLayer);
      this._Map.addLayer(this._ReachableStopsLayer);
      window.addEventListener("mousedown", this.handleCloseMenu);
    },
    handleDisable() {
      this._Map.removeEventListener(
        MAP_EVENT.HANDLE_CLICK_RIGHT,
        this._MapEvnetId1
      );
      this._Map.removeLayer(this._SelectStopLayer);
      this._Map.removeLayer(this._TransitLinesLayer);
      this._Map.removeLayer(this._ReachableStopsLayer);
      this._transferList.forEach((v) => {
        v.$emit("close");
      });
      this._transitRoutesInfoList.forEach((v) => {
        v.$emit("close");
      });
      this._transitStopLoadList.forEach((v) => {
        v.$emit("close");
      });
      this._passengersAtStop.forEach((v) => {
        v.$emit("close");
      });
      window.removeEventListener("mousedown", this.handleCloseMenu);
    },
    handleOpenMenu(res) {
      if (this.stopDetail) {
        this.busStopMenuStyle = `top: ${res.data.event.pageY + 10}px; left: ${
          res.data.event.pageX - 30
        }px;z-index:1000;`;
        this.showBusStopMenu = true;
      }
    },
    handleCloseMenu(event) {
      if (event.button == 0) {
        this.showBusStopMenu = false;
      }
    },
    handleOneStopMenu({ data, command }) {
      switch (command) {
        case "Stop Load...":
          this.handleShowTransitStopLoad({
            list: [data],
          });
          break;
        case "Transfers At Stop...":
          this.handleShowTransfers({
            list: [data],
          });
          break;
        case "Passengers At Stop":
          this.handleShowPassengersAtStop({
            list: [data],
          });
          break;
        case "Copy Name":
          copyText(data.name, this.$message.success, this.$message.error);
          break;
        case "Copy Id":
          copyText(data.id, this.$message.success, this.$message.error);
          break;
        case "Copy Link Id":
          copyText(data.linkId, this.$message.success, this.$message.error);
          break;
        case "Transit Stop Details":
          // this.rootVue.handleShowStopDetail(data.id);
          this.rootVue.handleShowStopDetailByStopData(data);
          break;
      }
    },
    handleRouteManu({ data, command }) {
      switch (command) {
        case "Transit Route Analysis...":
          this.handleShowTransitRoutesInfo(data);
          break;
        case "Copy Id":
          copyText(data.routeId, this.$message.success, this.$message.error);
          break;
        case "Copy Transit Line Id":
          copyText(data.line, this.$message.success, this.$message.error);
          break;
        case "List Departures":
          this.rootVue.handleShowRouteDepartures(data);
          break;
        case "Show Route Details":
          this.rootVue.handleShowRouteDetail(data.routeId);
          break;
      }
    },
    handleShowTransitStopLoad(data) {
      const app = new TransitStopLoadExtend({
        propsData: { form: data },
        store,
      }).$mount();
      app.$on("close", () => {
        let index = this._transitStopLoadList.findIndex(
          (v) => v._uid == app._uid
        );
        this._transitStopLoadList.splice(index, 1);
        app.$destroy();
      });
      document.body.append(app.$el);
      this._transitStopLoadList.push(app);
    },
    handleShowTransfers(data) {
      const app = new TransfersExtend({
        propsData: { form: data },
        store,
      }).$mount();
      app.$on("close", () => {
        let index = this._transferList.findIndex((v) => v._uid == app._uid);
        this._transferList.splice(index, 1);
        app.$destroy();
      });
      document.body.append(app.$el);
      this._transferList.push(app);
    },
    handleShowTransitRoutesInfo(data) {
      const app = new TransitRoutesInfoExtend({
        propsData: { form: data },
        store,
      }).$mount();
      app.$on("close", () => {
        let index = this._transitRoutesInfoList.findIndex(
          (v) => v._uid == app._uid
        );
        this._transitRoutesInfoList.splice(index, 1);
        app.$destroy();
      });
      document.body.append(app.$el);
      this._transitRoutesInfoList.push(app);
      // this.formTransitRoutesInfo = data;
      // this.showTransitRoutesInfo = true;
    },
    handleShowPassengersAtStop(data) {
      const app = new PassengersAtStopExtend({
        propsData: { form: data },
        store,
      }).$mount();
      app.$on("close", () => {
        let index = this._passengersAtStop.findIndex((v) => v._uid == app._uid);
        this._passengersAtStop.splice(index, 1);
        app.$destroy();
      });
      document.body.append(app.$el);
      this._passengersAtStop.push(app);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dropdown-link {
    cursor: pointer;
    color:#409EFF;
  }
}
.BusStopToolbar {
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  .BusStopToolbar_bodyer {
    padding: 0 20px;
    .stop_name {
      font-size: 16px;
      line-height: 30px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .stop_title {
      font-size: 14px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .stops_table {
      margin-bottom: 10px;
    }
    .routes_type {
      margin-bottom: 10px;
      .el-select {
        width: 100%;
      }
    }
    .routes_table {
      margin-bottom: 10px;
    }
  }
}
</style>
