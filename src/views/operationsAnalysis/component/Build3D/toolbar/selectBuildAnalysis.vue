<template>
  <el-collapse-item class="toolbar_item my_collapse_item2" :name="name">
    <div class="toolbar_item_header" slot="title">{{ $l("selectBuildAnalysis") }} {{ buildDetail.id }}</div>
    <div class="toolbar_item_bodyer">
      <div class="form_item" style="align-items: center">
        <div class="form_label">{{ $l("type") }}</div>
        <div class="form_value">
          <el-select v-model="type" @change="getDetail">
            <el-option :label="$l('startInBuild')" value="start" />
            <el-option :label="$l('endInBuild')" value="end" />
          </el-select>
        </div>
      </div>
      <div class="form_item" style="align-items: center">
        <div class="form_label">{{ $l("time") }}</div>
        <div class="form_value">
          <TimeRangeSlider :value="[startTime, endTime]" :start.sync="startTime" :end.sync="endTime" @change="getDetail" />
        </div>
      </div>
      <div class="form_item" style="align-items: center">
        <div class="form_label">{{ $l("color") }}</div>
        <el-color-picker size="mini" :predefine="predefineColors" v-model="color" />
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("height") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0 calc(2em - 10px) 20px calc(2em - 10px)" v-model="height" :min="0" :max="100" :marks="marks" :format-tooltip="(v) => `${v}%`" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "selectBuildAnalysis":{
    "zh-CN": "选择构建分析",
    "en-US": "Select Build Analysis"
  },
  "color":{
    "zh-CN": "颜色：",
    "en-US": "Color: "
  },
  "height":{
    "zh-CN": "高度：",
    "en-US": "Height: "
  },
  "time":{
    "zh-CN": "时间：",
    "en-US": "Time: "
  },
  "type":{
    "zh-CN": "类型：",
    "en-US": "Type: "
  },
  "startInBuild":{
    "zh-CN": "从建筑出发",
    "en-US": "From Architecture"
  },
  "endInBuild":{
    "zh-CN": "最终到达建筑",
    "en-US": "Final arrival at the building"
  }
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { BuildFlowLayer } from "../layer/BuildFlowLayer";

import { getStartInFacilities, getEndInFacilities } from "@/api/index";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    buildDetail: {
      type: Object,
      default: () => ({}),
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
          setTimeout(() => {
            this.rootVue.$emit("setSelectedBuild", this.buildDetail);
          }, 200);
        } else {
          this.rootVue.$emit("setSelectedBuild", {});
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
        this._BuildFlowLayer.setColor(val);
      },
    },
    height: {
      handler(val) {
        this._BuildFlowLayer.setHeight(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      loading: true,
      resData: {},
      _BuildFlowLayer: undefined,
      color: "#ff4500",
      startTime: 0,
      endTime: 24 * 3600,
      height: 30,
      type: "start",
    };
  },
  created() {
    this._BuildFlowLayer = new BuildFlowLayer({ zIndex: 100, color: this.color, height: this.height });
    this.getDetail();
  },
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
  },
  methods: {
    getDetail() {
      this.loading = true;
      const apiFun = { start: getStartInFacilities, end: getEndInFacilities }[this.type];
      apiFun({ id: this.buildDetail.id, startTime: this.startTime, endTime: this.endTime })
        .then((res) => {
          this._BuildFlowLayer.setData(res.data);
          this.loading = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleEnable() {
      this._Map.addLayer(this._BuildFlowLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._BuildFlowLayer);
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
  .toolbar_item_header {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
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
