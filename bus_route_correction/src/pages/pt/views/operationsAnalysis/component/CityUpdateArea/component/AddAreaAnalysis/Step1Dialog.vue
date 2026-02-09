<!-- Step1_Dialog -->
<template>
  <Dialog class="Step1_Dialog" ref="dialog" :title="$l('基本情况确认')" hideMinimize :visible="s_visible" @close="handleClose" keepRight right="330" top="100" width="450px">
    <div class="Step1_box" v-loading="loading" element-loading-background="rgb(from var(--color-white) r g b / 0.8)">
      <el-scrollbar wrap-class="scroll_box">
        <div class="scroll_body">
          <template v-for="item in areaParam">
            <el-divider v-if="item.type == 'title'" content-position="left">{{ $l(item.label) }}</el-divider>
            <!-- <div class="title" v-if="item.type == 'title'">{{ $l(item.label) }}</div> -->
            <AreaFromItem v-if="item.type == 'item'" :label="$l(item.label)" v-bind="item" @update:value="item.value = $event" @update:check="item.check = $event" />
          </template>
        </div>
      </el-scrollbar>
      <div class="btn_box">
        <el-button type="info" size="small" @click="handlePrev">{{ $l("取消") }}</el-button>
        <el-button type="primary" size="small" @click="handleNext">{{ $l("下一步") }}</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import AreaFromItem from "../AreaFromItem.vue";
import { parserGeoJSON } from "../../../GeoJSON/layer/GeoJSONLayer2";

import { CUA_downloadGeojson } from "@/api/index";
import { boldToText } from "@/utils/index2";

const dialogList = [
  { type: "item", label: "方案名称", key: "方案名称", disabled: false, slider: false, inputNumber: false, input: true, value: "", avg: 0, check: true },
  { type: "title", label: "总体情况" },
  { type: "item", label: "总开发强度", key: "总开发强度", start: 0, end: -1, step: 0.001, disabled: true, slider: true, inputNumber: true },
  { type: "item", label: "平均容积率", key: "平均容积率", start: 0, end: -1, step: 0.001, disabled: true, slider: true, inputNumber: true },
  { type: "title", label: "出行结构" },
  { type: "item", label: "小汽车占比", key: "小汽车占比", start: 0, end: 1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "轨道交通占比", key: "轨道交通占比", start: 0, end: 1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "公交占比", key: "公交占比", start: 0, end: 1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "慢行占比", key: "慢行占比", start: 0, end: 1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "title", label: "业态开发强度" },
  { type: "item", label: "居住开发强度", key: "居住开发强度", start: 0, end: -1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "办公开发强度", key: "办公开发强度", start: 0, end: -1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "商业开发强度", key: "商业开发强度", start: 0, end: -1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "工业开发强度", key: "工业开发强度", start: 0, end: -1, step: 0.001, slider: true, inputNumber: true, checkBox: true },
  { type: "title", label: "交通设施" },
  { type: "item", label: "地铁站点数", key: "地铁站点数", start: 0, end: -1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "公交站点数", key: "公交站点数", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "主干路及以上长度", key: "主干路及以上长度", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "次干路及以下长度", key: "次干路及以下长度", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "title", label: "特殊地点" },
  { type: "item", label: "体育设施数", key: "体育设施数", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "医疗设施数", key: "医疗设施数", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "教育设施数", key: "教育设施数", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "文化设施数", key: "文化设施数", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
  { type: "item", label: "政府设施数", key: "政府设施数", start: 0, end: -1, step: 1, slider: true, inputNumber: true, checkBox: true },
];

export default {
  name: "Step1_Dialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    resultJsonPath: {
      type: String,
      default: "",
    },
  },
  components: { AreaFromItem },
  computed: {
    s_visible() {
      return this.visible;
    },
  },
  watch: {
    uid: {
      handler(val) {
        this.init();
      },
      immediate: true,
    },
  },
  data() {
    return {
      loading: false,
      areaParam: [],
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleNext() {
      const value = this.areaParam
        .filter((v) => v.type == "item")
        .map((v) => {
          return {
            key: v.key,
            value: v.value,
            avg: v.avg,
            check: v.check,
          };
        });
      this.$emit("next", value);
    },
    handlePrev() {
      this.$emit("prev");
    },
    init() {
      if (this.resultJsonPath) {
        this.loading = true;
        // 获取相似区域列表
        CUA_downloadGeojson({
          path: this.resultJsonPath,
        })
          .then((res) => boldToText(res.data))
          .then((res) => parserGeoJSON(res))
          .then((res) => {
            const areaParam = JSON.parse(JSON.stringify(dialogList));
            areaParam.forEach((item) => {
              const prop = res.propertiesLabels[item.key];
              if (prop && item.type == "item") {
                const list = prop.values.slice(1);
                item.min = Number(Math.min(...list).toFixed(4));
                item.max = Number(Math.max(...list).toFixed(4));
                item.value = Number(Number(list.reduce((a, b) => a + b, 0) / list.length).toFixed(4));
                item.avg = item.value;
                if (item.end == -1) {
                  item.end = Math.ceil(item.max * 1.5);
                }
                item.check = false;
              }
            });
            this.areaParam = areaParam;
          })
          .finally((err) => {
            this.loading = false;
          });
      } else {
        this.areaParam = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.Step1_Dialog {
  height: calc(100vh - 130px);

  .Step1_box {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .el-scrollbar {
      flex: 1;
      height: 0;
    }
    ::v-deep .scroll_box {
      overflow-x: hidden;
      overflow-y: auto;
    }

    .scroll_body {
      display: flex;
      flex-direction: column;
      gap: 20px;
      .title {
        font-size: 18px;
        font-weight: 500;
      }
      .item {
        padding: 0 10px;
      }
    }

    .btn_box {
      display: flex;
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
