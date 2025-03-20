<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('Traffic Region Analysis')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_network_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_network_icon.png" />
        <span class="item_title">{{ $l("Traffic Region Analysis") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("Select multi-links:") }}</div>
        <div class="form_value">
          <el-button v-if="polygonSelectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED || polygonSelectType != 'link'" :disabled="!s_showLayer" type="primary" size="mini" @click="handlePlayPolygonSelect('link')">{{ $l("开始圈定") }}</el-button>
          <template v-if="polygonSelectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED && polygonSelectType == 'link'">
            <el-button type="primary" size="mini" @click="handleReplayPolygonSelect('link')">{{ $l("重新圈定") }}</el-button>
            <el-button type="primary" size="mini" @click="handleStopPolygonSelect('link')">{{ $l("停止圈定") }}</el-button>
          </template>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("Select facilities/buildings:") }}</div>
        <div class="form_value">
          <el-button v-if="polygonSelectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED || polygonSelectType != 'build'" :disabled="!s_showLayer" type="primary" size="mini" @click="handlePlayPolygonSelect('build')">{{ $l("开始圈定") }}</el-button>
          <template v-if="polygonSelectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED && polygonSelectType == 'build'">
            <el-button type="primary" size="mini" @click="handleReplayPolygonSelect('build')">{{ $l("重新圈定") }}</el-button>
            <el-button type="primary" size="mini" @click="handleStopPolygonSelect('build')">{{ $l("停止圈定") }}</el-button>
          </template>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "Traffic Region Analysis":{
    "zh-CN": "区域交通分析",
    "en-US": "Traffic Region Analysis"
  },
  "Select multi-links:":{
    "zh-CN": "区域路段选取：",
    "en-US": "Select multi-links:"
  },
  "Select facilities/buildings:":{
    "zh-CN": "区域建筑选取：",
    "en-US": "Select facilities/buildings:"
  },
  "重新圈定":{
    "zh-CN": "重新圈定",
    "en-US": "Redraw"
  },
  "停止圈定":{
    "zh-CN": "停止圈定",
    "en-US": "Stop drawing"
  },
  "开始圈定":{
    "zh-CN": "开始圈定",
    "en-US": "Start drawing"
  },
}
</language>

<script>
import { guid } from "@/utils/utils";
import { COLOR_LIST } from "@/utils/utils";
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "./layer/PolygonSelectLayer";

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
  },
  data() {
    return {
      configKey: "trafficRegionAnalysisConfig",
      s_showLayer: true,

      loading: false,

      POLYGON_SELECT_STATE_KEY,
      polygonSelectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,
      polygonSelectType: "link",
    };
  },
  created() {
    this.s_showLayer = this.showLayer;

    this._PolygonSelectLayer = new PolygonSelectLayer({
      zIndex: 200,
      event: {
        [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.polygonSelectState = res.data.state;
          if (this.polygonSelectState === POLYGON_SELECT_STATE_KEY.ENDED) {
            const path = res.data.path;
            path[path.length] = [...path[0]];
            const type = this.polygonSelectType;
            this.handleStopPolygonSelect(type);
            if (type == "link") {
              console.log("link", path);
              this.rootVue.handleShowSinglePathDetail({
                uuid: guid(),
                singlePathDetail: {
                  shape: path,
                  holes: [],
                  type: "link",
                },
              });
            } else if (type == "build") {
              console.log("build", path);
              this.rootVue.handleShowSinglePathDetail({
                uuid: guid(),
                singlePathDetail: {
                  shape: path,
                  holes: [],
                  type: "build",
                },
              });
            }
          }
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
    this._PolygonSelectLayer.dispose();
  },
  methods: {
    initByConfig(config) {
      config = config || this.rootVue.defaultConfig.trafficRegionAnalysisConfig;
      this.s_showLayer = config.showLayer;
      this.$emit("update:showLayer", config.showLayer);
      this.$emit("update:lock2D", config.lock2D);

    },
    exportConfig() {
      return {
        showLayer: this.s_showLayer,
        lock2D: this.lock2D,
      };
    },
    // 组件初始化事件
    handleEnable() {
      this._Map.addLayer(this._PolygonSelectLayer);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleStopPolygonSelect();
      this._Map.removeLayer(this._PolygonSelectLayer);
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handlePlayPolygonSelect(type) {
      if (this._PolygonSelectLayer) {
        this.polygonSelectType = type;
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.polygonSelectState = this._PolygonSelectLayer.state;
        this.$emit("update:lock2D", true);
      }
    },
    handleReplayPolygonSelect(type) {
      if (this._PolygonSelectLayer) {
        this.polygonSelectType = type;
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.polygonSelectState = this._PolygonSelectLayer.state;
        this.$emit("update:lock2D", true);
      }
    },
    handleStopPolygonSelect(type) {
      if (this._PolygonSelectLayer) {
        this.polygonSelectType = type;
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.stop();
        this.polygonSelectState = this._PolygonSelectLayer.state;
        this.$emit("update:lock2D", false);
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
