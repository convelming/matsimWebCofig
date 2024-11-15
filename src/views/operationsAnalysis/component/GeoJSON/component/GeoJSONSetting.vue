<template>
  <Dialog class="GeoJSONSetting" :title="'GeoJSONSetting'" :visible="s_visible" @close="handleClose" left="center" width="600px">
    <div class="GeoJSONSetting_body">
      <el-form :model="s_form" ref="form" label-width="120px" :inline="false" size="small" label-position="left">
        <template v-for="(lItem, lIndex) in layout">
          <el-form-item v-if="lItem.type === 'number'" :label="lItem.label">
            <el-input-number class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'color'" :label="lItem.label">
            <el-color-picker class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, { predefine: predefine }, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'select'" :label="lItem.label">
            <el-select class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)">
              <el-option v-for="(v, k) in lItem.options" :key="v.value" :label="v.label" :value="v.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lItem.type === 'lineStyle'" :label="lItem.label">
            <el-select class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)">
              <el-option v-for="(v, k) in LINE_STYLE" :key="v" :label="k" :value="v"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lItem.type === 'icon'" :label="lItem.label">
            <IconSelect class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <template v-if="lItem.type == 'colorBar'">
            <el-divider content-position="left">{{ lItem.label }}</el-divider>
            <el-form-item label="Value key">
              <el-select class="w100" v-model="s_form[lItem.name].valueKey" @change="handleColorBarValueKeyChange(lItem, $event)">
                <el-option v-for="(v, k) in lItem.options" :key="k" :label="v.name" :value="k"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Color ramp">
              <div style="display: flex">
                <el-color-picker class="w100" v-model="s_form[lItem.name].startColor" :predefine="predefine" />
                <el-color-picker class="w100" v-model="s_form[lItem.name].endColor" :predefine="predefine" />
              </div>
            </el-form-item>
            <template v-if="s_form[lItem.name].valueType == 'Number'">
              <el-form-item label="Model">
                <div style="display: flex">
                  <el-select class="w100" v-model="s_form[lItem.name].model" @change="">
                    <el-option label="Equal Count" value="count" />
                    <el-option label="Equal Interval" value="interval" />
                  </el-select>
                  <el-input-number v-model="s_form[lItem.name].modelClass" :min="1" :step="1" step-strictly controls-position="right" />
                  <el-button type="primary" @click="handleAutogenerate(lItem)">自动生成</el-button>
                </div>
              </el-form-item>
              <el-form-item label-width="0">
                <el-table class="small" :data="s_form[lItem.name].data" border stripe>
                  <el-table-column label="Symbol" prop="symbol" width="80px">
                    <div slot-scope="{ row }" style="display: flex; align-items: center">
                      <el-checkbox v-model="row.show" style="padding-right: 10px" />
                      <el-color-picker v-model="row.color" size="mini" :predefine="predefine" @change="handleChangeImage(lItem, row, $event)" />
                    </div>
                  </el-table-column>
                  <el-table-column label="Min" prop="min">
                    <template slot-scope="{ row }">
                      <el-input-number v-model="row.min" size="mini" :step="1" controls-position="right" @change="handleChangeImage(lItem, row, $event)" />
                    </template>
                  </el-table-column>
                  <el-table-column label="Max" prop="max">
                    <template slot-scope="{ row }">
                      <el-input-number v-model="row.max" size="mini" :step="1" controls-position="right" @change="handleChangeImage(lItem, row, $event)" />
                    </template>
                  </el-table-column>
                  <el-table-column label="Label" prop="label">
                    <template slot-scope="{ row }">
                      <el-input v-model="row.label" size="mini" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </template>
            <template v-if="s_form[lItem.name].valueType == 'String'">
              <el-form-item label="Model">
                <el-button type="primary" @click="handleAutogenerate(lItem)">自动生成</el-button>
              </el-form-item>
              <el-form-item label-width="0">
                <el-table class="small" :data="s_form[lItem.name].data" border stripe>
                  <el-table-column label="Symbol" prop="symbol" width="80px">
                    <div slot-scope="{ row }" style="display: flex; align-items: center">
                      <el-checkbox v-model="row.show" style="padding-right: 10px" />
                      <el-color-picker v-model="row.color" size="mini" :predefine="predefine" />
                    </div>
                  </el-table-column>
                  <el-table-column label="Type" prop="min">
                    <template slot-scope="{ row }">
                      <el-select v-model="row.min" @change="row.max = $event">
                        <el-option v-for="(mi, mk) in lItem.options[s_form[lItem.name].valueKey].map" :key="mi" :label="mk" :value="mi" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="Label" prop="label">
                    <template slot-scope="{ row }">
                      <el-input v-model="row.label" size="mini" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </template>
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
import * as THREE from "three";
import { ICON_LIST } from "@/utils/utils";
import { LINE_STYLE } from "../layer/GeoJSONLayer";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.v2";
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
            id__Number: {
              type: "Number",
              name: "id",
              min: 100758,
              max: 1007582,
              values: [0, 1007577, 1007576, 1007575, 1007574, 1007573, 1007572, 1007582, 1007581, 1007580, 100758, 1007579, 1007578, 1007578],
            },
            srid__Number: {
              type: "Number",
              name: "srid",
              min: 3857,
              max: 3857,
              values: [0, 3857, 3857, 3857, 3857, 3857, 3857, 3857, 3857, 3857, 3857, 3857, 3857, 3857],
            },
            from_node__Number: {
              type: "Number",
              name: "from_node",
              min: 5073324615,
              max: 10731151137,
              values: [0, 6642321256, 6015128180, 6015128181, 7669228366, 6015128182, 5073324615, 5734868113, 5734868112, 5734868112, 10731151137, 9520940349, 6015128179, 6015128179],
            },
            to_node__Number: {
              type: "Number",
              name: "to_node",
              min: 2090820228,
              max: 10731151138,
              values: [0, 6015128179, 6642321256, 6015128180, 6015128181, 7669228366, 6015128182, 5734868112, 5734868113, 9520940349, 10731151138, 5734868112, 2090820228, 2090820228],
            },
            length__Number: {
              type: "Number",
              name: "length",
              min: 23.881369429688938,
              max: 209.63560476865078,
              values: [
                0, 52.280559475329724, 64.6082947294028, 119.91990487575727, 23.881369429688938, 29.106009012720406, 115.08553234233977, 89.04294798091108, 89.04294798091108, 34.635776072489385, 29.138823349782804, 34.635776072489385, 209.63560476865078,
                209.63560476865078,
              ],
            },
            freespeed__Number: {
              type: "Number",
              name: "freespeed",
              min: 4.166666666666667,
              max: 8.333333333333334,
              values: [
                0, 8.333333333333334, 8.333333333333334, 8.333333333333334, 8.333333333333334, 8.333333333333334, 8.333333333333334, 4.166666666666667, 4.166666666666667, 4.166666666666667, 6.944444444444445, 4.166666666666667, 8.333333333333334,
                8.333333333333334,
              ],
            },
            capacity__Number: {
              type: "Number",
              name: "capacity",
              min: 600,
              max: 2000,
              values: [0, 2000, 2000, 2000, 2000, 2000, 2000, 600, 600, 600, 600, 600, 2000, 2000],
            },
            origid__Number: {
              type: "Number",
              name: "origid",
              min: 604372364,
              max: 1153855502,
              values: [0, 638189455, 638189455, 638189455, 638189455, 638189455, 638189455, 604372364, 604372364, 604372364, 1153855502, 604372364, 638189455, 638189455],
            },
            type__String: {
              type: "String",
              name: "type",
              map: {
                secondary: 0,
                residential: 1,
                tertiary: 2,
              },
              min: 0,
              max: 2,
              values: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1, 0, 0],
            },
            name__Number: {
              type: "Number",
              name: "name",
              min: 0,
              max: 0,
              values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
            lane__Number: {
              type: "Number",
              name: "lane",
              min: 1,
              max: 2,
              values: [0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2],
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
                valueType: "",
                startColor: "#FEE0D2",
                endColor: "#99000D",
                model: "count", // count interval
                modelClass: 5,
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
    handleColorBarValueKeyChange(lItem, val) {
      const item = this.s_form[lItem.name];
      this.$set(item, "valueType", lItem.options[val].type);
      this.handleAutogenerate(lItem);
    },
    handleAutogenerate(lItem) {
      const item = this.s_form[lItem.name];
      const data = lItem.options[item.valueKey];

      const startColor = new THREE.Color(item.startColor);
      const endColor = new THREE.Color(item.endColor);
      const list = [];

      if (data.type == "Number" && item.model == "count") {
        const modelClass = item.modelClass;
        const min = data.min;
        const max = data.max;
        const step = (max - min) / modelClass;
        for (let i = 0; i < modelClass; i++) {
          const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
          list.push({
            min: min + step * i,
            max: min + step * (i + 1),
            color: "#" + color.getHexString(),
            label: `${min + step * i} ~ ${min + step * (i + 1)}`,
          });
        }
      } else if (data.type == "Number" && item.model == "interval") {
        const modelClass = item.modelClass;
        const values = Array.from(data.values || []);
        values.shift();
        values.sort((a, b) => a - b);
        const step = values.length / modelClass;
        for (let i = 0; i < modelClass; i++) {
          let s = Math.floor(i * step);
          let e = Math.floor((i + 1) * step) - 1;
          if (e < s) e = s;
          const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
          list.push({
            min: values[s],
            max: values[e],
            color: "#" + color.getHexString(),
            label: `${values[s]} ~ ${values[e]}`,
          });
        }
      } else if (data.type == "String") {
        const mapList = Object.entries(data.map);
        for (let i = 0, l = mapList.length; i < l; i++) {
          const [mk, mi] = mapList[i];
          const color = new THREE.Color().lerpColors(startColor, endColor, i / l);
          list.push({
            min: mi,
            max: mi,
            color: "#" + color.getHexString(),
            label: mk,
          });
        }
      }
      this.$set(item, "data", list);
      this.handleChangeImage(lItem);
    },
    handleChangeImage(lItem) {
      return;
      const item = this.s_form[lItem.name];
      const image = new ColorBar2D(item.data).getImage();
      this.$set(item, "image", image);
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
  .GeoJSONSetting_body {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 80vh;
  }
}
</style>
