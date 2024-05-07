<template>
  <el-collapse-item class="RouteDetail" :name="name">
    <template v-if="routeDetail">
      <div class="collapse_item_title" slot="title">
        {{ `${$l("Line")} ${routeDetail.line}` }}
      </div>
      <div class="RouteDetail_bodyer">
        <div class="stop_title">
          <el-button type="primary" size="small" @click="handleRouteManu({ data: routeDetail, command: 'Transit Route Analysis...' })">{{ $l("Transit Route Analysis...") }}</el-button>
        </div>
        <div class="stop_title">
          <el-select v-model="routeSelect" @change="handleSelectRoute">
            <el-option v-for="(item, index) in routeList" :key="index" :label="item.routeId" :value="index" />
          </el-select>
        </div>
        <div class="stops_table">
          <el-table class="small" :data="routeDetail.stops" border stripe height="250">
            <el-table-column :label="$l('Id')" prop="id" show-overflow-tooltip />
            <el-table-column :label="$l('Name')" prop="name" show-overflow-tooltip />
            <el-table-column width="50">
              <el-dropdown slot-scope="{ row }" trigger="click" @command="handleOneStopMenu({ data: row, command: $event })">
                <span class="el-dropdown-link el-icon-arrow-down el-icon--right" />
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="v in one_stop_menu" :key="v.value" :command="v.value">{{ $l(v.label) }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-table-column>
          </el-table>
        </div>
        <div class="stop_title">
          <el-checkbox v-model="showTransitLines">{{ $l("Show Transit Lines") }}</el-checkbox>
          <el-color-picker size="mini" :predefine="predefineColors" v-model="transitLinesColor" />
        </div>
        <div class="stop_title">
          <el-checkbox v-model="showReachableStops">{{ $l("Show Reachable Stops") }}</el-checkbox>
          <el-color-picker size="mini" :predefine="predefineColors" v-model="reachableStopsColor" />
        </div>
      </div>
      <RouteMenu :visible.sync="showBusRouteMenu" :route="routeDetail" :style="busRouteMenuStyle" @command="handleRouteManu" />
    </template>
  </el-collapse-item>
</template>

<language>
{
  "Line":{
    "zh-CN": "Line",
    "en-US": "Line"
  },
  "Transit Route Analysis...":{
    "zh-CN": "Transit Route Analysis...",
    "en-US": "Transit Route Analysis..."
  },
  "Id":{
    "zh-CN": "Id",
    "en-US": "Id"
  },
  "Name":{
    "zh-CN": "Name",
    "en-US": "Name"
  },
  "Copy Id":{
    "zh-CN": "Copy Id",
    "en-US": "Copy Id"
  },
  "Copy Name":{
    "zh-CN": "Copy Name",
    "en-US": "Copy Name"
  },
  "Copy Link Id":{
    "zh-CN": "Copy Link Id",
    "en-US": "Copy Link Id"
  },
  "Transit Stop Details":{
    "zh-CN": "Transit Stop Details",
    "en-US": "Transit Stop Details"
  },
  "Stop Load...":{
    "zh-CN": "Stop Load...",
    "en-US": "Stop Load..."
  },
  "Transfers At Stop...":{
    "zh-CN": "Transfers At Stop...",
    "en-US": "Transfers At Stop..."
  },
  "Passengers At Stop":{
    "zh-CN": "Passengers At Stop",
    "en-US": "Passengers At Stop"
  },
  "Show Transit Lines":{
    "zh-CN": "Show Transit Lines",
    "en-US": "Show Transit Lines"
  },
  "Show Reachable Stops":{
    "zh-CN": "Show Reachable Stops",
    "en-US": "Show Reachable Stops"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index.js";
import { TransitLinesLayer } from "../layer/TransitLinesLayer";
import { ReachableStopsLayer } from "../layer/ReachableStopsLayer";

import RouteMenu from "../menu/Route.vue";
import TransitStopLoad from "../dialog/TransitStopLoad.vue";
import Transfers from "../dialog/Transfers.vue";
import PassengersAtStop from "../dialog/PassengersAtStop.vue";
import TransitRoutesInfo from "../dialog/TransitRoutesInfo.vue";
import { one_stop_menu, many_stop_menu, route_menu } from "../enum";

import { copyText } from "@/utils/utils";
import { getTwoWayByRouteId } from "@/api/index.js";
import * as Bean from "@/utils/Bean";

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
    routeId: {
      type: [Number, String],
    },
  },
  inject: ["rootVue"],
  components: {
    RouteMenu,
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    routeId: {
      handler(val) {
        console.log(val);
        this.getRouteList();
      },
      immediate: true,
      deep: true,
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
      routeSelect: 0,
      routeDetail: null,
      routeList: [],

      one_stop_menu,
      many_stop_menu,
      route_menu,

      showBusRouteMenu: false,
      busRouteMenuStyle: "top:100px;left:100px;z-index:1000;",

      showTransitLines: true,
      transitLinesColor: "#ffd700",

      showReachableStops: true,
      reachableStopsColor: "#ffd700",

      _transitStopLoadList: [],
      _transitRoutesInfoList: [],
      _transferList: [],
      _passengersAtStop: [],

      showTransitRoutesInfo: false,
      formTransitRoutesInfo: undefined,

      predefineColors: ["#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#409eff", "#c71585"],

      _TransitLinesLayer: undefined,
      _ReachableStopsLayer: undefined,
    };
  },
  created() {
    this._transferList = [];
    this._transitRoutesInfoList = [];
    this._transitStopLoadList = [];
    this._passengersAtStop = [];
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
    getRouteList() {
      this.$nextTick(async () => {
        const res = await getTwoWayByRouteId({
          routeId: this.routeId,
        });
        this.routeList = res.data.map((v) => new Bean.TransitRoute(v));
        const index = this.routeList.findIndex((v) => v.routeId == this.routeId);
        this.handleSelectRoute(index > -1 ? index : 0);
      });
    },
    handleSelectRoute(val) {
      this.routeSelect = val;
      this.routeDetail = this.routeList[this.routeSelect];
      const list = this.routeDetail ? [this.routeDetail] : [];
      this._TransitLinesLayer.setData(list);
      this._ReachableStopsLayer.setData(list);
    },
    handleEnable() {
      this._MapEvnetId1 = this._Map.addEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this.handleOpenMenu);
      this._Map.addLayer(this._TransitLinesLayer);
      this._Map.addLayer(this._ReachableStopsLayer);
      window.addEventListener("mousedown", this.handleCloseMenu);
    },
    handleDisable() {
      this._Map.removeEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this._MapEvnetId1);
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
      if (this.routeDetail) {
        this.busRouteMenuStyle = `top: ${res.data.event.pageY + 10}px; left: ${res.data.event.pageX - 30}px;z-index:1000;`;
        this.showBusRouteMenu = true;
      }
    },
    handleCloseMenu(event) {
      if (event.button == 0) {
        this.showBusRouteMenu = false;
      }
    },
    handleOneStopMenu({ data, command }) {
      debugger;
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
        let index = this._transitStopLoadList.findIndex((v) => v._uid == app._uid);
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
        let index = this._transitRoutesInfoList.findIndex((v) => v._uid == app._uid);
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
    color: #409eff;
  }
}
.RouteDetail {
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  .RouteDetail_bodyer {
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
