<template>
  <div class="StopsChangeDialog">
    <Dialog ref="dialog" :title="$l('站点变动信息')" :visible="true" @close="$emit('close')" top="80" left="80" width="400px">
      <div class="StopsChangeDialog__bodyer">
        <div class="row">
          <div class="col">
            <div class="_title">
              <el-checkbox v-model="showOldLine">{{ $l("基础方案") }}</el-checkbox>
            </div>
            <div class="_tools">
              <el-color-picker size="mini" :predefine="predefineColors" v-model="oldLineColor" />
              <el-button type="primary" size="mini" circle icon="el-icon-map-location" @click="handleLocationLine(oldLine)"></el-button>
            </div>
            <div class="_content">
              <div class="stop_list">
                <div class="stop_item" v-for="(v, $index) in oldLine.stops" :key="$index">
                  <div class="index">{{ $index + 1 }}</div>
                  <div class="name">{{ v.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="_title">
              <el-checkbox v-model="showNewLine">{{ $l("对比方案") }}</el-checkbox>
            </div>
            <div class="_tools">
              <el-color-picker size="mini" :predefine="predefineColors" v-model="newLineColor" />
              <el-button type="primary" size="mini" circle icon="el-icon-map-location" @click="handleLocationLine(newLine)"></el-button>
            </div>
            <div class="_content">
              <div class="stop_list">
                <div class="stop_item" v-for="(v, $index) in newLine.stops" :key="$index">
                  <div class="index">{{ $index + 1 }}</div>
                  <div class="name">{{ v.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<language>
{
  "站点变动信息":{
    "zh-CN": "站点变动信息",
    "en-US": "Stop changes"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "基础方案"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "对比方案"
  },
  "vehicleId":{
    "zh-CN": "vehicleId",
    "en-US": "vehicleId"
  },
  "id":{
    "zh-CN": "id",
    "en-US": "id"
  },
  "departureTime":{
    "zh-CN": "departureTime",
    "en-US": "departureTime"
  },
}
</language>

<script>
import { BusStopLayer } from "../../layer/BusStopLayer";

import * as Bean from "@/utils/Bean";
import { routeChangeInfo } from "@/api/contrast";

export default {
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    offset: {
      type: Number,
      default: 0,
    },
  },
  inject: ["rootVue"],
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    showOldLine() {
      if (this._OldBusStopLayer) {
        this._OldBusStopLayer.visible = this.showOldLine;
      }
    },
    oldLineColor() {
      if (this._OldBusStopLayer) {
        this._OldBusStopLayer.setColor(this.oldLineColor);
      }
    },
    showNewLine() {
      if (this._NewBusStopLayer) {
        this._NewBusStopLayer.visible = this.showNewLine;
      }
    },
    newLineColor() {
      if (this._NewBusStopLayer) {
        this._NewBusStopLayer.setColor(this.newLineColor);
      }
    },
  },
  data() {
    return {
      predefineColors: ["#E9CDAA", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#409eff", "#c71585"],
      s_form: {},

      showOldLine: true,
      oldLineColor: "#E9CDAA",
      oldLine: {},

      showNewLine: true,
      newLineColor: "#ff4500",
      newLine: {},

      loading1: false,
    };
  },
  created() {
    this._OldBusStopLayer = new BusStopLayer({
      zIndex: 30,
      color: this.oldLineColor,
      visible: this.showOldLine,
    });
    this._NewBusStopLayer = new BusStopLayer({
      zIndex: 33,
      color: this.newLineColor,
      visible: this.showNewLine,
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.dialog.offset(this.offset, this.offset);
    });

    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      this.handleEnable();
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
    this._OldBusStopLayer.dispose();
    this._NewBusStopLayer.dispose();
  },
  methods: {
    // 组件初始化事件
    handleEnable() {
      this._Map.addLayer(this._OldBusStopLayer);
      this._Map.addLayer(this._NewBusStopLayer);
      this.init();
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._OldBusStopLayer);
      this._Map.removeLayer(this._NewBusStopLayer);
    },
    init() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      routeChangeInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeId: this.form.routeId,
      }).then((res) => {
        this.oldLine = new Bean.TransitRoute(res.data.before || {});
        this.newLine = new Bean.TransitRoute(res.data.after || {});
        this._OldBusStopLayer.setData(this.oldLine);
        this._NewBusStopLayer.setData(this.newLine);

        console.log(this._Map, this.rootVue);
        this._Map.setCenter(this.oldLine.center.toList());
        this.loading1 = false;
      });
    },
    handleLocationLine(data) {
      this._Map.setCenter(data.center.toList());
    },
  },
};
</script>

<style lang="scss" scoped>
.StopsChangeDialog__bodyer {
  .row {
    display: flex;
    justify-content: space-between;
    .col {
      box-sizing: border-box;
      padding: 10px;
      border-radius: 5px;
      width: calc(50% - 10px);
      background-color: #eee;
      ._title {
        text-align: center;
        margin-bottom: 20px;
      }
      ._tools {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        & > * + * {
          margin-left: 10px;
        }
        .el-color-picker {
          background-color: #fff;
        }
      }
      ._content {
        font-size: 14px;
        .stop_item {
          display: flex;
          font-size: 12px;
          .index {
            flex-shrink: 0;
            width: 2.5em;
          }
          .name {
            width: 100%;
          }
          .btn_box {
            flex-shrink: 0;
            padding: 0 10px;
            .edit_btn {
              cursor: pointer;
              color: #409eff;
            }
            .delete_btn {
              cursor: pointer;
              margin-left: 10px;
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}
</style>
