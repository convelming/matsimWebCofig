<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%;">{{ $l("活动详情") }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form" v-if="activityDetail">
        <div class="form_item">
          <div class="form_label">{{ $l("personId") }}</div>
          <div class="form_value">{{ activityDetail.personId }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("actType") }}</div>
          <div class="form_value">{{ activityDetail.actType }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("coord") }}</div>
          <div class="form_value">{{ activityDetail.coord }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("startTime") }}</div>
          <div class="form_value">{{ activityDetail.startTime }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("endTime") }}</div>
          <div class="form_value">{{ activityDetail.endTime }}</div>
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
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("actColor") }}</div>
            <el-color-picker size="mini" :predefine="predefineColors" v-model="actColor" />
          </div>
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("legColor") }}</div>
            <el-color-picker size="mini" :predefine="predefineColors" v-model="legColor" />
          </div>
          <div class="form_item" style="align-items: center">
            <div class="form_label">{{ $l("height") }}</div>
            <div class="form_value">
              <el-slider style="padding: 0 calc(2em - 10px)" v-model="height" :min="0" :max="300" :format-tooltip="(v) => `${v}%`" />
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
    "en-US": "Activity Detail"
  },
  "personId":{
    "zh-CN": "出行人Id：",
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
    "en-US": "Display Activity Rroutes:"
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
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { getPlan } from "@/api/index";
import { formatHour } from "@/utils/utils";
import { SelectActivityLayer } from "../layer/SelectActivityLayer";
import { ActivityRoutesLayer } from "../layer/ActivityRoutesLayer";
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
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      color: "#ffa500",

      actColor: "#ffa500",
      legColor: "#EE6666",
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
      zIndex: 30,
      color: this.color,
    });
    this._ActivityRoutesLayer = new ActivityRoutesLayer({
      zIndex: 40,
      actColor: this.actColor,
      legColor: this.legColor,
      height: this.height,
    });

    this._SelectActivityLayer.setData(this.activityDetail);
  },
  mounted() {
    this.getDetail();
  },
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
  },
  methods: {
    handleEnable() {
      this._Map.addLayer(this._SelectActivityLayer);
      if (this.showActivityRoutes) this._Map.addLayer(this._ActivityRoutesLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._SelectActivityLayer);
      this._Map.removeLayer(this._ActivityRoutesLayer);
    },
    getDetail() {
      if (!this.activityDetail) return;
      getPlan({
        personId: this.activityDetail.personId,
      })
        .then((res) => {
          let index = res.data.findIndex((v) => Number(v.startTime) == Number(this.activityDetail.startTime));
          if (index > -1) {
            for (let i = index + 1, l = res.data.length; i < l; i++) {
              let item = res.data[i];
              if (item.type == "Activity") {
                this.nextActivity = item;
                break;
              }
            }
          }
          this._ActivityRoutesLayer.setData(res.data, [this.activityDetail.coord.x, this.activityDetail.coord.y]);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatHour(val) {
      return formatHour(val).slice(0, 5);
    },
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
