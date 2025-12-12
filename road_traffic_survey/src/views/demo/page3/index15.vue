<!-- index13 -->
<template>
  <div class="index13">
    <div id="mapRoot"></div>
    <div class="box1">
      <el-form label-width="80px" :inline="false" size="mini">
        <el-form-item label="选择文件">
          <el-button type="primary" @click="handleSelectFile">选择文件</el-button>
          <div class="file" v-if="file">{{ file.name }}</div>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-select v-model="startTime" clearable filterable @change="handleChangTime">
            <el-option v-for="item in params" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-select v-model="endTime" clearable filterable @change="handleChangTime">
            <el-option v-for="item in params" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="高度比"> <el-input-number v-model="height" :min="0" :step="1" :controls="true" @change="handleHeight"> </el-input-number> 秒/米 </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { MyMap, MapLayer, MAP_LAYER_STYLE, MAP_EVENT, MOUSE_BUTTONS, Layer } from "@/mymap/index.js";
import * as THREE from "three";

import { GeoJSONLayer } from "./layer/GeoJSONLayer2";
import GeoJSONLayerWorker from "./layer/GeoJSONLayer2.worker";

class TestLayer extends Layer {
  constructor(opt) {
    super(opt);
    this.geometry = new THREE.BoxGeometry(10, 10, 10);
    const m4 = new THREE.Matrix4().makeTranslation(0, 0, 5);
    this.geometry.applyMatrix4(m4);
    this.material = new THREE.MeshPhongMaterial({ color: "red", opacity: 0.5, transparent: true });
    this.material1 = new THREE.MeshBasicMaterial({});
    this.material2 = new THREE.MeshBasicMaterial({});

    this.height = opt.height || 1;
  }

  setPickLayerColor(color) {
    super.setPickLayerColor(color);
    this.material1.setValues({ color: color });
    this.material1.needsUpdate = true;
  }

  setHeight(height) {
    this.height = height;
    this.update();
  }

  setTimeArray(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    console.log(startTime, endTime);

    this.update();
  }

  setData(data) {
    if (this.mesh) {
      this.mesh.removeFromParent();
      this.mesh.dispose();
    }
    if (this.mesh1) {
      this.mesh1.removeFromParent();
      this.mesh1.dispose();
    }
    if (this.mesh2) {
      this.mesh2.removeFromParent();
      this.mesh2.dispose();
    }

    const { propertiesList, pointArray, center } = data;
    this.propertiesList = propertiesList;
    this.pointArray = pointArray;
    this.center = center;
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, Math.floor(pointArray.length / 3));
    this.mesh1 = new THREE.InstancedMesh(this.geometry, this.material1, Math.floor(pointArray.length / 3));
    this.mesh2 = new THREE.InstancedMesh(this.geometry, this.material2, Math.floor(pointArray.length / 3));
    this.update();
  }

  update() {
    const l1 = Math.floor(this.pointArray.length / 3);
    for (let i1 = 0; i1 < l1; i1++) {
      const x = this.pointArray[i1 * 3];
      const y = this.pointArray[i1 * 3 + 1];
      const value = this.pointArray[i1 * 3 + 2];
      let z = 0;
      let sz = 1;
      const m4 = new THREE.Matrix4();
      if (this.startTime && this.endTime) {
        const st = this.startTime[value];
        const et = this.endTime[value];

        z = st / this.height;
        sz = (et - st) / this.height / 10;
        console.log(st, et, z, sz);
      }
      m4.makeTranslation(x, y, z);
      m4.multiply(new THREE.Matrix4().makeScale(1, 1, sz));

      const pcolor = new THREE.Color(value);
      console.log(pcolor);

      this.mesh.setMatrixAt(i1, m4);
      this.mesh1.setMatrixAt(i1, m4);
      this.mesh2.setMatrixAt(i1, m4);
      this.mesh2.setColorAt(i1, pcolor);
    }
    if (this.mesh.instanceMatrix) this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh1.instanceMatrix) this.mesh1.instanceMatrix.needsUpdate = true;
    if (this.mesh2.instanceMatrix) this.mesh2.instanceMatrix.needsUpdate = true;
    if (this.mesh2.instanceColor) this.mesh2.instanceColor.needsUpdate = true;
    this.scene.add(this.mesh);
    this.pickLayerScene.add(this.mesh1);
    this.pickMeshScene.add(this.mesh2);
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER);
  }

  on(type, data) {
    if (type == MAP_EVENT.UPDATE_CENTER && this.center && this.mesh) {
      const [x, y] = this.map.WebMercatorToCanvasXY(...this.center);
      this.mesh.position.set(x, y, 0);
      this.mesh1.position.set(x, y, 0);
      this.mesh2.position.set(x, y, 0);
    }
    if (type == MAP_EVENT.HANDLE_PICK_LEFT && data.layerId == this.id) {
      console.log(data);

      // const pickId = data.pickColor;
      const properties = this.propertiesList[data.pickColor] || {};
      // const geom = this.geomList[data.pickColor] || {};
      this.handleEventListener(MAP_EVENT.HANDLE_PICK_LEFT, properties);
    }
  }

  onAdd(map) {
    super.onAdd(map);
    if (this.map) this.on(MAP_EVENT.UPDATE_CENTER);
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
  name: "index13",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {
      file: null,
      params: [],
      startTime: "",
      endTime: "",
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
        minPitch: -90,
        // center: [12598360.73, 2640607.15],
      });

      this._MapLayer = new MapLayer({ tileClass: MAP_LAYER_STYLE[MAP_LAYER_STYLE.length - 1], zIndex: -1 });
      this._Map.addLayer(this._MapLayer);

      this._TestLayer = new TestLayer({ height: this.height });
      this._TestLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (e) => {
        alert(JSON.stringify(e.data));
      });
      this._Map.addLayer(this._TestLayer);
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
          this.params = Object.keys(res.propertiesLabels);
          this._GeoJSON = res;
          this._Map.setCenter(res.center);
          this._TestLayer.setData(res);
        })
        .catch(console.log)
        .finally(() => {
          loading.close();
        });
    },
    handleChangTime() {
      const stArray = this._GeoJSON.propertiesLabels[this.startTime] || { values: null };
      const etArray = this._GeoJSON.propertiesLabels[this.endTime] || { values: null };
      this._TestLayer.setTimeArray(stArray.values, etArray.values);
    },
    handleHeight(value) {
      this._TestLayer.setHeight(this.height);
    },
  },
};
</script>

<style lang="scss" scoped>
.index13 {
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
