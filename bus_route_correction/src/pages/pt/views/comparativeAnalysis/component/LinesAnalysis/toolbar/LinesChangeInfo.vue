<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ $l("线路比对分析") }}</div>
    </div>
    <div class="toolbar_item_bodyer">
      <div class="title">
        <span>{{ $l("修改的线路") }}&nbsp;&nbsp;&nbsp;</span>
        <span class="el-icon-refresh-right" @click="getList1"></span>
      </div>
      <el-table class="small my_tabel" :data="list1" border stripe height="300px" v-loading="loading1">
        <el-table-column :label="$l('Line')" prop="lineName" show-overflow-tooltip />
        <el-table-column :label="$l('Route')" prop="routeName" show-overflow-tooltip />
        <el-table-column width="50">
          <el-dropdown slot-scope="{ row }" trigger="click" @command="handleRouteMenu({ data: row, command: $event })">
            <span class="el-dropdown-link el-icon-arrow-down el-icon--right"></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="线路变动信息" :disabled="!row.path && !row.stop">{{ $l("线路变动信息") }}</el-dropdown-item>
              <!-- <el-dropdown-item command="站点变动信息" :disabled="!row.stop">{{ $l("站点变动信息") }}</el-dropdown-item> -->
              <el-dropdown-item command="时刻表信息变动" :disabled="!row.time">{{ $l("时刻表信息变动") }}</el-dropdown-item>
              <el-dropdown-item command="Xml信息对比">{{ $l("Xml信息对比") }}</el-dropdown-item>
              <el-dropdown-item command="客流信息变化">{{ $l("客流信息变化") }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-table-column>
      </el-table>
      <div class="title">
        <span>{{ $l("受影响的线路") }}&nbsp;&nbsp;&nbsp;</span>
        <span class="el-icon-refresh-right" @click="getList2"></span>
      </div>
      <el-table class="small my_tabel" :data="list2" border stripe height="300px" v-loading="loading2">
        <el-table-column :label="$l('Line')" prop="lineName" show-overflow-tooltip />
        <el-table-column :label="$l('Route')" prop="routeName" show-overflow-tooltip />
        <el-table-column width="50">
          <el-dropdown slot-scope="{ row }" trigger="click" @command="handleRouteMenu({ data: row, command: $event })">
            <span class="el-dropdown-link el-icon-arrow-down el-icon--right" />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="客流信息变化">{{ $l("客流信息变化") }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-table-column>
      </el-table>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "线路比对分析":{
    "zh-CN": "线路比对分析",
    "en-US": "Line comparison analysis"
  },
  "修改的线路":{
    "zh-CN": "修改的线路",
    "en-US": "Modified lines"
  },
  "受影响的线路":{
    "zh-CN": "受影响的线路",
    "en-US": "Lines affected"
  },
  "Line":{
    "zh-CN": "线",
    "en-US": "Line"
  },
  "Route":{
    "zh-CN": "路线",
    "en-US": "Route"
  },
  "线路变动信息":{
    "zh-CN": "线路变动信息",
    "en-US": "Line Change Information"
  },
  "站点变动信息":{
    "zh-CN": "站点变动信息",
    "en-US": "Information on site changes"
  },
  "时刻表信息变动":{
    "zh-CN": "时刻表信息变动",
    "en-US": "Timetable information changes"
  },
  "Xml信息对比":{
    "zh-CN": "Xml信息对比",
    "en-US": "Xml Information Comparison"
  },
  "客流信息变化":{
    "zh-CN": "客流信息变化",
    "en-US": "Changes in passenger flow information"
  },
}
</language>

<script>
import TimetableDialog from "../dialog/TimetableDialog/index.vue";
import XmlComparisonDialog from "../dialog/XmlComparisonDialog/index.vue";
import PassengerFlowDialog from "../dialog/PassengerFlowDialog/index.vue";
import RoutesChangeDialog from "../dialog/RoutesChangeDialog/index.vue";
import StopsChangeDialog from "../dialog/StopsChangeDialog/index.vue";

import { changeLines, affectedLines } from "@/api/contrast";

import Vue from "vue";

const RoutesChangeDialogExtend = Vue.extend(RoutesChangeDialog);
const StopsChangeDialogExtend = Vue.extend(StopsChangeDialog);
const TimetableDialogExtend = Vue.extend(TimetableDialog);
const XmlComparisonDialogExtend = Vue.extend(XmlComparisonDialog);
const PassengerFlowDialogExtend = Vue.extend(PassengerFlowDialog);

export default {
  name: "toolbar_item",
  inject: ["rootVue"],
  props: {
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
  },
  data() {
    return {
      loading1: false,
      list1: [],
      loading2: false,
      list2: [],
    };
  },
  created() {
    this.getList1();
    this.getList2();
  },
  mounted() {},
  methods: {
    // 获取修改的线路
    getList1() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      return changeLines({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      })
        .then((res) => {
          this.list1 = res.data;
          this.loading1 = false;
        })
        .catch((err) => {
          this.list1 = [];
          this.loading1 = false;
        });
    },
    // 获取受影响的线路
    getList2() {
      this.loading2 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      return affectedLines({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      })
        .then((res) => {
          this.list2 = res.data;
          this.loading2 = false;
        })
        .catch((err) => {
          this.list2 = [];
          this.loading2 = false;
        });
    },
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {
      if (this._passengerFlowDialog) [...this._passengerFlowDialog].forEach((v) => v.$emit("close"));
    },
    // 菜单点击事件
    handleRouteMenu({ data, command }) {
      switch (command) {
        case "线路变动信息":
          this.handleShowRoutesChangeDialog(data);
          break;
        case "站点变动信息":
          this.handleShowStopsChangeDialog(data);
          break;
        case "时刻表信息变动":
          this.handleShowTimetableDialog(data);
          break;
        case "Xml信息对比":
          this.handleShowXmlComparisonDialog(data);
          break;
        case "客流信息变化":
          this.handleShowPassengerFlowDialog(data);
          break;
      }
    },
    // 显示线路变动信息
    handleShowRoutesChangeDialog(data) {
      if (!this._routesChangeDialogList) {
        this._routesChangeDialogList = [];
      }
      const _routesChangeDialog = new RoutesChangeDialogExtend({
        propsData: { form: data, offset: this._routesChangeDialogList.length * 20 },
        parent: this.rootVue,
      }).$mount();
      this._routesChangeDialogList.push(_routesChangeDialog);
      _routesChangeDialog.$on("close", () => {
        _routesChangeDialog.$destroy();
        let index = this._routesChangeDialogList.findIndex((v) => v === _routesChangeDialog);
        if (index > -1) {
          this._routesChangeDialogList.splice(index, 1);
        }
      });
      document.body.append(_routesChangeDialog.$el);
    },
    // 显示站点变动信息
    handleShowStopsChangeDialog(data) {
      if (!this._stopsChangeDialogList) {
        this._stopsChangeDialogList = [];
      }
      const _stopsChangeDialog = new StopsChangeDialogExtend({
        propsData: { form: data, offset: this._stopsChangeDialogList.length * 20 },
        parent: this.rootVue,
      }).$mount();
      this._stopsChangeDialogList.push(_stopsChangeDialog);
      _stopsChangeDialog.$on("close", () => {
        _stopsChangeDialog.$destroy();
        let index = this._stopsChangeDialogList.findIndex((v) => v === _stopsChangeDialog);
        if (index > -1) {
          this._stopsChangeDialogList.splice(index, 1);
        }
      });
      document.body.append(_stopsChangeDialog.$el);
    },
    // 显示时刻表信息变动
    handleShowTimetableDialog(data) {
      if (!this._timetableDialogList) {
        this._timetableDialogList = [];
      }
      const _timetableDialog = new TimetableDialogExtend({
        propsData: { form: data, offset: this._timetableDialogList.length * 20 },
        parent: this.rootVue,
      }).$mount();
      this._timetableDialogList.push(_timetableDialog);
      _timetableDialog.$on("close", () => {
        _timetableDialog.$destroy();
        let index = this._timetableDialogList.findIndex((v) => v === _timetableDialog);
        if (index > -1) {
          this._timetableDialogList.splice(index, 1);
        }
      });
      document.body.append(_timetableDialog.$el);
    },
    // 显示Xml信息对比
    handleShowXmlComparisonDialog(data) {
      if (!this._xmlComparisonDialogList) {
        this._xmlComparisonDialogList = [];
      }
      const _xmlComparisonDialog = new XmlComparisonDialogExtend({
        propsData: { form: data, offset: this._xmlComparisonDialogList.length * 20 },
        parent: this.rootVue,
      }).$mount();
      this._xmlComparisonDialogList.push(_xmlComparisonDialog);
      _xmlComparisonDialog.$on("close", () => {
        _xmlComparisonDialog.$destroy();
        let index = this._xmlComparisonDialogList.findIndex((v) => v === _xmlComparisonDialog);
        if (index > -1) {
          this._xmlComparisonDialogList.splice(index, 1);
        }
      });
      document.body.append(_xmlComparisonDialog.$el);
    },
    // 显示客流信息变化
    handleShowPassengerFlowDialog(data) {
      if (!this._passengerFlowDialogList) {
        this._passengerFlowDialogList = [];
      }
      const _passengerFlowDialog = new PassengerFlowDialogExtend({
        propsData: { form: data, offset: this._passengerFlowDialogList.length * 20 },
        parent: this.rootVue,
      }).$mount();
      this._passengerFlowDialogList.push(_passengerFlowDialog);
      _passengerFlowDialog.$on("close", () => {
        _passengerFlowDialog.$destroy();
        let index = this._passengerFlowDialogList.findIndex((v) => v === _passengerFlowDialog);
        if (index > -1) {
          this._passengerFlowDialogList.splice(index, 1);
        }
      });
      document.body.append(_passengerFlowDialog.$el);
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  font-size: 13px;
  .toolbar_item_bodyer {
    .title {
      font-size: 18px;
      font-weight: bold;
      margin: 10px 0;
      .el-icon-refresh-right {
        cursor: pointer;
        color: #409eff;
      }
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
