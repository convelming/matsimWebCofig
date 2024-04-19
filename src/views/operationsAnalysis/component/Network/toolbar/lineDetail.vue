<template>
  <el-collapse-item class="BusStopToolbar" :name="name">
    <div class="collapse_item_title" slot="title">{{ title }}</div>
    <div class="BusStopToolbar_bodyer">
      <el-descriptions class="margin-top" :column="1" border size="small" labelClassName="labelClassName">
        <template slot="extra">
          <el-button type="primary" size="small" @click="handleMenu({ data: resData, command: 'selectLinkAnalysis' })">Select Link Analysis</el-button>
          <el-button type="primary" size="small" @click="handleMenu({ data: resData, command: 'transitLinesOnLink' })">Transit Lines On Link</el-button>
        </template>
        <el-descriptions-item label="Link Id">{{ resData.id }}</el-descriptions-item>
        <el-descriptions-item label="From Node Id">{{ resData.fromNode }}</el-descriptions-item>
        <el-descriptions-item label="To Node Id">{{ resData.toNode }}</el-descriptions-item>
        <el-descriptions-item label="Allowed Transport Node">{{ resData.allowedTransportNode }}</el-descriptions-item>
        <el-descriptions-item label="Length">{{ resData.length }}</el-descriptions-item>
        <el-descriptions-item label="Capacity">{{ resData.capacity }}</el-descriptions-item>
        <el-descriptions-item label="Free Speed">{{ resData.freespeed }}</el-descriptions-item>
        <el-descriptions-item label="Number of Lanes">{{ resData.numberofLanes }}</el-descriptions-item>
        <el-descriptions-item label="origid">{{ resData.origid }}</el-descriptions-item>
        <el-descriptions-item label="type">{{ resData.type }}</el-descriptions-item>
        <el-descriptions-item label="originId">{{ resData.originId }}</el-descriptions-item>
        <el-descriptions-item label="storageCapacityUsedInQsim">{{ resData.storageCapacityUsedInQsim }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <LineMenu :visible.sync="showMenu" :style="menuStyle" @command="handleMenu({ data: stopList[0], command: $event.command })" />
  </el-collapse-item>
</template>

<script>
import { MAP_EVENT } from "@/mymap";
import LineMenu, { line_menu } from "../menu/Line.vue";
import { getLinkById } from "@/api/index";

import SelectLinkAnalysis from "../dialog/SelectLinkAnalysis.vue";
import TransitLinesOnLink from "../dialog/TransitLinesOnLink.vue";

import Vue from "vue";
import store from "@/store";

const SelectLinkAnalysisExtend = Vue.extend(SelectLinkAnalysis);
const TransitLinesOnLinkExtend = Vue.extend(TransitLinesOnLink);

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
    title() {
      return "LineDetail";
    },
  },
  watch: {
    ids: {
      handler(val) {
        this.getDetail();
      },
      immediate: true,
      deep: true,
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
      loading: true,
      resData: null,
      showMenu: false,
      menuStyle: "top:100px;left:100px;z-index:1000;",
      _NodeLayer: undefined,
    };
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
  },
  methods: {
    getDetail() {
      this.loading = true;
      getLinkById({ linkId: this.lineDetail.linkId })
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
      if (this.stopList.length) {
        this.menuStyle = `top: ${res.data.event.pageY + 10}px; left: ${res.data.event.pageX - 30}px;z-index:1000;`;
        this.showMenu = true;
      }
    },
    handleCloseMenu(event) {
      if (event.button == 0) {
        this.showMenu = false;
      }
    },
    handleMenu({ data, command }) {
      switch (command) {
        case "selectLinkAnalysis":
          this.handleShowSelectLinkAnalysis(data);
          break;
        case "transitLinesOnLink":
          this.handleShowTransitLinesOnLink(data);
          break;
      }
    },
    handleShowSelectLinkAnalysis(data) {
      if (this._selectLinkAnalysis) return;
      this._selectLinkAnalysis = new SelectLinkAnalysisExtend({
        propsData: { form: data },
        store,
      }).$mount();
      this._selectLinkAnalysis.$on("close", () => {
        this._selectLinkAnalysis.$destroy();
        this._selectLinkAnalysis = null;
      });
      document.body.append(this._selectLinkAnalysis.$el);
    },
    handleShowTransitLinesOnLink(data) {
      if (this._transitLinesOnLink) return;
      this._transitLinesOnLink = new TransitLinesOnLinkExtend({
        propsData: { form: data },
        store,
      }).$mount();
      this._transitLinesOnLink.$on("close", () => {
        this._transitLinesOnLink.$destroy();
        this._transitLinesOnLink = null;
      });
      document.body.append(this._transitLinesOnLink.$el);
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
