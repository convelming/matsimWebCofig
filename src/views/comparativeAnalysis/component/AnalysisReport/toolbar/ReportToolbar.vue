<template>
  <el-collapse-item class="ReportToolbar" :name="name">
    <div class="collapse_item_title" slot="title">{{ $l("ReportToolbar") }}</div>
    <div class="_bodyer">
      <div class="tree_scroll">
        <el-tree ref="tree" :data="treeData" show-checkbox node-key="id" :default-checked-keys="defaultCheckedKeys" default-expand-all>
          <div slot-scope="{ node, data }" class="tree_item">
            <div>{{ $l(data.label) }}</div>
            <el-button v-if="data.showView" type="text" size="small" icon="el-icon-view" @click.stop="handleShowDialog(node, data)"></el-button>
          </div>
        </el-tree>
      </div>
      <div class="btn_list">
        <el-button type="primary" size="small" @click="">分析报告生成</el-button>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "ReportToolbar":{
    "zh-CN": "公交出行影响对比分析报告",
    "en-US": "公交出行影响对比分析报告"
  },
  "活动属性":{
    "zh-CN": "活动属性",
    "en-US": "活动属性"
  },
  "出行目的":{
    "zh-CN": "出行目的",
    "en-US": "出行目的"
  },
  "出行时段":{
    "zh-CN": "出行时段",
    "en-US": "出行时段"
  },
  "停留时间":{
    "zh-CN": "停留时间",
    "en-US": "停留时间"
  },
  "出行属性":{
    "zh-CN": "出行属性",
    "en-US": "出行属性"
  },
  "在途时间":{
    "zh-CN": "在途时间",
    "en-US": "在途时间"
  },
  "候车时间":{
    "zh-CN": "候车时间",
    "en-US": "候车时间"
  },
  "换乘次数":{
    "zh-CN": "换乘次数",
    "en-US": "换乘次数"
  },
  "费用":{
    "zh-CN": "费用",
    "en-US": "费用"
  },
  "出行距离":{
    "zh-CN": "出行距离",
    "en-US": "出行距离"
  },
  "出行方式":{
    "zh-CN": "出行方式",
    "en-US": "出行方式"
  },
  "出行者属性":{
    "zh-CN": "出行者属性",
    "en-US": "出行者属性"
  },
  "性别":{
    "zh-CN": "性别",
    "en-US": "性别"
  },
  "年龄":{
    "zh-CN": "年龄",
    "en-US": "年龄"
  },
  "机动车保有量":{
    "zh-CN": "机动车保有量",
    "en-US": "机动车保有量"
  },
  "就业情况":{
    "zh-CN": "就业情况",
    "en-US": "就业情况"
  },
  "车辆可使用情况":{
    "zh-CN": "车辆可使用情况",
    "en-US": "车辆可使用情况"
  },
  "其他":{
    "zh-CN": "其他",
    "en-US": "其他"
  },
  "决策树1":{
    "zh-CN": "决策树1",
    "en-US": "决策树1"
  },
  "决策树2":{
    "zh-CN": "决策树2",
    "en-US": "决策树2"
  },
}
</language>

<script>
import { guid } from "@/utils/utils.js";

import Vue from "vue";
// 活动属性弹窗
import ResidenceTime from "../dialog/ActivityAttributes/ResidenceTime.vue";
import TravelPurpose from "../dialog/ActivityAttributes/TravelPurpose.vue";
import TravelTime from "../dialog/ActivityAttributes/TravelTime.vue";
import TravelMode from "../dialog/ActivityAttributes/TravelMode.vue";
// 出行属性弹窗
import TravelAttribute from "../dialog/TravelAttribute/index.vue";

import TestDialog from "../dialog/TestDialog.vue";

const TestDialogExtend = Vue.extend(TestDialog);

const ResidenceTimeExtend = Vue.extend(ResidenceTime);
const TravelPurposeExtend = Vue.extend(TravelPurpose);
const TravelTimeExtend = Vue.extend(TravelTime);
const TravelModeExtend = Vue.extend(TravelMode);

const TravelAttributeExtend = Vue.extend(TravelAttribute);

export default {
  name: "ReportToolbar",
  inject: ["rootVue"],
  props: {
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    show: {
      handler(val) {
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
  },
  data() {
    return {
      treeData: [
        {
          id: "1",
          label: "活动属性",
          showView: true,
          children: [
            {
              id: "1-1",
              label: "出行目的",
              showView: true,
            },
            {
              id: "1-2",
              label: "出行时段",
              showView: true,
            },
            {
              id: "1-3",
              label: "停留时间",
              showView: true,
            },
            {
              id: "1-4",
              label: "出行方式",
              showView: true,
            },
          ],
        },
        {
          id: "2",
          label: "出行属性",
          showView: true,
          children: [
            {
              id: "2-1",
              label: "在途时间",
            },
            {
              id: "2-2",
              label: "候车时间",
            },
            {
              id: "2-3",
              label: "换乘次数",
            },
            {
              id: "2-4",
              label: "费用",
            },
            {
              id: "2-5",
              label: "出行距离",
            },
            // {
            //   id: "2-6",
            //   label: "出行方式",
            // },
          ],
        },
        {
          id: "3",
          label: "出行者属性",
          showView: true,
          children: [
            {
              id: "3-1",
              label: "性别",
              showView: true,
            },
            {
              id: "3-2",
              label: "年龄",
              showView: true,
            },
            {
              id: "3-3",
              label: "机动车保有量",
              showView: true,
            },
            {
              id: "3-4",
              label: "就业情况",
              showView: true,
            },
            {
              id: "3-5",
              label: "车辆可使用情况",
              showView: true,
            },
            {
              id: "3-6",
              label: "其他",
              showView: true,
            },
          ],
        },
        {
          id: "4",
          label: "决策树1",
          children: [],
        },
        {
          id: "5",
          label: "决策树2",
          children: [],
        },
      ],
      defaultCheckedKeys: ["1", "2"],
      s_form: {
        startTime: 0,
        endTime: 24 * 60 * 60,
      },
    };
  },
  created() {
    this._dialogMap = new Map();
    this._dialogOffset = 0;
  },
  mounted() {
    // 接收两个 boolean 类型的参数，1. 是否只是叶子节点，默认值为 false 2. 是否包含半选节点，默认值为 false
    // console.log(this.$refs.tree.getCheckedNodes());
  },
  beforeDestroy() {
    this.handleDisable();
    this._dialogMap.clear();
  },
  methods: {
    handleEnable() {},
    handleDisable() {},
    handleShowDialog(node, data) {
      console.log(node, data);
      switch (data.id) {
        /************* 活动属性 *************/
        case "1":
          {
            const value = new Set(node.childNodes.filter((item) => item.checked).map((item) => item.data.id));
            //"活动属性":
            if (value.has("1-1")) this.showDialog(TravelPurposeExtend, {}, "TravelPurposeExtend");
            if (value.has("1-2")) this.showDialog(TravelTimeExtend, {}, "TravelTimeExtend");
            if (value.has("1-3")) this.showDialog(ResidenceTimeExtend, {}, "ResidenceTimeExtend");
            if (value.has("1-4")) this.showDialog(TravelModeExtend, {}, "TravelModeExtend");
          }
          break;
        case "1-1":
          {
            //"出行目的":
            this.showDialog(TravelPurposeExtend, {}, "TravelPurposeExtend");
          }
          break;
        case "1-2":
          {
            //"出行时段":
            this.showDialog(TravelTimeExtend, {}, "TravelTimeExtend");
          }
          break;
        case "1-3":
          {
            //"停留时间":
            this.showDialog(ResidenceTimeExtend, {}, "ResidenceTimeExtend");
          }
          break;
        case "1-4":
          {
            //"出行方式":
            this.showDialog(TravelModeExtend, {}, "TravelModeExtend");
          }
          break;
        /************* 出行属性 *************/
        case "2":
          {
            //"出行属性":
            const value = node.childNodes.filter((item) => item.checked).map((item) => item.data.id);
            const _dialog = this.showDialog(TravelAttributeExtend, { value: value }, "TravelAttributeExtend" + value.join(","));
            _dialog.$on("input", (value) => {
              console.log(value);
            });
          }
          break;
        case "2-1":
          {
            //"在途时间":
          }
          break;
        case "2-2":
          {
            //"候车时间":
          }
          break;
        case "2-3":
          {
            //"换乘次数":
          }
          break;
        case "2-4":
          {
            //"费用":
          }
          break;
        case "2-5":
          {
            //"出行距离":
          }
          break;
        case "2-6":
          {
            //"出行方式":
          }
          break;
        /************* 出行属性 *************/
        case "3":
          {
            //"出行者属性":
          }
          break;
        case "3-1":
          {
            //"性别":
          }
          break;
        case "3-2":
          {
            //"年龄":
          }
          break;
        case "3-3":
          {
            //"机动车保有量":
          }
          break;
        case "3-4":
          {
            //"就业情况":
          }
          break;
        case "3-5":
          {
            //"车辆可使用情况":
          }
          break;
        case "3-6":
          {
            //"其他":
          }
          break;
        /************* 出行属性 *************/
        case "4":
          {
            //"决策树1":
          }
          break;
        case "5":
          {
            //"决策树2":
          }
          break;
        default:
          {
          }
          break;
      }
    },
    showDialog(DialogClass, data, key) {
      if (this._dialogMap.has(key)) {
        const _dialog = this._dialogMap.get(key);
        _dialog.toTop();
        return _dialog;
      } else {
        if (this._dialogOffset > 20) this._dialogOffset = 0;
        const _dialog = new DialogClass({
          propsData: { form: data, offset: ++this._dialogOffset * 20 },
          parent: this.rootVue,
        }).$mount();
        this._dialogMap.set(key, _dialog);
        _dialog.$on("close", () => {
          _dialog.$destroy();
          if (this._dialogMap) this._dialogMap.delete(key);
        });
        document.body.append(_dialog.$el);
        return _dialog;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.ReportToolbar {
  font-size: 13px;
  .collapse_item_title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 20px;
  }
  ._bodyer {
    padding: 0 20px;
    .btn_list {
      padding-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
    .tree_item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tree_scroll {
      padding-right: 15px;
      max-height: 50vh;
      overflow-y: scroll;
    }
  }
}
</style>
