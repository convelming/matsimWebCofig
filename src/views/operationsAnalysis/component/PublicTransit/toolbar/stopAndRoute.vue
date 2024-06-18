<template>
  <el-collapse-item class="toolbar_item my_collapse_item2" :name="name">
    <div class="toolbar_item_header" slot="title">{{ title }}</div>
    <div class="toolbar_item_bodyer">
      <!-- <div class="stop_name">{{ $l("Stop Name") }}</div> -->
      <div class="stop_title">
        <div>{{ stopList.length }} {{ $l("Stops") }}</div>
        <el-color-picker size="mini" :predefine="predefineColors" v-model="stopColor" />
      </div>
      <div class="stops_table">
        <el-table class="small" :data="stopList" border stripe height="250">
          <el-table-column :label="$l('Route')" prop="route" show-overflow-tooltip />
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
      <div class="routes_type">
        <el-select v-model="routesType" size="small">
          <el-option v-for="item in routesTypeOptions" :key="item.value" :label="$l(item.label)" :value="item.value"> </el-option>
        </el-select>
      </div>
      <div class="routes_table">
        <el-table class="small" :data="routeList" border stripe height="250">
          <el-table-column :label="$l('Line')" prop="line" show-overflow-tooltip />
          <el-table-column :label="$l('Route')" prop="routeId" show-overflow-tooltip />
          <el-table-column width="50">
            <el-dropdown slot-scope="{ row }" trigger="click" @command="handleRouteManu({ data: row, command: $event })">
              <span class="el-dropdown-link el-icon-arrow-down el-icon--right" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="v in route_menu" :key="v.value" :command="v.value">{{ $l(v.label) }}</el-dropdown-item>
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
    <StopMenu :visible.sync="showBusStopMenu" :list="stopList" :style="busStopMenuStyle" @commandOne="handleOneStopMenu({ data: stopList[0], command: $event.command })" @commandMany="handleManyStopMenu({ data: stopList, command: $event.command })" />
  </el-collapse-item>
</template>

<language>
{
  "Stops":{
    "zh-CN": "站点",
    "en-US": "站点"
  },
  "Id":{
    "zh-CN": "编号",
    "en-US": "Id"
  },
  "Route":{
    "zh-CN": "路线",
    "en-US": "Route"
  },
  "Name":{
    "zh-CN": "名称",
    "en-US": "Name"
  },
  "Copy Id":{
    "zh-CN": "复制编号",
    "en-US": "Copy Id"
  },
  "Copy Name":{
    "zh-CN": "复制名称",
    "en-US": "Copy Name"
  },
  "Copy Link Id":{
    "zh-CN": "复制线路编号",
    "en-US": "Copy Link Id"
  },
  "Transit Stop Details":{
    "zh-CN": "中转站详情",
    "en-US": "Transit Stop Details"
  },
  "Stop Load...":{
    "zh-CN": "站点加载...",
    "en-US": "Stop Load..."
  },
  "Transfers At Stop...":{
    "zh-CN": "中转站...",
    "en-US": "Transfers At Stop..."
  },
  "Passengers At Stop":{
    "zh-CN": "停靠站点的乘客",
    "en-US": "Passengers At Stop"
  },
  "Attributes":{
    "zh-CN": "属性",
    "en-US": "Attributes"
  },
  "Transit Lines":{
    "zh-CN": "交通线路",
    "en-US": "Transit Lines"
  },
  "Departures":{
    "zh-CN": "出发",
    "en-US": "Departures"
  },
  "Waiting Passengers":{
    "zh-CN": "候车乘客",
    "en-US": "Waiting Passengers"
  },
  "Statistics":{
    "zh-CN": "统计数据",
    "en-US": "Statistics"
  },
  "Line":{
    "zh-CN": "线路",
    "en-US": "Line"
  },
  "Route":{
    "zh-CN": "路线",
    "en-US": "Route"
  },
  "Copy Id":{
    "zh-CN": "复制编号",
    "en-US": "Copy Id"
  },
  "Copy Transit Line Id":{
    "zh-CN": "复制公交线路编号",
    "en-US": "Copy Transit Line Id"
  },
  "Show Route Details":{
    "zh-CN": "显示路线详情",
    "en-US": "Show Route Details"
  },
  "Transit Route Analysis...":{
    "zh-CN": "公交线路分析...",
    "en-US": "Transit Route Analysis..."
  },
  "List Departures":{
    "zh-CN": "出发名单",
    "en-US": "List Departures"
  },
  "Create Passengers Agent Group...":{
    "zh-CN": "创建乘客代理组...",
    "en-US": "Create Passengers Agent Group..."
  },
  "Show Transit Lines":{
    "zh-CN": "显示交通线路",
    "en-US": "Show Transit Lines"
  },
  "Show Reachable Stops":{
    "zh-CN": "显示可到达的站点",
    "en-US": "Show Reachable Stops"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index.js";
import { SelectStopLayer } from "../layer/SelectStopLayer";
import { TransitLinesLayer } from "../layer/TransitLinesLayer";
import { ReachableStopsLayer } from "../layer/ReachableStopsLayer";

import StopMenu from "../menu/Stop.vue";
import TransitStopLoad from "../dialog/TransitStopLoad/index.vue";
import Transfers from "../dialog/Transfers/index.vue";
import PassengersAtStop from "../dialog/PassengersAtStop/index.vue";
import TransitRoutesInfo from "../dialog/TransitRoutesInfo/index.vue";
import { one_stop_menu, many_stop_menu, route_menu } from "../enum";

import { getOverlappingStopFacilities, getRouteByFacilities } from "@/api/index";

import * as Bean from "@/utils/Bean";

import { copyText } from "@/utils/utils";

import Vue from "vue";

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
    ids: {
      type: Array,
      default: () => [],
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
    title() {
      try {
        return `${this.$l("Stops")} ${this.stopList.map((v) => `${v.name}(${v.id})`).join(",")}`;
      } catch (error) {
        return `Stops`;
      }
    },
  },
  watch: {
    ids: {
      handler(val) {
        this.getStopList();
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
      stopList: [],
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

      predefineColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],

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
    getStopList() {
      this.$nextTick(async () => {
        if (this.ids.length) {
          let res = await getOverlappingStopFacilities(this.ids);
          this.stopList = res.data;
          this.routeList = [];
        } else {
          this.stopList = [];
          this.routeList = [];
        }
        this._SelectStopLayer.setData(this.stopList);
        this._TransitLinesLayer.setData(this.routeList);
        this._ReachableStopsLayer.setData(this.routeList);
        this.getRouteList();
      });
    },
    getRouteList() {
      this.$nextTick(async () => {
        if (this.stopList.length) {
          let res = await getRouteByFacilities(this.stopList.map((v) => v.id));
          this.routeList = res.data.map((v) => new Bean.TransitRoute(v));
        } else {
          this.routeList = [];
        }

        this._TransitLinesLayer.setData(this.routeList);
        this._ReachableStopsLayer.setData(this.routeList);
      });
    },
    handleEnable() {
      this._MapEvnetId1 = this._Map.addEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this.handleOpenMenu);
      this._Map.addLayer(this._SelectStopLayer);
      this._Map.addLayer(this._TransitLinesLayer);
      this._Map.addLayer(this._ReachableStopsLayer);
      window.addEventListener("mousedown", this.handleCloseMenu);
    },
    handleDisable() {
      this._Map.removeEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this._MapEvnetId1);
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
      if (this.stopList.length) {
        this.busStopMenuStyle = `top: ${res.data.event.pageY + 10}px; left: ${res.data.event.pageX - 30}px;z-index:1000;`;
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
    handleManyStopMenu({ data, command }) {
      switch (command) {
        case "Stop Load...":
          this.handleShowTransitStopLoad({
            list: data,
          });
          break;
        case "Transfers At Stop...":
          this.handleShowTransfers({
            list: data,
          });
          break;
        case "Copy Name":
          {
            let nameObj = {};
            for (const val of data) {
              nameObj[val.name] = val;
            }
            copyText(Object.keys(nameObj).join("\n"), this.$message.success, this.$message.error);
          }
          break;
        case "Copy Link Id":
          {
            let nameObj = {};
            for (const val of data) {
              nameObj[val.linkId] = val;
            }
            copyText(Object.keys(nameObj).join("\n"), this.$message.success, this.$message.error);
          }
          break;
        case "Transit Stop Details":
          this.rootVue.handleShowStopAndRoute(data);
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
        parent: this.rootVue,
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
        parent: this.rootVue,
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
        parent: this.rootVue,
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
        parent: this.rootVue,
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
.toolbar_item {
  .toolbar_item_header {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  .toolbar_item_bodyer {
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
