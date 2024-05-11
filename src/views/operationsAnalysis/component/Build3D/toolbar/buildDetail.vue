<template>
  <el-collapse-item class="CarDetail" :name="name">
    <div class="collapse_item_title" slot="title">{{ $l("建筑详情") }} {{ buildDetail.id }}</div>
    <div class="_bodyer" v-loading="loading">
      <div class="form" v-if="resData">
        <div class="form_item" style="justify-content: flex-end">
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
          <el-table :data="resData.activitiesList" border stripe>
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
    "en-US": "建筑详情"
  },
  "建筑ID：":{
    "zh-CN": "建筑ID：",
    "en-US": "建筑ID："
  },
  "坐标：":{
    "zh-CN": "坐标：",
    "en-US": "坐标："
  },
  "描述：":{
    "zh-CN": "描述：",
    "en-US": "描述："
  },
  "linkId：":{
    "zh-CN": "linkId：",
    "en-US": "linkId："
  },
  "楼层数：":{
    "zh-CN": "楼层数：",
    "en-US": "楼层数："
  },
  "高度：":{
    "zh-CN": "高度：",
    "en-US": "高度："
  },
  "面积：":{
    "zh-CN": "面积：",
    "en-US": "面积："
  },
  "小类名称：":{
    "zh-CN": "小类名称：",
    "en-US": "小类名称："
  },
  "中类名称：":{
    "zh-CN": "中类名称：",
    "en-US": "中类名称："
  },
  "大类名称：":{
    "zh-CN": "大类名称：",
    "en-US": "大类名称："
  },
  "场地类型":{
    "zh-CN": "场地类型",
    "en-US": "场地类型"
  },
  "开放时间":{
    "zh-CN": "开放时间",
    "en-US": "开放时间"
  },
  "容量":{
    "zh-CN": "容量",
    "en-US": "容量"
  },
  "selectBuildAnalysis":{
    "zh-CN": "Select Build Analysis",
    "en-US": "Select Build Analysis"
  },
}
</language>

<script>
import { getFacilitiesById } from "@/api/index";
import { formatHour } from "@/utils/utils";
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
    this.getDetail();
  },
  methods: {
    getDetail() {
      if (!this.buildDetail) return;
      getFacilitiesById({
        id: this.buildDetail.id,
      })
        .then((res) => {
          res.data.activitiesList = Object.values(res.data.activities || {});
          this.resData = res.data;
          console.log(res);
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
  },
};
</script>

<style lang="scss" scoped>
.CarDetail {
  font-size: 13px;
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  ._bodyer {
    padding: 0 20px;
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
