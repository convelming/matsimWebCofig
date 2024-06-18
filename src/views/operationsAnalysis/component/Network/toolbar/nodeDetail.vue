<template>
  <el-collapse-item class="toolbar_item my_collapse_item2" :name="name">
    <div class="toolbar_item_header" slot="title">{{ $l("nodeDetail") }} {{ nodeDetail.id }}</div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <el-descriptions class="margin-top" :column="1" border size="small" labelClassName="labelClassName">
        <template slot="extra">
          <el-button type="primary" size="mini" icon="el-icon-aim" circle @click="handleChangeMapCenter"></el-button>
          <el-button type="primary" size="mini" @click="handleMenu({ data: resData, command: 'intersectionFlows' })">{{ $l("intersectionFlows") }}</el-button>
        </template>
        <el-descriptions-item label="Node Id">{{ resData.id }}</el-descriptions-item>
        <el-descriptions-item label="X">{{ resData.x }}</el-descriptions-item>
        <el-descriptions-item label="Y">{{ resData.y }}</el-descriptions-item>
        <el-descriptions-item label="Number of In-Links">{{ resData.in }}</el-descriptions-item>
        <el-descriptions-item label="Number of Out-Links">{{ resData.out }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <NodeMenu :visible.sync="showMenu" :style="menuStyle" @command="handleMenu({ data: stopList[0], command: $event.command })" />
  </el-collapse-item>
</template>

<language>
{
  "nodeDetail":{
    "zh-CN": "节点详情",
    "en-US": "Node Detail"
  },
  "intersectionFlows":{
    "zh-CN": "交叉口流量",
    "en-US": "Intersection Flows"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import NodeMenu, { node_menu } from "../menu/Node.vue";
import { getNodeById } from "@/api/index";
import IntersectionFlows from "../dialog/IntersectionFlows.vue";

import { SelectStopLayer } from "../layer/SelectNodeLayer.js";

import Vue from "vue";

const IntersectionFlowsExtend = Vue.extend(IntersectionFlows);
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    nodeDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["rootVue"],
  components: {
    NodeMenu,
  },
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
      loading: true,
      resData: {},
      showMenu: false,
      menuStyle: "top:100px;left:100px;z-index:1000;",
      stopColor: "#ff8c00",

      _SelectStopLayer: undefined,
    };
  },
  created() {
    this._SelectStopLayer = new SelectStopLayer({
      zIndex: 100,
      color: this.stopColor,
    });
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
      getNodeById({ nodeId: this.nodeDetail.id })
        .then((res) => {
          this.resData = res.data;
          this._SelectStopLayer.setData(this.resData);
          this.loading = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleEnable() {
      this._MapEvnetId1 = this._Map.addEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this.handleOpenMenu);
      window.addEventListener("mousedown", this.handleCloseMenu);

      this._Map.addLayer(this._SelectStopLayer);
    },
    handleDisable() {
      this._Map.removeEventListener(MAP_EVENT.HANDLE_CLICK_RIGHT, this._MapEvnetId1);
      window.removeEventListener("mousedown", this.handleCloseMenu);

      this._Map.removeLayer(this._SelectStopLayer);
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
        case "intersectionFlows":
          this.handleShowIntersectionFlows(data);
          break;
      }
    },
    handleShowIntersectionFlows() {
      if (this._intersectionFlows) return;
      this._intersectionFlows = new IntersectionFlowsExtend({
        propsData: { nodeId: this.nodeDetail.id },
        parent: this.rootVue,
      }).$mount();
      this._intersectionFlows.$on("close", () => {
        this._intersectionFlows.$destroy();
        this._intersectionFlows = null;
      });
      document.body.append(this._intersectionFlows.$el);
    },
    handleChangeMapCenter() {
      const coord = this.resData;
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
.toolbar_item {
  .toolbar_item_header {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  .toolbar_item_bodyer {
    padding: 0 20px;
    .row {
      line-height: 35px;
      display: flex;
      margin-bottom: 10px;
    }
  }
}
</style>
