<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('network')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_network_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_network_icon.png" />
        <span class="item_title">{{ $l("network") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("width") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0px calc(2em - 10px)" :disabled="!s_showLayer" v-model="width" :min="0" :max="50" :step="0.1" />
          <!-- <el-input-number class="my_input_number_1" style="width: 100%" size="medium" :disabled="!s_showLayer" v-model="width" :min="0" :max="50" :step="1" step-strictly> </el-input-number> -->
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("offset") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0px calc(2em - 10px)" :disabled="!s_showLayer" v-model="offset" :min="0" :max="50" :step="0.1" />
          <!-- <el-input-number class="my_input_number_1" style="width: 100%" size="medium" :disabled="!s_showLayer" v-model="offset" :min="0" :max="50" :step="1" step-strictly> </el-input-number> -->
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
          <el-switch :disabled="!s_showLayer" v-model="showNode"></el-switch>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <div>{{ $l("showVideoIcon") }}</div>
        </div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showVideoIcon"></el-switch>
        </div>
      </div>
      <div class="form_item" v-if="showVideoIcon">
        <div class="form_label">
          <div>{{ $l("videoIconWidth") }}</div>
        </div>
        <div class="form_value">
          <el-slider style="padding: 0px calc(2em - 10px)" :disabled="!s_showLayer" v-model="videoIconWidth" :min="0" :max="100" :step="0.1" />
        </div>
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
    "zh-CN": "显示节点：",
    "en-US": "Show Nodes："
  },
  "selectLine":{
    "zh-CN": "选择路段",
    "en-US": "Select Link"
  },
  "showVideoIcon":{
    "zh-CN": "显示实际流量图标：",
    "en-US": "Show Actual Traffic Icon:"
  },
  "videoIconWidth":{
    "zh-CN": "图标大小：",
    "en-US": "Icon Size:"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { NetworkLayer } from "./layer/NetworkLayer";
import { COLOR_LIST } from "@/utils/utils";

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
    width: {
      handler(val) {
        this._NetworkLayer.setLineWidth(val);
        this.rootVue.$emit("Network_setLineWidth", val);
      },
    },
    videoIconWidth: {
      handler(val) {
        this._NetworkLayer.setVideoIconWidth(val);
      },
    },
    offset: {
      handler(val) {
        this._NetworkLayer.setLineOffset(val);
        this.rootVue.$emit("Network_setLineOffset", val);
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
    showVideoIcon: {
      handler(val) {
        this._NetworkLayer.setShowVideoIcon(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

      _NetworkLayer: null,
      _NetworkNodeLayer: null,

      colors: 0,
      width: 1,
      videoIconWidth: 10,
      offset: 0,
      color: "#E9CDAA",
      showNode: false,
      showVideoIcon: false,
      canSelect: false,

      colorsList: COLOR_LIST,

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
      showVideoIcon: this.showVideoIcon,
      videoIconWidth: this.videoIconWidth,
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
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._NetworkLayer);
      this.handleCanSelect(false);
      this.rootVue.$off("timeChange", this.handleTimeChange);
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
          const _data = JSON.parse(JSON.stringify(data));
          _data.lineWidth = this.width;
          _data.lineOffset = this.offset;
          if (_data.type == "line") {
            this.rootVue.handleShowLineDetail({ uuid: "line" + _data.id, lineDetail: _data });
          } else if (_data.type == "videoIcon") {
            _data.showVideoIcon = true;
            this.rootVue.handleShowLineDetail({ uuid: "line" + _data.id, lineDetail: _data });
          } else if (_data.type == "node") {
            this.rootVue.handleShowNodeDetail({ uuid: "node" + _data.id, nodeDetail: _data });
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

.my_collapse_item {
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
