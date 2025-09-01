<!-- index12 -->
<template>
  <div class="index12">
    <div id="mapRoot"></div>
    <div class="box1">
      <el-form label-width="80px" :inline="false" size="mini">
        <el-form-item label="选择文件">
          <el-button type="primary" @click="handleSelectFile">选择文件</el-button>

          <div class="file" v-if="file">{{ file.name }}</div>
        </el-form-item>
        <el-form-item label="高度属性">
          <el-select v-model="heightAttribute" clearable filterable @change="handleHeightAttributeChange">
            <el-option v-for="item in params" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number v-model="height" :min="0" :step="1" :controls="true" @change="handleHeight"> </el-input-number>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT, MOUSE_BUTTONS } from "@/mymap/index.js";
import * as THREE from "three";

import { GeoJSONLayer } from "./layer/GeoJSONLayer2";
import GeoJSONLayerWorker from "./layer/GeoJSONLayer2.worker";

function getColorBarByPropertie(aData, aItem) {
  try {
    const data = Object.assign(
      {},
      {
        type: "Number",
        name: "",
        min: 0,
        max: 10,
        values: [0, 10],
      },
      aData
    );
    const item = Object.assign(
      {},
      {
        valueKey: "",
        valueType: "",
        // startColor: "#FEE0D2",
        // endColor: "#B50404",
        startColor: "#01ae9c",
        endColor: "#01ae9c",
        model: "count", // count interval
        modelClass: 5,
        labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
        toFixed: 4,
        colorList: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      },
      aItem
    );
    const startColor = new THREE.Color(item.startColor);
    const endColor = new THREE.Color(item.endColor);
    const list = [];

    function getLabel(labelRule, { min, max, index }) {
      try {
        switch (labelRule) {
          case "EN": {
            const n1 = Math.floor(index / 26);
            const n2 = index % 26;
            const arr = new Array(n1).fill("z");
            arr.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[n2]);
            return arr.join("");
          }
          case "en": {
            const n1 = Math.floor(index / 26);
            const n2 = index % 26;
            const arr = new Array(n1).fill("z");
            arr.push("abcdefghijklmnopqrstuvwxyz"[n2]);
            return arr.join("");
          }
        }
      } catch (error) {}
      return `${min} ~ ${max}`;
    }

    if (data.type == "Number" && item.model == "count") {
      const modelClass = item.modelClass;
      let min = data.min;
      let max = data.max;
      if (min == max) {
        min--;
        max++;
      }
      const step = (max - min) / modelClass;
      for (let i = 0; i < modelClass; i++) {
        const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
        const min2 = Number(Number(min + step * i).toFixed(item.toFixed));
        const max2 = Number(Number(min + step * (i + 1)).toFixed(item.toFixed));
        list.push({
          min: min2,
          max: max2,
          range: [min, max],
          color: "#" + color.getHexString(),
          label: getLabel(item.labelRule, { min: min2, max: max2, index: i }),
          use: true,
        });
      }
    } else if (data.type == "Number" && item.model == "interval") {
      const modelClass = item.modelClass;
      const values = Array.from(data.values || []);
      values.shift();
      values.sort((a, b) => a - b);
      const step = values.length / modelClass;
      for (let i = 0; i < modelClass; i++) {
        let s = Math.floor(i * step);
        let e = Math.floor((i + 1) * step) - 1;
        if (e < s) e = s;
        const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
        list.push({
          min: values[s],
          max: values[e],
          range: [data.min, data.max],
          color: "#" + color.getHexString(),
          // label: `${values[s]} ~ ${values[e]}`,
          label: getLabel(item.labelRule, { min: values[s], max: values[e], index: i }),
          use: true,
        });
      }
    } else if (data.type == "String") {
      const mapList = Object.entries(data.map);
      for (let i = 0, l = mapList.length; i < l; i++) {
        const [mk, mi] = mapList[i];
        const color = new THREE.Color(item.colorList[i % item.colorList.length]); //new THREE.Color().lerpColors(startColor, endColor, i / l);
        list.push({
          min: mi - 0.5,
          max: mi + 0.5,
          range: [data.min, data.max],
          color: "#" + color.getHexString(),
          label: mk == "null" || !mk ? "未知" : mk,
          use: true,
        });
      }
    }
    return list;
  } catch (error) {
    return [];
  }
}
function parserGeoJSON(text) {
  return new Promise((resolve, reject) => {
    const worker = new GeoJSONLayerWorker();
    worker.onmessage = (event) => {
      const { range, center, pointArray, lineArray, polygonArray, propertiesListArray, propertiesLabelsArray, geomListArray } = event.data;

      const textDecoder = new TextDecoder();
      const propertiesLabels = JSON.parse(textDecoder.decode(propertiesLabelsArray));
      const propertiesList = JSON.parse(textDecoder.decode(propertiesListArray));
      const geomList = JSON.parse(textDecoder.decode(geomListArray));

      resolve({ range, center, pointArray, lineArray, polygonArray, propertiesList, propertiesLabels, geomList });
      worker.terminate();
    };
    worker.addEventListener("error", (error) => {
      reject(error);
      worker.terminate();
    });

    let textEncoder = new TextEncoder();
    const array = new Int8Array(textEncoder.encode(text));
    worker.postMessage(array, [array.buffer]);
  }).catch(console.log);
}

function fileToString(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("file is null"));
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      resolve(e.target.result);
    };
    // readAsDataURL
    fileReader.readAsText(file);
    fileReader.onerror = () => {
      reject(new Error("fileToString error"));
    };
  });
}

function selectFile(accept = "*/*") {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      resolve(input.files[0]);
    };
    input.click();
  });
}

export default {
  name: "index12",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      file: null,
      params: [],
      heightAttribute: "",
      height: 20,
    };
  },
  created() {},
  mounted() {
    this.initMap();
  },
  methods: {
    initMap(
      mapConfig = {
        center: [12636110, 2604649.2],
        zoom: 13.5,
        mapZoomHeight: 300,
        background: "#1b1b1b",
        // pitch: 30,
        // rotation: -10,
        enableRotate: true,
      }
    ) {
      this._Map = new MyMap({
        rootId: "mapRoot",
        ...mapConfig,
        background: "#1b1b1b",
        mapZoomHeight: 300,
        mouseButtons: MOUSE_BUTTONS.RIGHT,
        // center: [12598360.73, 2640607.15],
      });

      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._GeoJSONLayer = new GeoJSONLayer({ pointHeight: this.height, lineHeight: this.height, polygonHeight: this.height });
      this._GeoJSONLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (e) => {
        // console.log(e);
        // _Css2DLabelLayer.setCenter(e.data.webMercatorXY);
        // mapDialogData.show = true;
        alert(JSON.stringify(e.data.prop));
        // mapDialogData.data = Object.entries(e.data.prop).map(([label, value]) => ({ label, value }));
      });
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleSelectFile() {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      selectFile()
        .then((res) => {
          this.file = res;
          return fileToString(res);
        })
        .then((res) => {
          return parserGeoJSON(res);
        })
        .then((res) => {
          console.log(res);
          this.params = Object.keys(res.propertiesLabels);
          this._GeoJSON = res;
          this._Map.setCenter(res.center);
          this._GeoJSONLayer.setGeoJsonData(res);
        })
        .catch(console.log)
        .finally(() => {
          loading.close();
        });
    },
    handleHeightAttributeChange(value) {
      this._GeoJSONLayer.setPointColorBar(getColorBarByPropertie(this._GeoJSON.propertiesLabels[value]));
      this._GeoJSONLayer.setPointValue(value);

      this._GeoJSONLayer.setLineColorBar(getColorBarByPropertie(this._GeoJSON.propertiesLabels[value]));
      this._GeoJSONLayer.setLineValue(value);

      this._GeoJSONLayer.setPolygonColorBar(getColorBarByPropertie(this._GeoJSON.propertiesLabels[value]));
      this._GeoJSONLayer.setPolygonValue(value);
    },
    handleHeight(value) {
      this._GeoJSONLayer.setPointHeight(value);
      this._GeoJSONLayer.setLineHeight(value);
      this._GeoJSONLayer.setPolygonHeight(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.index12 {
  top: 0;
  left: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
#mapRoot {
  width: 100%;
  height: 100%;
}
.box1 {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: #ffffff99;
  padding: 10px;
  border-radius: 10px;
}
</style>
