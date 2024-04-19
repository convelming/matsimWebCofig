<template>
  <el-collapse-item class="BusStopToolbar" :name="name">
    <div class="collapse_item_title" slot="title">{{ title }}</div>
    <div class="BusStopToolbar_bodyer"></div>
    <NodeMenu :visible.sync="showMenu" :style="menuStyle" @command="handleMenu({ data: stopList[0], command: $event.command })" />
  </el-collapse-item>
</template>

<script>
import { MAP_EVENT } from "@/mymap";
import NodeMenu, { node_menu } from "../menu/Node.vue";
import { getNodeById } from "@/api/index";
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
    title() {
      return "NodeDetail";
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
    getDetail(){
      this.loading = true;
      getNodeById({ nodeId: this.lineDetail.linkId }).then((res) => {
        this.resData = res.data;
        this.loading = false;
      }).finally(()=>{
        this.loading = false
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
        this.menuStyle = `top: ${res.data.event.pageY + 10}px; left: ${res.data.event.pageX - 30}px;z-index:1000;`;
        this.showMenu = true;
      }
    },
    handleCloseMenu(event) {
      if (event.button == 0) {
        this.showMenu = false;
      }
    },
    handleMenu({ data, command }) {},
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
