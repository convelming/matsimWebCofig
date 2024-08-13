<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('活动')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/Activity3D_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/Activity3D_icon.png" />
        <span class="item_title">{{ $l("活动") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
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
    </div>
  </el-collapse-item>
</template>

<language>
{
  "活动":{
    "zh-CN": "活动",
    "en-US": "Activities"
  },
  "最多显示人数：":{
    "zh-CN": "最多显示人数：",
    "en-US": "Max Number："
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
    "en-US": "Act type"
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
import { Activity3DLayer } from "./layer/Activity3DLayer";
import { getAllActivity, getAllActivityType } from "@/api/index";

const CHANGE_COLOR_EVENT_KEY = "Activity3D_changeColor";

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
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,
      color: "#5470c6",
      scale: 1,
      maxNum: 10000,

      _Activity3DLayer: null,

      showColorTypeTable: false,
      colorType: "activity",
      activityTypeList: [],
      legTypeList: [],

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._Activity3DLayer = new Activity3DLayer({
      zIndex: 20,
      colors: this.activityTypeList,
      scale: this.scale,
      maxNum: this.maxNum,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          const _data = JSON.parse(JSON.stringify(data));

          _data.legColors = JSON.parse(JSON.stringify(this.legTypeList));
          _data.activityColors = JSON.parse(JSON.stringify(this.activityTypeList));
          _data.changeColorEventKey = CHANGE_COLOR_EVENT_KEY;
          this.rootVue.handleShowActivityDetail({
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
        const res = await getAllActivity(1000000);
        this._Activity3DLayer.setData(res.data);
        this._ActivityLoaded = true;
      } catch (error) {}
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this.getData();
      this._Map.addLayer(this._Activity3DLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._Activity3DLayer);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    handleTimeChange(time) {
      if (this._Activity3DLayer) this._Activity3DLayer.setTime(time);
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
  .color_item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & + .color_item {
      margin-top: 10px;
    }
  }
}

.color-picker {
  background: rgba(0, 0, 0, 0.05);
  padding: 0 8px;
  border-radius: 6px;
  width: 120px;
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
