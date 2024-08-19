<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ GeoJSON.name }}</div>
    </div>
    <div class="toolbar_item_bodyer">
      <div class="title">点</div>
      <div class="file_item">
        <div class="file_row">
          <div class="file_l_col" style="padding: 0 15px">
            <el-slider :title="$l('pointSize')" v-model="pointSize" @change="handleChange('pointSize', $event)" :step="1" :min="1" :max="1000"> </el-slider>
          </div>
          <div class="file_s_col">
            <el-color-picker :title="$l('pointColor')" v-model="pointColor" @change="handleChange('pointColor', $event)" size="mini" :predefine="predefineColors" />
          </div>
          <div class="file_s_col" style="width: 80px">icon</div>
        </div>
        <div class="file_row">
          <div class="file_s_col" style="width: 100px">
            <el-select v-model="pointValue" @change="handleChange('pointValue', $event)" clearable>
              <el-option v-for="(item, key) in propertiesLabels" :key="key" :label="key" :value="key"></el-option>
            </el-select>
          </div>
          <div class="file_l_col">
            <ColorSelect v-model="pointColors" @change="handleChange('pointColors', $event.value)" :colorsList="COLOR_LIST" />
          </div>
        </div>
      </div>
      <div class="title">线</div>
      <div class="file_item">
        <div class="file_row">
          <div class="file_l_col" style="padding: 0 15px">
            <el-slider :title="$l('lineWidth')" v-model="lineWidth" @change="handleChange('lineWidth', $event)" :step="1" :min="1" :max="1000"> </el-slider>
          </div>
          <div class="file_s_col">
            <el-color-picker :title="$l('lineColor')" v-model="lineColor" @change="handleChange('lineColor', $event)" size="mini" :predefine="predefineColors" />
          </div>
          <div class="file_s_col" style="width: 100px">
            <el-select v-model="lineStyle" @change="handleChange('lineStyle', $event)">
              <el-option v-for="(v, k) in LINE_STYPE" :key="v" :label="k" :value="v"></el-option>
            </el-select>
          </div>
        </div>
        <div class="file_row">
          <div class="file_s_col" style="width: 100px">
            <el-select v-model="lineValue" @change="handleChange('lineValue', $event)" clearable>
              <el-option v-for="(item, key) in propertiesLabels" :key="key" :label="key" :value="key"></el-option>
            </el-select>
          </div>
          <div class="file_l_col">
            <ColorSelect style="width: 100%" v-model="lineColors" @change="handleChange('lineColors', $event.value)" :colorsList="COLOR_LIST" />
          </div>
        </div>
      </div>
      <div class="title">面</div>
      <div class="file_item">
        <div class="file_row">
          <div class="file_l_col" style="padding: 0 15px">
            <el-slider :title="$l('polygonOpacity')" v-model="polygonOpacity" @change="handleChange('polygonOpacity', $event)" :step="1" :min="1" :max="1000"> </el-slider>
          </div>
          <div class="file_s_col">
            <el-color-picker :title="$l('polygonColor')" v-model="polygonColor" @change="handleChange('polygonColor', $event)" size="mini" :predefine="predefineColors" />
          </div>
        </div>
        <div class="file_row">
          <div class="file_l_col" style="padding: 0 15px">
            <el-slider :title="$l('polygonBorderWidth')" v-model="polygonBorderWidth" @change="handleChange('polygonBorderWidth', $event)" :step="1" :min="1" :max="1000"> </el-slider>
          </div>
          <div class="file_s_col">
            <el-color-picker :title="$l('polygonBorderColor')" v-model="polygonBorderColor" @change="handleChange('polygonBorderColor', $event)" size="mini" :predefine="predefineColors" />
          </div>
          <div class="file_s_col" style="width: 100px">
            <el-select v-model="polygonBorderStyle" @change="handleChange('polygonBorderStyle', $event)">
              <el-option v-for="(v, k) in LINE_STYPE" :key="v" :label="k" :value="v"></el-option>
            </el-select>
          </div>
        </div>
        <div class="file_row">
          <div class="file_s_col" style="width: 100px">
            <el-select v-model="polygonValue" @change="handleChange('polygonValue', $event)" clearable>
              <el-option v-for="(item, key) in propertiesLabels" :key="key" :label="key" :value="key"></el-option>
            </el-select>
          </div>
          <div class="file_l_col">
            <ColorSelect style="width: 100%" v-model="polygonColors" @change="handleChange('polygonColors', $event.value)" :colorsList="COLOR_LIST" />
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
}
</language>

<script>
import { GeoJSONLayer, LINE_STYPE } from "../layer/GeoJSONLayer";
import GeoJSONLayerWorker from "../worker/GeoJSONLayer.worker";

const COLOR_LIST = [
  ["#313695", "#74add1", "#e0f3f8", "#fdae61", "#f46d43", "#a50026"],
  ["rgb(254, 224, 210)", "rgb(252, 187, 161)", "rgb(252, 146, 114)", "rgb(239, 59, 44)", "rgb(203, 24, 29)", "rgb(153, 0, 13)"],
  ["rgb(251, 234, 215)", "rgb(249, 219, 195)", "rgb(247, 212, 175)", "rgb(245, 183, 133)", "rgb(241, 165, 102)", "rgb(237, 135, 52)"],
  ["rgb(251, 234, 215)", "rgb(248, 230, 196)", "rgb(247, 212, 175)", "rgb(245, 199, 133)", "rgb(241, 185, 102)", "rgb(237, 161, 52)"],
  ["rgb(249, 241, 217)", "rgb(248, 230, 196)", "rgb(245, 225, 177)", "rgb(239, 209, 139)", "rgb(235, 197, 108)", "rgb(227, 179, 60)"],
  ["rgb(249, 245, 217)", "rgb(247, 239, 197)", "rgb(245, 233, 177)", "rgb(239, 223, 139)", "rgb(235, 215, 108)", "rgb(227, 201, 60)"],
  ["rgb(240, 248, 213)", "rgb(235, 244, 190)", "rgb(222, 237, 169)", "rgb(215, 227, 124)", "rgb(205, 221, 92)", "rgb(187, 209, 38)"],
  ["rgb(240, 248, 213)", "rgb(225, 241, 191)", "rgb(222, 237, 169)", "rgb(195, 227, 124)", "rgb(181, 221, 92)", "rgb(155, 209, 38)"],
  ["rgb(223, 247, 213)", "rgb(207, 243, 189)", "rgb(193, 239, 169)", "rgb(161, 233, 124)", "rgb(137, 227, 92)", "rgb(96, 217, 38)"],
  ["rgb(215, 245, 223)", "rgb(193, 241, 207)", "rgb(173, 235, 191)", "rgb(131, 225, 161)", "rgb(100, 219, 137)", "rgb(48, 205, 96)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(171, 229, 211)", "rgb(129, 215, 191)", "rgb(106, 209, 179)", "rgb(42, 189, 147)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(163, 227, 223)", "rgb(116, 213, 207)", "rgb(82, 201, 195)", "rgb(24, 183, 175)"],
  ["rgb(207, 243, 245)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(112, 217, 227)", "rgb(86, 211, 221)", "rgb(16, 191, 207)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(28, 181, 215)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(30, 169, 207)"],
  ["rgb(209, 227, 243)", "rgb(185, 211, 237)", "rgb(161, 197, 229)", "rgb(108, 165, 215)", "rgb(78, 145, 207)", "rgb(18, 108, 191)"],
];

export default {
  inject: ["rootVue"],
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
      COLOR_LIST: COLOR_LIST,
      LINE_STYPE: LINE_STYPE,
      show: true,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      pointSize: 1000,
      pointColor: "#ffa500",
      pointIcon: require("@/assets/image/point2.png"),
      pointValue: "",
      pointColors: 0,
      pointOpacity: 1,

      lineWidth: 100,
      lineColor: "#ffa500",
      lineStyle: LINE_STYPE.SOLID,
      lineValue: "",
      lineColors: 0,
      lineOpacity: 1,

      polygonOpacity: 1,
      polygonColor: "#ffa500",
      polygonBorderWidth: 1,
      polygonBorderColor: "#ffa500",
      polygonBorderStyle: LINE_STYPE.SOLID,
      polygonValue: "",
      polygonColors: 0,
      polygon3DHeight: 100,
      polygon3D: false,

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
      polygonColorBar: this.COLOR_LIST[this.polygonColors],
      polygon3D: this.polygon3D,
      polygon3DHeight: this.polygon3DHeight,
    });
  },
  mounted() {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { center, propertiesLabels, pointArray, lineArray, polygonArray, propertiesListArray } = event.data;

      console.time("onmessage");
      console.log(center);
      
      this.propertiesLabels = propertiesLabels;
      this._GeoJSONLayer.setCenter(center);
      this._GeoJSONLayer.setPointArray(pointArray);
      this._GeoJSONLayer.setLineArray(lineArray);
      this._GeoJSONLayer.setPolygonArray(polygonArray);

      const propertiesList = JSON.parse(new TextDecoder().decode(propertiesListArray));
      this._GeoJSONLayer.setPropertiesList(propertiesList, propertiesLabels);
      console.timeEnd("onmessage");
      worker.terminate();
    };
    worker.addEventListener("error", (error) => {
      console.log(error);
      worker.terminate();
    });

    let reader = new FileReader();
    reader.readAsArrayBuffer(this.GeoJSON._file);
    reader.onload = () => {
      const array = new Int8Array(reader.result);
      worker.postMessage(array, [array.buffer]);
    };
  },
  beforeDestroy() {
    this.handleDisable();
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
      console.log(type, value);

      this[type] = value;
      switch (type) {
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
          this._GeoJSONLayer.setLineOpacity(value);
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
          break;
        case "polygonColors":
          const polygonColorBar = this.COLOR_LIST[value];
          this._GeoJSONLayer.setPolygonColorBar(polygonColorBar);
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
    .file_item {
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
    }

    .file_s_col {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 40px;
      width: 40px;

      & + .file_s_col,
      & + .file_l_col {
        border-left: 1px solid #000;
      }
    }

    .file_l_col {
      box-sizing: border-box;
      width: 100%;

      & + .file_s_col,
      & + .file_l_col {
        border-left: 1px solid #000;
      }
    }
  }
}
</style>
