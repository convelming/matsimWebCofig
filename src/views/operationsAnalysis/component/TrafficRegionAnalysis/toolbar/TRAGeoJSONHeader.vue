<template>
  <div class="RegionalTrafficDetail" v-if="rootVue">
    <div v-loading="uploading" :element-loading-text="$l('文件上传中...')" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-select class="select_box" :value="s_value" @change="handleChangeGeoJSON" :placeholder="$l('请选择GeoJSON')" clearable size="mini">
        <el-option value="localhost" :label="$l('本地文件')"></el-option>
        <el-option v-for="item in rootVue.GeoJSONList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>
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
}
</language>

<script>
import { GeoJSONLayer, LINE_STYPE } from "../../GeoJSON/layer/GeoJSONLayer";
import GeoJSONLayerWorker from "../../GeoJSON/worker/GeoJSONLayer.worker";
import GeoJSONVisualMap from "../../GeoJSON/component/GeoJSONVisualMap.vue";

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
  watch: {},
  data() {
    return {
      COLOR_LIST: COLOR_LIST,
      LINE_STYPE: LINE_STYPE,
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
  created() {},
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
    },
    handleDisable() {
      for (const layer of this.layerList) {
        this._Map.removeLayer(layer._geojsonLayer);
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
        this.uploadForm = {};
        this.handleUploadFile();
      }
    },
    handleUploadFile() {
      this.uploading = true;
      const form = JSON.parse(JSON.stringify(this.uploadForm));
      form.file = this.selectGeoJSON._file;
      const regionalTrafficGeoJSON = {
        _file: form.file,
        name: form.file.name,
      };
      this.handleDrowFile(form);
      this.rootVue.regionalTrafficGeoJSON = regionalTrafficGeoJSON;
      this.uploading = false;
      this.reselect = false;
    },
    handleDrowFile(form) {
      this.drowFileing = true;

      const worker = new GeoJSONLayerWorker();
      worker.onmessage = (event) => {
        const { center, polygonArray } = event.data;
        const polygonList = [];
        for (let index = 0, l = polygonArray.length, num = 0, dataSize = polygonArray[0]; index < l; index += 1 + dataSize, dataSize = polygonArray[index]) {
          const shapeArray = polygonArray.slice(index + 1 + 1, index + 1 + dataSize);
          let shape = [];
          for (let j = 0, l = shapeArray.length, size = shapeArray[0]; j < l; j += 1 + size, size = shapeArray[j]) {
            const v = shapeArray.slice(j + 1, j + 1 + size);
            const points = [];
            for (let k = 0, l3 = v.length / 2; k < l3; k++) {
              points[points.length] = [v[k * 2 + 0] + center[0], v[k * 2 + 1] + center[1]];
            }
            shape.push(points);
          }
          polygonList[polygonList.length] = {
            shape: shape[0],
            holes: shape.slice(1),
          };
        }
        worker.terminate();
      };
      worker.addEventListener("error", (error) => {
        console.log(error);
        worker.terminate();
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
