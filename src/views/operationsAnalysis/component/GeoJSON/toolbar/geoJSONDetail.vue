<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ GeoJSON.name }}</div>
    </div>
    <div class="toolbar_item_bodyer">
      <div class="file_item">
        <div class="file_row">
          <div class="file_l_col" style="padding: 0 15px">{{ $l("Show GeoJSON") }}</div>
          <div class="file_s_col" style="width: 60px">
            <el-switch v-model="GeoJSON.show" :active-value="true" :inactive-value="false" size="mini" />
          </div>
        </div>
        <div class="file_row">
          <div class="file_l_col" style="padding: 0 15px">{{ $l("Locate to the center") }}</div>
          <div class="file_s_col" style="width: 60px">
            <el-button type="primary" size="mini" circle icon="el-icon-aim" @click="handleChange('center')"></el-button>
          </div>
        </div>
      </div>
      <template v-if="showPointSetting">
        <div class="title">{{ $l("point") }}</div>
        <div class="file_item">
          <div class="file_row">
            <div class="file_l_col" style="padding: 0 15px">
              <el-slider :title="$l('pointSize')" v-model="pointSize" @change="handleChange('pointSize', $event)" :step="0.1" :min="0" :max="1000"> </el-slider>
            </div>
            <div class="file_s_col">
              <el-color-picker :title="$l('pointColor')" v-model="pointColor" @change="handleChange('pointColor', $event)" size="mini" :predefine="predefineColors" />
            </div>
            <div class="file_s_col" style="width: 90px">
              <IconSelect :title="$l('pointIcon')" v-model="pointIcon" @change="handleChange('pointIcon', $event.value)" size="mini" />
              <!-- <el-select v-model="pointIcon" @change="handleChange('pointIcon', $event)" size="mini" popper-class="point_icon_popper">
                <el-option v-for="(v, i) in iconOptions" :key="i" :label="i" :value="v">
                  <img class="point_icon" :src="v" alt="" />
                </el-option>
              </el-select> -->
            </div>
          </div>
          <div class="file_row">
            <div class="file_s_col" style="width: 90px">
              <el-select :title="$l('pointValue')" v-model="pointValue" @change="handleChange('pointValue', $event)" clearable size="mini">
                <el-option v-for="(item, key) in propertiesLabels" :key="key" :label="key" :value="key"></el-option>
              </el-select>
            </div>
            <div class="file_l_col">
              <ColorSelect :title="$l('pointColors')" v-model="pointColors" @change="handleChange('pointColors', $event.value)" :colorsList="COLOR_LIST" size="mini" />
            </div>
            <div class="file_s_col" style="width: 60px">
              <el-switch :title="$l('showPointVisualMap')" v-model="showPointVisualMap" :active-value="true" :inactive-value="false" size="mini" />
              <GeoJSONVisualMap v-show="showPointVisualMap" :colors="COLOR_LIST[pointColors]" :max="pointValueLabel.max" :min="pointValueLabel.min" />
            </div>
          </div>
        </div>
      </template>
      <template v-if="showLineSetting">
        <div class="title">{{ $l("line") }}</div>
        <div class="file_item">
          <div class="file_row">
            <div class="file_l_col" style="padding: 0 15px">
              <el-slider :title="$l('lineWidth')" v-model="lineWidth" @change="handleChange('lineWidth', $event)" :step="0.1" :min="0" :max="1000"> </el-slider>
            </div>
            <div class="file_s_col">
              <el-color-picker :title="$l('lineColor')" v-model="lineColor" @change="handleChange('lineColor', $event)" size="mini" :predefine="predefineColors" />
            </div>
            <div class="file_s_col" style="width: 90px">
              <el-select :title="$l('lineStyle')" v-model="lineStyle" @change="handleChange('lineStyle', $event)" size="mini">
                <el-option v-for="(v, k) in LINE_STYPE" :key="v" :label="k" :value="v"></el-option>
              </el-select>
            </div>
          </div>
          <div class="file_row">
            <div class="file_s_col" style="width: 90px">
              <el-select :title="$l('lineValue')" v-model="lineValue" @change="handleChange('lineValue', $event)" clearable size="mini">
                <el-option v-for="(item, key) in propertiesLabels" :key="key" :label="key" :value="key"></el-option>
              </el-select>
            </div>
            <div class="file_l_col">
              <ColorSelect :title="$l('lineColors')" style="width: 100%" v-model="lineColors" @change="handleChange('lineColors', $event.value)" :colorsList="COLOR_LIST" size="mini" />
            </div>
            <div class="file_s_col" style="width: 60px">
              <el-switch :title="$l('showLineVisualMap')" v-model="showLineVisualMap" :active-value="true" :inactive-value="false" size="mini" />
              <GeoJSONVisualMap v-show="showLineVisualMap" :colors="COLOR_LIST[lineColors]" :max="lineValueLabel.max" :min="lineValueLabel.min" />
            </div>
          </div>
        </div>
      </template>
      <template v-if="showPolygonSetting">
        <div class="title">{{ $l("polygon") }}</div>
        <div class="file_item">
          <div class="file_row">
            <div class="file_l_col" style="padding: 0 15px">
              <el-slider :title="$l('polygonOpacity')" v-model="polygonOpacity" @change="handleChange('polygonOpacity', $event)" :step="0.01" :min="0" :max="1" size="mini"> </el-slider>
            </div>
            <div class="file_s_col">
              <el-color-picker :title="$l('polygonColor')" v-model="polygonColor" @change="handleChange('polygonColor', $event)" size="mini" :predefine="predefineColors" />
            </div>
          </div>
          <div class="file_row">
            <div class="file_l_col">
              <el-input-number :title="$l('polygonBorderWidth')" v-model="polygonBorderWidth" :min="0" :step="0.1" :controls="true" controls-position="both" size="mini" @change="handleChange('polygonBorderWidth', $event)"> </el-input-number>
              <!-- <el-slider :title="$l('polygonBorderWidth')" v-model="polygonBorderWidth" @change="handleChange('polygonBorderWidth', $event)" :step="0.1" :min="0" :max="300" size="mini"> </el-slider> -->
            </div>
            <div class="file_s_col">
              <el-color-picker :title="$l('polygonBorderColor')" v-model="polygonBorderColor" @change="handleChange('polygonBorderColor', $event)" size="mini" :predefine="predefineColors" />
            </div>
            <div class="file_s_col" style="width: 90px">
              <el-select :title="$l('polygonBorderStyle')" v-model="polygonBorderStyle" @change="handleChange('polygonBorderStyle', $event)" size="mini">
                <el-option v-for="(v, k) in LINE_STYPE" :key="v" :label="k" :value="v"></el-option>
              </el-select>
            </div>
          </div>
          <div class="file_row">
            <div class="file_s_col" style="width: calc(100% - 60px)">
              <el-select :title="$l('polygonValue')" style="width: 100%" v-model="polygonValue" @change="handleChange('polygonValue', $event)" clearable size="mini">
                <el-option v-for="(item, key) in propertiesLabels" :key="key" :label="key" :value="key"></el-option>
              </el-select>
            </div>
            <div class="file_s_col" style="width: 60px">
              <el-switch :title="$l('usePolygonColors')" v-model="usePolygonColors" @change="handleChange('usePolygonColors', $event.value)" :active-value="true" :inactive-value="false" />
            </div>
          </div>
          <div class="file_row">
            <div class="file_l_col">
              <ColorSelect :title="$l('polygonColors')" style="width: 100%" v-model="polygonColors" @change="handleChange('polygonColors', $event.value)" :colorsList="COLOR_LIST" size="mini" />
            </div>
            <div class="file_s_col" style="width: 60px">
              <el-switch :title="$l('showPolygonVisualMap')" v-model="showPolygonVisualMap" :active-value="true" :inactive-value="false" />
              <GeoJSONVisualMap v-show="showPolygonVisualMap" :colors="COLOR_LIST[polygonColors]" :max="polygonValueLabel.max" :min="polygonValueLabel.min" />
            </div>
          </div>
          <div class="file_row">
            <div class="file_s_col" style="width: 60px">
              <el-switch :title="$l('polygon3D')" v-model="polygon3D" @change="handleChange('polygon3D', $event)" :active-value="true" :inactive-value="false" size="mini" />
            </div>
            <div class="file_l_col" style="padding: 0 15px">
              <el-input-number :title="$l('polygon3DHeight')" style="width: 100%;" v-model="polygon3DHeight" :min="0" :max="5000" :step="0.1" @change="handleChange('polygon3DHeight', $event)" size="mini" />
              <!-- <el-slider :title="$l('polygon3DHeight')" v-model="polygon3DHeight" @change="handleChange('polygon3DHeight', $event)" :step="0.1" :min="0" :max="5000" size="mini"> </el-slider> -->
            </div>
          </div>
        </div>
      </template>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "活动详情":{
    "zh-CN": "活动详情",
    "en-US": "Activity Details"
  },
  "Show GeoJSON":{
    "zh-CN": "显示GeoJSON",
    "en-US": "Show GeoJSON"
  },
  "Locate to the center":{
    "zh-CN": "定位到中心",
    "en-US": "Locate to the center"
  },
  "point":{
    "zh-CN": "point",
    "en-US": "point"
  },
  "pointSize":{
    "zh-CN": "pointSize",
    "en-US": "pointSize"
  },
  "pointColor":{
    "zh-CN": "pointColor",
    "en-US": "pointColor"
  },
  "pointValue":{
    "zh-CN": "pointValue",
    "en-US": "pointValue"
  },
  "pointColors":{
    "zh-CN": "pointColors",
    "en-US": "pointColors"
  },
  "line":{
    "zh-CN": "line",
    "en-US": "line"
  },
  "lineWidth":{
    "zh-CN": "lineWidth",
    "en-US": "lineWidth"
  },
  "lineColor":{
    "zh-CN": "lineColor",
    "en-US": "lineColor"
  },
  "lineStyle":{
    "zh-CN": "lineStyle",
    "en-US": "lineStyle"
  },
  "lineValue":{
    "zh-CN": "lineValue",
    "en-US": "lineValue"
  },
  "lineColors":{
    "zh-CN": "lineColors",
    "en-US": "lineColors"
  },
  "polygon":{
    "zh-CN": "polygon",
    "en-US": "polygon"
  },
  "polygonOpacity":{
    "zh-CN": "polygonOpacity",
    "en-US": "polygonOpacity"
  },
  "polygonColor":{
    "zh-CN": "polygonColor",
    "en-US": "polygonColor"
  },
  "polygonBorderWidth":{
    "zh-CN": "polygonBorderWidth",
    "en-US": "polygonBorderWidth"
  },
  "polygonBorderColor":{
    "zh-CN": "polygonBorderColor",
    "en-US": "polygonBorderColor"
  },
  "polygonBorderStyle":{
    "zh-CN": "polygonBorderStyle",
    "en-US": "polygonBorderStyle"
  },
  "polygonValue":{
    "zh-CN": "polygonValue",
    "en-US": "polygonValue"
  },
  "polygonColors":{
    "zh-CN": "polygonColors",
    "en-US": "polygonColors"
  },
  "usePolygonColors":{
    "zh-CN": "usePolygonColors",
    "en-US": "usePolygonColors"
  },
  "polygon3D":{
    "zh-CN": "polygon3D",
    "en-US": "polygon3D"
  },
  "polygon3DHeight":{
    "zh-CN": "polygon3DHeight",
    "en-US": "polygon3DHeight"
  },
}
</language>

<script>
import { ICON_LIST } from "@/utils/utils";
import { GeoJSONLayer, LINE_STYPE } from "../layer/GeoJSONLayer";
import GeoJSONVisualMap from "../component/GeoJSONVisualMap.vue";
import GeoJSONLayerWorker from "../worker/GeoJSONLayer.worker";
import { COLOR_LIST } from "@/utils/utils";

export default {
  inject: ["rootVue"],
  components: { GeoJSONVisualMap },
  props: {
    name: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    "GeoJSON.show": {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.GeoJSON.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 1000);
        });
      },
    },
  },
  data() {
    return {
      COLOR_LIST: COLOR_LIST,
      LINE_STYPE: LINE_STYPE,
      show: true,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      pointSize: 1000,
      pointColor: "#ffa500",
      pointIcon: ICON_LIST[0],
      pointValue: "",
      pointColors: 0,
      pointOpacity: 1,
      showPointSetting: false,

      showPointVisualMap: false,
      pointValueLabel: { max: 1, min: 0 },

      lineWidth: 100,
      lineColor: "#ffa500",
      lineStyle: LINE_STYPE.SOLID,
      lineValue: "",
      lineColors: 0,
      lineOpacity: 1,
      showLineSetting: false,

      showLineVisualMap: false,
      lineValueLabel: { max: 1, min: 0 },

      polygonOpacity: 1,
      polygonColor: "#ffa500",
      polygonBorderWidth: 10,
      polygonBorderColor: "#5470C6",
      polygonBorderStyle: LINE_STYPE.SOLID,
      polygonValue: "",
      usePolygonColors: true,
      polygonColors: 0,
      polygon3DHeight: 2500,
      polygon3D: false,
      showPolygonSetting: false,

      showPolygonVisualMap: false,
      polygonValueLabel: { max: 1, min: 0 },

      GeoJSON: {},
      GeoJSONParams: [],
      propertiesLabels: [],
    };
  },
  created() {
    this.GeoJSON = this.rootVue.GeoJSONList.find((v) => v.id == this.id) || {};
    this._GeoJSONLayer = new GeoJSONLayer({
      zIndex: 30,

      // ******************** 点 ******************** //
      pointSize: this.pointSize,
      pointColor: this.pointColor,
      pointIcon: this.pointIcon,
      pointValue: this.pointValue,
      pointColorBar: this.COLOR_LIST[this.pointColors],
      pointOpacity: this.pointOpacity,
      // ******************** 线 ******************** //
      lineWidth: this.lineWidth,
      lineColor: this.lineColor,
      lineStyle: this.lineStyle,
      lineValue: this.lineValue,
      lineColorBar: this.COLOR_LIST[this.lineColors],
      lineOpacity: this.lineOpacity,
      // ******************** 面 ******************** //
      polygonColor: this.polygonColor,
      polygonOpacity: this.polygonOpacity,
      polygonBorderWidth: this.polygonBorderWidth,
      polygonBorderColor: this.polygonBorderColor,
      polygonBorderStyle: this.polygonBorderStyle,
      polygonValue: this.polygonValue,
      polygonColorBar: this.usePolygonColors ? this.COLOR_LIST[this.polygonColors] : [this.pointColor],
      polygon3D: this.polygon3D,
      polygon3DHeight: this.polygon3DHeight,
    });
  },
  mounted() {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { center, propertiesLabels, pointArray, lineArray, polygonArray, propertiesListArray } = event.data;

      console.time("onmessage");

      this.$set(this.GeoJSON, "propertiesLabels", propertiesLabels);
      this.$set(this.GeoJSON, "center", center);
      this.propertiesLabels = propertiesLabels;
      this._GeoJSONLayer.setCenter(center);
      this._GeoJSONLayer.setPointArray(pointArray);
      this._GeoJSONLayer.setLineArray(lineArray);
      this._GeoJSONLayer.setPolygonArray(polygonArray);

      this.showPointSetting = !!pointArray.length;
      this.showLineSetting = !!lineArray.length;
      this.showPolygonSetting = !!polygonArray.length;

      const propertiesList = JSON.parse(new TextDecoder().decode(propertiesListArray));
      this._GeoJSONLayer.setPropertiesList(propertiesList, propertiesLabels);
      this.isDev && (console.log(event.data) || console.log(propertiesList) || console.log(propertiesLabels));
      console.timeEnd("onmessage");
      worker.terminate();
    };
    worker.addEventListener("error", (error) => {
      console.log(error);
      worker.terminate();
    });
    this._worker = worker;

    let reader = new FileReader();
    reader.readAsArrayBuffer(this.GeoJSON._file);
    reader.onload = () => {
      const array = new Int8Array(reader.result);
      worker.postMessage(array, [array.buffer]);
    };
  },
  beforeDestroy() {
    this.handleDisable();
    this._worker.terminate();
  },
  methods: {
    handleActivity3DChangeColor(val) {},
    handleEnable() {
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._GeoJSONLayer);
    },

    handleChange(type, value) {
      this[type] = value;
      switch (type) {
        case "center":
          if (this._Map) {
            this._Map.setCenter(this.GeoJSON.center);
          }
          break;
        case "show":
          if (value && this._Map) {
            this._Map.addLayer(this._GeoJSONLayer);
          } else {
            this._GeoJSONLayer.removeFromParent();
          }
          break;
        // ******************** 点
        case "pointSize":
          this._GeoJSONLayer.setPointSize(value);
          break;
        case "pointColor":
          this._GeoJSONLayer.setPointColor(value);
          break;
        case "pointIcon":
          this._GeoJSONLayer.setPointIcon(value);
          break;
        case "pointValue":
          this._GeoJSONLayer.setPointValue(value);
          this.pointValueLabel = JSON.parse(JSON.stringify(this.propertiesLabels[value] || { max: 1, min: 0 }));
          break;
        case "pointColors":
          const pointColorBar = this.COLOR_LIST[value];
          this._GeoJSONLayer.setPointColorBar(pointColorBar);
          break;
        case "pointOpacity":
          this._GeoJSONLayer.setPointOpacity(value);
          break;

        // ******************** 线
        case "lineWidth":
          this._GeoJSONLayer.setLineWidth(value);
          break;
        case "lineColor":
          this._GeoJSONLayer.setLineColor(value);
          break;
        case "lineStyle":
          this._GeoJSONLayer.setLineStyle(value);
          break;
        case "lineValue":
          this._GeoJSONLayer.setLineValue(value);
          this.lineValueLabel = JSON.parse(JSON.stringify(this.propertiesLabels[value] || { max: 1, min: 0 }));
          break;
        case "lineColors":
          const lineColorBar = this.COLOR_LIST[value];
          this._GeoJSONLayer.setLineColorBar(lineColorBar);
          break;
        case "lineOpacity":
          this._GeoJSONLayer.setLineOpacity(value);
          break;

        // ******************** 面
        case "polygonOpacity":
          this._GeoJSONLayer.setPolygonOpacity(value);
          break;
        case "polygonColor":
          this._GeoJSONLayer.setPolygonColor(value);
          break;
        case "polygonBorderWidth":
          this._GeoJSONLayer.setPolygonBorderWidth(value);
          break;
        case "polygonBorderColor":
          this._GeoJSONLayer.setPolygonBorderColor(value);
          break;
        case "polygonBorderStyle":
          this._GeoJSONLayer.setPolygonBorderStyle(value);
          break;
        case "polygonValue":
          this._GeoJSONLayer.setPolygonValue(value);
          this.polygonValueLabel = JSON.parse(JSON.stringify(this.propertiesLabels[value] || { max: 1, min: 0 }));
          break;
        case "polygonColors":
        case "usePolygonColors":
          if (this.usePolygonColors) {
            const polygonColorBar = this.COLOR_LIST[value];
            this._GeoJSONLayer.setPolygonColorBar(polygonColorBar);
          } else {
            this._GeoJSONLayer.setPointColorBar([this.polygonColor]);
          }
          break;
        case "polygon3D":
          this._GeoJSONLayer.setPolygon3D(value);
          break;
        case "polygon3DHeight":
          this._GeoJSONLayer.setPolygon3DHeight(value);
          break;
      }
    },
    removeGeoJSON() {},
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  font-size: 13px;

  .toolbar_item_bodyer {
    .title {
      font-size: 18px;
      margin: 5px 0;
    }
    .file_item {
      border: 1px solid transparent;
      border-radius: 4px;
    }

    .file_row {
      // height: 40px;
      display: flex;
      align-items: center;

      & + .file_row {
        border-top: 4px solid transparent;
      }
    }

    .file_s_col {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      // height: 40px;
      width: 40px;

      & + .file_s_col,
      & + .file_l_col {
        border-left: 4px solid transparent;
      }
    }

    .file_l_col {
      box-sizing: border-box;
      width: 100%;

      & + .file_s_col,
      & + .file_l_col {
        border-left: 1px solid transparent;
      }
    }
  }
}
</style>
