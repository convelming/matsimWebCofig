<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('停车供需')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_map_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_map_icon.png" />
        <span class="item_title">{{ $l("停车供需") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("上传文件：") }}</div>
        <div class="form_value">
          <el-button :disabled="!s_showLayer" type="primary" size="mini" @click="handleShowUploadDialog">{{ $l("导入GeoJSON") }}</el-button>
        </div>
      </div>
      <div class="form_item">
        <div class="form_value">
          <div class="file_item" v-if="file">
            <div class="file_row">
              <div class="file_name" :title="file.name">{{ file.name }}</div>
              <div class="file_btn" style="width: 81px">
                <el-switch v-model="geojsonParams.show" :title="geojsonParams.show ? $l('hideGeoJSON') : $l('showGeoJSON')" @change="handleChangeGeoJsonParams('show', $event)"> </el-switch>
              </div>
            </div>
            <div class="file_row">
              <div style="width: 100%; padding: 0 10px">
                <el-slider :disabled="!s_showLayer" :title="$l('pointScale')" v-model="geojsonParams.pointScale" :step="1" :min="1" :max="1000" @change="handleChangeGeoJsonParams('pointScale', $event)"> </el-slider>
              </div>
              <div class="file_btn">
                <el-color-picker :disabled="!s_showLayer" :title="$l('pointColor')" size="mini" :predefine="predefineColors" v-model="geojsonParams.pointColor" @change="handleChangeGeoJsonParams('pointColor', $event)" />
              </div>
              <div class="file_btn">
                <el-color-picker :disabled="!s_showLayer" :title="$l('polygonColor')" size="mini" :predefine="predefineColors" v-model="geojsonParams.polygonColor" @change="handleChangeGeoJsonParams('polygonColor', $event)" />
              </div>
            </div>
            <div class="file_row">
              <div style="width: 100%; padding: 0 10px">
                <el-slider :disabled="!s_showLayer" :title="$l('lineWidth')" v-model="geojsonParams.lineWidth" :step="1" :min="1" :max="1000" @change="handleChangeGeoJsonParams('lineWidth', $event)"> </el-slider>
              </div>
              <div class="file_btn">
                <el-color-picker :disabled="!s_showLayer" :title="$l('lineColor')" size="mini" :predefine="predefineColors" v-model="geojsonParams.lineColor" @change="handleChangeGeoJsonParams('lineColor', $event)" />
              </div>
              <div class="file_btn">
                <el-button :disabled="!s_showLayer" type="danger" icon="el-icon-delete" size="mini" circle :title="$l('deleteGeoJSON')" @click="handleCloseFile"></el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("划定选择范围：") }}</div>
        <div class="form_value">
          <el-button v-if="polygonSelectState == POLYGON_SELECT_STATE_KEY.NOT_STARTED" :disabled="!s_showLayer" type="primary" size="mini" @click="handlePlayPolygonSelect">{{ $l("开始划定") }}</el-button>
          <template v-if="polygonSelectState != POLYGON_SELECT_STATE_KEY.NOT_STARTED">
            <el-button type="primary" size="mini" @click="handleReplayPolygonSelect">{{ $l("重新划定") }}</el-button>
            <el-button type="primary" size="mini" @click="handleStopPolygonSelect">{{ $l("停止划定") }}</el-button>
          </template>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("显示活动：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showActivity" @change="handleShowActivity($event)" />
        </div>
      </div>
      <template v-if="showActivity">
        <div class="form_item">
          <div class="form_label">{{ $l("最多显示人数：") }}</div>
          <div class="form_value">
            <el-input-number class="my_input_number_1" style="width: 100%" :disabled="!s_showLayer" size="medium" v-model="maxNum" :min="0" :step="1" step-strictly> </el-input-number>
          </div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("大小：") }}</div>
          <div class="form_value">
            <el-slider style="padding: 0px calc(2em - 10px)" :disabled="!s_showLayer" v-model="scale" :min="0" :max="3" :step="0.1" />
          </div>
        </div>
        <div class="form_item">
          <div class="form_label">{{ $l("颜色：") }}</div>
          <div class="form_value">
            <div style="display: flex; width: 100%; margin-bottom: 10px; align-items: center">
              <el-select v-model="colorType" :disabled="!s_showLayer" size="small">
                <el-option :label="$l('activity')" value="activity" />
                <el-option :label="$l('leg')" value="leg" />
              </el-select>
              <el-button :disabled="!s_showLayer" :icon="showColorTypeTable ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="showColorTypeTable = !showColorTypeTable"></el-button>
            </div>
            <el-table v-show="showColorTypeTable" class="small my_tabel" :data="{ leg: legTypeList, activity: activityTypeList }[colorType] || []" border stripe>
              <el-table-column prop="name" :label="$l('type')" />
              <el-table-column prop="color" :label="$l('color')" width="150px">
                <ColorPicker slot-scope="{ row }" :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="row.color" />
              </el-table-column>
            </el-table>
          </div>
        </div>
      </template>

      <el-dialog :title="$l('导入GeoJSON')" :visible.sync="showUploadDialog" width="600px" append-to-body>
        <el-form :model="uploadForm" ref="form" :rules="uploadRules" label-width="auto" :inline="false" size="normal">
          <el-form-item :label="$l('文件')" prop="file">
            <div>
              <el-button :disabled="!s_showLayer" type="primary" size="mini" @click="handleSelectFile">{{ $l("选择GeoJSON") }}</el-button>
            </div>
            <div class="file_item2" v-if="uploadForm.file">
              <span>{{ uploadForm.file.name }}</span>
              <i
                class="el-icon-close"
                @click="
                  uploadForm.file = null;
                  typeList = [];
                "
              ></i>
            </div>
          </el-form-item>
          <template v-if="uploadForm.file">
            <el-form-item :label="$l('路内停车场字段')" prop="road">
              <el-select v-model="uploadForm.road" clearable>
                <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$l('公共停车场字段')" prop="common">
              <el-select v-model="uploadForm.common" clearable>
                <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$l('专用停车场字段')" prop="special">
              <el-select v-model="uploadForm.special" clearable>
                <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$l('路边停车场字段')" prop="roadside">
              <el-select v-model="uploadForm.roadside" clearable>
                <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button type="primary" @click="handleUploadFile" :loading="uploading">{{ $l("立即上传") }}</el-button>
            <el-button @click="showUploadDialog = false">{{ $l("取消") }}</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "停车供需":{
    "zh-CN": "停车供需分析",
    "en-US": "Parking Analysis"
  },
  "导入GeoJSON":{
    "zh-CN": "导入GeoJSON",
    "en-US": "Import GeoJSON"
  },
  "上传文件：":{
    "zh-CN": "上传文件：",
    "en-US": "Upload file:"
  },
  "划定选择范围：":{
    "zh-CN": "划定选择范围：",
    "en-US": "Draw to select:"
  },
  "开始划定":{
    "zh-CN": "开始划定",
    "en-US": "Start drawing"
  },
  "重新划定":{
    "zh-CN": "重新划定",
    "en-US": "Redraw"
  },
  "停止划定":{
    "zh-CN": "停止划定",
    "en-US": "Stop drawing"
  },
  
  "显示活动：":{
    "zh-CN": "显示活动：",
    "en-US": "Show Activity："
  },
  "最多显示人数：":{
    "zh-CN": "最多显示人数：",
    "en-US": "Max Display Number："
  },
  "颜色：":{
    "zh-CN": "颜色：",
    "en-US": "Color："
  },
  "大小：":{
    "zh-CN": "大小：",
    "en-US": "Size："
  },
  "leg":{
    "zh-CN": "出行方式",
    "en-US": "Mode"
  },
  "activity":{
    "zh-CN": "活动类型",
    "en-US": "Activity"
  },
  "type":{
    "zh-CN": "类型",
    "en-US": "Type"
  },
  "color":{
    "zh-CN": "颜色",
    "en-US": "Color"
  },
  "文件":{
    "zh-CN": "文件",
    "en-US": "File"
  },
  "选择GeoJSON":{
    "zh-CN": "选择GeoJSON",
    "en-US": "Select GeoJSON"
  },
  "路内停车场字段":{
    "zh-CN": "路内停车场字段",
    "en-US": "On Street Parking Field:"
  },
  "公共停车场字段":{
    "zh-CN": "公共停车场字段",
    "en-US": "Public Parking Field"
  },
  "专用停车场字段":{
    "zh-CN": "专用停车场字段",
    "en-US": "Dedicated Parking Field"
  },
  "路边停车场字段":{
    "zh-CN": "路外停车场字段",
    "en-US": "Roadside Parking Field"
  },
  "立即上传":{
    "zh-CN": "立即上传",
    "en-US": "Upload now"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "./layer/PolygonSelectLayer";
import { Activity3DLayer } from "../Activity3D/layer/Activity3DLayer";
import { allParking, getAllActivityType, uploadGeoJson } from "@/api/index";
import { guid, JsonParse } from "@/utils/utils";
import ParkingGeoJSONWorker from "./worker/ParkingGeoJSON.worker";
import { GeoJSONLayer } from "../GeoJSON/layer/GeoJSONLayer";

const CHANGE_COLOR_EVENT_KEY = "Parking_changeColor";

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

    activityTypeList: {
      handler(val) {
        if (this._Activity3DLayer) {
          this._Activity3DLayer.setColors(val);
        }
        this.rootVue.$emit(CHANGE_COLOR_EVENT_KEY, {
          activityColors: this.activityTypeList,
          legColors: this.legTypeList,
        });
      },
      deep: true,
    },
    legTypeList: {
      handler(val) {
        this.rootVue.$emit(CHANGE_COLOR_EVENT_KEY, {
          activityColors: this.activityTypeList,
          legColors: this.legTypeList,
        });
      },
      deep: true,
    },
    scale(val) {
      if (this._Activity3DLayer) {
        this._Activity3DLayer.setScale(val);
      }
    },
    maxNum(val) {
      if (this._Activity3DLayer) {
        this._Activity3DLayer.setMaxNum(val);
      }
    },
  },
  data() {
    return {
      POLYGON_SELECT_STATE_KEY,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,
      color: "#5470c6",
      scale: 1,
      maxNum: 10000,
      showActivity: true,

      _Activity3DLayer: null,

      showColorTypeTable: false,
      colorType: "activity",
      activityTypeList: [],
      legTypeList: [],

      showUploadDialog: false,
      uploadForm: {},
      geojsonParams: {
        show: true,
        pointScale: 50,
        pointColor: "#5470c6",
        polygonColor: "#5470c6",
        lineWidth: 500,
        lineColor: "#5470c6",
      },
      uploadRules: {
        file: {
          required: true,
          message: "文件不能为空",
          trigger: "blur",
        },
      },
      uploading: false,
      typeList: [],
      file: null,

      selectPolygon: false,
      polygonSelectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,

      loading: false,
    };
  },
  created() {
    this.worker = new ParkingGeoJSONWorker();
    this.worker.onmessage = (event) => {
      const decode = new TextDecoder();
      const str = decode.decode(event.data.type);
      this._fileSource = event.data.source;

      this.typeList = JsonParse(str, []);
      this.uploadForm.road = null;
      this.uploadForm.common = null;
      this.uploadForm.special = null;
      this.uploadForm.roadside = null;
    };

    this.s_showLayer = this.showLayer;

    this._PolygonSelectLayer = new PolygonSelectLayer({
      zIndex: 100,
      event: {
        [POLYGON_SELECT_EVENT.STATE_CHANGE]: (res) => {
          this.polygonSelectState = res.data.state;
          if (this.polygonSelectState === POLYGON_SELECT_STATE_KEY.ENDED) {
            this.handleShowParkDetail(res.data.path);
          }
        },
      },
    });

    this._Activity3DLayer = new Activity3DLayer({
      zIndex: 30,
      colors: this.activityTypeList,
      scale: this.scale,
      maxNum: this.maxNum,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          const _data = JSON.parse(JSON.stringify(data));

          _data.legColors = JSON.parse(JSON.stringify(this.legTypeList));
          _data.activityColors = JSON.parse(JSON.stringify(this.activityTypeList));
          _data.changeColorEventKey = CHANGE_COLOR_EVENT_KEY;

          this.rootVue.handleShowParkingActivityDetail({
            uuid: data.pickColor,
            activityDetail: _data,
          });
        },
      },
    });

    this._GeoJSONLayer = new GeoJSONLayer({
      zIndex: 10,
      pointScale: this.geojsonParams.pointScale,
      pointColor: this.geojsonParams.pointColor,
      polygonColor: this.geojsonParams.polygonColor,
      lineWidth: this.geojsonParams.lineWidth,
      lineColor: this.geojsonParams.lineColor,
    });

    getAllActivityType().then((res) => {
      this.legTypeList = res.data.leg.map((v, i) => ({ name: v, color: this.predefineColors[i % this.predefineColors.length] }));
      this.activityTypeList = res.data.activity.map((v, i) => ({ name: v, color: this.predefineColors[i % this.predefineColors.length] }));
    });
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
    this._PolygonSelectLayer.dispose();
    this._Activity3DLayer.dispose();
    this._GeoJSONLayer.dispose();
  },
  methods: {
    handleChangeGeoJsonParams(type, value) {
      this.geojsonParams[type] = value;
      switch (type) {
        case "show":
          if (value && this._Map) {
            this._Map.addLayer(this._GeoJSONLayer);
          } else {
            this._GeoJSONLayer.removeFromParent();
          }
          break;
        case "pointScale":
          this._GeoJSONLayer.setPointScale(value);
          break;
        case "pointColor":
          this._GeoJSONLayer.setPointColor(value);
          break;
        case "polygonColor":
          this._GeoJSONLayer.setPolygonColor(value);
          break;
        case "lineWidth":
          this._GeoJSONLayer.setLineWidth(value);
          break;
        case "lineColor":
          this._GeoJSONLayer.setLineColor(value);
          break;
        default:
          break;
      }
    },
    getData() {
      if (this.loading) return;
      this.loading = true;
      let list = [];
      if (!this._ActivityLoaded) list.push(this.getAllActivity());
      Promise.all(list).finally(() => {
        this.loading = false;
      });
    },
    async getAllActivity() {
      try {
        const res = await allParking(1000000);
        this._Activity3DLayer.setData(res.data);
        this._ActivityLoaded = true;
      } catch (error) {}
    },
    handleShowActivity(val) {
      try {
        if (val) {
          this._Map.addLayer(this._Activity3DLayer);
        } else {
          this._Map.removeLayer(this._Activity3DLayer);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this.getData();
      this.handleShowActivity(this.showActivity);
      this.handleChangeGeoJsonParams("show", this.geojsonParams.show);
      this._Map.addLayer(this._PolygonSelectLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleStopPolygonSelect();
      this.handleShowActivity(false);
      this.handleChangeGeoJsonParams("show", false);
      this._Map.removeLayer(this._PolygonSelectLayer);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._Activity3DLayer) this._Activity3DLayer.setTime(time);
    },
    // ******************************* 上传文件 -- start
    handleShowUploadDialog() {
      this.uploading = false;
      this.uploadForm = {
        file: null,
        road: null,
        common: null,
        special: null,
        roadside: null,
      };
      this.showUploadDialog = true;
    },
    handleSelectFile() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".geojson";
      input.style = "position:fixed;width:0;height:0;top: -100px;";
      document.body.appendChild(input);
      input.onchange = (e) => {
        this.uploadForm.file = e.target.files[0];

        let reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = () => {
          const arrayBuffer = reader.result;
          const array = new Int8Array(arrayBuffer);
          this.worker.postMessage(array, [array.buffer]);
        };
        document.body.removeChild(input);
      };
      input.click();
    },
    handleUploadFile(file) {
      this.uploading = true;
      uploadGeoJson(this.uploadForm)
        .then((res) => {
          this.showUploadDialog = false;
          this.file = {
            ...this.uploadForm,
            name: this.uploadForm.file.name,
            geoId: res.data,
          };
          this.rootVue.$emit("Parking_Geojson_Uuid", { geoId: res.data });

          this.handleChangeGeoJsonParams("show", true);
          this._GeoJSONLayer.setData(this._fileSource);

          this.uploading = false;
        })
        .catch((res) => {
          this.uploading = false;
        });
    },
    handleCloseFile() {
      this.file = null;
      this.handleChangeGeoJsonParams("show", false);
      this.rootVue.$emit("Parking_Geojson_Uuid", { geoId: null });
    },
    // ******************************* 上传文件 -- end
    // ******************************* 交通交叉口 -- start
    handleShowParkDetail(path) {
      this.handleStopPolygonSelect();
      console.log(path);

      this.rootVue.handleShowPolgonParkingDetail({
        uuid: guid(),
        polgonParkingDetail: {
          xyarr: path,
          geoId: this.file ? this.file.geoId : null,
        },
      });
    },
    handlePlayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.polygonSelectState = this._PolygonSelectLayer.state;
      }
    },
    handleReplayPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.play();
        this.polygonSelectState = this._PolygonSelectLayer.state;
      }
    },
    handleStopPolygonSelect() {
      if (this._PolygonSelectLayer) {
        this._PolygonSelectLayer.reset();
        this._PolygonSelectLayer.stop();
        this.polygonSelectState = this._PolygonSelectLayer.state;
      }
    },
    // ******************************* 交通交叉口 -- end
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

.file_item2 {
  display: inline-block;
  padding: 7px 10px 7px 15px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 3px;

  color: #ffffff;
  background-color: #409eff;
  border-color: #409eff;
  .el-icon-loading {
    margin-left: 10px;
  }
  .el-icon-close {
    cursor: pointer;
    margin-left: 10px;
  }
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
