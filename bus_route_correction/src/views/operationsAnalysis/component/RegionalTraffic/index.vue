<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('RegionalTraffic')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon active" v-show="s_showLayer" src="@/assets/image/road_network_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_network_icon.png" />
        <span class="item_title">{{ $l("RegionalTraffic") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form"></div>
  </el-collapse-item>
</template>

<language>
{
  "RegionalTraffic":{
    "zh-CN": "区域流量溯源",
    "en-US": "Regional Traffic"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { COLOR_LIST } from "@/utils/utils";

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
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

      colors: 0,
      width: 1,
      offset: 0,
      color: "#E9CDAA",
      showNode: false,
      canSelect: false,

      colorsList: COLOR_LIST,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
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
  },
  methods: {
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {},
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep {
  .el-slider__marks-text {
    white-space: nowrap;
  }
  .checkbox{
    .el-checkbox__input{
      display: none;
    }
    .el-checkbox__label{
      padding-left: 35px;
    }
  }
}

.my_collapse_item {
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
