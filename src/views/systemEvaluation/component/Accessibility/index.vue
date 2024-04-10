<template>
  <el-collapse-item class="Accessibility" :name="name">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox :value="s_showLayer" @change="handleChangeShowLayer">{{ $l("公交可达性分析") }}</el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("数据类型：") }}</div>
        <div class="form_value">
          <el-radio-group v-model="binningType">
            <el-radio label="ptal">{{ $l("PTAL") }}</el-radio>
            <el-radio label="demand">{{ $l("需求端") }}</el-radio>
            <el-radio label="supply">{{ $l("供给端") }}</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <div>{{ $l("网格边长(x100m)：") }}</div>
        </div>
        <div class="form_value">
          <el-slider style="padding: 0 20px" :disabled="!s_showLayer" v-model="binningSize" :min="1" :max="20" :step="1" step-strictly />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">
          <div>{{ $l("网格颜色：") }}</div>
        </div>
        <div class="form_value">
          <ColorSelect v-model="binningColors" :colorsList="colorsList" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "网格颜色：": {
    "zh-CN": "网格颜色：",
    "en-US": "网格颜色："
  }
}
</language>

<script>
import { ColorList } from "@/components/ColorSelect.vue";
import { BinningLayer } from "./layer/BinningLayer";
// import hpPTAL from "@/assets/data/hpPTAL.json";
const hpPTAL = {}
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
    binningSize: {
      handler(val) {
        if (this._sizeTimeout) return;
        this._sizeTimeout = setTimeout(() => {
          this._BinningLayer.setSegm(this.binningSize);
          this._sizeTimeout = null;
        }, 200);
      },
    },
    binningType: {
      handler(val) {
        if (val == "ptal") {
          this._BinningLayer.setValueFunc((value) => value.properties.AI_all);
        } else if (val == "demand") {
          this._BinningLayer.setValueFunc((value) => value.properties.AI_Bus);
        } else if (val == "supply") {
          this._BinningLayer.setValueFunc(
            (value) => value.properties.AI_Subway
          );
        }
      },
    },
    binningColors: {
      handler(val) {
        if (this._colorsTimeout) return;
        this._colorsTimeout = setTimeout(() => {
          this._BinningLayer.setColors(this.colorsList[this.binningColors]);
          this._colorsTimeout = null;
        }, 200);
      },
    },
  },
  data() {
    return {
      s_showLayer: true,

      binningType: "ptal",
      binningSize: 1,
      binningColors: 0,

      _BinningLayer: null,

      colorsList: ColorList,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;

    this._BinningLayer = new BinningLayer({
      zIndex: 20,
      segm: this.binningSize,
      valueFunc: (value) => value.properties.AI_all,
    });
    this._BinningLayer.setData(hpPTAL);
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
    // 组件初始化事件
    handleEnable() {
      this._Map.addLayer(this._BinningLayer);
    },
    // 组件卸载事件
    handleDisable() {
      this._Map.removeLayer(this._BinningLayer);
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
.Accessibility {
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
      &.column {
        flex-direction: column;
      }
      & + .form_item {
        margin-top: 10px;
      }
      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }
      .form_value {
        box-sizing: border-box;
        width: 100%;
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
  }
}
</style>
