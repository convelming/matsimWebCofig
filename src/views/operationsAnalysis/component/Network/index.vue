<template>
  <el-collapse-item class="BusStopForm" :name="name">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox :value="s_showLayer" @change="handleChangeShowLayer">{{ $l("network") }}</el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("width") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="width" :min="0" :max="50" :step="1" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("offset") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="offset" :min="0" :max="50" :step="1" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <div>{{ $l("color") }}</div>
        </div>
        <div class="form_value">
          <ColorSelect v-model="colors" :colorsList="colorsList" />
        </div>
      </div>
      <div class="form_item" style="align-items: center">
        <el-switch :disabled="!s_showLayer" style="width: 100%" v-model="showNode" :active-text="$l('showNode')"></el-switch>
        <!-- <el-color-picker :disabled="!s_showLayer" :title="$l('color')" size="mini" :predefine="predefineColors" v-model="color" /> -->
        <div :title="$l('selectLine')" :class="{ active: canSelect, disabled: !s_showLayer }" class="icon_button el-icon-aim" @click="s_showLayer && handleCanSelect(!canSelect)"></div>
      </div>
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
    "zh-CN": "显示节点",
    "en-US": "Show Nodes"
  },
  "selectLine":{
    "zh-CN": "选择路段",
    "en-US": "Select Line"
  }
}
</language>

<script>
import { ColorList } from "@/components/ColorSelect.vue";
import { MAP_EVENT } from "@/mymap";
import { NetworkLayer } from "./layer/NetworkLayer";

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
          this._NetworkLayer.setColors(this.colorsList[this.colors]);
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
      predefineColors: ["#E9CDAA", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#409eff", "#c71585"],
      s_showLayer: true,

      _NetworkLayer: null,
      _NetworkNodeLayer: null,

      colors: 0,
      width: 10,
      offset: 12,
      color: "#E9CDAA",
      showNode: false,
      canSelect: false,

      colorsList: ColorList,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._NetworkLayer = new NetworkLayer({
      zIndex: 20,
      lineWidth: this.width,
      lineOffset: this.offset,
      colors: this.colorsList[this.colors],
      showNode: this.showNode,
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
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this._Map.addLayer(this._NetworkLayer);
      this.handleCanSelect(this.canSelect);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._NetworkLayer);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._NetworkLayer) this._NetworkLayer.setTime(time);
    },
    handleCanSelect(value) {
      this.canSelect = value;
      if (value) {
        this._NetworkLayerEventId = this._NetworkLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, ({ data }) => {
          console.log(data);
          this.selectItem = data;
          if (data.type == "line") {
            this.rootVue.handleShowLineDetail({ uuid: data.uuid, lineDetail: data });
          } else if (data.type == "node") {
            this.rootVue.handleShowLineDetail({ uuid: data.uuid, nodeDetail: data });
          }
        });
      } else {
        this._NetworkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT, this._NetworkLayerEventId);
      }
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
  .el-collapse-item__title {
    padding-left: 10px;
  }
  .form {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 10px 0px 20px;

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;
      & + .form_item {
        margin-top: 10px;
      }
      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }
      .form_value {
        width: 100%;
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
</style>
