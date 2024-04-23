<template>
  <el-collapse-item class="BusStopToolbar" :name="name">
    <div class="collapse_item_title" slot="title">{{ title }}</div>
    <div class="BusStopToolbar_bodyer">
      <div class="form_item" style="align-items: center">
        <div class="form_label">{{ $l("color") }}</div>
        <el-color-picker size="mini" :predefine="predefineColors" v-model="color" />
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "selectLinkAnalysis":{
    "zh-CN": "Select Link Analysis",
    "en-US": "Select Link Analysis"
  },
  "color":{
    "zh-CN": "Color: ",
    "en-US": "颜色："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { getElapseLinkLeg } from "@/api/index";
import { LinkFlowLayer } from "../layer/LinkFlowLayer";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    lineDetail: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["rootVue"],
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    title() {
      return this.$l("selectLinkAnalysis") + " " + this.lineDetail.id;
    },
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          setTimeout(() => {
            this.rootVue.$emit("setSelectLine", this.lineDetail);
          }, 200);
        } else {
          this.rootVue.$emit("setSelectLine", {});
        }

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
      immediate: true,
    },
    color: {
      handler(val) {
        this._LinkFlowLayer.setColor(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#E9CDAA", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#409eff", "#c71585"],

      loading: true,
      resData: {},
      _LinkFlowLayer: undefined,
      color: "#ff4500",
    };
  },
  created() {
    this._LinkFlowLayer = new LinkFlowLayer({ zIndex: 100, color: this.color });
    this.getDetail();
  },
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
  },
  methods: {
    getDetail() {
      this.loading = true;
      getElapseLinkLeg({ linkId: this.lineDetail.id })
        .then((res) => {
          this._LinkFlowLayer.setData(res.data);
          this.loading = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleEnable() {
      this._Map.addLayer(this._LinkFlowLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._LinkFlowLayer);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .labelClassName {
    width: 150px;
  }
}
.BusStopToolbar {
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  .BusStopToolbar_bodyer {
    box-sizing: border-box;
    width: 100%;
    padding: 0px 10px 0px 20px;

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
  }
}
</style>
