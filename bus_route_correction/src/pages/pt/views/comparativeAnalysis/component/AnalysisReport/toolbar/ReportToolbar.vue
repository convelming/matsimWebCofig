<template>
  <el-collapse-item class="toolbar_item" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ $l("ReportToolbar") }}</div>
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
    "en-US": "Generate Report"
  }
}
</language>

<script>
import { guid } from "@/utils/utils.js";
import { changeLines, affectedLines, genReports, getReportData, genReports2 } from "@/api/contrast";
import { residenceTime } from "@/api/crt.js";
import * as echarts from "@/utils/echarts.utils";
import * as echart_utils from "../echart_utils";

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
              // label_en: "travel destination",
              label_en: "trip purpose",
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
              label_en: "residence time",
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
    // 获取修改的线路列表
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
    // 获取受影响的线路列表
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
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {},
    // 根据点击的节点显示弹窗
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
    // 单例弹窗
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
    // 多例弹窗
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
    // 生成报告
    _handleGenerateAnalysisReport(cb) {
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
    async handleGenerateAnalysisReport(cb) {
      // attributeData; // 出行者属性雷达图  TravelAttribute_index
      // sexData; // 出行者性别雷达图 TravelerAttributes_TravelersSex
      // modeData; // 出行方式 ActivityAttributes_TravelMode
      // ageData; // 出行年龄 TravelerAttributes_TravelersAge
      // purposeData; // 出行目的 ActivityAttributes_TravelPurpose
      // tree1; // 出行效用决策树  TravelUtilityTree_index
      // tree2; // 出行变化决策树  TravelVariationTree_index
      // routeList; // 线路数据
      // routeInfo; // 线路信息
      // routeInfo.data; // 客流信息 PassengerFlow_PassengersEnteringLeaving
      // routeInfo.routeFlowsData; // od客流信息  PassengerFlow_RouteFlows
      // routeInfo.routeAttributesData; // 线路基础信息 PassengerFlow_RouteAttributes
      if (this.reportLoading) return;
      this.reportLoading = true;
      try {
        const changeRouteList = this.$refs.tree
          .getNode("6")
          .childNodes.filter((v) => v.checked)
          .map((v) => v.data.id);
        const { database1, datasource1, database2, datasource2 } = this.$route.params;
        const chartRes = await getReportData({
          name1: database1 + "/" + datasource1,
          name2: database2 + "/" + datasource2,
          // routeIds: changeRouteList,
        });

        console.log(chartRes);

        const imageData = {};
        const imageOptions = {
          type: "png",
          pixelRatio: 2,
          excludeComponents: ["toolbox"],
        };
        const _chartDom = document.createElement("div");
        _chartDom.style = "position:fixed;top:0;left:0; width: 1200px;height: 1200px;";
        document.body.append(_chartDom);
        const _chart = echarts.init(_chartDom);

        // 出行者属性雷达图 attributeData
        const attributeData_options = echart_utils.TravelAttribute_index({ data: chartRes.data.attributeData, keySet: new Set(["2-1", "2-2", "2-3", "2-4", "2-5"]) });
        attributeData_options.animation = false;
        _chart.setOption(attributeData_options, true);
        imageData.attributeData = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.attributeData, "attributeData.png");

        // 出行者性别雷达图 sexData
        const sexData_options = echart_utils.TravelerAttributes_TravelersSex(chartRes.data.sexData.data);
        sexData_options.animation = false;
        _chart.setOption(sexData_options, true);
        imageData.sexData = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.sexData, "attributeData.png");

        // 出行方式 modeData
        const modeData_options = echart_utils.ActivityAttributes_TravelMode(chartRes.data.modeData);
        modeData_options.animation = false;
        _chart.setOption(modeData_options, true);
        imageData.modeData = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.modeData, "attributeData.png");

        // 出行年龄 ageData
        const ageData_options = echart_utils.TravelerAttributes_TravelersAge(chartRes.data.ageData.data);
        ageData_options.animation = false;
        _chart.setOption(ageData_options, true);
        imageData.ageData = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.ageData, "attributeData.png");

        // 出行目的 purposeData
        const purposeData_options = echart_utils.ActivityAttributes_TravelPurpose(chartRes.data.purposeData.data);
        purposeData_options.animation = false;
        _chart.setOption(purposeData_options, true);
        imageData.purposeData = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.purposeData, "attributeData.png");

        // 出行效用决策树 tree1
        const tree1_options = echart_utils.TravelUtilityTree_index(chartRes.data.tree1);
        tree1_options.animation = false;
        _chart.setOption(tree1_options, true);
        imageData.tree1 = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.tree1, "attributeData.png");

        // 出行变化决策树 tree2
        const tree2_options = echart_utils.TravelVariationTree_index(chartRes.data.tree2);
        tree2_options.animation = false;
        _chart.setOption(tree2_options, true);
        imageData.tree2 = _chart.getDataURL(imageOptions);
        downloadBase64(imageData.tree2, "attributeData.png");

        // 线路数据 routeList
        imageData.routeList = await Promise.all(
          chartRes.data.routeList.map(async (v, i) => {
            const routeInfo = {
              routeInfo: v.routeInfo,
            };

            // 客流信息 data
            const data_options = echart_utils.PassengerFlow_PassengersEnteringLeaving(v);
            data_options.animation = false;
            _chart.setOption(data_options, true);
            routeInfo.data = _chart.getDataURL(imageOptions);
            downloadBase64(routeInfo.data, `data_${v.routeInfo.routeId}.png`);

            // od客流信息 routeFlowsData
            const routeFlowsData_options = echart_utils.PassengerFlow_RouteFlows({ ...v.routeFlowsData, routeInfo: v.routeInfo });
            // routeInfo.routeFlowsData = `data:image/svg+xml;base64,${Encode64(routeFlowsData_options)}`;
            // routeInfo.routeFlowsData = routeFlowsData_options
            routeInfo.routeFlowsData = await svgBlobToPng(routeFlowsData_options);
            downloadBase64(routeInfo.routeFlowsData, `routeFlowsData_${v.routeInfo.routeId}.png`);

            // 线路基础信息 routeAttributesData
            const routeAttributesData_options = echart_utils.PassengerFlow_RouteAttributes({ ...v.routeAttributesData, routeInfo: v.routeInfo });
            routeAttributesData_options.animation = false;
            _chart.setOption(routeAttributesData_options, true);
            routeInfo.routeAttributesData = _chart.getDataURL(imageOptions);
            downloadBase64(routeInfo.routeAttributesData, `routeAttributesData_${v.routeInfo.routeId}.png`);

            return routeInfo;
          }),
        );

        _chart.dispose();
        document.body.removeChild(_chartDom);
        console.log({
          name1: database1 + "/" + datasource1,
          name2: database2 + "/" + datasource2,
          routeIds: changeRouteList,
          imageData: imageData,
        });
        const docxRes = await genReports2({
          name1: database1 + "/" + datasource1,
          name2: database2 + "/" + datasource2,
          routeIds: changeRouteList,
          imageData: imageData,
        });

        const a = document.createElement("a");
        a.href = `/pt/crt/downloadReports/${docxRes.data}`;
        a.download = docxRes.data;
        a.style = "position: fixed;top: -100vh;left: -100vw;";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        typeof cb === "function" && cb(true);
        this.reportLoading = false;
      } catch (err) {
        console.log(err);
        typeof cb === "function" && cb(false);
        this.reportLoading = false;
      }
    },
  },
};

/**
 * 编码base64
 */
function Encode64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
      return String.fromCharCode("0x" + p1);
    }),
  );
}
/**
 * 解码base64
 */
function Decode64(str) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
}

function downloadBase64(base64Image, name) {
  // var link = document.createElement("a");
  // link.download = name; // 设置下载文件名
  // link.href = base64Image; // 使用 getDataURL 生成的 Base64 地址
  // link.click(); // 触发下载
}
async function svgBlobToPng(svgText) {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // Set canvas size based on SVG dimensions
      const { width, height } = img;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
  });
}
// ————————————————
// 版权声明：本文为CSDN博主「1024小神」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
// 原文链接：https://blog.csdn.net/weixin_44786530/article/details/129127376
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
      .el-tree {
        background-color: transparent;
      }
    }
  }
}
</style>
