<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title">{{ $l("建筑详情") }}</div>
      <div class="subtitle" :title="buildDetail.id">{{ buildDetail.id }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form" v-if="resData">
        <div class="form_item" style="justify-content: flex-end">
          <el-button type="primary" size="mini" icon="el-icon-aim" circle @click="handleChangeMapCenterAndZoom"></el-button>
          <el-button type="primary" size="mini" @click="handleMenu({ data: resData, command: 'selectBuildAnalysis' })">{{ $l("selectBuildAnalysis") }}</el-button>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("建筑ID：") }}</div>
          <div class="form_value">{{ resData.id }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("坐标：") }}</div>
          <div class="form_value">
            {{ Number(resData.coord.x).toFixed(2) }},
            {{ Number(resData.coord.y).toFixed(2) }}
          </div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("描述：") }}</div>
          <div class="form_value">{{ resData.desc }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("linkId：") }}</div>
          <div class="form_value">{{ resData.linkId }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("楼层数：") }}</div>
          <div class="form_value">{{ resData.floor }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("高度：") }}</div>
          <div class="form_value">{{ resData.height }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("面积：") }}</div>
          <div class="form_value">{{ resData.area }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("小类名称：") }}</div>
          <div class="form_value">{{ resData.smallCategory.join(",") }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("中类名称：") }}</div>
          <div class="form_value">{{ resData.mediumCategory.join(",") }}</div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("大类名称：") }}</div>
          <div class="form_value">{{ resData.bigCategory.join(",") }}</div>
        </div>
        <div class="form_item">
          <el-table class="small my_tabel" :data="resData.activitiesList" border stripe>
            <el-table-column :label="$l(`场地类型`)" prop="type" />
            <el-table-column :label="$l(`开放时间`)">
              <template slot-scope="{ row }">
                <div v-for="(v2, i2) in row.openingTimes" :key="i2">{{ formatHour(v2.startTime) }} ~ {{ formatHour(v2.endTime) }}</div>
              </template>
            </el-table-column>
            <el-table-column :label="$l(`容量`)" prop="capacity" />
          </el-table>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "建筑详情":{
    "zh-CN": "建筑详情",
    "en-US": "Building Details"
  },
  "建筑ID：":{
    "zh-CN": "建筑ID：",
    "en-US": "Building ID："
  },
  "坐标：":{
    "zh-CN": "坐标：",
    "en-US": "coordinates："
  },
  "描述：":{
    "zh-CN": "描述：",
    "en-US": "descriptive："
  },
  "linkId：":{
    "zh-CN": "linkId：",
    "en-US": "路段 Id："
  },
  "楼层数：":{
    "zh-CN": "楼层数：",
    "en-US": "Number of floors："
  },
  "高度：":{
    "zh-CN": "高度：",
    "en-US": "heights："
  },
  "面积：":{
    "zh-CN": "面积：",
    "en-US": "sizes："
  },
  "小类名称：":{
    "zh-CN": "小类名称：",
    "en-US": "Subcategory Name："
  },
  "中类名称：":{
    "zh-CN": "中类名称：",
    "en-US": "Medium Name："
  },
  "大类名称：":{
    "zh-CN": "大类名称：",
    "en-US": "Category name："
  },
  "场地类型":{
    "zh-CN": "场地类型",
    "en-US": "Type of site"
  },
  "开放时间":{
    "zh-CN": "开放时间",
    "en-US": "opening hours"
  },
  "容量":{
    "zh-CN": "容量",
    "en-US": "capacities"
  },
  "selectBuildAnalysis":{
    "zh-CN": "选择构建分析",
    "en-US": "Select Build Analysis"
  },
}
</language>

<script>
import { getFacilitiesById } from "@/api/index";
import { formatHour } from "@/utils/utils";
import { SelectBuild3DLayer } from "../layer/SelectBuild3DLayer";
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
    buildDetail: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: [Object, undefined],
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
  },
  data() {
    return {
      loading: true,

      resData: null,
    };
  },
  created() {
    this._SelectBuild3DLayer = new SelectBuild3DLayer({
      zIndex: 100,
      buildColor: 0xff0000,
      buildOpacity: 1,
    });
    if (this.config) this.initByConfig(this.config);
    this.getDetail();
  },
  beforeDestroy() {
    this.handleDisable();
    this._SelectBuild3DLayer.dispose();
  },
  methods: {
    initByConfig(config) {},
    exportConfig() {
      return {};
    },
    handleEnable() {
      this._Map.addLayer(this._SelectBuild3DLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._SelectBuild3DLayer);
    },
    getDetail() {
      if (!this.buildDetail) return;
      getFacilitiesById({
        id: this.buildDetail.id,
      })
        .then((res) => {
          res.data.activitiesList = Object.values(res.data.activities || {});
          this.resData = res.data;
          this._SelectBuild3DLayer.setData(res.data);
          // this.handleChangeMapCenterAndZoom();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatHour(val) {
      return formatHour(val).slice(0, 5);
    },
    handleMenu({ data, command }) {
      switch (command) {
        case "selectBuildAnalysis":
          this.rootVue.handleShowSelectBuildAnalysis({
            uuid: this.name + this.buildDetail.id,
            buildDetail: this.buildDetail,
          });
          break;
      }
    },
    handleChangeMapCenterAndZoom() {
      try {
        this._Map.setCenter([this.resData.coord.x, this.resData.coord.y]);
        this._Map.setZoom(16);
      } catch (error) {
        console.log(error);
      }
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
