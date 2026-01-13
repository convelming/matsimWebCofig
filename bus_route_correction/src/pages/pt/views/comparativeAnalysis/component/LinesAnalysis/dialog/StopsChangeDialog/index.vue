<template>
  <Dialog class="StopsChangeDialog" ref="dialog" :title="$l('站点变动信息')" :visible="true" @close="$emit('close')" top="80" left="80" width="600px">
    <div class="StopsChangeDialog__bodyer">
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <div class="_title">
            <el-checkbox v-model="showOldLine">{{ $l("基础方案") }}</el-checkbox>
          </div>
          <div class="_tools">
            <el-color-picker size="mini" :predefine="predefineColors" v-model="oldLineColor"  style="margin-right: 20px;"/>
            <el-button type="primary" size="mini" circle icon="el-icon-map-location" @click="handleLocationLine(oldLine)"></el-button>
          </div>
        </el-col>
        <el-col :span="12" :offset="0">
          <div class="_title">
            <el-checkbox v-model="showNewLine">{{ $l("对比方案") }}</el-checkbox>
          </div>
          <div class="_tools">
            <el-color-picker size="mini" :predefine="predefineColors" v-model="newLineColor" style="margin-right: 20px;"/>
            <el-button type="primary" size="mini" circle icon="el-icon-map-location" @click="handleLocationLine(newLine)"></el-button>
          </div>
        </el-col>
      </el-row>
      <code-diff class="code-diff" :old-string="oldText" :new-string="newText" output-format="side-by-side" :context="100" isShowNoChange/>
    </div>
  </Dialog>
</template>

<language>
{
  "站点变动信息":{
    "zh-CN": "站点变动信息",
    "en-US": "Modified Stop Info"
  },
  "基础方案":{
    "zh-CN": "基础方案",
    "en-US": "Base Scenario"
  },
  "对比方案":{
    "zh-CN": "对比方案",
    "en-US": "Compared Scheme"
  },
  "vehicleId":{
    "zh-CN": "车辆标识",
    "en-US": "VehicleId"
  },
  "id":{
    "zh-CN": "ID",
    "en-US": "ID"
  },
  "departureTime":{
    "zh-CN": "出发时间",
    "en-US": "Departure Time"
  },
}
</language>

<script>
import CodeDiff from "vue-code-diff";
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
  components: { CodeDiff },
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
      predefineColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      s_form: {},

      showOldLine: true,
      oldLineColor: "#E9CDAA",
      oldLine: {},
      oldText: "",

      showNewLine: true,
      newLineColor: "#ff4500",
      newLine: {},
      newText: "",

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
    // 获取数据
    init() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      routeChangeInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeId: this.form.routeId,
      }).then((res) => {
        this.oldLine = new Bean.TransitRoute(res.data.before || {});
        this.oldText = this.oldLine.stops.map((v, i) => `${i + 1}. ${v.name}`).join("\n");
        this.newLine = new Bean.TransitRoute(res.data.after || {});
        this.newText = this.newLine.stops.map((v, i) => `${i + 1}. ${v.name}`).join("\n");
        this._OldBusStopLayer.setData(this.oldLine);
        this._NewBusStopLayer.setData(this.newLine);

        if (res.data.before) {
          this._Map.setCenter(this.oldLine.center.toList());
        } else if (res.data.after) {
          this._Map.setCenter(this.newLine.center.toList());
        }
        this.loading1 = false;
      });
    },
    // 根据数据定位
    handleLocationLine(data) {
      this._Map.setCenter(data.center.toList());
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .code-diff {
    width: 100% !important;
    height: auto !important;
    max-height: calc(100vh - 250px) !important;
    overflow: auto !important;
  }
}
.StopsChangeDialog__bodyer {
  ._title {
    text-align: center;
    padding-bottom: 20px; 
  }
  ._tools {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
  }
}
</style>
