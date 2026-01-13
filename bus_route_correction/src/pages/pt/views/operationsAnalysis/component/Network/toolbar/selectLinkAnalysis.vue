<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title">{{ $l("selectLinkAnalysis") }}</div>
      <div class="subtitle" :title="lineDetail.id">{{ lineDetail.id }}</div>
    </div>
    <div class="toolbar_item_bodyer">
      <!-- <div class="form_item" style="align-items: center">
        <div class="form_label"></div>
        <div class="form_value">
          <el-button type="primary" size="mini" icon="el-icon-aim" circle @click="handleChangeMapCenter"></el-button>
        </div>
      </div> -->
      <div class="form_item">
        <div class="form_label">{{ $l("time") }}</div>
        <div class="form_value">
          <TimeRangeSlider :value="[startTime, endTime]" :start.sync="startTime" :end.sync="endTime" @change="getDetail" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("height") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0 calc(2em - 10px) 20px calc(2em - 10px)" v-model="height" :min="0" :max="100" :step="0.1" :marks="marks" :format-tooltip="(v) => `${v}%`" />
        </div>
      </div>
      <div class="form_item" style="align-items: center">
        <div class="form_label">{{ $l("color") }}</div>
        <el-color-picker size="mini" :predefine="predefineColors" v-model="color" />
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "selectLinkAnalysis":{
    "zh-CN": "路段流量溯源",
    "en-US": "Select Link Analysis"
  },
  "time":{
    "zh-CN": "时间：",
    "en-US": "Time: "
  },
  "height":{
    "zh-CN": "高度：",
    "en-US": "Height: "
  },
  "color":{
    "zh-CN": "颜色: ",
    "en-US": "Color："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { getLinkById, getElapseLinkLeg } from "@/api/index";
import { LinkFlowLayer } from "../layer/LinkFlowLayer";
import { SelectLineLayer } from "../layer/SelectLineLayer";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    lineDetail: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: [Object, undefined],
    },
  },
  inject: ["rootVue"],
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.rootVue.$emit("setSelectLine", this.lineDetail);
            }, 200);
          });
        } else {
          this.rootVue.$emit("setSelectLine", {});
        }

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
    color: {
      handler(val) {
        this._LinkFlowLayer.setColor(val);
      },
    },
    height: {
      handler(val) {
        this._LinkFlowLayer.setHeight(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      loading: true,
      resData: {},
      _LinkFlowLayer: undefined,
      color: "#ff4500",
      startTime: 0,
      endTime: 24 * 3600,

      height: 30,

      marks: {
        0: "0%",
        50: "50%",
        100: "100%",
      },
    };
  },
  created() {
    this._SelectLineLayer = new SelectLineLayer({
      zIndex: 130,
      lineWidth: this.lineDetail.lineWidth,
      lineOffset: this.lineDetail.lineOffset,
    });
    this._LinkFlowLayer = new LinkFlowLayer({ zIndex: 200, color: this.color, height: this.height });
    this.getDetail();
  },
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
    this._SelectLineLayer.dispose();
    this._LinkFlowLayer.dispose();
  },
  methods: {
    initByConfig(config) {
      for (const key in config) {
        this[key] = config[key];
      }
    },
    exportConfig() {
      return {
        color: this.color,
        startTime: this.startTime,
        endTime: this.endTime,
        height: this.height,
      };
    },
    handleLineWidthChange(lineWidth) {
      this._SelectLineLayer.setLineWidth(lineWidth);
    },
    handleLineOffsetChange(lineOffset) {
      this._SelectLineLayer.setLineOffset(lineOffset);
    },
    async getDetail() {
      this.loading = true;
      try {
        await getElapseLinkLeg({ linkId: this.lineDetail.id, startTime: this.startTime, endTime: this.endTime }).then((res) => {
          this._LinkFlowLayer.setData(res.data);
        });
        await getLinkById({ linkId: this.lineDetail.id }).then((res) => {
          this._SelectLineLayer.setData(res.data);
        });
        this.loading = false;
        if (this.config) this.initByConfig(this.config);
      } catch (error) {}
      this.loading = false;
    },
    handleEnable() {
      this._Map.addLayer(this._LinkFlowLayer);
      this._Map.addLayer(this._SelectLineLayer);
      this.rootVue.$on("Network_setLineWidth", this.handleLineWidthChange);
      this.rootVue.$on("Network_setLineOffset", this.handleLineOffsetChange);
    },
    handleDisable() {
      this._Map.removeLayer(this._LinkFlowLayer);
      this._Map.removeLayer(this._SelectLineLayer);
      this.rootVue.$off("Network_setLineWidth", this.handleLineWidthChange);
      this.rootVue.$off("Network_setLineOffset", this.handleLineOffsetChange);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .labelClassName {
    width: 150px;
  }
}
.toolbar_item {
  .toolbar_item_bodyer {
    box-sizing: border-box;
    width: 100%;
    padding: 0px 10px 0px 20px;

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
}
</style>
