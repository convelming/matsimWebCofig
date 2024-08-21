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
    </div>
  </el-collapse-item>
</template>

<language>
{
  "停车供需":{
    "zh-CN": "停车供需分析",
    "en-US": "Parking Analysis"
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
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { PolygonSelectLayer, POLYGON_SELECT_STATE_KEY, POLYGON_SELECT_EVENT } from "./layer/PolygonSelectLayer";
import { Activity3DLayer } from "../Activity3D/layer/Activity3DLayer";
import { allParking, getAllActivityType,  } from "@/api/index";
import { guid } from "@/utils/utils";

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

      selectPolygon: false,
      polygonSelectState: POLYGON_SELECT_STATE_KEY.NOT_STARTED,

      loading: false,
    };
  },
  created() {

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
  },
  methods: {
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
      this._Map.addLayer(this._PolygonSelectLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this.handleStopPolygonSelect();
      this.handleShowActivity(false);
      this._Map.removeLayer(this._PolygonSelectLayer);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._Activity3DLayer) this._Activity3DLayer.setTime(time);
    },
    // ******************************* 交通交叉口 -- start
    handleShowParkDetail(path) {
      this.handleStopPolygonSelect();
      console.log(path);

      this.rootVue.handleShowPolgonParkingDetail({
        uuid: guid(),
        polgonParkingDetail: {
          xyarr: path,
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

</style>
