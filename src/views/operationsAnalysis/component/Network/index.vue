<template>
  <el-collapse-item class="BusStopForm" :name="name" :class="[s_showLayer ? 'showLayer' : '']">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox class="checkbox flex-align-center" :value="s_showLayer" @change="handleChangeShowLayer">
        <div class=" flex-align-center">
          <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_network_icon_a.png" />
          <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_network_icon.png" />
          <span>{{ $l("network") }}</span>
          <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
        </div>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("width") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="width" :min="0" :max="20" :step="1" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("offset") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="offset" :min="0" :max="20" :step="1" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <div>{{ $l("color") }}</div>
        </div>
        <div class="form_value">
          <ColorSelect :disabled="!s_showLayer" v-model="colors" :colorsList="colorsList" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <div>{{ $l("showNode") }}</div>
        </div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer"  v-model="showNode"></el-switch>
        </div>
      </div>
      <!-- <div class="form_item" style="align-items: center"> -->
      <!-- <el-color-picker :disabled="!s_showLayer" :title="$l('color')" size="mini" :predefine="predefineColors" v-model="color" /> -->
      <!-- <div :title="$l('selectLine')" :class="{ disabled: !s_showLayer }" class="icon_button el-icon-circle-close" @click="s_showLayer && handleClearSelect()"></div>
        <div :title="$l('selectLine')" :class="{ active: canSelect, disabled: !s_showLayer }" class="icon_button el-icon-aim" @click="s_showLayer && handleCanSelect(!canSelect)"></div> -->
      <!-- </div> -->
    </div>
  </el-collapse-item>
</template>

<language>
{
  "network":{
    "zh-CN": "路网",
    "en-US": "Network"
  },
  "width":{
    "zh-CN": "宽度：",
    "en-US": "Width: "
  },
  "offset":{
    "zh-CN": "偏移量：",
    "en-US": "Offset: "
  },
  "color":{
    "zh-CN": "颜色：",
    "en-US": "Color: "
  },
  "showNode":{
    "zh-CN": "显示节点：",
    "en-US": "Show Nodes："
  },
  "selectLine":{
    "zh-CN": "选择路段",
    "en-US": "Select Line"
  }
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { NetworkLayer } from "./layer/NetworkLayer";
const ColorList = [
  ["#313695", "#74add1", "#e0f3f8", "#fdae61", "#f46d43", "#a50026"],
  ["rgb(254, 224, 210)", "rgb(252, 187, 161)", "rgb(252, 146, 114)", "rgb(239, 59, 44)", "rgb(203, 24, 29)", "rgb(153, 0, 13)"],
  ["rgb(251, 234, 215)", "rgb(249, 219, 195)", "rgb(247, 212, 175)", "rgb(245, 183, 133)", "rgb(241, 165, 102)", "rgb(237, 135, 52)"],
  ["rgb(251, 234, 215)", "rgb(248, 230, 196)", "rgb(247, 212, 175)", "rgb(245, 199, 133)", "rgb(241, 185, 102)", "rgb(237, 161, 52)"],
  ["rgb(249, 241, 217)", "rgb(248, 230, 196)", "rgb(245, 225, 177)", "rgb(239, 209, 139)", "rgb(235, 197, 108)", "rgb(227, 179, 60)"],
  ["rgb(249, 245, 217)", "rgb(247, 239, 197)", "rgb(245, 233, 177)", "rgb(239, 223, 139)", "rgb(235, 215, 108)", "rgb(227, 201, 60)"],
  ["rgb(240, 248, 213)", "rgb(235, 244, 190)", "rgb(222, 237, 169)", "rgb(215, 227, 124)", "rgb(205, 221, 92)", "rgb(187, 209, 38)"],
  ["rgb(240, 248, 213)", "rgb(225, 241, 191)", "rgb(222, 237, 169)", "rgb(195, 227, 124)", "rgb(181, 221, 92)", "rgb(155, 209, 38)"],
  ["rgb(223, 247, 213)", "rgb(207, 243, 189)", "rgb(193, 239, 169)", "rgb(161, 233, 124)", "rgb(137, 227, 92)", "rgb(96, 217, 38)"],
  ["rgb(215, 245, 223)", "rgb(193, 241, 207)", "rgb(173, 235, 191)", "rgb(131, 225, 161)", "rgb(100, 219, 137)", "rgb(48, 205, 96)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(171, 229, 211)", "rgb(129, 215, 191)", "rgb(106, 209, 179)", "rgb(42, 189, 147)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(163, 227, 223)", "rgb(116, 213, 207)", "rgb(82, 201, 195)", "rgb(24, 183, 175)"],
  ["rgb(207, 243, 245)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(112, 217, 227)", "rgb(86, 211, 221)", "rgb(16, 191, 207)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(28, 181, 215)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(30, 169, 207)"],
  ["rgb(209, 227, 243)", "rgb(185, 211, 237)", "rgb(161, 197, 229)", "rgb(108, 165, 215)", "rgb(78, 145, 207)", "rgb(18, 108, 191)"],
];

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
    width: {
      handler(val) {
        this._NetworkLayer.setLineWidth(val);
      },
    },
    offset: {
      handler(val) {
        this._NetworkLayer.setLineOffset(val);
      },
    },
    colors: {
      handler(val) {
        if (this._colorsTimeout) return;
        this._colorsTimeout = setTimeout(() => {
          this._NetworkLayer.setColors(this.getLayerColors(this.colorsList[this.colors]));
          this._colorsTimeout = null;
        }, 200);
      },
    },
    showNode: {
      handler(val) {
        this._NetworkLayer.setShowNode(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      s_showLayer: true,

      _NetworkLayer: null,
      _NetworkNodeLayer: null,

      colors: 0,
      width: 1,
      offset: 0,
      color: "#E9CDAA",
      showNode: false,
      canSelect: false,

      colorsList: ColorList,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._NetworkLayer = new NetworkLayer({
      zIndex: 20,
      lineWidth: this.width,
      lineOffset: this.offset,
      colors: this.getLayerColors(this.colorsList[this.colors]),
      showNode: this.showNode,
      event: {
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
  },
  methods: {
    getLayerColors(colors) {
      try {
        return {
          0: colors[0],
          0.4: colors[0],
          0.4: colors[1],
          0.6: colors[1],
          0.6: colors[2],
          0.75: colors[2],
          0.75: colors[3],
          0.85: colors[3],
          0.85: colors[4],
          0.95: colors[4],
          0.95: colors[5],
          1: colors[5],
        };
      } catch (error) {
        colors = ["#313695", "#74add1", "#e0f3f8", "#fdae61", "#f46d43", "#a50026"];
        return {
          0: colors[0],
          0.4: colors[0],
          0.4: colors[1],
          0.6: colors[1],
          0.6: colors[2],
          0.75: colors[2],
          0.75: colors[3],
          0.85: colors[3],
          0.85: colors[4],
          0.95: colors[4],
          0.95: colors[5],
          1: colors[5],
        };
      }
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this._Map.addLayer(this._NetworkLayer);
      this.handleCanSelect(true);
      this.rootVue.$on("timeChange", this.handleTimeChange);
      this.rootVue.$on("setSelectLine", this.handleSetSelectLine);
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._NetworkLayer);
      this.handleCanSelect(false);
      this.rootVue.$off("timeChange", this.handleTimeChange);
      this.rootVue.$off("setSelectLine", this.handleSetSelectLine);
    },
    handleSetSelectLine(data) {
      if (this._NetworkLayer) this._NetworkLayer.setSelectLine(data.id);
    },
    handleTimeChange(time) {
      if (this._NetworkLayer) this._NetworkLayer.setTime(time);
    },
    handleCanSelect(value) {
      this.canSelect = value;
      if (value) {
        this._NetworkLayerEventId = this._NetworkLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, ({ data }) => {
          this.selectItem = data;
          if (data.type == "line") {
            this.rootVue.handleShowLineDetail({ uuid: data.uuid, lineDetail: data });
          } else if (data.type == "node") {
            this.rootVue.handleShowNodeDetail({ uuid: data.uuid, nodeDetail: data });
          }
        });
      } else {
        this._NetworkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT, this._NetworkLayerEventId);
      }
    },
    handleClearSelect() {
      this.rootVue.$emit("clearSelectNetwork");
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
        display: none;
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

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;

      &+.form_item {
        margin-top: 12px;
      }

      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }

      .form_value {
        width: 100%;
        text-align: right;
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
  ::v-deep .el-collapse-item__arrow{
    &::after{
      background-image:url('@/assets/image/right_icon_a.png')
    }
  }
}
::v-deep .el-collapse-item__arrow{
  position: relative;
  width: 16px;
  height: 16px;
  background-color: transparent;
  &::before{
    display: none;
  }
  &::after{
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 16px;
    height: 16px;
    background:url('@/assets/image/right_icon.png') no-repeat center center;
    background-size: 100% 100%; 
  }
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
