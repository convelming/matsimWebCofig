<template>
  <Dialog class="GeoJSONSetting" ref="dialog" :title="title" :visible="s_visible" @close="handleClose" left="center" width="700px">
    <div class="GeoJSONSetting_body">
      <el-form :model="s_form" ref="form" label-width="120px" :inline="false" size="small" label-position="left">
        <template v-for="(lItem, lIndex) in layout">
          <el-form-item v-if="lItem.type === 'number'" :label="lItem[$l('label')]">
            <el-input-number class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'slider'" :label="lItem[$l('label')]">
            <el-slider class="w100 px-1em" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'switch'" :label="lItem[$l('label')]">
            <el-switch v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'color'" :label="lItem[$l('label')]">
            <el-color-picker class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, { predefine: predefine }, lItem.attrs)" />
          </el-form-item>
          <el-form-item v-if="lItem.type === 'select'" :label="lItem[$l('label')]">
            <el-select class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)">
              <el-option v-for="(v, k) in lItem.options" :key="v.value" :label="v.label" :value="v.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lItem.type === 'lineStyle'" :label="lItem[$l('label')]">
            <el-select class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)">
              <el-option v-for="(v, k) in LINE_STYLE" :key="v" :label="k" :value="v"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lItem.type === 'icon'" :label="lItem[$l('label')]">
            <IconSelect class="w100" v-model="s_form[lItem.name]" v-bind="Object.assign({}, {}, lItem.attrs)" />
          </el-form-item>
          <template v-if="lItem.type == 'colorBar'">
            <el-divider content-position="left">{{ lItem[$l("label")] }}</el-divider>
            <el-form-item :label="$l('值')" v-if="!(lItem.attrs && lItem.attrs.hideValueKey)">
              <el-select class="w100" v-model="s_form[lItem.name].valueKey" @change="handleColorBarValueKeyChange(lItem, $event)">
                <el-option v-for="(v, k) in lItem.options" :key="k" :label="`${v.name}(${v.type})`" :value="k"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$l('色道')" v-if="!(lItem.attrs && lItem.attrs.hideColorRamp)">
              <div style="display: flex">
                <el-color-picker class="w100" v-model="s_form[lItem.name].startColor" :predefine="predefine" />
                <el-color-picker class="w100" v-model="s_form[lItem.name].endColor" :predefine="predefine" />
              </div>
            </el-form-item>
            <template v-if="s_form[lItem.name].valueType == 'Number'">
              <el-form-item :label="$l('模式')" v-if="!(lItem.attrs && lItem.attrs.hideModel)">
                <div style="display: flex">
                  <el-select class="w100" v-model="s_form[lItem.name].model" @change="">
                    <el-option label="Equal Count" value="count" />
                    <el-option label="Equal Interval" value="interval" />
                  </el-select>
                  <el-input-number v-model="s_form[lItem.name].modelClass" :min="1" :step="1" step-strictly controls-position="right" />
                  <el-button type="primary" @click="handleAutogenerate(lItem)">{{ $l("自动生成") }}</el-button>
                </div>
              </el-form-item>
              <el-form-item label-width="0">
                <el-table class="small" :data="s_form[lItem.name].data" border stripe>
                  <el-table-column :label="$l('颜色')" width="80px">
                    <div slot-scope="{ row }" style="display: flex; align-items: center">
                      <el-checkbox v-model="row.use" style="padding-right: 10px" />
                      <el-color-picker v-model="row.color" size="mini" :predefine="predefine" @change="handleChangeImage(lItem, row, $event)" />
                    </div>
                  </el-table-column>
                  <el-table-column :label="$l('最小值')">
                    <template slot-scope="{ row }">
                      <el-input-number v-model="row.min" size="mini" :step="1" controls-position="right" @change="handleChangeImage(lItem, row, $event)" />
                    </template>
                  </el-table-column>
                  <el-table-column :label="$l('最大值')">
                    <template slot-scope="{ row }">
                      <el-input-number v-model="row.max" size="mini" :step="1" controls-position="right" @change="handleChangeImage(lItem, row, $event)" />
                    </template>
                  </el-table-column>
                  <el-table-column :label="$l('标签')">
                    <template slot-scope="{ row }">
                      <el-input v-model="row.label" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column width="65" align="center" v-if="!(lItem.attrs && lItem.attrs.hideDelete)">
                    <template slot-scope="{ row, $index }">
                      <el-button type="danger" size="mini" @click="handleDeleteColorBarItem(lItem, $index)" icon="el-icon-delete"></el-button>
                    </template>
                  </el-table-column>
                  <el-button slot="append" v-if="!(lItem.attrs && lItem.attrs.hideAdd)" style="width: 100%; display: block" type="primary" size="mini" icon="el-icon-plus" @click="handleAddColorBarItem(lItem)"></el-button>
                </el-table>
              </el-form-item>
            </template>
            <template v-if="s_form[lItem.name].valueType == 'String'">
              <el-form-item :label="$l('模式')" v-if="!(lItem.attrs && lItem.attrs.hideModel)">
                <el-button type="primary" @click="handleAutogenerate(lItem)">{{ $l("自动生成") }}</el-button>
              </el-form-item>
              <el-form-item label-width="0">
                <el-table class="small" :data="s_form[lItem.name].data" border stripe>
                  <el-table-column :label="$l('颜色')" prop="symbol" width="80px">
                    <div slot-scope="{ row }" style="display: flex; align-items: center">
                      <el-checkbox v-model="row.use" style="padding-right: 10px" />
                      <el-color-picker v-model="row.color" size="mini" :predefine="predefine" />
                    </div>
                  </el-table-column>
                  <el-table-column :label="$l('类型')" prop="min">
                    <template slot-scope="{ row }">
                      <el-select v-model="row.min" @change="row.max = $event" size="mini">
                        <el-option v-for="(mi, mk) in lItem.options[s_form[lItem.name].valueKey].map" :key="mi - 0.5" :label="mk" :value="mi - 0.5" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$l('标签')" prop="label">
                    <template slot-scope="{ row }">
                      <el-input v-model="row.label" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column width="65" align="center" v-if="!(lItem.attrs && lItem.attrs.hideDelete)">
                    <template slot-scope="{ row, $index }">
                      <el-button type="danger" size="mini" @click="handleDeleteColorBarItem(lItem, $index)" icon="el-icon-delete"></el-button>
                    </template>
                  </el-table-column>
                  <el-button slot="append" v-if="!(lItem.attrs && lItem.attrs.hideAdd)" style="width: 100%; display: block" type="primary" size="mini" icon="el-icon-plus" @click="handleAddColorBarItem(lItem)"></el-button>
                </el-table>
              </el-form-item>
            </template>
          </template>
          <template v-if="lItem.type == '3d'">
            <el-divider content-position="left">{{ lItem[$l("label")] }}</el-divider>
            <el-form-item label="Value key">
              <el-select class="w100" v-model="s_form[lItem.name].valueKey">
                <el-option v-for="(v, k) in lItem.options" :disabled="v.type != 'Number'" :key="k" :label="`${v.name}(${v.type})`" :value="k" />
              </el-select>
            </el-form-item>
            <el-form-item label="Scale">
              <el-input-number class="w100" v-model="s_form[lItem.name].data" :min="0" :step="0.01" />
            </el-form-item>
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

<language>
{
  "label":{
    "zh-CN": "label",
    "en-US": "en_label"
  },
  "值":{
    "zh-CN": "值",
    "en-US": "Value"
  },
  "色道":{
    "zh-CN": "色道",
    "en-US": "Color ramp"
  },
  "模式":{
    "zh-CN": "模式",
    "en-US": "Model"
  },
  "颜色":{
    "zh-CN": "颜色",
    "en-US": "Color"
  },
  "最小值":{
    "zh-CN": "最小值",
    "en-US": "Min"
  },
  "最大值":{
    "zh-CN": "最大值",
    "en-US": "Max"
  },
  "标签":{
    "zh-CN": "标签",
    "en-US": "Label"
  },
  "类型":{
    "zh-CN": "类型",
    "en-US": "Type"
  },
  "自动生成":{
    "zh-CN": "自动生成",
    "en-US": "Autogenerate"
  },
  
}
</language>

<script>
import * as THREE from "three";
import { ICON_LIST } from "@/utils/utils";
import { LINE_STYLE } from "../layer/GeoJSONLayer2";
import { ColorBar2D } from "@/mymap/utils/ColorBar2D.v2";
export default {
  name: "GeoJSONSetting",
  props: {
    title: {
      type: String,
      default: "",
    },
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
          },
          attrs: {
            hideAdd: false,
            hideDelete: false,
            hideValueKey: false,
            hideColorRamp: false,
            hideModel: false,
          },
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
          this.handleUpdate();
        }
      },
      immediate: true,
      deep: true,
    },
    layout: {
      handler(val) {
        this.handleUpdate();
      },
      immediate: true,
      deep: true,
    },
    form: {
      handler(val) {
        this.handleUpdate();
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
    handleUpdate() {
      const s_form = {};
      for (const lItem of this.layout) {
        s_form[lItem.name] = {
          number: 0,
          slider: 0,
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
            labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
            data: [],
          },
          "3d": {
            valueKey: "",
            data: 1,
          },
        }[lItem.type];
      }
      this.s_form = Object.assign({}, s_form, JSON.parse(JSON.stringify(this.form)));
    },
    handleClose() {
      this.s_visible = false;
      this.$emit("update:visible", this.s_visible);
      this.$emit("close", this.s_visible);
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
      console.log(lItem.options, item.valueKey, item);

      const startColor = new THREE.Color(item.startColor);
      const endColor = new THREE.Color(item.endColor);
      const list = [];

      function getLabel(labelRule, { min, max, index }) {
        try {
          switch (labelRule) {
            case "EN": {
              const n1 = Math.floor(index / 26);
              const n2 = index % 26;
              const arr = new Array(n1).fill("z");
              arr.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[n2]);
              return arr.join("");
            }
            case "en": {
              const n1 = Math.floor(index / 26);
              const n2 = index % 26;
              const arr = new Array(n1).fill("z");
              arr.push("abcdefghijklmnopqrstuvwxyz"[n2]);
              return arr.join("");
            }
          }
        } catch (error) {}
        return `${min} ~ ${max}`;
      }

      if (data.type == "Number" && item.model == "count") {
        const modelClass = item.modelClass;
        const min = data.min;
        const max = data.max;
        const step = (max - min) / modelClass;
        for (let i = 0; i < modelClass; i++) {
          const color = new THREE.Color().lerpColors(startColor, endColor, i / modelClass);
          const min2 = Number(Number(min + step * i).toFixed(4));
          const max2 = Number(Number(min + step * (i + 1)).toFixed(4));
          list.push({
            min: min2,
            max: max2,
            range: [data.min, data.max],
            color: "#" + color.getHexString(),
            // label: `${min2} ~ ${max2}`,
            label: getLabel(item.labelRule, { min: min2, max: max2, index: i }),
            use: true,
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
            range: [data.min, data.max],
            color: "#" + color.getHexString(),
            // label: `${values[s]} ~ ${values[e]}`,
            label: getLabel(item.labelRule, { min: values[s], max: values[e], index: i }),
            use: true,
          });
        }
      } else if (data.type == "String") {
        const mapList = Object.entries(data.map);
        for (let i = 0, l = mapList.length; i < l; i++) {
          const [mk, mi] = mapList[i];
          const color = new THREE.Color().lerpColors(startColor, endColor, i / l);
          list.push({
            min: mi - 0.5,
            max: mi + 0.5,
            range: [data.min, data.max],
            color: "#" + color.getHexString(),
            label: mk,
            use: true,
          });
        }
      }
      console.log(list);
      
      this.$set(item, "data", list);
      this.handleChangeImage(lItem);
    },
    handleDeleteColorBarItem(lItem, index) {
      console.log(lItem, index);

      const item = this.s_form[lItem.name];
      item.data.splice(index, 1);
      this.handleChangeImage(lItem);
    },
    handleAddColorBarItem(lItem, index) {
      const item = this.s_form[lItem.name];
      const data = lItem.options[item.valueKey];
      const last = item.data[item.data.length - 1] || {
        min: 0,
        max: 1,
        color: item.endColor,
        range: [data.min, data.max],
        label: `${0} ~ ${1}`,
        use: true,
      };
      item.data.push(JSON.parse(JSON.stringify(last)));
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
    box-sizing: border-box;
    width: 100% !important;
  }
}
.GeoJSONSetting {
  .GeoJSONSetting_body {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 80vh;
  }
  .px-1em {
    padding: 0 1em;
  }
}
</style>
