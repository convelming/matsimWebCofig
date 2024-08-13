<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%;">{{ $l("ReportToolbar") }}</div>
    </div>
    <div class="toolbar_item_bodyer">
      <div class="tree_scroll">
        <el-tree ref="tree" :data="treeData" show-checkbox node-key="id" :default-checked-keys="defaultCheckedKeys">
          <div slot-scope="{ node, data }" class="tree_item">
            <div class="tree_label" :title="data[$l(`label`)]">{{ data[$l(`label`)] }}</div>
            <el-button class="tree_btn" v-if="data.showView" type="text" size="small" icon="el-icon-view" @click.stop="handleShowDialog(node, data)"></el-button>
          </div>
        </el-tree>
      </div>
      <div class="btn_list">
        <el-button type="primary" size="small" @click="handleGenerateAnalysisReport" :loading="reportLoading">{{ $l("分析报告生成") }}</el-button>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "ReportToolbar":{
    "zh-CN": "公交出行影响对比分析报告",
    "en-US": "Transit Analysis & Comparison Report"
  },
  "label":{
    "zh-CN": "label_zh",
    "en-US": "label_en"
  },
  "分析报告生成":{
    "zh-CN": "分析报告生成",
    "en-US": "Generate Report "
  }
}
</language>

<script>
import { guid } from "@/utils/utils.js";
import { changeLines, affectedLines, genReports } from "@/api/contrast";

import Vue from "vue";
// 活动属性弹窗
import ResidenceTime from "../dialog/ActivityAttributes/ResidenceTime.vue";
import TravelPurpose from "../dialog/ActivityAttributes/TravelPurpose.vue";
import TravelTime from "../dialog/ActivityAttributes/TravelTime.vue";
import TravelMode from "../dialog/ActivityAttributes/TravelMode.vue";
// 出行属性弹窗
import TravelAttribute from "../dialog/TravelAttribute/index.vue";
// 出行者属性
import TravelersAge from "../dialog/TravelerAttributes/TravelersAge.vue";
import TravelersCarAvailability from "../dialog/TravelerAttributes/TravelersCarAvailability.vue";
import TravelersCarLicense from "../dialog/TravelerAttributes/TravelersCarLicense.vue";
import TravelersEmployed from "../dialog/TravelerAttributes/TravelersEmployed.vue";
import TravelersSex from "../dialog/TravelerAttributes/TravelersSex.vue";

import TravelUtilityTree from "../dialog/TravelUtilityTree/index.vue";
import TravelUtilityTreeData from "../dialog/TravelUtilityTree/index.json";

import TravelVariationTree from "../dialog/TravelVariationTree/index.vue";
import TravelVariationTreeData from "../dialog/TravelVariationTree/index.json";

import TestDialog from "../dialog/TestDialog.vue";

const TestDialogExtend = Vue.extend(TestDialog);

const ResidenceTimeExtend = Vue.extend(ResidenceTime);
const TravelPurposeExtend = Vue.extend(TravelPurpose);
const TravelTimeExtend = Vue.extend(TravelTime);
const TravelModeExtend = Vue.extend(TravelMode);

const TravelAttributeExtend = Vue.extend(TravelAttribute);

const TravelersAgeExtend = Vue.extend(TravelersAge);
const TravelersCarAvailabilityExtend = Vue.extend(TravelersCarAvailability);
const TravelersCarLicenseExtend = Vue.extend(TravelersCarLicense);
const TravelersEmployedExtend = Vue.extend(TravelersEmployed);
const TravelersSexExtend = Vue.extend(TravelersSex);

const TravelUtilityTreeExtend = Vue.extend(TravelUtilityTree);
const TravelVariationTreeExtend = Vue.extend(TravelVariationTree);

function setTreeId(root, rootId) {
  root.id = rootId;
  const _data = [root];
  while (_data.length > 0) {
    const node = _data.shift();
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        const cNode = node.children[i];
        cNode.id = `${node.id}_${i + 1}`;
        _data.push(cNode);
      }
    }
  }
  return root;
}

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
          label_zh: "活动属性",
          label_en: "Activity Attributes",
          showView: true,
          children: [
            {
              id: "1-1",
              label_zh: "出行目的",
              label_en: "travel destination",
              showView: true,
            },
            {
              id: "1-2",
              label_zh: "出行时段",
              label_en: "travel time",
              showView: true,
            },
            {
              id: "1-3",
              label_zh: "停留时间",
              label_en: "dwell time",
              showView: true,
            },
            {
              id: "1-4",
              label_zh: "出行方式",
              label_en: "Mode of travel",
              showView: true,
            },
          ],
        },
        {
          id: "2",
          label_zh: "出行属性",
          label_en: "Travel Attributes",
          showView: true,
          children: [
            {
              id: "2-1",
              label_zh: "在途时间",
              label_en: "time in transit",
            },
            {
              id: "2-2",
              label_zh: "候车时间",
              label_en: "waiting time",
            },
            {
              id: "2-3",
              label_zh: "换乘次数",
              label_en: "Number of transfers",
            },
            {
              id: "2-4",
              label_zh: "费用",
              label_en: "cost",
            },
            {
              id: "2-5",
              label_zh: "出行距离",
              label_en: "Travel distance",
            },
            // {
            //   id: "2-6",
            //   label_zh: "出行方式",
            //   label_en: "出行方式",
            // },
          ],
        },
        {
          id: "3",
          label_zh: "出行者属性",
          label_en: "Traveler Attributes",
          showView: true,
          children: [
            {
              id: "3-1",
              label_zh: "性别",
              label_en: "gender",
              showView: true,
            },
            {
              id: "3-2",
              label_zh: "年龄",
              label_en: "age",
              showView: true,
            },
            {
              id: "3-3",
              label_zh: "机动车保有量",
              label_en: "motor vehicle ownership",
              showView: true,
            },
            {
              id: "3-4",
              label_zh: "就业情况",
              label_en: "Employment",
              showView: true,
            },
            {
              id: "3-5",
              label_zh: "车辆可使用情况",
              label_en: "Vehicle serviceability",
              showView: true,
            },
            {
              id: "3-6",
              label_zh: "其他",
              label_en: "other",
              showView: true,
              disabled: true,
            },
          ],
        },
        setTreeId(TravelUtilityTreeData, "4"),
        setTreeId(TravelVariationTreeData, "5"),
        {
          id: "6",
          label_zh: "修改的线路",
          label_en: "Modified lines",
          children: [],
        },
        // {
        //   id: "7",
        //   label_zh: "受影响的线路",
        //   label_en: "受影响的线路",
        //   children: [],
        // },
      ],
      defaultCheckedKeys: ["1", "2", "3", "4", "5"],
      s_form: {
        startTime: 0,
        endTime: 24 * 60 * 60,
      },

      loading1: false,
      list1: [],
      loading2: false,
      list2: [],
      reportLoading: false,
    };
  },
  created() {
    this._dialogMap = new Map();

    this.getList1();
    this.getList2();
  },
  mounted() {
    // 接收两个 boolean 类型的参数，1. 是否只是叶子节点，默认值为 false 2. 是否包含半选节点，默认值为 false
    // console.log(this.$refs.tree.getCheckedNodes());
    this.rootVue.$on("AnalysisReport_generateAnalysisReport", this.handleGenerateAnalysisReport);
  },
  beforeDestroy() {
    this.handleDisable();
    this.rootVue.$off("AnalysisReport_generateAnalysisReport", this.handleGenerateAnalysisReport);
    this._dialogMap.values().forEach((v) => v.$destroy());
    this._dialogMap.clear();
  },
  methods: {
    getList1() {
      this.loading1 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      return changeLines({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      })
        .then((res) => {
          const list = res.data.map((item) => {
            return { ...item, id: item.routeId, label_zh: item.routeName, label_en: item.routeName };
          });
          const item = this.treeData.find((v) => v.label_zh == "修改的线路");
          if (item) {
            this.$set(item, "children", list);
          }
          this.loading1 = false;
        })
        .catch((err) => {
          this.loading1 = false;
        });
    },
    getList2() {
      this.loading2 = true;
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      return affectedLines({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
      })
        .then((res) => {
          const list = res.data.map((item) => {
            return { ...item, id: item.routeId, label_zh: item.routeName, label_en: item.routeName };
          });
          const item = this.treeData.find((v) => v.label_zh == "受影响的线路");
          if (item) {
            this.$set(item, "children", list);
          }
          this.loading2 = false;
        })
        .catch((err) => {
          this.loading2 = false;
        });
    },
    handleEnable() {},
    handleDisable() {},
    handleShowDialog(node, data) {
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
            const value = new Set(node.childNodes.filter((item) => item.checked).map((item) => item.data.id));
            //"出行者属性":
            if (value.has("3-1")) this.showDialog(TravelersSexExtend, {}, "TravelersSexExtend");
            if (value.has("3-2")) this.showDialog(TravelersAgeExtend, {}, "TravelersAgeExtend");
            if (value.has("3-3")) this.showDialog(TravelersCarLicenseExtend, {}, "TravelersCarLicenseExtend");
            if (value.has("3-4")) this.showDialog(TravelersEmployedExtend, {}, "TravelersEmployedExtend");
            if (value.has("3-5")) this.showDialog(TravelersCarAvailabilityExtend, {}, "TravelersCarAvailabilityExtend");
          }
          break;
        case "3-1":
          {
            //"性别":
            this.showDialog(TravelersSexExtend, {}, "TravelersSexExtend");
          }
          break;
        case "3-2":
          {
            //"年龄":
            this.showDialog(TravelersAgeExtend, {}, "TravelersAgeExtend");
          }
          break;
        case "3-3":
          {
            //"机动车保有量":
            this.showDialog(TravelersCarLicenseExtend, {}, "TravelersCarLicenseExtend");
          }
          break;
        case "3-4":
          {
            //"就业情况":
            this.showDialog(TravelersEmployedExtend, {}, "TravelersEmployedExtend");
          }
          break;
        case "3-5":
          {
            //"车辆可使用情况":
            this.showDialog(TravelersCarAvailabilityExtend, {}, "TravelersCarAvailabilityExtend");
          }
          break;
        case "3-6":
          {
            //"其他":
          }
          break;
        /************* 出行效用决策树 *************/
        case "4":
          {
            //"出行效用决策树":
            const nodeToJSON = function (node, parent = null, parentId = null, depth = 0) {
              const _item = {
                id: node.data.id,
                name: node.data.key,
                parentId: parentId,
                parent: parent,
                depth: depth,
                value: null,
                children: node.childNodes.map((v) => nodeToJSON(v, node.data.key, node.data.id, depth + 1)).filter((v) => v.checked),

                checked: node.checked || node.indeterminate,
              };
              return _item;
            };
            const data = nodeToJSON(this.$refs.tree.getNode("4"));
            if (data.checked) {
              this.showDialog2(TravelUtilityTreeExtend, data, "TravelUtilityTreeExtend");
            }
          }
          break;
        /************* 出行变化决策树 *************/
        case "5":
          {
            //"出行变化决策树":
            const nodeToJSON = function (node, parent = null, parentId = null, depth = 0) {
              const _item = {
                id: node.data.id,
                name: node.data.key,
                parentId: parentId,
                parent: parent,
                depth: depth,
                value: null,
                children: node.childNodes.map((v) => nodeToJSON(v, node.data.key, node.data.id, depth + 1)).filter((v) => v.checked),

                checked: node.checked || node.indeterminate,
              };
              return _item;
            };
            const data = nodeToJSON(this.$refs.tree.getNode("5"));
            if (data.checked) {
              this.showDialog2(TravelVariationTreeExtend, data, "TravelVariationTreeExtend");
            }
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
        _dialog.show();
        _dialog.toTop();
        return _dialog;
      } else {
        const _dialog = new DialogClass({
          propsData: { form: data, offset: this._dialogMap.size * 40 },
          parent: this.rootVue,
        }).$mount();
        this._dialogMap.set(key, _dialog);
        document.body.append(_dialog.$el);
        return _dialog;
      }
    },
    showDialog2(DialogClass, data, key) {
      if (this._dialogMap.has(key)) {
        const _dialog = this._dialogMap.get(key);
        _dialog.show();
        _dialog.toTop();
        return _dialog;
      } else {
        const _dialog = new DialogClass({
          propsData: { form: data, offset: this._dialogMap.size * 40 },
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
    handleGenerateAnalysisReport(cb) {
      if (this.reportLoading) return;
      this.reportLoading = true;
      const changeRouteList = this.$refs.tree
        .getNode("6")
        .childNodes.filter((v) => v.checked)
        .map((v) => v.data.id);
      const { database1, datasource1, database2, datasource2 } = this.$route.params;
      return genReports({
        name1: database1 + "/" + datasource1,
        name2: database2 + "/" + datasource2,
        routeIds: changeRouteList,
      })
        .then((res) => {
          const a = document.createElement("a");
          a.href = `/pt/crt/downloadReports/${res.data}`;
          a.download = res.data;
          a.style = "position: fixed;top: -100vh;left: -100vw;";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          typeof cb === "function" && cb(true);
          this.reportLoading = false;
        })
        .catch((err) => {
          console.log(err);
          this.$message.error(err.msg);
          typeof cb === "function" && cb(false);
          this.reportLoading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar_item {
  .toolbar_item_bodyer {
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
      .tree_label {
        width: calc(100% - 50px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .tree_btn {
        flex: 1;
      }
    }

    .tree_scroll {
      max-height: 50vh;
      overflow-y: scroll;
      .el-tree{
        background-color: transparent;
      }
    }
  }
}
</style>
