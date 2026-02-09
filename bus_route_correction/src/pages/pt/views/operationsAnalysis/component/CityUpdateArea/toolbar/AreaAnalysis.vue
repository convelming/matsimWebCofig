<!-- AreaAnalysis 片区承载力分析 -->
<template>
  <div class="AreaAnalysis">
    <!-- <el-select class="block" v-model="year" size="small" :placeholder="$l('选择年份')" @change="handleChangeYear">
      <el-option label="2026" value="2026"> </el-option>
    </el-select> -->
    <div class="flex-box">
      <el-date-picker class="block" v-model="year" size="small" type="year" :placeholder="$l('选择年份')" value-format="yyyy" @change="handleChangeYear" />
      <el-button type="primary" size="small" @click="handleRefresh()" icon="el-icon-refresh-right"></el-button>
    </div>
    <AutoSize style="height: 30%">
      <template slot-scope="{ width, height }">
        <el-table ref="table" class="small" :data="list" border :height="height" @select="handleSelectionChange">
          <el-table-column type="selection" width="40" />
          <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
          <el-table-column :label="$l('状态')" prop="name" width="75">
            <div slot-scope="{ row, $index }" class="tag-list">
              <!-- 0未生成，1生成中，2以生成，3生成失败 -->
              <el-tag v-if="row.status == 0" size="small" effect="dark" type="warning">{{ $l("未搜索") }}</el-tag>
              <el-tag v-if="row.status == 1" size="small" effect="dark" type="info">{{ $l("搜索中") }}</el-tag>
              <el-tag v-if="row.status == 2" size="small" effect="dark" type="success">{{ $l("已搜索") }}</el-tag>
              <el-tag v-if="row.status == 3" size="small" effect="dark" type="danger">{{ $l("搜索失败") }}</el-tag>
            </div>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>
    <Pagination @size-change="getList" @current-change="getList" :current-page.sync="pageNum" :page-size="pageSize" :total="total" :pager-count="5" layout="total, prev, pager, next"> </Pagination>
    <template v-if="areaDetail">
      <div class="flex-box">
        <div class="title block">{{ areaDetail.name }} -- {{ $l("方案列表") }}</div>
        <el-button type="primary" size="small" @click="handleRefreshAnalysis()" icon="el-icon-refresh-right"></el-button>
      </div>
      <el-button class="block" type="primary" size="small" @click="handleOpenAddAnalysis()">{{ $l("添加方案") }}</el-button>
      <AutoSize class="flex-h">
        <template slot-scope="{ width, height }">
          <el-table class="small" :data="a_list" border :height="height">
            <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
            <el-table-column :label="$l('状态')" prop="name" width="75">
              <div slot-scope="{ row, $index }" class="tag-list">
                <!-- 0未生成，1生成中，2以生成，3生成失败 -->
                <el-tag v-if="row.status == 0" size="small" effect="dark" type="warning">{{ $l("未生成") }}</el-tag>
                <el-tag v-if="row.status == 1" size="small" effect="dark" type="info">{{ $l("生成中") }}</el-tag>
                <el-tag v-if="row.status == 2" size="small" effect="dark" type="success">{{ $l("已生成") }}</el-tag>
                <el-tag v-if="row.status == 3" size="small" effect="dark" type="danger">{{ $l("生成失败") }}</el-tag>
              </div>
            </el-table-column>
            <el-table-column :label="$l('操作')" width="70">
              <div slot-scope="{ row, $index }" class="cz_btn">
                <!-- <el-button type="text" size="small" icon="el-icon-view" @click=""></el-button> -->
                <el-button type="text" size="small" icon="el-icon-edit" @click="handleOpenAnalysisDetail(row)"></el-button>
                <el-button type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger)" @click="handleDeleteAnalysis(row)"></el-button>
              </div>
            </el-table-column>
          </el-table>
        </template>
      </AutoSize>
      <Pagination @size-change="getList" @current-change="getList" :current-page.sync="pageNum" :page-size="pageSize" :total="total" :pager-count="5" layout="total, prev, pager, next"> </Pagination>

      <AddAreaAnalysis :visible.sync="showAddAnalysis" :detail="areaDetail" :year="year" @success="handleOpenAnalysisDetail" @close="handleCloseAddAnalysis" />
      <AnalysisDetail :visible.sync="showAnalysisDetail" :analysis="analysisDetail" :resultJsonPath="areaDetail.resultJsonPath" @close="handleCloseAnalysisDetail" />
    </template>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AddAreaAnalysis from "../component/AddAreaAnalysis/index.vue";
import AnalysisDetail from "../component/AnalysisDetail.vue";
import { GeoJSONLayer, parserGeoJSON } from "../../GeoJSON/layer/GeoJSONLayer2";

import { CUA_yearAreaList, CUA_planPage, CUA_roadGeoJSONByYear, CUA_deletePlan } from "@/api/index";
import { guid, boldToText } from "@/utils/index2";

export default {
  name: "AreaSreach",
  inject: ["rootVue"],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MySlider,
    AddAreaAnalysis,
    AnalysisDetail,
  },
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
          }, 500);
        });
      },
      immediate: true,
    },
  },
  data() {
    return {
      year: new Date().getFullYear().toString(),
      pageNum: 1,
      pageSize: 10,
      total: 0,
      list: [],

      a_pageNum: 1,
      a_pageSize: 10,
      a_total: 0,
      a_list: [],

      areaDetail: null,
      showAddAnalysis: false,

      analysisDetail: null,
      showAnalysisDetail: false,
    };
  },
  created() {
    this._GeoJSONLayer_road = new GeoJSONLayer({
      lineAutoWidth: 1,
    });
    this._GeoJSONLayer_anal = new GeoJSONLayer({
      polygonBorderAutoWidth: 0.5,
    });
  },
  mounted() {},
  beforeDestroy() {
    this._GeoJSONLayer_road.dispose();
    this._GeoJSONLayer_anal.dispose();
  },
  methods: {
    handleChangeYear() {
      this.$refs.table?.clearSelection();
      this.handleInitAnalysis();
      this.getList();
      CUA_roadGeoJSONByYear(this.year)
        .then((res) => boldToText(res.data))
        .then((res) => parserGeoJSON(res))
        .then((res) => {
          this._GeoJSONLayer_road.setGeoJsonData(res);
        });
    },
    handleRefresh() {
      this.getList().then((res) => {
        const row = this.list.find((v) => v.areaId == this.areaDetail.areaId);
        this.handleSelectionChange(true, row);
      });
    },
    handleRefreshAnalysis() {
      this.getAnalysisList();
    },
    getList() {
      CUA_yearAreaList({
        year: this.year,
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
    handleSelectionChange(selection, row) {
      const oldArea = this.areaDetail;

      this.handleInitAnalysis();
      this.$refs.table.clearSelection();

      if (oldArea?.m_id != row.m_id) {
        this.$refs.table.toggleRowSelection(row, true);
        this.areaDetail = row;
        this.getAnalysisList();
      } else {
        this.handleInitAnalysis();
      }
    },
    handleInitAnalysis() {
      this.areaDetail = null;
      this.areaParam = null;
      this.a_pageNum = 1;
      this.a_pageSize = 10;
      this.a_total = 0;
      this.a_list = [];
      this.handleCloseAddAnalysis();
      this.handleCloseAnalysisDetail();
    },
    getAnalysisList() {
      CUA_planPage({
        areaAnalyzeId: this.areaDetail.id,
        pageSize: this.a_pageSize,
        pageNum: this.a_pageNum,
      }).then((res) => {
        res.records.forEach((v) => {
          v.m_id = guid();
        });
        this.a_list = res.records;
        this.a_total = res.total;
      });
    },
    handleOpenAddAnalysis() {
      this._GeoJSONLayer_road.removeFromParent();
      this.showAddAnalysis = true;
    },
    handleCloseAddAnalysis() {
      if (this._Map) {
        this._Map.addLayer(this._GeoJSONLayer_road);
      }
      this.showAddAnalysis = false;
    },
    handleEnable() {
      this.handleChangeYear();
      this._Map.addLayer(this._GeoJSONLayer_road);
      this._Map.addLayer(this._GeoJSONLayer_anal);
    },
    handleDisable() {
      this.handleCloseAddAnalysis();
      this.handleCloseAnalysisDetail();
      this._GeoJSONLayer_road.removeFromParent();
      this._GeoJSONLayer_anal.removeFromParent();
    },
    handleOpenAnalysisDetail(row) {
      this.analysisDetail = row;
      this.showAnalysisDetail = true;
      this._GeoJSONLayer_road.removeFromParent();
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
    handleCloseAnalysisDetail() {
      if (this._Map) {
        this._Map.addLayer(this._GeoJSONLayer_road);
      }
      this.analysisDetail = null;
      this.showAnalysisDetail = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.AreaAnalysis {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  .flex-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .block {
    display: block;
    width: 100%;
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .el-tag {
      color: var(--color-white);
    }
  }
  .cz_btn {
    display: flex;
    align-items: center;
    gap: 10px;
    .el-button {
      padding: 0;
      margin: 0;
    }
  }

  ::v-deep th.el-table-column--selection .el-checkbox {
    display: none;
  }
}
.AreaAnalysis_Dialog {
  height: calc(100vh - 130px);
  // ::v-deep {
  //   .bodyer {
  //     height: 100%;
  //     overflow-x: hidden;
  //     overflow-y: auto;
  //   }
  // }
  .el-scrollbar {
    height: 100%;
  }
  ::v-deep .scroll_box {
    overflow-x: hidden;
    overflow-y: auto;
  }
  .AreaAnalysis_form {
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

    .btn_box {
      display: flex;
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
