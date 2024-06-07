<template>
  <el-collapse-item class="BusStopToolbar" :name="name">
    <div class="collapse_item_title" slot="title">{{ $l("lineDetail") }} {{ lineDetail.id }}</div>
    <div class="BusStopToolbar_bodyer" v-loading="loading">
      <el-descriptions class="margin-top" :column="1" border size="small" labelClassName="labelClassName">
        <template slot="extra">
          <el-button type="primary" size="mini" icon="el-icon-aim" circle @click="handleChangeMapCenter"></el-button>

          <el-button type="primary" size="mini" @click="handleMenu({ data: resData, command: 'selectLinkAnalysis' })">{{ $l("selectLinkAnalysis") }}</el-button>
          <!-- <el-button type="primary" size="mini" @click="handleMenu({ data: resData, command: 'transitLinesOnLink' })">Transit Lines On Link</el-button> -->
          <el-button type="primary" size="mini" @click="handleMenu({ data: resData, command: 'linkVolumes' })">{{ $l("linkVolumes") }}</el-button>
        </template>
        <el-descriptions-item :label="$l('linkId')">{{ resData.id }}</el-descriptions-item>
        <el-descriptions-item :label="$l('fromNodeId')">{{ resData.fromNode }}</el-descriptions-item>
        <el-descriptions-item :label="$l('toNodeId')">{{ resData.toNode }}</el-descriptions-item>
        <el-descriptions-item :label="$l('allowedTransportNode')">{{ resData.allowedTransportNode }}</el-descriptions-item>
        <el-descriptions-item :label="$l('length')">{{ resData.length }}</el-descriptions-item>
        <el-descriptions-item :label="$l('capacity')">{{ resData.capacity }}</el-descriptions-item>
        <el-descriptions-item :label="$l('freeSpeed')">{{ resData.freespeed }}</el-descriptions-item>
        <el-descriptions-item :label="$l('numberOfLanes')">{{ resData.numberofLanes }}</el-descriptions-item>
        <el-descriptions-item :label="$l('origid')">{{ resData.origid }}</el-descriptions-item>
        <el-descriptions-item :label="$l('type')">{{ resData.type }}</el-descriptions-item>
        <el-descriptions-item :label="$l('originId')">{{ resData.originId }}</el-descriptions-item>
        <el-descriptions-item :label="$l('storageCapacityUsedInQsim')">{{ resData.storageCapacityUsedInQsim }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <LineMenu :visible.sync="showMenu" :style="menuStyle" @command="handleMenu({ data: resData, command: $event.command })" />
  </el-collapse-item>
</template>

<language>
{
  "lineDetail":{
    "zh-CN": "Line Detail",
    "en-US": "Line Detail"
  },
  "selectLinkAnalysis":{
    "zh-CN": "Select Link Analysis",
    "en-US": "Select Link Analysis"
  },
  "linkVolumes":{
    "zh-CN": "Link Volumes",
    "en-US": "Link Volumes"
  },
  "linkId":{
    "zh-CN": "Link Id",
    "en-US": "Link Id"
  },
  "fromNodeId":{
    "zh-CN": "From Node Id",
    "en-US": "From Node Id"
  },
  "toNodeId":{
    "zh-CN": "To Node Id",
    "en-US": "To Node Id"
  },
  "allowedTransportNode":{
    "zh-CN": "Allowed Transport Node",
    "en-US": "Allowed Transport Node"
  },
  "length":{
    "zh-CN": "Length",
    "en-US": "Length"
  },
  "capacity":{
    "zh-CN": "Capacity",
    "en-US": "Capacity"
  },
  "freeSpeed":{
    "zh-CN": "Free Speed",
    "en-US": "Free Speed"
  },
  "numberOfLanes":{
    "zh-CN": "Number of Lanes",
    "en-US": "Number of Lanes"
  },
  "origid":{
    "zh-CN": "origid",
    "en-US": "origid"
  },
  "type":{
    "zh-CN": "type",
    "en-US": "type"
  },
  "originId":{
    "zh-CN": "originId",
    "en-US": "originId"
  },
  "storageCapacityUsedInQsim":{
    "zh-CN": "storageCapacityUsedInQsim",
    "en-US": "storageCapacityUsedInQsim"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import LineMenu, { line_menu } from "../menu/Line.vue";
import { getLinkById } from "@/api/index";
import { guid } from "@/utils/utils";

import LinkVolumes from "../dialog/LinkVolumes.vue";

import Vue from "vue";

const LinkVolumesExtend = Vue.extend(LinkVolumes);

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    lineDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["rootVue"],
  components: {
    LineMenu,
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.rootVue.$emit("setSelectLine", this.lineDetail);
          }, 200);
        } else {
          this.rootVue.$emit("setSelectLine", {});
        }

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
      loading: true,
      resData: {},
      showMenu: false,
      menuStyle: "top:100px;left:100px;z-index:1000;",
    };
  },
  mounted() {
    this.getDetail();
  },
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
  },
  methods: {
    getDetail() {
      this.loading = true;
      getLinkById({ linkId: this.lineDetail.id })
        .then((res) => {
          this.resData = res.data;
          this.loading = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleEnable() {
      this._MapEvnetId1 = this._Map.addEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this.handleOpenMenu);
      window.addEventListener("mousedown", this.handleCloseMenu);
    },
    handleDisable() {
      this._Map.removeEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this._MapEvnetId1);
      window.removeEventListener("mousedown", this.handleCloseMenu);
    },
    handleOpenMenu(res) {
      this.menuStyle = `top: ${res.data.event.pageY + 10}px; left: ${res.data.event.pageX - 30}px;z-index:1000;`;
      this.showMenu = true;
    },
    handleCloseMenu(event) {
      if (event.button == 0) {
        this.showMenu = false;
      }
    },
    handleMenu({ data, command }) {
      switch (command) {
        case "selectLinkAnalysis":
          this.rootVue.handleShowSelectLinkAnalysis({
            uuid: this.name + this.lineDetail.id,
            lineDetail: this.lineDetail,
          });
          break;
        case "linkVolumes":
          this.handleShowLinkVolumes(data);
          break;
      }
    },
    handleShowLinkVolumes() {
      if (this._linkVolumes) return;
      this._linkVolumes = new LinkVolumesExtend({
        propsData: { linkId: this.lineDetail.id },
        parent: this.rootVue,
      }).$mount();
      this._linkVolumes.$on("close", () => {
        this._linkVolumes.$destroy();
        this._linkVolumes = null;
      });
      document.body.append(this._linkVolumes.$el);
    },
    handleChangeMapCenter() {
      const coord = this.resData.fromCoord;
      this.rootVue._Map.setCenter([coord.x, coord.y]);
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
  .labelClassName {
    width: 150px;
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
    .row {
      line-height: 35px;
      display: flex;
      margin-bottom: 10px;
    }
  }
}
</style>
