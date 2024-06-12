<template>
  <el-collapse-item class="RouteFlows" :name="name">
    <div class="collapse_item_title" slot="title">{{ $l("RouteFlows") }} {{ this.routeDetail.routeId }}</div>
    <div class="_bodyer">
      <div class="title">
        <span>{{ $l("Top5Routes") }}&nbsp;&nbsp;&nbsp;</span>
        <el-button
          type="primary"
          size="mini"
          circle
          icon="el-icon-refresh-right"
          @click="
            getList1();
            getList2();
          "
        ></el-button>
        <el-button type="primary" size="small" @click="handleShowPassengerFlowDialog()">{{ $l("showOnChart") }}</el-button>
      </div>
      <div class="form">
        <div class="form_item">
          <div class="form_label">{{ $l("基础方案：") }}</div>
          <div class="form_value" style="display: flex; align-items: center">
            <el-switch v-model="showOldLine" style="margin-right: 20px" />
            <el-color-picker size="mini" :predefine="predefineColors" v-model="oldLineColor" />
          </div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("对比方案：") }}</div>
          <div class="form_value" style="display: flex; align-items: center">
            <el-switch v-model="showNewLine" style="margin-right: 20px" />
            <el-color-picker size="mini" :predefine="predefineColors" v-model="newLineColor" />
          </div>
        </div>
        <div class="form_item">
          <TimeRangeSlider :value="[this.s_form.startTime, this.s_form.endTime]" :start.sync="s_form.startTime" :end.sync="s_form.endTime" />
        </div>
      </div>
      <el-table class="small" :data="top5List" border stripe v-loading="loading1">
        <el-table-column prop="name" :label="$l('name')" />
        <el-table-column prop="type" :label="$l('type')" />
        <el-table-column prop="value" :label="$l('value')" />
      </el-table>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "RouteFlows":{
    "zh-CN": "Route Flows",
    "en-US": "Route Flows"
  },
  "Top5Routes":{
    "zh-CN": "Top 5 Routes",
    "en-US": "Top 5 Routes"
  },
  "name":{
    "zh-CN": "name",
    "en-US": "name"
  },
  "type":{
    "zh-CN": "type",
    "en-US": "type"
  },
  "value":{
    "zh-CN": "value",
    "en-US": "value"
  },
  "showOnChart":{
    "zh-CN": "在图表上显示",
    "en-US": "Display on chart"
  },
  "基础方案：":{
    "zh-CN": "基础方案：",
    "en-US": "基础方案："
  },
  "对比方案：":{
    "zh-CN": "对比方案：",
    "en-US": "对比方案："
  },
}
</language>

<script>
import { RouteFlowsLayer } from "../layer/RouteFlowsLayer";
import { BusLineLayer } from "../layer/BusLineLayer";
import { BusStopLayer } from "../layer/BusStopLayer";

import * as Bean from "@/utils/Bean";
import PassengerFlowDialog from "../dialog/PassengerFlowDialog/index.vue";

import { routeFlows, routeChangeInfo } from "@/api/contrast";

import Vue from "vue";

const PassengerFlowDialogExtend = Vue.extend(PassengerFlowDialog);

export default {
  name: "RouteFlows",
  inject: ["rootVue"],
  props: {
    routeDetail: {
      type: Object,
      default: () => ({}),
    },
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    top5List() {
      return this.sortList.slice(0, 5);
    },
  },
  watch: {
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
    s_form: {
      handler(val) {
        this.getList1();
        this.getList2();
      },
      deep: true,
    },
    showOldLine() {
      if (this._OldRouteFlowsLayer) {
        this._OldRouteFlowsLayer.visible = this.showOldLine;
      }
      if (this._OldBusLineLayer) {
        this._OldBusLineLayer.visible = this.showOldLine;
      }
      if (this._OldBusStopLayer) {
        this._OldBusStopLayer.visible = this.showOldLine;
      }
    },
    oldLineColor() {
      if (this._OldRouteFlowsLayer) {
        this._OldRouteFlowsLayer.setColor(this.oldLineColor);
      }
      if (this._OldBusStopLayer) {
        this._OldBusStopLayer.setColor(this.oldLineColor);
      }
      if (this._OldBusLineLayer) {
        this._OldBusLineLayer.setColor(this.oldLineColor);
      }
    },
    showNewLine() {
      if (this._NewRouteFlowsLayer) {
        this._NewRouteFlowsLayer.visible = this.showNewLine;
      }
      if (this._NewBusStopLayer) {
        this._NewBusStopLayer.visible = this.showNewLine;
      }
      if (this._NewBusLineLayer) {
        this._NewBusLineLayer.visible = this.showNewLine;
      }
    },
    newLineColor() {
      if (this._NewRouteFlowsLayer) {
        this._NewRouteFlowsLayer.setColor(this.newLineColor);
      }
      if (this._NewBusStopLayer) {
        this._NewBusStopLayer.setColor(this.newLineColor);
      }
      if (this._NewBusLineLayer) {
        this._NewBusLineLayer.setColor(this.newLineColor);
      }
    },
  },
  data() {
    return {
      predefineColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],

      loading1: false,

      sortList: [],

      s_form: {
        startTime: 0,
        endTime: 24 * 60 * 60,
      },

      showOldLine: true,
      oldLineColor: "#E9CDAA",
      oldLine: {},

      showNewLine: true,
      newLineColor: "#ff4500",
      newLine: {},

      _OldRouteFlowsLayer: null,
      _OldBusLineLayer: null,
      _OldBusStopLayer: null,
      _NewRouteFlowsLayer: null,
      _NewBusLineLayer: null,
      _NewBusStopLayer: null,
    };
  },
  created() {
    try {
      this.s_form.startTime = this.routeDetail.startTime || 0;
      this.s_form.endTime = this.routeDetail.endTime || 24 * 60 * 60;
    } catch (error) {
      this.s_form.startTime = 0;
      this.s_form.endTime = 24 * 60 * 60;
    }

    this._OldRouteFlowsLayer = new RouteFlowsLayer({ zIndex: 10, color: this.oldLineColor, visible: this.showOldLine });
    this._OldBusLineLayer = new BusLineLayer({
      zIndex: 29,
      color: this.oldLineColor,
      visible: this.showOldLine,
      isDashed: true,
    });
    this._OldBusStopLayer = new BusStopLayer({
      zIndex: 39,
      color: this.oldLineColor,
      visible: this.showOldLine,
    });

    this._NewRouteFlowsLayer = new RouteFlowsLayer({ zIndex: 10, color: this.newLineColor, visible: this.showNewLine });
    this._NewBusLineLayer = new BusLineLayer({
      zIndex: 26,
      color: this.newLineColor,
      visible: this.showNewLine,
    });
    this._NewBusStopLayer = new BusStopLayer({
      zIndex: 36,
      color: this.newLineColor,
      visible: this.showNewLine,
    });
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
    this._OldRouteFlowsLayer.dispose();
    this._NewRouteFlowsLayer.dispose();
    this._OldBusLineLayer.dispose();
    this._NewBusLineLayer.dispose();
    this._OldBusStopLayer.dispose();
    this._NewBusStopLayer.dispose();
  },
  methods: {
    getListObj(list) {
      const linkObj = {};
      const fromOffsetObj = {};
      const toOffsetObj = {};
      for (const v1 of list) {
        for (const v2 of v1.to.reverse()) {
          if (v2.stop) {
            fromOffsetObj[v1.stop.name] = Number(fromOffsetObj[v1.stop.name] || 0) + v2.passenger;
            toOffsetObj[v2.stop.name] = Number(toOffsetObj[v2.stop.name] || 0) + v2.passenger;
            const key = `${v1.stop.name}-${v2.stop.name}`;
            linkObj[key] = {
              source: v1.stop.name,
              target: v2.stop.name,
              sourceId: v1.stop.id,
              targetId: v2.stop.id,
              value: v2.passenger,
            };
          }
        }
      }
      return {
        linkObj: linkObj,
        maxPassenger: Math.max(...[...Object.values(fromOffsetObj), ...Object.values(toOffsetObj)]),
      };
    },
    getSortList(oldLinkObj, newLinkObj) {
      const list = [];
      for (const key in oldLinkObj) {
        const item = oldLinkObj[key];
        if (item.value) {
          list.push({
            type: "old",
            name: key,
            value: item.value,
          });
        }
      }
      for (const key in newLinkObj) {
        const item = newLinkObj[key];
        if (item.value) {
          list.push({
            type: "new",
            name: key,
            value: item.value,
          });
        }
      }

      return list.sort((a, b) => {
        return b.value - a.value;
      });
    },
    getList1() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      return routeFlows({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeId: this.routeDetail.routeId,
        startTime: this.s_form.startTime,
        endTime: this.s_form.endTime,
      })
        .then((res) => {
          const { linkObj: oldLinkObj, maxPassenger: oldMaxPassenger } = this.getListObj(res.data.before);
          const { linkObj: newLinkObj, maxPassenger: newMaxPassenger } = this.getListObj(res.data.after);

          this.stopMap = new Map(
            res.data.stops.map((v, i) => {
              v.index = i;
              return [v.id, v];
            })
          );
          this.oldLinkObj = oldLinkObj;
          this.newLinkObj = newLinkObj;
          this.sortList = this.getSortList(oldLinkObj, newLinkObj);
          this.maxPassenger = Math.max(oldMaxPassenger, newMaxPassenger);

          this._OldRouteFlowsLayer.setData(this.stopMap, this.oldLinkObj, this.maxPassenger);
          this._NewRouteFlowsLayer.setData(this.stopMap, this.newLinkObj, this.maxPassenger);

          this.loading1 = false;
        })
        .catch((err) => {
          this.list = [];
          this.oldLinkObj = [];
          this.newLinkObj = [];
          this.maxPassenger = 20;
          this.loading1 = false;
        });
    },
    getList2() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      routeChangeInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeId: this.routeDetail.routeId,
      })
        .then((res) => {
          const oldLine = new Bean.TransitRoute(res.data.before || {});
          const newLine = new Bean.TransitRoute(res.data.after || {});
          this._OldBusLineLayer.setData(oldLine);
          this._NewBusLineLayer.setData(newLine);
          this._OldBusStopLayer.setData(oldLine);
          this._NewBusStopLayer.setData(newLine);

          if (res.data.before) {
            this._Map.setCenter(oldLine.center.toList());
          } else if (res.data.after) {
            this._Map.setCenter(newLine.center.toList());
          }
          this.loading1 = false;
        })
        .catch(() => {
          this.loading1 = false;
        });
    },
    handleEnable() {
      this._Map.addLayer(this._OldRouteFlowsLayer);
      this._Map.addLayer(this._OldBusStopLayer);
      this._Map.addLayer(this._OldBusLineLayer);

      this._Map.addLayer(this._NewRouteFlowsLayer);
      this._Map.addLayer(this._NewBusStopLayer);
      this._Map.addLayer(this._NewBusLineLayer);
      this.getList1();
      this.getList2();
    },
    handleDisable() {
      this._Map.removeLayer(this._OldBusStopLayer);
      this._Map.removeLayer(this._OldRouteFlowsLayer);
      this._Map.removeLayer(this._OldBusLineLayer);

      this._Map.removeLayer(this._NewBusStopLayer);
      this._Map.removeLayer(this._NewRouteFlowsLayer);
      this._Map.removeLayer(this._NewBusLineLayer);
    },
    handleShowPassengerFlowDialog(data = this.routeDetail) {
      if (!this._passengerFlowDialogList) {
        this._passengerFlowDialogList = [];
      }
      data.startTime = this.s_form.startTime;
      data.endTime = this.s_form.endTime;
      const _passengerFlowDialog = new PassengerFlowDialogExtend({
        propsData: { form: data, offset: this._passengerFlowDialogList.length * 20 },
        parent: this.rootVue,
      }).$mount();
      // this._passengerFlowDialogList.push(_passengerFlowDialog);
      _passengerFlowDialog.$on("close", () => {
        _passengerFlowDialog.$destroy();
        let index = this._passengerFlowDialogList.findIndex((v) => v === _passengerFlowDialog);
        if (index > -1) {
          this._passengerFlowDialogList.splice(index, 1);
        }
      });
      _passengerFlowDialog.chartType = "Route Flows";
      document.body.append(_passengerFlowDialog.$el);
    },
  },
};
</script>

<style lang="scss" scoped>
.RouteFlows {
  font-size: 13px;
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  ._bodyer {
    padding: 0 20px;
    .title {
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
    }
    .form {
      width: 100%;
      .form_item {
        width: 100%;
        display: flex;
        & + .form_item {
          margin-top: 10px;
        }
        .form_label {
          flex-shrink: 0;
          padding-right: 10px;
        }
        .form_value {
          width: 100%;
        }
      }
    }
    .path {
      padding-top: 10px;
      svg {
        width: 100%;
        height: auto;
        max-height: 300px;
        margin: auto;
        transform: rotateX(180deg);
      }
    }
  }
}
</style>
