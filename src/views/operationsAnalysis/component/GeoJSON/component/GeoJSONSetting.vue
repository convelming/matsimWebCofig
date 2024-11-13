<template>
  <Dialog class="GeoJSONSetting" :title="'GeoJSONSetting'" :visible="s_visible" @close="handleClose" left="center" width="450px">
    <div class="GeoJSONSetting_body">
      <el-form :model="s_form" ref="form" label-width="120px" :inline="false" size="small" label-position="left">
        <template v-for="(lItem, lIndex) in layout">
          <el-form-item v-if="lItem.type === 'number'" :label="lItem.label">
            <el-input-number v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'color'" :label="lItem.label">
            <el-color-picker v-model="s_form[lItem.name]" v-bind="Object.assign({}, { predefine: predefine }, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'select'" :label="lItem.label">
            <el-select v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)">
              <el-option v-for="(v, k) in lItem.options" :key="v.value" :label="v.label" :value="v.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lItem.type === 'lineStyle'" :label="lItem.label">
            <el-select v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)">
              <el-option v-for="(v, k) in LINE_STYLE" :key="v" :label="k" :value="v"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lItem.type === 'icon'" :label="lItem.label">
            <IconSelect v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <template v-if="lItem.type == 'colorBar'">
            <div style="border: 1px solid #c8c8c8; padding: 18px 18px 0 18px; border-radius: 10px">
              <div style="margin-bottom: 18px">{{ lItem.label }}</div>
              <el-form-item label="Value key">
                <el-select v-model="s_form[lItem.name].valueKey" v-bind="Object.assign({}, {}, lItem.attrs)" @change="handleColorBarValueKeyChange(lItem, lIndex, $event)">
                  <el-option v-for="(v, k) in lItem.options" :key="k" :label="v.name" :value="k"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Value type">
                <el-select v-model="s_form[lItem.name].valueType" v-bind="Object.assign({}, {}, lItem.attrs)">
                  <el-option label="String" value="String"></el-option>
                  <el-option label="Number" value="Number"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Color ramp">
                <div style="display: flex">
                  <el-color-picker v-model="s_form[lItem.name].startColor" :predefine="predefine" />
                  <el-color-picker v-model="s_form[lItem.name].endColor" :predefine="predefine" />
                </div>
              </el-form-item>
              <el-form-item label-width="0">
                <el-table class="small" :data="s_form[lItem.name].data" border stripe>
                  <el-table-column label="symbol" prop="symbol"> </el-table-column>
                  <el-table-column label="Values" prop="values"> </el-table-column>
                  <el-table-column label="Legend" prop="legend"> </el-table-column>
                </el-table>
              </el-form-item>
            </div>
          </template>
        </template>
        <el-form-item>
          <el-button type="primary" @click="handleConfirm">{{ $l("确定") }}</el-button>
          <el-button @click="handleClose">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<script>
import { ICON_LIST, COLOR_LIST } from "@/utils/utils";
import { GeoJSONLayer, LINE_STYLE } from "../layer/GeoJSONLayer";
import { number } from "echarts";
export default {
  name: "GeoJSONSetting",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => ({}),
    },
    layout: {
      type: Array,
      default: () => [
        {
          label: "点大小",
          name: "size",
          type: "number",
          attrs: {
            min: 0,
            max: 100,
          },
        },
        {
          label: "填充颜色",
          name: "fillColor",
          type: "color",
          attrs: {},
        },
        {
          label: "Map",
          name: "colorBar",
          type: "colorBar",
          options: {
            面积__Number: {
              type: "Number",
              name: "面积",
              min: 7138860.418130001,
              max: 8570974.8253,
            },
            街镇__String: {
              type: "String",
              name: "街镇",
              map: {},
              min: 0,
              max: 1,
            },
            公共_1__Number: {
              type: "Number",
              name: "公共_1",
              min: 8,
              max: 33,
            },
            公共_12__Number: {
              type: "Number",
              name: "公共_12",
              min: 519,
              max: 5180,
            },
            专用_1__Number: {
              type: "Number",
              name: "专用_1",
              min: 44,
              max: 82,
            },
            专用_12__Number: {
              type: "Number",
              name: "专用_12",
              min: 6586,
              max: 8797,
            },
            临时_1__Number: {
              type: "Number",
              name: "临时_1",
              min: 3,
              max: 15,
            },
            临时_12__Number: {
              type: "Number",
              name: "临时_12",
              min: 248,
              max: 397,
            },
            路边泊__Number: {
              type: "Number",
              name: "路边泊",
              min: 2,
              max: 16,
            },
            路边_1__Number: {
              type: "Number",
              name: "路边_1",
              min: 106,
              max: 514,
            },
            合计停__Number: {
              type: "Number",
              name: "合计停",
              min: 82,
              max: 121,
            },
            合计泊__Number: {
              type: "Number",
              name: "合计泊",
              min: 8016,
              max: 14331,
            },
            违停率__Number: {
              type: "Number",
              name: "违停率",
              min: 5.07,
              max: 19.19,
            },
            联网率__Number: {
              type: "Number",
              name: "联网率",
              min: 18.18,
              max: 47.83,
            },
            供需比__Number: {
              type: "Number",
              name: "供需比",
              min: 0.77,
              max: 0.92,
            },
            路内停__Number: {
              type: "Number",
              name: "路内停",
              min: 0.00739655293,
              max: 0.06412175649,
            },
          },
          attrs: {},
        },
      ],
    },
  },
  components: {},
  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val !== this.s_visible) {
          this.s_visible = val;
        }
        if (val) {
          const s_form = {};
          for (const lItem of this.layout) {
            s_form[lItem.name] = {
              number: 0,
              color: "#EE6666",
              select: "",
              icon: ICON_LIST[0],
              lineStyle: LINE_STYLE.SOLID,
              colorBar: {
                valueKey: "",
                valueType: "Number",
                startColor: "#FEE0D2",
                endColor: "#99000D",
                data: [],
              },
            }[lItem.type];
          }
          this.s_form = Object.assign({}, s_form, this.form);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      LINE_STYLE: LINE_STYLE,
      predefine: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_visible: false,
      s_form: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.s_visible = false;
      this.$emit("update:visible", this.s_visible);
    },
    handleConfirm() {
      this.$emit("confirm", this.s_form);
    },
    handleColorBarValueKeyChange(lItem, lIndex, val) {
      this.s_form[lItem.name].valueType = this.layout[lIndex].options[val].type;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-form-item__content {
    text-align: right;
  }
  .el-input-number,
  .el-input,
  .el-select,
  .el-color-picker,
  .el-color-picker__trigger {
    width: 100% !important;
  }
}
.GeoJSONSetting {
}
</style>
