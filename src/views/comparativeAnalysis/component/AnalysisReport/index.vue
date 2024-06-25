<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('公交出行影响对比分析报告')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/AnalysisReport_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/AnalysisReport_icon.png" />
        <span class="item_title">{{ $l("公交出行影响对比分析报告") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("语言模型") }}</div>
        <div class="form_value">
          <el-select :disabled="!s_showLayer" v-model="lanModel">
            <el-option label="qwen:7b" value="qwen:7b"> </el-option>
          </el-select>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "公交出行影响对比分析报告":{
    "zh-CN": "公交出行影响对比分析报告",
    "en-US": "Transit Travel Impact Comparison Analysis Report"
  },
  "语言模型":{
    "zh-CN": "语言模型",
    "en-US": "language model"
  },
}
</language>

<script>
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
      loading: false,
      loaded: false,
      s_showLayer: true,
      lanModel: "qwen:7b",
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
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    loadData() {},
    // 组件初始化事件
    handleEnable() {
      if (!this.loaded) {
        this.loadData();
      }
    },
    // 组件卸载事件
    handleDisable() {},
    handleGenerateAnalysisReport() {
      this.rootVue.$emit("generateAnalysisReport");
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
}

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
