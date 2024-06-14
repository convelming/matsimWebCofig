<template>
  <el-collapse-item class="BusStopForm" :name="name" :class="[s_showLayer ? 'showLayer' : '']">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox class="checkbox flex-align-center" :value="s_showLayer" @change="handleChangeShowLayer">
        <div class="flex-align-center">
          <img class="item_icon" v-show="s_showLayer" src="@/assets/image/Activity3D_icon_a.png" />
          <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/Activity3D_icon.png" />
          <span>{{ $l("线路比对分析") }}</span>
        </div>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("所有修改线路：") }}</div>
        <div class="form_value">

          <el-switch :disabled="!s_showLayer" v-model="showChangeRoute" style="margin-right: 20px" />


        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("修改前：") }}</div>
        <div class="form_value">
          <div class="color-picker  flex-align-center">
            <el-color-picker :disabled="!s_showLayer" :title="$l('修改前线路颜色')" size="mini" :predefine="predefineColors"
              v-model="oldLinkColor" />
            <el-input size="small " style="margin-left: 10px;" :disabled="!s_showLayer"
              v-model="oldLinkColor"></el-input>
          </div>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("修改后：") }}</div>
        <div class="form_value">
          <div style="margin-left: 10px;" class="color-picker  flex-align-center">
            <el-color-picker :disabled="!s_showLayer" :title="$l('修改后线路颜色')" size="mini" :predefine="predefineColors"
              v-model="newLinkColor" />
            <el-input size="small " style="margin-left: 10px;" :disabled="!s_showLayer"
              v-model="newLinkColor"></el-input>
          </div>
        </div>
      </div>
      <!-- <div class="form_tip">{{ $l("（虚线为修改前线路， 实线为修改后线路）") }}</div> -->


      <div class="form_item">  
        <el-switch :disabled="!s_showLayer" v-model="showAffectedRoutes" style="margin-right: 20px" />
        <div class="form_label">{{ $l("受影响线路：") }}</div>
        <div class="form_value">
          <div class="flex-align-center">
          
            <div class="color-picker  flex-align-center">
              <el-color-picker :disabled="!s_showLayer" :title="$l('受影响线路颜色')" size="mini" :predefine="predefineColors"
                v-model="affectedLinkColor" />
              <el-input size="small " style="margin-left: 10px;" :disabled="!s_showLayer"
                v-model="affectedLinkColor"></el-input>
            </div>
          </div>
        </div>
      </div>
      <div class="form_item">
        <el-switch :disabled="!s_showLayer" v-model="showAffectedStop" style="margin-right: 20px" />
        <div class="form_label">{{ $l("受影响站点：") }}</div>
        <div class="form_value">
          <div class="flex-align-center">
     
            <div class="color-picker  flex-align-center">
              <el-color-picker :disabled="!s_showLayer" :title="$l('受影响站点颜色')" size="mini" :predefine="predefineColors"
                v-model="affectedStopColor" />
              <el-input size="small " style="margin-left: 10px;" :disabled="!s_showLayer"
                v-model="affectedStopColor"></el-input>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "线路比对分析":{
    "zh-CN": "线路比对分析",
    "en-US": "Line comparison analysis"
  },
  "所有修改线路：":{
    "zh-CN": "所有修改线路：",
    "en-US": "All modified lines："
  },
  "修改前线路颜色":{
    "zh-CN": "修改前线路颜色",
    "en-US": "Line color before modification"
  },
  "修改后线路颜色":{
    "zh-CN": "修改后线路颜色",
    "en-US": "Modified Line Colors"
  },
  "（虚线为修改前线路， 实线为修改后线路）":{
    "zh-CN": "（虚线为修改前线路， 实线为修改后线路）",
    "en-US": "(Dashed lines are pre-modification lines, solid lines are post-modification lines)"
  },
  "受影响线路：":{
    "zh-CN": "受影响线路：",
    "en-US": "Affected Lines："
  },
  "受影响线路颜色":{
    "zh-CN": "受影响线路颜色",
    "en-US": "Affected Line Colors"
  },
  "受影响站点：":{
    "zh-CN": "受影响站点：",
    "en-US": "Affected stations："
  },
  "受影响站点颜色":{
    "zh-CN": "受影响站点颜色",
    "en-US": "Affected site colors"
  },
  "修改前：":{
    "zh-CN": "修改前：",
    "en-US": "before modification"
  },
  "修改后：":{
    "zh-CN": "修改后：",
    "en-US": "after modification"
  }
}
</language>

<script>
import { BusLineListLayer } from "./layer/BusLineListLayer";
import { BusStopListLayer } from "./layer/BusStopListLayer";

import { allChangeLinesInfo, allAffectedLinesInfo, allAffectedStopInfo } from "@/api/contrast";

export default {
  props: ["name", "showLayer"],
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
    showChangeRoute() {
      if (this._OldBusLineListLayer) {
        this._OldBusLineListLayer.visible = this.showChangeRoute;
      }
      if (this._OldBusStopListLayer) {
        this._OldBusStopListLayer.visible = this.showChangeRoute;
      }
      if (this._NewBusLineListLayer) {
        this._NewBusLineListLayer.visible = this.showChangeRoute;
      }
      if (this._NewBusStopListLayer) {
        this._NewBusStopListLayer.visible = this.showChangeRoute;
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
      loaded: false,
      predefineColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      s_showLayer: true,

      showChangeRoute: true,
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
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    loadData() {
      const { database1, datasource1, database2, datasource2 } = this.$route.params;

      allChangeLinesInfo({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      }).then((changeLines) => {
        console.log('changeLines', changeLines);
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

.BusStopForm {
  padding: 0 12px;
  padding-top: 12px;

  ::v-deep .el-collapse-item__header {
    border-color: transparent;
  }

  .el-collapse-item__title {

    .checkbox {
      display: flex;
      align-items: center;

      ::v-deep .el-checkbox__input {
        padding-left: 10px;
      }

      ::v-deep .el-checkbox__label {
        font-size: 16px;
        font-weight: 500;

        .item_icon {
          width: 18px;
          height: 18px;
          margin-right: 7px;
        }
      }
    }

  }

  .form {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 10px 0px 20px;

    .form_item {
      width: 100%;
      display: flex;
      padding-top: 10px;

      &+.form_item {
        margin-top: 12px;
      }

      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }

      .form_value {
        width: 100%;
        display: flex;
        flex-direction: row-reverse;
      }
    }

    .form_tip {
      font-size: 12px;
      color: #555;
      padding-left: 2em;

      &+.form_item {
        margin-top: 10px;
      }
    }
  }

  .icon_button {
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e6e6e6;
    border-radius: 4px;

    &.active {
      background-color: rgba($color: #409eff, $alpha: 1);
      color: #ffffff;
    }

    &.disabled {
      cursor: no-drop;
    }

    &.icon_stop {
      .img {
        width: 20px;
        height: 20px;
        display: block;
        object-fit: cover;
        padding: 4px;
      }
    }
  }
}

::v-deep .is-active {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.showLayer {
  ::v-deep .is-active {
    background-color: #D2D6E5;
    border-radius: 6px;
  }

  ::v-deep .el-collapse-item__arrow {
    &::after {
      background-image: url('@/assets/image/right_icon_a.png')
    }
  }
}

.color-picker {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  width: 120px;
}

::v-deep .input-number {

  .el-input-number__decrease,
  .el-input-number__increase {
    border: none;
    background-color: transparent;
  }

  .el-input__inner {
    border: none;
    background: rgba(0, 0, 0, 0.05);
    padding: 0;
    margin: 0 39px;
    width: calc(100% - 78px);
  }

  .el-icon-minus,
  .el-icon-plus {
    width: 30px;
    height: 30px;

    &::before {
      display: none;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 30px;
      height: 30px;
      background: url('@/assets/image/minus_icon.png') no-repeat center center;
      background-size: 100% 100%;
    }

    &:hover {
      &::after {
        background-image: url('@/assets/image/minus_icon_a.png');
      }
    }
  }

  .el-icon-plus {
    &::after {
      background-image: url('@/assets/image/push_icon.png');
    }

    &:hover {
      &::after {
        background-image: url('@/assets/image/push_icon_a.png');
      }
    }
  }
}

::v-deep .el-collapse-item__arrow {
  position: relative;
  width: 16px;
  height: 16px;
  background-color: transparent;

  &::before {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 16px;
    height: 16px;
    background: url('@/assets/image/right_icon.png') no-repeat center center;
    background-size: 100% 100%;
  }
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
