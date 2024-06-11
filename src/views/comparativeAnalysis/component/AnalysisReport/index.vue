<template>
  <el-collapse-item class="BusStopForm" :name="name">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox :value="s_showLayer" @change="handleChangeShowLayer">{{ $l("公交出行影响对比分析报告") }}</el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">语言模型</div>
        <div class="form_value">
          <el-select v-model="lanModel">
            <el-option label="qwen:7b" value="qwen:7b"> </el-option>
          </el-select>
        </div>
      </div>

      <!-- <div class="btn_list">
        <el-button type="primary" size="small" @click="handleGenerateAnalysisReport">分析报告生成</el-button>
      </div> -->
    </div>
  </el-collapse-item>
</template>

<language>
{
  "公交出行影响对比分析报告":{
    "zh-CN": "公交出行影响对比分析报告",
    "en-US": "公交出行影响对比分析报告"
  },
  "语言模型":{
    "zh-CN": "语言模型",
    "en-US": "语言模型"
  },
}
</language>

<script>
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
  },
  data() {
    return {
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
.BusStopForm {
  .el-collapse-item__title {
    padding-left: 10px;
  }
  .form {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 10px 0px 20px;

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;
      & + .form_item {
        margin-top: 10px;
      }
      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }
      .form_value {
        width: 100%;
      }
    }
    .form_tip {
      font-size: 12px;
      color: #555;
      padding-left: 2em;
      & + .form_item {
        margin-top: 10px;
      }
    }
  }
  .icon_button {
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    &.active {
      background-color: rgba($color: #409eff, $alpha: 1);
      color: #ffffff;
    }
    &.disabled {
      cursor: no-drop;
    }
    &.icon_stop {
      .img {
        width: 20px;
        height: 20px;
        display: block;
        object-fit: cover;
        padding: 4px;
      }
    }
  }

  .btn_list {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
