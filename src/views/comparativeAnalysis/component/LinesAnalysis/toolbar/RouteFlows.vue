<template>
  <el-collapse-item class="RouteFlows" :name="name">
    <div class="collapse_item_title" slot="title">{{ $l("RouteFlows") }} {{ this.routeDetail.routeId }}</div>
    <div class="_bodyer">
      <div class="title">
        <span>{{ $l("Top5Routes") }}&nbsp;&nbsp;&nbsp;</span>
        <el-button type="primary" size="mini" circle icon="el-icon-refresh-right" @click="getList1"></el-button>
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
}
</language>

<script>
import { RouteFlowsLayer } from "../layer/RouteFlowsLayer";
import PassengerFlowDialog from "../dialog/PassengerFlowDialog/index.vue";

import { routeFlows } from "@/api/contrast";

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
  },
  data() {
    return {
      loading1: false,

      list: [],
      oldLinkObj: {},
      newLinkObj: {},
      sortList: [],

      s_form: {
        startTime: 0,
        endTime: 24 * 60 * 60,
      },

      _RouteFlowsLayer: null,
    };
  },
  created() {
    this._RouteFlowsLayer = new RouteFlowsLayer({ zIndex: 10 });

    this.getList1();
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_showLayer) {
        this.handleEnable();
      }
    }, 1000);
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
        const item2 = oldLinkObj[key];
        if (item2.value) {
          list.push({
            type: "old",
            name: key,
            value: item2.value,
          });
        }
      }
      for (const key in newLinkObj) {
        const item2 = newLinkObj[key];
        if (item2.value) {
          list.push({
            type: "new",
            name: key,
            value: item2.value,
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

          this.list = res.data.stops;
          this.oldLinkObj = oldLinkObj;
          this.newLinkObj = newLinkObj;
          this.sortList = this.getSortList(oldLinkObj, newLinkObj);

          this.maxPassenger = Math.max(oldMaxPassenger, newMaxPassenger);
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
    handleEnable() {
      this._Map.addLayer(this._RouteFlowsLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._RouteFlowsLayer);
    },
    handleShowPassengerFlowDialog(data = this.routeDetail) {
      if (!this._passengerFlowDialogList) {
        this._passengerFlowDialogList = [];
      }
      const _passengerFlowDialog = new PassengerFlowDialogExtend({
        propsData: { form: data, offset: this._passengerFlowDialogList.length * 20 },
        parent: this,
      }).$mount();
      // this._passengerFlowDialogList.push(_passengerFlowDialog);
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
