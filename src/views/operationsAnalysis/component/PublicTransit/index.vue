<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox class="checkbox flex-align-center" :value="s_showLayer" @change="handleChangeShowLayer">
        <div class="flex-align-center">
          <img class="item_icon" v-show="s_showLayer" src="@/assets/image/PublicTransit_icon_a.png" />
          <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/PublicTransit_icon.png" />
          <span>{{ $l("公共交通") }}</span>
          <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
        </div>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("图标大小：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="stopScale" :min="1" :max="20"></el-slider>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("图标颜色：") }}</div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" :title="$l('公交站点颜色')" size="mini" :predefine="predefineColors" v-model="stopColor" />
        </div>
      </div>
      <!-- <div class="form_item" style="align-items: center; justify-content: flex-end"> -->
      <!-- <el-switch :disabled="!s_showLayer" style="width: 100%" v-model="showStopName" :active-text="$l('显示站点名称')"></el-switch> -->
      <!-- <el-color-picker :disabled="!s_showLayer" :title="$l('公交站点颜色')" size="mini" :predefine="predefineColors" v-model="stopColor" /> -->
      <!-- <div aria-disabled="" :title="$l('公交线路查询')" :class="{ active: sreachLine, disabled: !s_showLayer }" class="icon_button icon_stop" @click="s_showLayer && handleSreachStop(!sreachLine)">
          <img class="img" src="@/assets/image/地图 (2).svg" alt="" />
        </div> -->
      <!-- <div :title="$l('公交站点选取')" :class="{ active: selectStop, disabled: !s_showLayer }" class="icon_button el-icon-aim" @click="s_showLayer && handleSelectStop(!selectStop)"></div> -->
      <!-- </div> -->
    </div>
  </el-collapse-item>
</template>

<language>
{
  "公共交通":{
    "zh-CN": "公共交通",
    "en-US": "public transport"
  },
  "图标大小：":{
    "zh-CN": "图标大小：",
    "en-US": "icons size："
  },
  "图标颜色：":{
    "zh-CN": "图标颜色：",
    "en-US": "icon color："
  },
  "显示站点名称":{
    "zh-CN": "显示站点名称",
    "en-US": "Show site name"
  },
  "公交站点颜色":{
    "zh-CN": "公交站点颜色",
    "en-US": "Bus Stop Colors"
  },
  "公交线路查询":{
    "zh-CN": "公交线路查询",
    "en-US": "Bus Route Search"
  },
  "公交站点选取":{
    "zh-CN": "公交站点选取",
    "en-US": "Bus Stop Selection"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { STOPS_STATE_KEY, STOPS_EVENT, StopsLayer } from "./layer/StopsLayer2";
import { LINK_EVENT, LINK_STATE_KEY, LinkLayer } from "./layer/LinkLayer";

export default {
  props: ["name", "showLayer"],
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
    showStopName: {
      handler(val) {
        if (this._StopsLayer) {
          if (val) this._StopsLayer.showName();
          else this._StopsLayer.hideName();
        }
      },
    },
    stopColor: {
      handler(val) {
        this._StopsLayer.setColor(val);
      },
    },
    stopScale: {
      handler(val) {
        this._StopsLayer.setSize(undefined, val);
      },
    },
  },
  data() {
    return {
      icon_sreach: require("@/assets/image/地图 (2).svg"),

      s_showLayer: false,

      showStopName: false,
      stopColor: "#2656C6",
      stopScale: 3,

      sreachLine: false,
      frameSelectState: undefined,
      frameSelectXYarr: undefined,
      linkState: undefined,
      linkStartPoint: undefined,
      linkEndPoint: undefined,

      selectStop: false,
      selectBusStopList: [],

      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],

      _StopsLayer: undefined,
      _LinkLayer: undefined,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._StopsLayer = new StopsLayer({
      zIndex: 10,
      showName: this.showStopName,
      color: this.stopColor,
      scale: this.stopScale,
      event: {
        [MAP_EVENT.LAYER_LOADING]: ({ data }) => {
          this.loading = data;
        },
      },
    });
    this._LinkLayer = new LinkLayer({
      zIndex: 20,
    });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_showLayer) this.handleEnable();
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
    this._StopsLayer.dispose();
    this._LinkLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    handleEnable() {
      this.handleSelectStop(true);
      this._Map.addLayer(this._StopsLayer);
      this._Map.addLayer(this._LinkLayer);
      this._StopsLayer.update();
    },
    handleDisable() {
      this.handleSelectStop(false);
      this.handleSreachStop(false);
      this._Map.removeLayer(this._StopsLayer);
      this._Map.removeLayer(this._LinkLayer);
    },
    handleSreachStop(value) {
      this.sreachLine = value;
      if (value) {
        this.handleSelectStop(false);
        this._LinkLayer.addEventListener(LINK_EVENT.STATE_CHANGE, (res) => {
          const { startPoint, endPoint, state } = res.data;
          this.linkState = state;
          if (this.linkState === LINK_STATE_KEY.ENDED) {
            this.linkStartPoint = startPoint;
            this.linkEndPoint = endPoint;
          } else {
            this.linkStartPoint = null;
            this.linkEndPoint = null;
          }
        });

        this._LinkLayer.show();

        this._LinkLayer.reset();
        this._LinkLayer.play();
        this.linkState = this._LinkLayer.state;
      } else {
        this._LinkLayer.hide();
        this._LinkLayer.reset();
        this._LinkLayer.stop();
        this.linkState = this._LinkLayer.state;
      }
    },
    handleSelectStop(value) {
      this.selectStop = value;
      if (value) {
        this.handleSreachStop(false);
        this._StopsLayerEventId = this._StopsLayer.addEventListener(STOPS_EVENT.SELECT_STOP_CHANGE, (res) => {
          this.selectBusStopList = res.data;
          this.rootVue.handleShowStopAndRoute(res.data);
        });
        this._StopsLayer.state = STOPS_STATE_KEY.CAN_SELECT;
      } else {
        this._StopsLayer.removeEventListener(STOPS_EVENT.SELECT_STOP_CHANGE, this._StopsLayerEventId);

        this._StopsLayer.state = STOPS_STATE_KEY.DISABLE;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.my_collapse_item {
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
