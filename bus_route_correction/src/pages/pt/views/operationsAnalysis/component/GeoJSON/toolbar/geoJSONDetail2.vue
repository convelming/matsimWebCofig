<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ GeoJSON.name }}</div>
    </div>
    <div class="toolbar_item_bodyer">
      <el-form :inline="false" size="mini" label-position="left">
        <el-form-item :label="$l('Show GeoJSON')">
          <el-switch v-model="GeoJSON.show" :active-value="true" :inactive-value="false" size="mini" />
        </el-form-item>
        <el-form-item :label="$l('Locate to the center')">
          <el-button type="primary" size="mini" circle icon="el-icon-aim" @click="handleLocateToTheCenter"></el-button>
        </el-form-item>
        <template v-if="hasPoint">
          <el-form-item :label="$l('point')">
            <div style="display: flex; align-items: center">
              <el-select v-model="pointSettingType" @change="handleChangePointSettingType($event, true)">
                <el-option label="Single Symbol" value="Single Symbol" />
                <el-option label="Categorized" value="Categorized" />
                <el-option label="Heatmap" value="Heatmap" />
              </el-select>
              <el-button type="primary" icon="el-icon-setting" @click="handleShowPointSetting"></el-button>
            </div>
            <GeoJSONSetting ref="pointSetting" :visible.sync="showPointSetting" :form="pointSettingForm" :layout="pointSettingLayout" @confirm="handlePointSettingConfirm" />
          </el-form-item>
          <el-form-item :label="$l('pointVisualMap')" v-if="pointSettingType == 'Categorized'">
            <el-switch v-model="showPointVisualMap" :active-value="true" :inactive-value="false" />
            <GeoJSONVisualMap ref="pointVisualMap" v-show="showPointVisualMap" :list="pointSettingForm.pointColorBar.data" />
          </el-form-item>
        </template>
        <template v-if="hasLine">
          <el-form-item :label="$l('line')">
            <div style="display: flex; align-items: center">
              <el-select v-model="lineSettingType" @change="handleChangeLineSettingType($event, true)">
                <el-option label="Single Symbol" value="Single Symbol" />
                <el-option label="Categorized" value="Categorized" />
              </el-select>
              <el-button type="primary" icon="el-icon-setting" @click="handleShowLineSetting"></el-button>
            </div>
            <GeoJSONSetting ref="lineSetting" :visible.sync="showLineSetting" :form="lineSettingForm" :layout="lineSettingLayout" @confirm="handleLineSettingConfirm" />
          </el-form-item>
          <el-form-item :label="$l('lineVisualMap')" v-if="lineSettingType == 'Categorized'">
            <el-switch v-model="showLineVisualMap" :active-value="true" :inactive-value="false" />
            <GeoJSONVisualMap ref="lineVisualMap" v-show="showLineVisualMap" :list="lineSettingForm.lineColorBar.data" />
          </el-form-item>
        </template>
        <template v-if="hasPolygon">
          <el-form-item :label="$l('polygon')">
            <div style="display: flex; align-items: center">
              <el-select v-model="polygonSettingType" @change="handleChangePolygonSettingType($event, true)">
                <el-option label="Single Symbol" value="Single Symbol" />
                <el-option label="Categorized" value="Categorized" />
                <el-option label="3D" value="3D" />
              </el-select>
              <el-button type="primary" icon="el-icon-setting" @click="handleShowPolygonSetting"></el-button>
            </div>
            <GeoJSONSetting ref="polygonSetting" :visible.sync="showPolygonSetting" :form="polygonSettingForm" :layout="polygonSettingLayout" @confirm="handlePolygonSettingConfirm" />
          </el-form-item>

          <el-form-item :label="$l('polygonVisualMap')" v-if="polygonSettingType == 'Categorized'">
            <el-switch v-model="showPolygonVisualMap" :active-value="true" :inactive-value="false" />
            <GeoJSONVisualMap ref="polygonVisualMap" v-show="showPolygonVisualMap" :list="polygonSettingForm.polygonColorBar.data" />
          </el-form-item>
        </template>
      </el-form>
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
  "pointVisualMap":{
    "zh-CN": "pointVisualMap",
    "en-US": "pointVisualMap"
  },
  "line":{
    "zh-CN": "line",
    "en-US": "line"
  },
  "lineVisualMap":{
    "zh-CN": "lineVisualMap",
    "en-US": "lineVisualMap"
  },
  "polygon":{
    "zh-CN": "polygon",
    "en-US": "polygon"
  },
  "polygonVisualMap":{
    "zh-CN": "polygonVisualMap",
    "en-US": "polygonVisualMap"
  },
}
</language>

<script>
import { getICONLIST, COLOR_LIST } from "@/utils/utils";
import { GeoJSONLayer, LINE_STYLE } from "../layer/GeoJSONLayer2";
import GeoJSONVisualMap from "../component/GeoJSONVisualMap2.vue";
import GeoJSONLayerWorker from "../worker/GeoJSONLayer.worker";
import GeoJSONSetting from "../component/GeoJSONSetting.vue";

export default {
  inject: ["rootVue"],
  components: { GeoJSONVisualMap, GeoJSONSetting },
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
      LINE_STYLE: LINE_STYLE,
      show: true,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      hasPoint: false,
      showPointSetting: false,
      pointSettingType: "Single Symbol",
      pointSettingForm: {
        pointSize: 1000,
        pointColor: "#ffa500",
        pointOpacity: 1,
        pointIcon: getICONLIST()[0],
        pointColorBar: {
          valueKey: "",
          valueType: "",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count", // count interval
          modelClass: 5,
          data: [],
        },
      },
      pointSettingLayout: [],
      showPointVisualMap: false,

      hasLine: false,
      showLineSetting: false,
      lineSettingType: "Single Symbol",
      lineSettingForm: {
        lineWidth: 100,
        lineColor: "#ffa500",
        lineOpacity: 1,
        lineStyle: LINE_STYLE.SOLID,
        lineColorBar: {
          valueKey: "",
          valueType: "",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count", // count interval
          modelClass: 5,
          data: [],
        },
      },
      lineSettingLayout: [],
      showLineVisualMap: false,

      hasPolygon: false,
      showPolygonSetting: false,
      polygonSettingType: "Single Symbol",
      polygonSettingForm: {
        polygonOpacity: 1,
        polygonColor: "#ffa500",
        polygonBorderWidth: 10,
        polygonBorderColor: "#5470C6",
        polygonBorderStyle: LINE_STYLE.NONE,
        polygonColorBar: {
          valueKey: "",
          valueType: "",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count", // count interval
          modelClass: 5,
          data: [],
        },
        polygon3D: {
          valueKey: "",
          data: 1,
        },
      },
      polygonSettingLayout: [],
      showPolygonVisualMap: false,

      GeoJSON: {},
      GeoJSONParams: [],
    };
  },
  created() {
    this.GeoJSON = this.rootVue.GeoJSONList.find((v) => v.id == this.id) || {};
    this._GeoJSONLayer = new GeoJSONLayer({
      zIndex: 30,
    });
  },
  mounted() {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { center, pointArray, lineArray, polygonArray, propertiesLabels, propertiesLabelsArray } = event.data;

      // 其他组件需要用到这个数据 不能删除
      this.$set(this.GeoJSON, "propertiesLabels", propertiesLabels);
      this.$set(this.GeoJSON, "center", center);
      this._GeoJSONLayer.setCenter(center);
      this._GeoJSONLayer.setPointArray(pointArray);
      this._GeoJSONLayer.setLineArray(lineArray);
      this._GeoJSONLayer.setPolygonArray(polygonArray);

      this.hasPoint = !!pointArray.length;
      this.hasLine = !!lineArray.length;
      this.hasPolygon = !!polygonArray.length;

      const textDecoder = new TextDecoder();
      this._propertiesLabels = JSON.parse(textDecoder.decode(propertiesLabelsArray));
      this._GeoJSONLayer.setPropertiesLabels(this._propertiesLabels);

      this.handleChangePointSettingType("Single Symbol", false);
      this.handleChangeLineSettingType("Single Symbol", false);
      this.handleChangePolygonSettingType("Single Symbol", false);
      this.$nextTick(() => {
        if (this.GeoJSON.config) {
          this.initByConfig(this.GeoJSON.config);
        } else {
          this.$refs.pointSetting && this.$refs.pointSetting.handleConfirm();
          this.$refs.lineSetting && this.$refs.lineSetting.handleConfirm();
          this.$refs.polygonSetting && this.$refs.polygonSetting.handleConfirm();
        }
      });
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
    initByConfig(config) {
      this.handleChangePointSettingType(config.pointSettingType, false);
      this.handlePointSettingConfirm(config.pointSettingForm);
      this.showPointVisualMap = config.showPointVisualMap;

      this.handleChangeLineSettingType(config.lineSettingType, false);
      this.handleLineSettingConfirm(config.lineSettingForm);
      this.showLineVisualMap = config.showLineVisualMap;

      this.handleChangePolygonSettingType(config.polygonSettingType, false);
      this.handlePolygonSettingConfirm(config.polygonSettingForm);
      this.showPolygonVisualMap = config.showPolygonVisualMap;
    },

    async exportConfig() {
      return JSON.parse(
        JSON.stringify({
          pointSettingType: this.pointSettingType,
          pointSettingForm: this.pointSettingForm,
          showPointVisualMap: this.showPointVisualMap,

          lineSettingType: this.lineSettingType,
          lineSettingForm: this.lineSettingForm,
          showLineVisualMap: this.showLineVisualMap,

          polygonSettingType: this.polygonSettingType,
          polygonSettingForm: this.polygonSettingForm,
          showPolygonVisualMap: this.showPolygonVisualMap,
        }),
      );
    },
    handleLocateToTheCenter() {
      if (this._Map) {
        this._Map.setCenter(this.GeoJSON.center);
      }
    },
    handleEnable() {
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._GeoJSONLayer);
    },
    // ******************** 点 ******************** //
    handleChangePointSettingType(type, showSetting) {
      this.pointSettingType = type;
      switch (type) {
        case "Single Symbol": {
          this.pointSettingLayout = [
            {
              label: "大小",
              name: "pointSize",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "图标",
              name: "pointIcon",
              type: "icon",
            },
            {
              label: "透明度",
              name: "pointOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "填充颜色",
              name: "pointColor",
              type: "color",
              attrs: {},
            },
          ];
          break;
        }
        case "Categorized": {
          this.pointSettingLayout = [
            {
              label: "大小",
              name: "pointSize",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "图标",
              name: "pointIcon",
              type: "icon",
            },
            {
              label: "透明度",
              name: "pointOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "填充颜色",
              name: "pointColorBar",
              type: "colorBar",
              options: this._propertiesLabels,
              attrs: {},
            },
          ];
          break;
        }
        case "Heatmap": {
          break;
        }
      }
      if (showSetting) {
        this.$nextTick(() => {
          this.$refs.pointSetting && this.$refs.pointSetting.handleConfirm();
          this.handleShowPointSetting();
        });
      }
    },
    handleShowPointSetting() {
      this.showPointSetting = true;
    },
    handlePointSettingConfirm(form) {
      this.pointSettingForm = form;
      const { pointColor, pointOpacity, pointSize, pointIcon, pointColorBar } = this.pointSettingForm;
      this._GeoJSONLayer.setPointSize(pointSize);
      this._GeoJSONLayer.setPointColor(pointColor);
      this._GeoJSONLayer.setPointIcon(pointIcon);
      this._GeoJSONLayer.setPointOpacity(pointOpacity);

      switch (this.pointSettingType) {
        case "Single Symbol": {
          this._GeoJSONLayer.setPointValue("");
          this._GeoJSONLayer.setPointColorBar(null);
          break;
        }
        case "Categorized": {
          this._GeoJSONLayer.setPointValue(pointColorBar.valueKey);
          this._GeoJSONLayer.setPointColorBar(pointColorBar.data);
          break;
        }
        case "Heatmap": {
          break;
        }
      }
      this.showPointSetting = false;
    },
    // ******************** 线 ******************** //
    handleChangeLineSettingType(type, showSetting) {
      this.lineSettingType = type;
      switch (type) {
        case "Single Symbol": {
          this.lineSettingLayout = [
            {
              label: "线宽",
              name: "lineWidth",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "样式",
              name: "lineStyle",
              type: "select",
              options: [
                { label: "实线", value: LINE_STYLE.SOLID },
                { label: "虚线", value: LINE_STYLE.DASHED },
              ],
            },
            {
              label: "透明度",
              name: "lineOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "填充颜色",
              name: "lineColor",
              type: "color",
              attrs: {},
            },
          ];
          break;
        }
        case "Categorized": {
          this.lineSettingLayout = [
            {
              label: "线宽",
              name: "lineWidth",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "样式",
              name: "lineStyle",
              type: "select",
              options: [
                { label: "实线", value: LINE_STYLE.SOLID },
                { label: "虚线", value: LINE_STYLE.DASHED },
              ],
            },
            {
              label: "透明度",
              name: "lineOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "填充颜色",
              name: "lineColorBar",
              type: "colorBar",
              options: this._propertiesLabels,
              attrs: {},
            },
          ];
          break;
        }
        case "Heatmap": {
          break;
        }
      }
      if (showSetting) {
        this.$nextTick(() => {
          this.$refs.lineSetting && this.$refs.lineSetting.handleConfirm();
          this.handleShowLineSetting();
        });
      }
    },
    handleShowLineSetting() {
      this.showLineSetting = true;
    },
    handleLineSettingConfirm(form) {
      this.lineSettingForm = form;
      const { lineWidth, lineColor, lineStyle, lineOpacity, lineColorBar } = this.lineSettingForm;
      this._GeoJSONLayer.setLineWidth(lineWidth);
      this._GeoJSONLayer.setLineColor(lineColor);
      this._GeoJSONLayer.setLineStyle(lineStyle);
      this._GeoJSONLayer.setLineOpacity(lineOpacity);
      switch (this.lineSettingType) {
        case "Single Symbol": {
          this._GeoJSONLayer.setLineValue("");
          this._GeoJSONLayer.setLineColorBar(null);
          break;
        }
        case "Categorized": {
          this._GeoJSONLayer.setLineValue(lineColorBar.valueKey);
          this._GeoJSONLayer.setLineColorBar(lineColorBar.data);
          break;
        }
        case "Heatmap": {
          break;
        }
      }
      this.showLineSetting = false;
    },
    // ******************** 面 ******************** //
    handleChangePolygonSettingType(type, showSetting) {
      this.polygonSettingType = type;
      switch (type) {
        case "Single Symbol": {
          this.polygonSettingLayout = [
            {
              label: "填充颜色",
              name: "polygonColor",
              type: "color",
              attrs: {},
            },
            {
              label: "透明度",
              name: "polygonOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "边框线宽",
              name: "polygonBorderWidth",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "边框样式",
              name: "polygonBorderStyle",
              type: "select",
              options: [
                { label: "不显示", value: LINE_STYLE.NONE },
                { label: "实线", value: LINE_STYLE.SOLID },
                { label: "虚线", value: LINE_STYLE.DASHED },
              ],
            },
            {
              label: "边框颜色",
              name: "polygonBorderColor",
              type: "color",
              attrs: {},
            },
          ];
          break;
        }
        case "Categorized": {
          this.polygonSettingLayout = [
            {
              label: "透明度",
              name: "polygonOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "边框线宽",
              name: "polygonBorderWidth",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "边框样式",
              name: "polygonBorderStyle",
              type: "select",
              options: [
                { label: "不显示", value: LINE_STYLE.NONE },
                { label: "实线", value: LINE_STYLE.SOLID },
                { label: "虚线", value: LINE_STYLE.DASHED },
              ],
            },
            {
              label: "边框颜色",
              name: "polygonBorderColor",
              type: "color",
              attrs: {},
            },
            {
              label: "填充颜色",
              name: "polygonColorBar",
              type: "colorBar",
              options: this._propertiesLabels,
              attrs: {},
            },
          ];
          break;
        }
        case "3D": {
          this.polygonSettingLayout = [
            {
              label: "填充颜色",
              name: "polygonColor",
              type: "color",
              attrs: {},
            },
            {
              label: "透明度",
              name: "polygonOpacity",
              type: "slider",
              attrs: {
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            {
              label: "边框线宽",
              name: "polygonBorderWidth",
              type: "number",
              attrs: {
                min: 0,
              },
            },
            {
              label: "边框样式",
              name: "polygonBorderStyle",
              type: "select",
              options: [
                { label: "不显示", value: LINE_STYLE.NONE },
                { label: "实线", value: LINE_STYLE.SOLID },
                { label: "虚线", value: LINE_STYLE.DASHED },
              ],
            },
            {
              label: "边框颜色",
              name: "polygonBorderColor",
              type: "color",
              attrs: {},
            },
            {
              label: "3D配置",
              name: "polygon3D",
              type: "3d",
              options: this._propertiesLabels,
              attrs: {},
            },
          ];
          break;
        }
      }
      if (showSetting) {
        this.$nextTick(() => {
          this.$refs.polygonSetting && this.$refs.polygonSetting.handleConfirm();
          this.handleShowPolygonSetting();
        });
      }
    },
    handleShowPolygonSetting() {
      this.showPolygonSetting = true;
    },
    handlePolygonSettingConfirm(form) {
      this.polygonSettingForm = form;
      const { polygonOpacity, polygonColor, polygonBorderWidth, polygonBorderColor, polygonBorderStyle, polygon3D, polygonColorBar } = this.polygonSettingForm;

      this._GeoJSONLayer.setPolygonOpacity(polygonOpacity);
      this._GeoJSONLayer.setPolygonColor(polygonColor);
      this._GeoJSONLayer.setPolygonBorderWidth(polygonBorderWidth);
      this._GeoJSONLayer.setPolygonBorderColor(polygonBorderColor);
      this._GeoJSONLayer.setPolygonBorderStyle(polygonBorderStyle);

      switch (this.polygonSettingType) {
        case "Single Symbol": {
          this._GeoJSONLayer.setPolygon3DValue("");
          this._GeoJSONLayer.setPolygon3DScale(1);
          this._GeoJSONLayer.setPolygonValue("");
          this._GeoJSONLayer.setPolygonColorBar(null);
          break;
        }
        case "Categorized": {
          this._GeoJSONLayer.setPolygon3DValue("");
          this._GeoJSONLayer.setPolygon3DScale(1);
          this._GeoJSONLayer.setPolygonValue(polygonColorBar.valueKey);
          this._GeoJSONLayer.setPolygonColorBar(polygonColorBar.data);
          break;
        }
        case "3D": {
          this._GeoJSONLayer.setPolygonValue("");
          this._GeoJSONLayer.setPolygonColorBar(null);
          this._GeoJSONLayer.setPolygon3DValue(polygon3D.valueKey);
          this._GeoJSONLayer.setPolygon3DScale(polygon3D.data);
          break;
        }
      }
      this.showPolygonSetting = false;
    },
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
