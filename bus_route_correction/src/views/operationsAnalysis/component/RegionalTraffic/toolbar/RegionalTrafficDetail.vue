<template>
  <div class="RegionalTrafficDetail" v-if="rootVue">
    <div v-if="rootVue.regionalTrafficGeoJSON && !reselect">
      <el-form size="mini">
        <el-form-item>
          <el-button style="display: block; margin-bottom: 10px; width: 100%" size="mini" type="primary" @click="reselect = true">{{ $l("重新选择文件") }}</el-button>
        </el-form-item>
        <el-form-item :label="$l('类型：')">
          <el-checkbox v-model="showLayer1">{{ $l("显示全部流量") }}</el-checkbox>
          <el-checkbox v-model="showLayer2">{{ $l("显示区域内流量") }}</el-checkbox>
        </el-form-item>
        <el-form-item :label="$l('颜色：')">
          <ColorSelect v-model="layerColor" :colorsList="COLOR_LIST" size="mini" />
        </el-form-item>
        <el-form-item :label="$l('视觉映射组件：')">
          <el-switch v-model="showLayerVisualMap" :active-value="true" :inactive-value="false"></el-switch>
          <GeoJSONVisualMap v-show="showLayerVisualMap" :colors="COLOR_LIST[layerColor]" :max="1" :min="0" />
        </el-form-item>
        <el-form-item>
          <div class="collapse" v-for="layer in layerList" :key="layer.name">
            <div class="collapse_header">
              <el-checkbox v-model="layer.show" :indeterminate="false" @change="handleChangeLayerParams(layer.name, 'show', $event)">{{ $l(layer.label) + layer.valueKey }}</el-checkbox>
              <span class="icon el-icon-caret-bottom" :class="layer.showSetting ? 'show' : 'hide'" @click.stop="layer.showSetting = !layer.showSetting"></span>
            </div>
            <div class="collapse_bodyer" v-show="layer.showSetting">
              <el-descriptions :column="1" size="mini">
                <template v-if="layer.showPointSetting">
                  <el-descriptions-item label="pointSize">
                    <el-slider :title="$l('pointSize')" v-model="layer.params.pointSize" @change="handleChangeLayerParams(layer.name, 'pointSize', $event)" :step="0.1" :min="0" :max="1000" size="mini"> </el-slider>
                  </el-descriptions-item>
                  <!-- <el-descriptions-item label="pointColors">
                    <ColorSelect :title="$l('pointColors')" v-model="layer.params.pointColors" @change="handleChangeLayerParams(layer.name, 'pointColors', $event.value)" :colorsList="COLOR_LIST" size="mini" />
                  </el-descriptions-item> -->
                  <!-- <el-descriptions-item label="showPointVisualMap">
                    <el-switch :title="$l('showPointVisualMap')" v-model="layer.showPointVisualMap" :active-value="true" :inactive-value="false"></el-switch>
                    <GeoJSONVisualMap v-show="layer.showPointVisualMap" :colors="COLOR_LIST[layer.params.pointColors]" :max="layer.valueLabel.max" :min="layer.valueLabel.min" />
                  </el-descriptions-item> -->
                </template>
                <template v-if="layer.showLineSetting">
                  <el-descriptions-item label="lineWidth">
                    <el-slider :title="$l('lineWidth')" v-model="layer.params.lineWidth" @change="handleChangeLayerParams(layer.name, 'lineWidth', $event)" :step="0.1" :min="0" :max="1000" size="mini"> </el-slider>
                  </el-descriptions-item>
                  <el-descriptions-item label="lineStyle">
                    <el-select :title="$l('lineStyle')" v-model="layer.params.lineStyle" @change="handleChangeLayerParams(layer.name, 'lineStyle', $event)" size="mini">
                      <el-option v-for="(v, k) in LINE_STYLE" :key="v" :label="k" :value="v"></el-option>
                    </el-select>
                  </el-descriptions-item>
                  <!-- <el-descriptions-item label="lineColors">
                    <ColorSelect :title="$l('lineColors')" style="width: 100%" v-model="layer.params.lineColors" @change="handleChangeLayerParams(layer.name, 'lineColors', $event.value)" :colorsList="COLOR_LIST" size="mini" />
                  </el-descriptions-item> -->

                  <!-- <el-descriptions-item label="showLineVisualMap">
                    <el-switch :title="$l('showLineVisualMap')" v-model="layer.showLineVisualMap" :active-value="true" :inactive-value="false"> </el-switch>
                    <GeoJSONVisualMap v-show="layer.showLineVisualMap" :colors="COLOR_LIST[layer.params.lineColors]" :max="layer.valueLabel.max" :min="layer.valueLabel.min" />
                  </el-descriptions-item> -->
                </template>
                <template v-if="layer.showPolygonSetting">
                  <el-descriptions-item label="polygonOpacity">
                    <el-slider :title="$l('polygonOpacity')" v-model="layer.params.polygonOpacity" @change="handleChangeLayerParams(layer.name, 'polygonOpacity', $event)" :step="0.01" :min="0" :max="1" size="mini"> </el-slider>
                  </el-descriptions-item>
                  <!-- <el-descriptions-item label="polygonColors">
                    <ColorSelect :title="$l('polygonColors')" style="width: 100%" v-model="layer.params.polygonColors" @change="handleChangeLayerParams(layer.name, 'polygonColors', $event.value)" :colorsList="COLOR_LIST" size="mini" />
                  </el-descriptions-item> -->
                  <el-descriptions-item label="polygon3D">
                    <el-switch :title="$l('polygon3D')" v-model="layer.params.polygon3D" @change="handleChangeLayerParams(layer.name, 'polygon3D', $event)" :active-value="true" :inactive-value="false" size="mini" />
                  </el-descriptions-item>
                  <el-descriptions-item label="polygon3DHeight">
                    <el-slider :title="$l('polygon3DHeight')" v-model="layer.params.polygon3DHeight" @change="handleChangeLayerParams(layer.name, 'polygon3DHeight', $event)" :step="0.1" :min="0" :max="5000" size="mini"> </el-slider>
                  </el-descriptions-item>
                  <el-descriptions-item label="polygonBorderWidth">
                    <el-slider :title="$l('polygonBorderWidth')" v-model="layer.params.polygonBorderWidth" @change="handleChangeLayerParams(layer.name, 'polygonBorderWidth', $event)" :step="0.1" :min="0" :max="300" size="mini"> </el-slider>
                  </el-descriptions-item>
                  <el-descriptions-item label="polygonBorderColor">
                    <el-color-picker :title="$l('polygonBorderColor')" v-model="layer.params.polygonBorderColor" @change="handleChangeLayerParams(layer.name, 'polygonBorderColor', $event)" :predefine="predefineColors" size="mini" />
                  </el-descriptions-item>
                  <el-descriptions-item label="polygonBorderStyle">
                    <el-select :title="$l('polygonBorderStyle')" v-model="layer.params.polygonBorderStyle" @change="handleChangeLayerParams(layer.name, 'polygonBorderStyle', $event)" size="mini">
                      <el-option v-for="(v, k) in LINE_STYLE" :key="v" :label="k" :value="v"></el-option>
                    </el-select>
                  </el-descriptions-item>

                  <!-- <el-descriptions-item label="showPolygonVisualMap">
                    <el-switch :title="$l('showPolygonVisualMap')" v-model="layer.showPolygonVisualMap" :active-value="true" :inactive-value="false"> </el-switch>
                    {{ layer.showPolygonVisualMap }}
                    <GeoJSONVisualMap v-show="layer.showPolygonVisualMap" :colors="COLOR_LIST[layer.params.polygonColors]" :max="layer.valueLabel.max" :min="layer.valueLabel.min" />
                  </el-descriptions-item> -->
                </template>
              </el-descriptions>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div v-else v-loading="uploading" :element-loading-text="$l('文件上传中...')" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-select class="select_box" :value="s_value" @change="handleChangeGeoJSON" :placeholder="$l('请选择GeoJSON')" clearable size="mini">
        <el-option value="localhost" :label="$l('本地文件')"></el-option>
        <el-option v-for="item in rootVue.GeoJSONList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>
      <el-form class="form_box" v-if="selectGeoJSON && s_value" :model="uploadForm" ref="form" label-width="auto" :inline="false" size="mini">
        <el-form-item :label="$l('线路ID字段')" prop="roadId">
          <el-select v-model="uploadForm.roadId" clearable>
            <el-option v-for="(item, key) in selectGeoJSON.propertiesLabels" :key="key" :label="key" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <div class="tip">{{ $l("总停车场字段不选择时，将会采用其他4个字段的和作为总停车场数量") }}</div>
        <div class="btn_box">
          <el-button size="mini" type="primary" @click="handleUploadFile" :loading="uploading">{{ $l("立即上传") }}</el-button>
          <el-button size="mini" @click="handleCloseSelect">{{ $l("取消") }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<language>
{
  "GeoJSON":{
    "zh-CN": "GeoJSON",
    "en-US": "GeoJSON"
  },
  "本地文件":{
    "zh-CN": "本地文件",
    "en-US": "本地文件"
  },
  "重新选择文件":{
    "zh-CN": "重新选择文件",
    "en-US": "重新选择文件"
  },
  "请选择GeoJSON":{
    "zh-CN": "请选择GeoJSON",
    "en-US": "请选择GeoJSON"
  },
  "线路ID字段":{
    "zh-CN": "线路ID字段",
    "en-US": "Road ID Field"
  },
  "立即上传":{
    "zh-CN": "立即上传",
    "en-US": "Upload now"
  },
  "类型：":{
    "zh-CN": "类型：",
    "en-US": "Type:"
  },
  "颜色：":{
    "zh-CN": "颜色：",
    "en-US": "Color:"
  },
  "视觉映射组件：":{
    "zh-CN": "视觉映射组件：",
    "en-US": "Visual Map:"
  },
  "显示全部流量":{
    "zh-CN": "显示全部流量",
    "en-US": "show all flow"
  },
  "显示区域内流量":{
    "zh-CN": "显示区域内流量",
    "en-US": "show part flow"
  },
}
</language>

<script>
import { GeoJSONLayer, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer";
import GeoJSONLayerWorker from "../../GeoJSON/worker/GeoJSONLayer.worker";
import GeoJSONVisualMap from "../../GeoJSON/component/GeoJSONVisualMap.vue";

import { RegionalTrafficFlowLayer } from "../layer/RegionalTrafficFlowLayer";

import { getElapseAreaLeg } from "@/api/index";
import { guid, COLOR_LIST } from "@/utils/utils";

export default {
  name: "RegionalTrafficDetail",
  inject: ["rootVue"],
  props: {},
  components: { GeoJSONVisualMap },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    showLayer1(val) {
      if (val) {
        this._Map.addLayer(this._RegionalTrafficFlowLayer1);
      } else {
        this._Map.removeLayer(this._RegionalTrafficFlowLayer1);
      }
    },
    showLayer2(val) {
      if (val) {
        this._Map.addLayer(this._RegionalTrafficFlowLayer2);
      } else {
        this._Map.removeLayer(this._RegionalTrafficFlowLayer2);
      }
    },
    layerColor(val) {
      const pointColorBar = this.COLOR_LIST[this.layerColor];
      this._RegionalTrafficFlowLayer1.setColorBar(pointColorBar);
      this._RegionalTrafficFlowLayer2.setColorBar(pointColorBar);
    },
  },
  data() {
    return {
      COLOR_LIST: COLOR_LIST,
      LINE_STYLE: LINE_STYLE,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_value: "",
      uploading: false,
      uploadForm: {},
      selectGeoJSON: null,
      reselect: false,
      layerList: [],

      showLayer1: true,
      showLayer2: false,
      layerColor: 0,
      showLayerVisualMap: false,
    };
  },
  created() {
    this._RegionalTrafficFlowLayer1 = new RegionalTrafficFlowLayer({ zIndex: 100, color: this.color, height: this.height, colorBar: this.COLOR_LIST[this.layerColor] });
    this._RegionalTrafficFlowLayer2 = new RegionalTrafficFlowLayer({ zIndex: 100, color: this.color, height: this.height, colorBar: this.COLOR_LIST[this.layerColor] });
  },
  mounted() {
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
  methods: {
    handleEnable() {
      for (const layer of this.layerList) {
        this._Map.addLayer(layer._geojsonLayer);
      }
      if (this.showLayer1) this._Map.addLayer(this._RegionalTrafficFlowLayer1);
      if (this.showLayer2) this._Map.addLayer(this._RegionalTrafficFlowLayer2);
    },
    handleDisable() {
      for (const layer of this.layerList) {
        this._Map.removeLayer(layer._geojsonLayer);
      }
      this._Map.removeLayer(this._RegionalTrafficFlowLayer1);
      this._Map.removeLayer(this._RegionalTrafficFlowLayer2);
    },
    handleChangeLayerParams(layerName, type, value) {
      console.log(type, value);
      const layer = this.layerList.find((v) => v.name == layerName);
      if (!layer) return console.log("layer not found", layerName);
      layer.params[type] = value;
      const _geojsonLayer = layer._geojsonLayer;
      switch (type) {
        case "show":
          if (value && this._Map) {
            this._Map.addLayer(_geojsonLayer);
          } else {
            _geojsonLayer.removeFromParent();
          }
          break;
        // ******************** 点
        case "pointSize":
          _geojsonLayer.setPointSize(value);
          break;
        case "pointColor":
          _geojsonLayer.setPointColor(value);
          break;
        case "pointIcon":
          _geojsonLayer.setPointIcon(value);
          break;
        case "pointValue":
          _geojsonLayer.setPointValue(value);
          break;
        case "pointColors":
          const pointColorBar = this.COLOR_LIST[value];
          _geojsonLayer.setPointColorBar(pointColorBar);
          break;
        case "pointOpacity":
          _geojsonLayer.setPointOpacity(value);
          break;

        // ******************** 线
        case "lineWidth":
          _geojsonLayer.setLineWidth(value);
          break;
        case "lineColor":
          _geojsonLayer.setLineColor(value);
          break;
        case "lineStyle":
          _geojsonLayer.setLineStyle(value);
          break;
        case "lineValue":
          _geojsonLayer.setLineValue(value);
          break;
        case "lineColors":
          const lineColorBar = this.COLOR_LIST[value];
          _geojsonLayer.setLineColorBar(lineColorBar);
          break;
        case "lineOpacity":
          _geojsonLayer.setLineOpacity(value);
          break;

        // ******************** 面
        case "polygonOpacity":
          _geojsonLayer.setPolygonOpacity(value);
          break;
        case "polygonColor":
          _geojsonLayer.setPolygonColor(value);
          break;
        case "polygonBorderWidth":
          _geojsonLayer.setPolygonBorderWidth(value);
          break;
        case "polygonBorderColor":
          _geojsonLayer.setPolygonBorderColor(value);
          break;
        case "polygonBorderStyle":
          _geojsonLayer.setPolygonBorderStyle(value);
          break;
        case "polygonValue":
          _geojsonLayer.setPolygonValue(value);
          break;
        case "polygonColors":
          const polygonColorBar = this.COLOR_LIST[value];
          _geojsonLayer.setPolygonColorBar(polygonColorBar);
          break;
        case "polygon3D":
          _geojsonLayer.setPolygon3D(value);
          break;
        case "polygon3DHeight":
          _geojsonLayer.setPolygon3DHeight(value);
          break;
      }
    },
    handleCloseSelect() {
      this.s_value = null;
      this.reselect = false;
    },
    handleChangeGeoJSON(value) {
      if (value == "localhost") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".geojson,.json";
        input.style = "position:absolute;width:0;height:0;top: -100px;";
        document.body.appendChild(input);
        input.onchange = (e) => {
          const file = e.target.files[0];
          const index = this.rootVue.GeoJSONList.findIndex((item) => item.name == file.name);
          if (index > -1) {
            this.$message.error(this.$l("GeoJSON文件已存在！"));
          } else {
            const GeoJSON = {
              id: guid(),
              _file: file,
              name: file.name,
              show: false,
            };
            this.rootVue.handleAddGeoJSON(GeoJSON);
            this.$nextTick(() => {
              this.handleChangeGeoJSON(GeoJSON.id);
            });
            document.body.removeChild(input);
          }
        };
        input.click();
      } else {
        this.s_value = value;
        this.selectGeoJSON = this.rootVue.GeoJSONList.find((item) => item.id === value);
        this.uploadForm = {
          roadId: null,
        };
      }
    },
    // handleUploadFile() {
    //   this.uploading = true;
    //   const form = JSON.parse(JSON.stringify(this.uploadForm));
    //   form.file = this.selectGeoJSON._file;
    //   uploadGeoJson(form)
    //     .then((res) => {
    //       const regionalTrafficGeoJSON = {
    //         _file: form.file,
    //         name: form.file.name,
    //         roadId: form.roadId,
    //         geoId: res.data,
    //       };
    //       this.handleDrowFile(form);
    //       this.rootVue.regionalTrafficGeoJSON = regionalTrafficGeoJSON;
    //       // this.rootVue.$emit("Parking_Geojson_Uuid", { geoId: res.data });
    //       this.uploading = false;
    //       this.reselect = false;
    //     })
    //     .catch((res) => {
    //       this.uploading = false;
    //     });
    // },
    handleUploadFile() {
      this.uploading = true;
      const form = JSON.parse(JSON.stringify(this.uploadForm));
      form.file = this.selectGeoJSON._file;
      const regionalTrafficGeoJSON = {
        _file: form.file,
        name: form.file.name,
        roadId: form.roadId,
      };
      this.handleDrowFile(form);
      this.rootVue.regionalTrafficGeoJSON = regionalTrafficGeoJSON;
      this.uploading = false;
      this.reselect = false;
    },
    handleDrowFile(form) {
      for (const layer of this.layerList) {
        layer._geojsonLayer.removeFromParent();
        layer._geojsonLayer.dispose();
      }

      this._RegionalTrafficFlowLayer1.setData(null);
      this._RegionalTrafficFlowLayer2.setData(null);

      const layerNameList = [];
      if (!!form.roadId) layerNameList.push("roadId");

      const layerList = [];

      for (const layerName of layerNameList) {
        const layer = {
          label: layerName + "_label",
          name: layerName,
          valueKey: form[layerName],
          valueLabel: { max: 0, min: 1 },
          show: false,
          showSetting: false,

          showPointSetting: false,
          showPointVisualMap: false,

          showLineSetting: false,
          showLineVisualMap: false,

          showPolygonSetting: false,
          showPolygonVisualMap: false,

          params: {
            pointSize: 1000,
            pointColor: "#ffa500",
            pointIcon: require("@/assets/image/point2.png"),
            pointValue: form[layerName],
            pointColors: 0,
            pointOpacity: 1,

            lineWidth: 100,
            lineColor: "#ffa500",
            lineStyle: LINE_STYLE.SOLID,
            lineValue: form[layerName],
            lineColors: 0,
            lineOpacity: 1,

            polygonOpacity: 1,
            polygonColor: "#ffa500",
            polygonBorderWidth: 100,
            polygonBorderColor: "#5470C6",
            polygonBorderStyle: LINE_STYLE.SOLID,
            polygonValue: form[layerName],
            polygonColors: 0,
            polygon3DHeight: 2500,
            polygon3D: false,
          },
          _geojsonLayer: null,
        };

        layer._geojsonLayer = new GeoJSONLayer({
          zIndex: 10,

          // ******************** 点 ******************** //
          pointSize: layer.params.pointSize,
          pointColor: layer.params.pointColor,
          pointIcon: layer.params.pointIcon,
          pointValue: "", //layer.params.pointValue,
          pointColorBar: this.COLOR_LIST[layer.params.pointColors],
          pointOpacity: layer.params.pointOpacity,
          // ******************** 线 ******************** //
          lineWidth: layer.params.lineWidth,
          lineColor: layer.params.lineColor,
          lineStyle: layer.params.lineStyle,
          lineValue: "", //layer.params.lineValue,
          lineColorBar: this.COLOR_LIST[layer.params.lineColors],
          lineOpacity: layer.params.lineOpacity,
          // ******************** 面 ******************** //
          polygonColor: layer.params.polygonColor,
          polygonOpacity: layer.params.polygonOpacity,
          polygonBorderWidth: layer.params.polygonBorderWidth,
          polygonBorderColor: layer.params.polygonBorderColor,
          polygonBorderStyle: layer.params.polygonBorderStyle,
          polygonValue: "", //layer.params.polygonValue,
          polygonColorBar: this.COLOR_LIST[layer.params.polygonColors],
          polygon3D: layer.params.polygon3D,
          polygon3DHeight: layer.params.polygon3DHeight,
        });

        layerList[layerList.length] = layer;
      }

      this.layerList = layerList;
      this.drowFileing = true;

      const worker = new GeoJSONLayerWorker();
      worker.onmessage = (event) => {
        const { center, propertiesLabels, pointArray, lineArray, polygonArray, propertiesListArray } = event.data;
        const propertiesList = JSON.parse(new TextDecoder().decode(propertiesListArray));
        console.log(event.data);

        for (const layer of layerList) {
          console.time("onmessage");

          layer.valueLabel = JSON.parse(JSON.stringify(propertiesLabels[layer.valueKey] || { max: 1, min: 0 }));

          layer.showPointSetting = !!pointArray.length;
          layer.showLineSetting = !!lineArray.length;
          layer.showPolygonSetting = !!polygonArray.length;

          layer._geojsonLayer.setCenter(center);
          layer._geojsonLayer.setPointArray(pointArray);
          layer._geojsonLayer.setLineArray(lineArray);
          layer._geojsonLayer.setPolygonArray(polygonArray);
          layer._geojsonLayer.setPropertiesList(propertiesList, propertiesLabels);

          console.timeEnd("onmessage");
        }
        if (this._Map) {
          for (const layer of this.layerList) {
            if (layer.show) this._Map.addLayer(layer._geojsonLayer);
          }
        }
        worker.terminate();

        // 获取流量数据

        const roadIdList = propertiesList.map((v) => v[form.roadId]).filter((v) => !!v);
        getElapseAreaLeg({
          linkIds: roadIdList,
          selectAll: true,
        }).then((res) => {
          this._RegionalTrafficFlowLayer1.setData(res.data);
          if (this.showLayer1) this._Map.addLayer(this._RegionalTrafficFlowLayer1);
        });
        getElapseAreaLeg({
          linkIds: roadIdList,
          selectAll: false,
        }).then((res) => {
          this._RegionalTrafficFlowLayer2.setData(res.data);
          if (this.showLayer2) this._Map.addLayer(this._RegionalTrafficFlowLayer2);
        });

        this.drowFileing = false;
      };
      worker.addEventListener("error", (error) => {
        console.log(error);
        worker.terminate();
        this.layerList = [];
        this.drowFileing = false;
      });

      let reader = new FileReader();
      reader.readAsArrayBuffer(form.file);
      reader.onload = () => {
        const array = new Int8Array(reader.result);
        worker.postMessage(array, [array.buffer]);
      };
      reader.onerror = (error) => {
        console.log(error);
      };
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider {
    width: 100%;
    padding: 0 10px;
  }
  .el-select {
    .el-input__inner {
      border: 0;
      border-radius: 0;
    }
  }
  .el-descriptions__body {
    background-color: transparent;
  }
  .el-descriptions-item__container {
    align-items: center;
  }
}
.RegionalTrafficDetail {
  position: relative;
  z-index: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

  .select_box {
    overflow: hidden;
    width: 100%;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
  .form_box {
    margin-top: 20px;
  }
  .tip {
    font-size: 12px;
    color: #e6a23c;
  }
  .btn_box {
    margin-top: 20px;
    text-align: right;
  }
  .collapse {
    &_header {
      display: flex;
      align-items: center;
      line-height: 30px;
      .el-checkbox {
        width: calc(100% - 40px);
      }
      .icon {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
        width: 30px;
        height: 30px;
        transition: transform 0.3s;
        &.show {
          transform: rotate(0deg);
        }
        &.hide {
          transform: rotate(-90deg);
        }
      }
    }
    &_bodyer {
      padding: 0 0 0 30px;
    }
  }
}
</style>
