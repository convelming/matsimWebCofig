<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ $l("活动详情") }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form" v-if="detail">
        <div class="form_item">
          <div class="form_label">{{ $l("personId") }}</div>
          <div class="form_value">{{ detail.personId }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("actType") }}</div>
          <div class="form_value">{{ detail.actType }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("coord") }}</div>
          <div class="form_value">{{ MercatorToWGS84(detail.coord.x, detail.coord.y).map((v) => Number(v.toFixed(3))) }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("startTime") }}</div>
          <div class="form_value">{{ formatHour(detail.startTime) }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("endTime") }}</div>
          <div class="form_value">{{ formatHour(detail.endTime) }}</div>
        </div>
        <div class="form_item" v-if="nextActivity">
          <div class="form_label">{{ $l("nextActivity") }}</div>
          <div class="form_value">
            <div class="form_value">{{ nextActivity.activity }}</div>
          </div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("displayActivityRoutes") }}</div>
          <div class="form_value">
            <el-switch v-model="showActivityRoutes" />
          </div>
        </div>
        <div style="margin: 20px 0 0 20px" v-if="showActivityRoutes">
          <!-- <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("actColor") }}</div>
            <el-color-picker size="mini" :predefine="predefineColors" v-model="actColor" />
          </div>
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("legColor") }}</div>
            <el-color-picker size="mini" :predefine="predefineColors" v-model="legColor" />
          </div> -->
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("height") }}</div>
            <div class="form_value">
              <el-slider style="padding: 0 calc(2em - 10px)" v-model="height" :min="0" :max="500" :step="0.1" :format-tooltip="(v) => `${v}%`" />
            </div>
          </div>
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("actScale") }}</div>
            <div class="form_value">
              <el-slider style="padding: 0 calc(2em - 10px)" v-model="actScale" :min="0" :max="10" :step="0.1" :format-tooltip="(v) => `${v}%`" />
            </div>
          </div>
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("legScale") }}</div>
            <div class="form_value">
              <el-slider style="padding: 0 calc(2em - 10px)" v-model="legScale" :min="0" :max="10" :step="0.1" :format-tooltip="(v) => `${v * 10}%`" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "活动详情":{
    "zh-CN": "活动详情",
    "en-US": "Activity Details"
  },
  "personId":{
    "zh-CN": "出行者Id：",
    "en-US": "Person Id:"
  },
  "actType":{
    "zh-CN": "活动类型：",
    "en-US": "Activity Type:"
  },
  "coord":{
    "zh-CN": "位置：",
    "en-US": "Position:"
  },
  "startTime":{
    "zh-CN": "开始时间：",
    "en-US": "Start Time:"
  },
  "endTime":{
    "zh-CN": "结束时间：",
    "en-US": "End Time:"
  },
  "displayActivityRoutes":{
    "zh-CN": "显示活动路线：",
    "en-US": "Display trip route:"
  },
  "nextActivity":{
    "zh-CN": "下一个活动：",
    "en-US": "Next Activity:"
  },
  "actColor":{
    "zh-CN": "活动点颜色：",
    "en-US": "Activity Color: "
  },
  "legColor":{
    "zh-CN": "出行轨迹颜色：",
    "en-US": "Leg Color: "
  },
  "color":{
    "zh-CN": "颜色：",
    "en-US": "Color: "
  },
  "height":{
    "zh-CN": "高度：",
    "en-US": "Height: "
  },
  "actScale":{
    "zh-CN": "活动大小：",
    "en-US": "ActScale: "
  },
  "legScale":{
    "zh-CN": "出行大小：",
    "en-US": "LegScale: "
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { MercatorToWGS84 } from "@/mymap/utils/LngLatUtils";
import { getPlan } from "@/api/index";
import { formatHour } from "@/utils/utils";
import { SelectActivityLayer } from "../layer/SelectActivityLayer";
import { ActivityRoutesLayer } from "../layer/ActivityRoutesLayer";

const CHANGE_COLOR_EVENT_KEY = "Activity3D_changeColor";

export default {
  inject: ["rootVue"],
  props: {
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
    activityDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
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
    showActivityRoutes: {
      handler(val) {
        if (this._Map) {
          if (val) {
            this._Map.addLayer(this._ActivityRoutesLayer);
          } else {
            this._Map.removeLayer(this._ActivityRoutesLayer);
          }
        }
      },
    },
    actColor: {
      handler(val) {
        this._ActivityRoutesLayer.setActColor(val);
      },
    },
    legColor: {
      handler(val) {
        this._ActivityRoutesLayer.setLegColor(val);
      },
    },
    height: {
      handler(val) {
        this._ActivityRoutesLayer.setHeight(val);
      },
    },
    actScale: {
      handler(val) {
        this._ActivityRoutesLayer.setActScale(val);
      },
    },
    legScale: {
      handler(val) {
        this._ActivityRoutesLayer.setLegScale(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      detail: null,
      color: "#ffa500",

      actColor: "#ffa500",
      legColor: "#EE6666",
      actScale: 1,
      legScale: 1,
      height: 30,

      loading: true,
      resData: null,
      showActivityRoutes: true,
      nextActivity: null,

      _SelectActivityLayer: null,
      _ActivityRoutesLayer: null,
    };
  },
  created() {
    this._SelectActivityLayer = new SelectActivityLayer({
      zIndex: 130,
      color: this.color,
    });
    this._ActivityRoutesLayer = new ActivityRoutesLayer({
      zIndex: 140,
      height: this.height,
    });

    this.rootVue.$on(CHANGE_COLOR_EVENT_KEY, this.handleActivity3DChangeColor);
  },
  mounted() {
    this.getDetail();
  },
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
    this.rootVue.$off(CHANGE_COLOR_EVENT_KEY, this.handleActivity3DChangeColor);
  },
  methods: {
    // 活动颜色改变事件
    handleActivity3DChangeColor(val) {
      this._ActivityRoutesLayer.setActivityColors(val.activityColors);
      this._ActivityRoutesLayer.setLegColors(val.legColors);
      // this._ActivityRoutesLayer.setActColor(val.actColor);
      // this._ActivityRoutesLayer.setLegColor(val.legColor);
    },
    // 启用
    handleEnable() {
      this._Map.addLayer(this._SelectActivityLayer);
      if (this.showActivityRoutes) this._Map.addLayer(this._ActivityRoutesLayer);
    },
    // 禁用
    handleDisable() {
      this._Map.removeLayer(this._SelectActivityLayer);
      this._Map.removeLayer(this._ActivityRoutesLayer);
    },
    // 获取详情
    getDetail() {
      if (!this.activityDetail) return;
      getPlan({
        personId: this.activityDetail.personId,
      })
        .then((res) => {
          if (this.activityDetail._form_type == "sreach") {
            this.detail = Object.assign({}, this.activityDetail, res.data.find((v) => v.type == "Activity") || {});
          } else if (this.activityDetail._form_type == "mymap")  {
            this.detail = Object.assign({}, this.activityDetail);
          }

          this._SelectActivityLayer.setData(this.detail);
          let index = res.data.findIndex((v) => Number(v.startTime) == Number(this.detail.startTime));
          if (index > -1) {
            for (let i = index + 1, l = res.data.length; i < l; i++) {
              let item = res.data[i];
              if (item.type == "Activity") {
                this.nextActivity = item;
                break;
              }
            }
          }
          this._ActivityRoutesLayer.setData(res.data, [this.detail.coord.x, this.detail.coord.y]);

          if (this.rootVue.$refs.Activity3D) this.rootVue.$refs.Activity3D.updataColor();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 格式化时间
    formatHour: formatHour,
    // 格式化坐标
    MercatorToWGS84: MercatorToWGS84,
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  font-size: 13px;
  .toolbar_item_bodyer {
    .form {
      width: 100%;

      .form_item {
        width: 100%;
        display: flex;
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
    .path {
      padding-top: 10px;
      svg {
        width: 100%;
        height: auto;
        max-height: 300px;
        margin: auto;
        transform: rotateX(180deg);
      }
    }
  }
}
</style>
