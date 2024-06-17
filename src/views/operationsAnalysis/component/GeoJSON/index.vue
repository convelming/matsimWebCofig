<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox class="checkbox flex-align-center" :value="s_showLayer" @change="handleChangeShowLayer">
        <div class="flex-align-center">
          <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_map_icon_a.png" />
          <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_map_icon.png" />
          <span>{{ $l("导入GeoJSON") }}</span>
          <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
        </div>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="file_list" v-for="(item, index) in geoJSONList" :key="index">
        <div class="file_item">
          <div class="file_row">
            <div style="width: 100%; padding: 0 10px">{{ item.name }}</div>
            <div class="file_btn" style="width: 81px">
              <el-switch v-model="item.show" :title="item.show ? $l('hideGeoJSON') : $l('showGeoJSON')" @change="handleChange('show', index, $event)"> </el-switch>
            </div>
          </div>
          <div class="file_row">
            <div style="width: 100%; padding: 0 10px">
              <el-slider :disabled="!s_showLayer" :title="$l('pointScale')" style="padding: 0 calc(2em - 10px)" v-model="item.labelParams.pointScale" :step="1" :min="1" :max="30" @change="handleChange('pointScale', index, $event)"> </el-slider>
            </div>
            <div class="file_btn">
              <el-color-picker :disabled="!s_showLayer" :title="$l('pointColor')" size="mini" :predefine="predefineColors" v-model="item.labelParams.pointColor" @change="handleChange('pointColor', index, $event)" />
            </div>
            <div class="file_btn">
              <el-color-picker :disabled="!s_showLayer" :title="$l('polygonColor')" size="mini" :predefine="predefineColors" v-model="item.labelParams.polygonColor" @change="handleChange('polygonColor', index, $event)" />
            </div>
          </div>
          <div class="file_row">
            <div style="width: 100%; padding: 0 10px">
              <el-slider :disabled="!s_showLayer" :title="$l('lineWidth')" style="padding: 0 calc(2em - 10px)" v-model="item.labelParams.lineWidth" :step="1" :min="1" :max="30" @change="handleChange('lineWidth', index, $event)"> </el-slider>
            </div>
            <div class="file_btn">
              <el-color-picker :disabled="!s_showLayer" :title="$l('lineColor')" size="mini" :predefine="predefineColors" v-model="item.labelParams.lineColor" @change="handleChange('lineColor', index, $event)" />
            </div>
            <div class="file_btn">
              <el-button :disabled="!s_showLayer" type="danger" icon="el-icon-delete" size="mini" circle :title="$l('deleteGeoJSON')" @click="removeGeoJSON(index)"></el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="btn_list" style="text-align: right">
        <el-button :disabled="!s_showLayer" type="primary" size="mini" @click="handleSelectFile">{{ $l("导入GeoJSON") }}</el-button>
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
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { GeoJSONLayer } from "./layer/GeoJSONLayer";
import { guid } from "@/utils/utils";

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
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,
      color: "#5470c6",
      geoJSONList: [],

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
    for (const item of this.geoJSONList) {
      item._layer.dispose();
    }
  },
  methods: {
    removeGeoJSON(index) {
      let item = this.geoJSONList[index];
      if (item) {
        this.geoJSONList.splice(index, 1);
        item._layer.removeFromParent();
        item._layer.dispose();
      }
    },
    addGeoJSON(file) {
      const labelParams = {
        zIndex: 20,
        pointColor: "#ffa500",
        pointScale: 1,
        lineColor: "#ffa500",
        lineWidth: 10,
        polygonColor: "#ffa500",
      };
      const item = {
        uuid: guid(),
        name: file.name,
        show: true,
        labelParams: labelParams,
        _file: file,
        _layer: new GeoJSONLayer(labelParams),
      };
      this.geoJSONList.push(item);

      let reader = new FileReader();
      // 传入需要被转换的文本流 file,这个是转字符串的关键方法
      reader.readAsText(file);
      // onload是异步的,封装的话可以用promise
      reader.onload = () => {
        // 输出字符串
        item._layer.setData(JSON.parse(reader.result));
      };
      if (this._Map) {
        if (this.s_showLayer && item.show) {
          this._Map.addLayer(item._layer);
        } else {
          item._layer.removeFromParent();
        }
      }
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      for (const item of this.geoJSONList) {
        if (item.show) this._Map.addLayer(item._layer);
      }
    },
    // 组件卸载事件
    handleDisable() {
      for (const item of this.geoJSONList) {
        item._layer.removeFromParent();
      }
    },
    handleSelectFile() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".geojson";
      input.style = "position:absolute;width:0;height:0;top: -100px;";
      document.body.appendChild(input);
      input.onchange = (e) => {
        const file = e.target.files[0];
        this.addGeoJSON(file);
        document.body.removeChild(input);
      };
      input.click();
    },
    handleChange(type, index, value) {
      const item = this.geoJSONList[index];
      if (!item) return;
      switch (type) {
        case "show":
          if (value && this._Map) {
            this._Map.addLayer(item._layer);
          } else {
            item._layer.removeFromParent();
          }
          break;
        case "pointScale":
          item._layer.setPointScale(value);
          break;
        case "pointColor":
          item._layer.setPointColor(value);
          break;
        case "polygonColor":
          item._layer.setPolygonColor(value);
          break;
        case "lineWidth":
          item._layer.setLineWidth(value);
          break;
        case "lineColor":
          item._layer.setLineColor(value);
          break;
        default:
          break;
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
