<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('线路比对分析')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/Activity3D_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/Activity3D_icon.png" />
        <span class="item_title">{{ $l("线路比对分析") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <!-- <div class="form_item">
        <div class="form_label">{{ $l("所有修改线路：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showChangeRoute" style="margin-right: 20px" />
        </div>
      </div> -->
      <div class="form_item">
        <div class="form_label">
          <el-checkbox :disabled="!s_showLayer" v-model="showChangeOld">{{ $l("修改前：") }}</el-checkbox>
        </div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" :title="$l('公交站点颜色')" :predefine="predefineColors" v-model="oldLinkColor" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <el-checkbox :disabled="!s_showLayer" v-model="showChangeNew">{{ $l("修改后：") }}</el-checkbox>
        </div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" :title="$l('公交站点颜色')" :predefine="predefineColors" v-model="newLinkColor" />
        </div>
      </div>
      <!-- <div class="form_tip">{{ $l("（虚线为修改前线路， 实线为修改后线路）") }}</div> -->

      <div class="form_item">
        <div class="form_label">
          <el-checkbox :disabled="!s_showLayer" v-model="showAffectedRoutes">{{ $l("受影响线路：") }}</el-checkbox>
        </div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" :title="$l('受影响线路颜色')" :predefine="predefineColors" v-model="affectedLinkColor" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <el-checkbox :disabled="!s_showLayer" v-model="showAffectedStop">{{ $l("受影响站点：") }}</el-checkbox>
        </div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" :title="$l('受影响站点颜色')" :predefine="predefineColors" v-model="affectedStopColor" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "线路比对分析":{
    "zh-CN": "线路比对分析",
    "en-US": "Transit Routes Comparison Analysis"
  },
  "所有修改线路：":{
    "zh-CN": "所有修改线路：",
    "en-US": "All Modified Routes："
  },
  "修改前线路颜色":{
    "zh-CN": "修改前线路颜色",
    "en-US": "Base Line Color"
  },
  "修改后线路颜色":{
    "zh-CN": "修改后线路颜色",
    "en-US": "Modified Line Color"
  },
  "（虚线为修改前线路， 实线为修改后线路）":{
    "zh-CN": "（虚线为修改前线路， 实线为修改后线路）",
    "en-US": "(Dashed lines are based routes, solid lines are modified lines.)"
  },
  "受影响线路：":{
    "zh-CN": "受影响线路：",
    "en-US": "Affected Routes："
  },
  "受影响线路颜色":{
    "zh-CN": "受影响线路颜色",
    "en-US": "Affected Line Color"
  },
  "受影响站点：":{
    "zh-CN": "受影响站点：",
    "en-US": "Affected Stops："
  },
  "受影响站点颜色":{
    "zh-CN": "受影响站点颜色",
    "en-US": "Affected Stop Color"
  },
  "修改前：":{
    "zh-CN": "修改前：",
    "en-US": "Base Scenario"
  },
  "修改后：":{
    "zh-CN": "修改后：",
    "en-US": "Modified"
  }
}
</language>

<script>
import { BusLineListLayer } from "./layer/BusLineListLayer";
import { BusStopListLayer } from "./layer/BusStopListLayer";

import { allChangeLinesInfo, allAffectedLinesInfo, allAffectedStopInfo } from "@/api/contrast";

export default {
  props: ["name", "showLayer", "lock2D"],
  inject: ["rootVue"],
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    showLayer: {
      handler(val) {
        this.s_showLayer = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
    oldLinkColor() {
      if (this._OldBusLineListLayer) {
        this._OldBusLineListLayer.setColor(this.oldLinkColor);
      }
      if (this._OldBusStopListLayer) {
        this._OldBusStopListLayer.setColor(this.oldLinkColor);
      }
    },
    newLinkColor() {
      if (this._NewBusLineListLayer) {
        this._NewBusLineListLayer.setColor(this.newLinkColor);
      }
      if (this._NewBusStopListLayer) {
        this._NewBusStopListLayer.setColor(this.newLinkColor);
      }
    },
    showChangeOld() {
      if (this._OldBusLineListLayer) {
        this._OldBusLineListLayer.visible = this.showChangeOld;
      }
      if (this._OldBusStopListLayer) {
        this._OldBusStopListLayer.visible = this.showChangeOld;
      }
    },
    showChangeNew() {
      if (this._NewBusLineListLayer) {
        this._NewBusLineListLayer.visible = this.showChangeNew;
      }
      if (this._NewBusStopListLayer) {
        this._NewBusStopListLayer.visible = this.showChangeNew;
      }
    },
    showAffectedRoutes() {
      if (this._AffectedBusLineListLayer) {
        this._AffectedBusLineListLayer.visible = this.showAffectedRoutes;
      }
    },
    showAffectedStop() {
      if (this._AffectedBusStopListLayer) {
        this._AffectedBusStopListLayer.visible = this.showAffectedStop;
      }
    },
    affectedLinkColor() {
      if (this._AffectedBusLineListLayer) {
        this._AffectedBusLineListLayer.setColor(this.affectedLinkColor);
      }
    },
    affectedStopColor() {
      if (this._AffectedBusStopListLayer) {
        this._AffectedBusStopListLayer.setColor(this.affectedStopColor);
      }
    },
  },
  data() {
    return {
      loading: false,
      loaded: false,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

      showChangeOld: true,
      showChangeNew: true,
      showAffectedRoutes: true,
      showAffectedStop: true,

      oldLinkColor: "#3860FD",
      newLinkColor: "#727583",
      affectedLinkColor: "#c71585",
      affectedStopColor: "#409eff",

      _OldBusLineListLayer: null,
      _NewBusLineListLayer: null,

      _OldBusStopListLayer: null,
      _NewBusStopListLayer: null,

      _AffectedBusLineListLayer: null,
      _AffectedBusStopListLayer: null,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._OldBusLineListLayer = new BusLineListLayer({ zIndex: 23, color: this.oldLinkColor, isDashed: true });
    this._OldBusStopListLayer = new BusStopListLayer({ zIndex: 30, color: this.oldLinkColor });

    this._NewBusLineListLayer = new BusLineListLayer({ zIndex: 20, color: this.newLinkColor });
    this._NewBusStopListLayer = new BusStopListLayer({ zIndex: 33, color: this.newLinkColor });

    this._AffectedBusLineListLayer = new BusLineListLayer({ zIndex: 26, color: this.affectedLinkColor });
    this._AffectedBusStopListLayer = new BusStopListLayer({ zIndex: 36, color: this.affectedStopColor });
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
  beforeDestroy() {
    this.handleDisable();
    this._OldBusLineListLayer.dispose();
    this._NewBusLineListLayer.dispose();
    this._OldBusStopListLayer.dispose();
    this._NewBusStopListLayer.dispose();
    this._AffectedBusLineListLayer.dispose();
    this._AffectedBusStopListLayer.dispose();
  },
  methods: {
    // 触发showLayer变化事件
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 加载数据
    loadData() {
      const { database1, datasource1, database2, datasource2 } = this.$route.params;

      allChangeLinesInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      }).then((changeLines) => {
        console.log("changeLines", changeLines);
        this._OldBusLineListLayer.setData(changeLines?.data?.before || []);
        this._OldBusStopListLayer.setData(changeLines?.data?.before || []);

        this._NewBusLineListLayer.setData(changeLines?.data?.after || []);
        this._NewBusStopListLayer.setData(changeLines?.data?.after || []);
      });

      allAffectedLinesInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      }).then((affectedLines) => {
        this._AffectedBusLineListLayer.setData(affectedLines.data.before || []);
      });

      allAffectedStopInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      }).then((affectedStops) => {
        const data = [
          {
            routeId: "",
            stops: (affectedStops.data || []).map((v) => {
              return {
                stop: v,
              };
            }),
          },
        ];
        this._AffectedBusStopListLayer.setData(data);
      });
    },
    // 组件初始化事件
    handleEnable() {
      if (!this.loaded) {
        this.loadData();
      }
      this._Map.addLayer(this._OldBusLineListLayer);
      this._Map.addLayer(this._OldBusStopListLayer);
      this._Map.addLayer(this._NewBusLineListLayer);
      this._Map.addLayer(this._NewBusStopListLayer);
      this._Map.addLayer(this._AffectedBusLineListLayer);
      this._Map.addLayer(this._AffectedBusStopListLayer);
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._OldBusLineListLayer);
      this._Map.removeLayer(this._OldBusStopListLayer);
      this._Map.removeLayer(this._NewBusLineListLayer);
      this._Map.removeLayer(this._NewBusStopListLayer);
      this._Map.removeLayer(this._AffectedBusLineListLayer);
      this._Map.removeLayer(this._AffectedBusStopListLayer);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider__marks-text {
    white-space: nowrap;
  }
}

.my_collapse_item {
}

.color-picker {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  width: 120px;
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
