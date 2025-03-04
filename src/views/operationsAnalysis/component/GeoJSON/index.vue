<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('导入GeoJSON')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_map_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_map_icon.png" />
        <span class="item_title">{{ $l("导入GeoJSON") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="btn_list" style="text-align: right">
        <!-- :disabled="!s_showLayer" -->
        <el-button type="primary" size="mini" @click="handleSelectFile">{{ $l("导入GeoJSON") }}</el-button>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "导入GeoJSON":{
    "zh-CN": "导入GeoJSON",
    "en-US": "Import GeoJSON"
  },
  "最多显示人数：":{
    "zh-CN": "最多显示人数：",
    "en-US": "Max People Number："
  },
  "颜色：":{
    "zh-CN": "颜色：",
    "en-US": "Color："
  },
  "导入GeoJSON":{
    "zh-CN": "导入GeoJSON",
    "en-US": "import GeoJSON"
  },
  "pointScale":{
    "zh-CN": "点大小",
    "en-US": "Point Scale"
  },
  "pointColor":{
    "zh-CN": "点颜色",
    "en-US": "Point Color"
  },
  "polygonColor":{
    "zh-CN": "多边形颜色",
    "en-US": "Polygon Color"
  },
  "lineWidth":{
    "zh-CN": "线段宽度",
    "en-US": "Line Width"
  },
  "lineColor":{
    "zh-CN": "线段颜色",
    "en-US": "Line Color"
  },
  "deleteGeoJSON":{
    "zh-CN": "删除GeoJSON",
    "en-US": "Delete GeoJSON"
  },
  "hideGeoJSON":{
    "zh-CN": "隐藏GeoJSON",
    "en-US": "Hide GeoJSON"
  },
  "showGeoJSON":{
    "zh-CN": "显示GeoJSON",
    "en-US": "Show GeoJSON"
  },
  "GeoJSON文件已存在！":{
    "zh-CN": "GeoJSON文件已存在！",
    "en-US": "GeoJSON file already exists!"
  },
}
</language>

<script>
import { fileToString, guid, stringToFile } from "@/utils/utils";

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
      configKey: "geoJSONConfig",
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
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
    initByConfig(config) {
      config = config || this.rootVue.defaultConfig.geoJSONConfig;
      this.s_showLayer = config.showLayer;
      this.$emit("update:showLayer", config.showLayer);
      this.$emit("update:lock2D", config.lock2D);

      try {
        this.rootVue.handleClearGeoJSON();
        for (const item of config.geoJSONList) {
          const file = {
            id: item.id,
            _file: stringToFile(item._file),
            name: item.name,
            show: item.show,
          };
          this.rootVue.handleAddGeoJSON(file, false);
        }
      } catch (error) {}
    },
    async exportConfig() {
      let geoJSONList = [];
      for (const item of this.rootVue.GeoJSONList) {
        geoJSONList.push({
          id: item.id,
          _file: await fileToString(item._file),
          name: item.name,
          show: item.show,
        });
      }
      return {
        showLayer: this.s_showLayer,
        lock2D: this.lock2D,
        geoJSONList: geoJSONList,
      };
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {},
    handleSelectFile() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".geojson";
      input.style = "position:absolute;width:0;height:0;top: -100px;";
      document.body.appendChild(input);
      input.onchange = (e) => {
        const file = e.target.files[0];
        const index = this.rootVue.GeoJSONList.findIndex((item) => item.name == file.name);
        if (index > -1) {
          this.$message.error(this.$l("GeoJSON文件已存在！"));
        } else {
          this.rootVue.handleAddGeoJSON(
            {
              id: guid(),
              _file: file,
              name: file.name,
              show: true,
            },
            true
          );
          document.body.removeChild(input);
        }
      };
      input.click();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider__marks-text {
    white-space: nowrap;
  }
  .checkbox {
    .el-checkbox__input {
      display: none;
    }
    .el-checkbox__label {
      padding-left: 35px;
    }
  }
}

.my_collapse_item {
  .file_list {
    padding-bottom: 20px;
    .file_item {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid #000;
      border-radius: 4px;
    }
    .file_row {
      height: 40px;
      display: flex;
      align-items: center;
      & + .file_row {
        border-top: 1px solid #000;
      }
      .file_btn {
        flex-shrink: 0;
        height: 40px;
        width: 40px;
        border-left: 1px solid #000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .file_name {
        width: 100%;
        padding: 0 10px;
        text-align: left;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
