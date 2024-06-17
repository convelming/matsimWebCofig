<template>
  <el-collapse-item class="BusStopForm" :name="name" :class="[s_showLayer ? 'showLayer' : '']">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox class="checkbox flex-align-center" :value="s_showLayer" @change="handleChangeShowLayer">
        <div class="flex-align-center">
          <img class="item_icon" v-show="s_showLayer" src="@/assets/image/Build3D_icon_a.png" />
          <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/Build3D_icon.png" />
          <span>{{ $l("3D建筑") }}</span>
          <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
        </div>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("建筑颜色：") }}</div>
        <div class="form_value">
          <div class="color-picker flex-align-center">
            <el-color-picker :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="buildColor" />
            <el-input size="small " style="margin-left: 10px" :disabled="!s_showLayer" v-model="buildColor"></el-input>
            <el-input-number class="input-number" style="width: 100%; margin: 0 10px" :disabled="!s_showLayer" size="small" v-model="buildOpacity" :min="0" :max="100" :step="1" step-strictly> </el-input-number>%
          </div>
        </div>
      </div>
      <!-- <div class="form_item">
        <div class="form_label">{{ $l("建筑透明度：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="buildOpacity" :min="0" :max="1" :step="0.1" />
        </div>
      </div> -->
    </div>
  </el-collapse-item>
</template>

<language>
{
  "3D建筑":{
    "zh-CN": "3D建筑",
    "en-US": "3DBuilding"
  },
  "建筑颜色：":{
    "zh-CN": "建筑颜色：",
    "en-US": "Building Colors："
  },
  "建筑透明度：":{
    "zh-CN": "建筑透明度：",
    "en-US": "Architectural transparency："
  }
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { Build3DLayer } from "./layer/Build3DLayer";

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
    buildColor(val) {
      if (this._Build3DLayer) {
        this._Build3DLayer.setBuildColor(val);
      }
    },
    buildOpacity(val) {
      if (this._Build3DLayer) {
        this._Build3DLayer.setBuildOpacity(Math.round((val / 100) * 100) / 100);
      }
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,
      buildColor: "#E9CDAA",
      buildOpacity: 80,
      _Build3DLayer: null,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._Build3DLayer = new Build3DLayer({
      buildColor: this.buildColor,
      buildOpacity: this.buildOpacity * 100,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._Build3DLayer.setSelectBuildId(data.pickColorNum);
          this.rootVue.handleShowBuildDetail({
            uuid: data.pickColorNum,
            buildDetail: data,
          });
        },
        [MAP_EVENT.LAYER_LOADING]: ({ data }) => {
          this.loading = data;
        },
      },
    });
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
    this._Build3DLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this.rootVue.$on("setSelectedBuild", (busDetail) => {
        this._Build3DLayer.setSelectBuildId(busDetail.pickColorNum);
      });
      this._Map.addLayer(this._Build3DLayer);
    },
    // 组件卸载事件
    handleDisable() {
      this.rootVue.$off("setSelectedBuild");
      this._Map.removeLayer(this._Build3DLayer);
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
    padding-top: 10px;

    & > * + * {
      margin-top: 12px;
    }

    .form_flex {
      display: flex;

      .form_item + .form_item {
        margin-top: 0;
      }
    }

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;

      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }

      .form_value {
        width: 100%;
        text-align: right;

        .layer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          .text2 {
            color: rgba(0, 0, 0, 0.3);
          }

          .icon {
            width: 20px;
            height: 20px;
          }
        }
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
  }
}

::v-deep .is-active {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.showLayer {
  ::v-deep .is-active {
    background-color: #d2d6e5;
    border-radius: 6px;
  }

  ::v-deep .el-collapse-item__arrow {
    &::after {
      background-image: url("@/assets/image/right_icon_a.png");
    }
  }
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
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 30px;
      height: 30px;
      background: url("@/assets/image/minus_icon.png") no-repeat center center;
      background-size: 100% 100%;
    }

    &:hover {
      &::after {
        background-image: url("@/assets/image/minus_icon_a.png");
      }
    }
  }

  .el-icon-plus {
    &::after {
      background-image: url("@/assets/image/push_icon.png");
    }

    &:hover {
      &::after {
        background-image: url("@/assets/image/push_icon_a.png");
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
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 16px;
    height: 16px;
    background: url("@/assets/image/right_icon.png") no-repeat center center;
    background-size: 100% 100%;
  }
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
