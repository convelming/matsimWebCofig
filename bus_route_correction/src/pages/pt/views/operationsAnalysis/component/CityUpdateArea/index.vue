<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('城市更新区域分析')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon active" v-show="s_showLayer" src="@/assets/image/road_map_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_map_icon.png" />
        <span class="item_title">{{ $l("城市更新区域分析") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <!-- <div class="form_label">{{ $l("width") }}</div> -->
        <div class="form_value">
          <el-button type="primary" block size="mini" @click="handleShowCUAToolbar('研究区域')">{{ $l("研究区域") }}</el-button>
        </div>
      </div>
      <div class="form_item">
        <!-- <div class="form_label">{{ $l("width") }}</div> -->
        <div class="form_value">
          <el-button type="primary" block size="mini" @click="handleShowCUAToolbar('相似片区搜索')">{{ $l("相似片区搜索") }}</el-button>
        </div>
      </div>
      <div class="form_item">
        <!-- <div class="form_label">{{ $l("width") }}</div> -->
        <div class="form_value">
          <el-button type="primary" block size="mini" @click="handleShowCUAToolbar('片区承载力分析')">{{ $l("片区承载力分析") }}</el-button>
        </div>
      </div>
      <div class="form_item">
        <!-- <div class="form_label">{{ $l("width") }}</div> -->
        <div class="form_value">
          <el-button type="primary" block size="mini" @click="handleShowCUAToolbar('地块承载力分析')">{{ $l("地块承载力分析") }}</el-button>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "城市更新区域分析":{
    "zh-CN": "城市更新区域分析",
    "en-US": "城市更新区域分析"
  },
}
</language>

<script>
import { fileToString, guid, stringToFile } from "@/utils/utils";

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
      configKey: "cityUpdateAreaConfig",
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

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
    initByConfig(config) {
      config = config || this.rootVue.defaultConfig.cityUpdateAreaConfig;
      this.s_showLayer = config.showLayer;
      this.$emit("update:showLayer", config.showLayer);
      this.$emit("update:lock2D", config.lock2D);
    },
    async exportConfig() {
      return {
        showLayer: this.s_showLayer,
        lock2D: this.lock2D,
      };
    },
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {},
    handleShowCUAToolbar(name) {
      this.rootVue.handleShowCUAToolbar({ uuid: "", name: name });
    },
  },
};
</script>

<style lang="scss" scoped>
.form_value {
  .el-button {
    display: block;
    width: 100%;
    margin: 0;
  }
}
</style>
