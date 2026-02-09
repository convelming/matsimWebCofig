<!-- Step3Dialog -->
<template>
  <div v-if="analysis">
    <Dialog class="Step3_Dialog" ref="dialog" :title="analysis.name" hideMinimize :visible="s_visible" @close="handleClose" keepRight right="330" top="100" width="450px">
      <div class="Step3_box" v-loading="loading" element-loading-background="rgb(from var(--color-white) r g b / 0.8)">
        <div class="btn_box">
          <div class="text1 btn_box" style="width: 100%">
            <span>{{ $l("方案结果") }}</span>
            <el-tag v-if="analysis.status == 0" size="small" effect="dark" type="warning">{{ $l("未生成") }}</el-tag>
            <el-tag v-if="analysis.status == 1" size="small" effect="dark" type="info">{{ $l("生成中") }}</el-tag>
            <el-tag v-if="analysis.status == 2" size="small" effect="dark" type="success">{{ $l("已生成") }}</el-tag>
            <el-tag v-if="analysis.status == 3" size="small" effect="dark" type="danger">{{ $l("生成失败") }}</el-tag>
          </div>
          <el-button style="width: 60px; flex: none" type="primary" size="small" :disabled="analysis.status != 2" @click="getGetJSON(analysis)">{{ $l("查看") }}</el-button>
        </div>
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleOpenAdjust(analysis)">{{ $l("方案调整") }}</el-button>
          <el-button style="width: 60px; flex: none" type="primary" size="small" @click="getAnalysisList()" icon="el-icon-refresh-right"></el-button>
        </div>
        <AutoSize style="height: 400px">
          <template slot-scope="{ width, height }">
            <el-table class="small" :data="list" border :height="height">
              <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
              <el-table-column :label="$l('状态')" prop="status" width="75">
                <div slot-scope="{ row, $index }" class="tag-list">
                  <!-- 0未生成，1生成中，2以生成，3生成失败 -->
                  <el-tag v-if="row.status == 0" size="small" effect="dark" type="warning">{{ $l("未生成") }}</el-tag>
                  <el-tag v-if="row.status == 1" size="small" effect="dark" type="info">{{ $l("生成中") }}</el-tag>
                  <el-tag v-if="row.status == 2" size="small" effect="dark" type="success">{{ $l("已生成") }}</el-tag>
                  <el-tag v-if="row.status == 3" size="small" effect="dark" type="danger">{{ $l("生成失败") }}</el-tag>
                </div>
              </el-table-column>
              <el-table-column :label="$l('操作')" width="90">
                <div slot-scope="{ row, $index }" class="cz_btn">
                  <el-button type="text" size="small" icon="el-icon-view" :disabled="row.status != 2" @click="getGetJSON(row)"></el-button>
                  <!-- <el-button type="text" size="small" icon="el-icon-edit" @click="handleOpenAdjust(row)"></el-button> -->
                  <el-button type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger)" @click="handleDeleteAnalysis(row)"></el-button>
                </div>
              </el-table-column>
            </el-table>
          </template>
        </AutoSize>
        <Pagination @size-change="getAnalysisList" @current-change="getAnalysisList" :current-page.sync="pageNum" :page-size="pageSize" :total="total" :pager-count="5" layout="total, prev, pager, next"> </Pagination>

        <!-- <div class="btn_box">
          <el-button type="primary" size="small" @click="handleNext">{{ $l("搜索最优方案") }}</el-button>
          <el-button type="info" size="small" @click="handlePrev">{{ $l("上一步") }}</el-button>
        </div> -->
      </div>
    </Dialog>
    <Dialog class="Step3_Adjust_Dialog" ref="dialog" :title="$l('方案调整')" hideMinimize :visible.sync="showAdjust" @close="handleCloseAdjust" keepRight right="330" top="100" width="450px">
      <div class="Step3_Adjust_box">
        <el-scrollbar wrap-class="scroll_box">
          <div class="scroll_body">
            <template v-for="item in adjustParam">
              <el-divider v-if="item.type == 'title'" content-position="left">{{ $l(item.label) }}</el-divider>
              <!-- <div class="title" v-if="item.type == 'title'">{{ $l(item.label) }}</div> -->
              <AreaFromItem v-if="item.type == 'item'" :label="$l(item.label)" v-bind="item" @update:value="item.value = $event" @update:check="item.check = $event" />
            </template>
          </div>
        </el-scrollbar>
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleSubmitAbjust">{{ $l("确认") }}</el-button>
          <el-button type="info" size="small" @click="handleCloseAdjust">{{ $l("取消") }}</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import AreaFromItem from "./AreaFromItem.vue";

import { GeoJSONLayer, parserGeoJSON } from "../../GeoJSON/layer/GeoJSONLayer2";

import { CUA_downloadGeojson, CUA_planPage, CUA_deletePlan, CUA_addPlan } from "@/api/index";
import { guid, boldToText } from "@/utils/index2";

const dialogList = [
  { type: "item", label: "方案名称", key: "方案名称", disabled: false, slider: false, inputNumber: false, input: true, value: "", avg: "", check: true },
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
  name: "Step3Dialog",
  inject: ["rootVue"],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    resultJsonPath: {
      type: String,
      default: "",
    },
    analysis: {
      type: Object,
    },
  },
  components: { AreaFromItem },
  computed: {
    s_visible() {
      return this.visible && !this.showAdjust;
    },
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    visible: {
      handler(val) {
        if (this.visible) {
          this.init();
        }

        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.visible) {
              this._Map.addLayer(this._GeoJSONLayer_road);
            } else {
              this._GeoJSONLayer_road.removeFromParent();
            }
          }, 500);
        });
      },
    },
    analysis: {
      handler(val) {
        if (this.visible && this.analysis) {
          this.getAnalysisList();
          this.getGetJSON(this.analysis);
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      loading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      list: [],
      areaParam: [],

      showAdjust: false,
      adjustForm: {},
      adjustParam: [],
    };
  },
  created() {
    this._GeoJSONLayer_road = new GeoJSONLayer({
      lineAutoWidth: 1,
    });
    if (this.visible) {
      this.init();
    }
  },
  mounted() {},
  beforeDestroy() {
    this._GeoJSONLayer_road.dispose();
  },
  methods: {
    init() {
      this.loading = true;
      Promise.all([this.getAnalysisList(), this.getGetJSON(this.analysis), this.getResultJsonPath()]).finally(() => {
        this.loading = false;
      });
    },
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    getGetJSON(row) {
      return CUA_downloadGeojson({
        path: row.roadJsonPath,
      })
        .then((res) => boldToText(res.data))
        .then((res) => parserGeoJSON(res))
        .then((res) => {
          console.log(res);

          this._GeoJSONLayer_road.setGeoJsonData(res);
        });
    },
    getAnalysisList() {
      return CUA_planPage({
        areaAnalyzeId: this.analysis.areaAnalyzeId,
        parentId: this.analysis.id,
        pageSize: this.pageSize,
        pageNum: this.pageNum,
      }).then((res) => {
        res.records.forEach((v) => {
          v.m_id = guid();
        });
        this.list = res.records;
        this.total = res.total;
      });
    },
    getResultJsonPath() {
      // 获取相似区域列表
      return CUA_downloadGeojson({
        path: this.resultJsonPath,
      })
        .then((res) => boldToText(res.data))
        .then((res) => parserGeoJSON(res))
        .then((res) => {
          const areaParam = JSON.parse(JSON.stringify(dialogList));
          areaParam.forEach((item) => {
            const prop = res.propertiesLabels[item.key];
            if (item.key != "方案名称" && prop && item.type == "item") {
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
        });
    },
    handleDeleteAnalysis(row) {
      this.$confirm(`确定删除"${row.name}"吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          CUA_deletePlan(row.id).then(() => {
            this.getAnalysisList();
          });
        })
        .catch(() => {});
    },
    handleOpenAdjust(row) {
      const form = JSON.parse(JSON.stringify(row));
      form.args = JSON.parse(form.args);
      form.bastValue = JSON.parse(form.bastValue);

      const bastValue = Object.fromEntries(form.bastValue.map((v) => [v.key, v.value]));
      const areaParam = JSON.parse(JSON.stringify(this.areaParam));

      areaParam.forEach((item) => {
        if (item.key != "方案名称" && item.type == "item") {
          item.value = Number(Number(bastValue[item.key] || item.value).toFixed(4));
          item.avg = Number(Number(bastValue[item.key] || item.avg).toFixed(4));
        }
      });

      this.adjustParam = areaParam;
      this.adjustForm = form;
      this.showAdjust = true;
    },
    handleCloseAdjust() {
      this.showAdjust = false;
    },
    handleSubmitAbjust() {
      const name = this.adjustParam.find((v) => v.key == "方案名称")?.value;
      const query = {
        parentId: this.adjustForm.id,
        areaAnalyzeId: this.adjustForm.areaAnalyzeId,
        name: name,
        args: JSON.stringify({
          params: this.adjustParam
            .filter((v) => v.type == "item")
            .map((v) => {
              return {
                key: v.key,
                value: v.value,
                avg: v.avg,
                check: v.check,
              };
            }),
          links: JSON.parse(this.analysis.args).links,
        }),
      };
      const loading = this.$loading({
        lock: true,
        text: "搜索中...",
        spinner: "el-icon-loading",
        background: "rgb(from var(--color-white) r g b / 0.8)",
      });
      CUA_addPlan(query)
        .then((res) => {
          this.getAnalysisList();
          this.handleCloseAdjust();
        })
        .finally(() => loading.close());
    },
  },
};
</script>

<style lang="scss" scoped>
.Step3_Dialog {
  .el-scrollbar {
    height: 100%;
  }
  ::v-deep .scroll_box {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .Step3_box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .text1 {
      font-size: 14px;
    }
    .title {
      font-size: 18px;
      font-weight: 500;
    }
    .item {
      padding: 0 10px;
    }

    .btn_box {
      display: flex;
      align-items: center;
      gap: 10px;
      .el-button {
        margin: 0;
        flex: 1;
      }
    }
  }
}
.Step3_Adjust_Dialog {
  height: calc(100vh - 130px);
  .Step3_Adjust_box {
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
