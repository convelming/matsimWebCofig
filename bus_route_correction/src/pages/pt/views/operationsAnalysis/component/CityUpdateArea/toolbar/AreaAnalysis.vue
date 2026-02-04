<!-- AreaAnalysis 片区承载力分析 -->
<template>
  <div class="AreaAnalysis">
    <!-- <el-select class="block" v-model="year" size="small" :placeholder="$l('选择年份')" @change="handleChangeYear">
      <el-option label="2026" value="2026"> </el-option>
    </el-select> -->
    <el-date-picker class="block" v-model="year" size="small" type="year" :placeholder="$l('选择年份')" value-format="yyyy" @change="handleChangeYear" />
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
      <div class="title">{{ $l("方案列表") }}</div>
      <el-button class="block" type="primary" size="small" @click="handleOpenAddAnalysis()">{{ $l("添加方案") }}</el-button>
      <AutoSize class="flex-h">
        <template slot-scope="{ width, height }">
          <el-table class="small" :data="a_list" border :height="height">
            <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
            <el-table-column :label="$l('操作')" width="90">
              <div slot-scope="{ row, $index }" class="cz_btn">
                <!-- <el-button type="text" size="small" icon="el-icon-view" @click=""></el-button> -->
                <el-button type="text" size="small" icon="el-icon-edit" @click="handleOpenAddAnalysis(row)"></el-button>
                <el-button type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger)" @click=""></el-button>
              </div>
            </el-table-column>
          </el-table>
        </template>
      </AutoSize>
      <Pagination @size-change="getList" @current-change="getList" :current-page.sync="pageNum" :page-size="pageSize" :total="total" :pager-count="5" layout="total, prev, pager, next"> </Pagination>

      <AddAreaAnalysis :visible.sync="showAddAnalysis" :step="addAnalysisSpet" />
    </template>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AddAreaAnalysis from "../component/AddAreaAnalysis/index.vue";
import { GeoJSONLayer, parserGeoJSON } from "../../GeoJSON/layer/GeoJSONLayer2";
import data from "./line2.json";

import { CUA_yearAreaList, CUA_downloadGeojson, CUA_planPage } from "@/api/index";
import { guid } from "@/utils/index2";

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

      areaDetail: null,

      a_pageNum: 1,
      a_pageSize: 10,
      a_total: 0,
      a_list: [],

      showAddAnalysis: false,
      addAnalysisSpet: 1,
      addAnalysisFormTitle: "",
      addAnalysisForm: {
        value1: 0,
        value2: "",
      },
    };
  },
  created() {
    this._GeoJSONLayer = new GeoJSONLayer({
      lineAutoWidth: 2,
    });
    parserGeoJSON(JSON.stringify(data)).then((res) => {
      this._GeoJSONLayer.setGeoJsonData(res);
    });
    this.getList();
  },
  mounted() {},
  beforeDestroy() {
    // this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleChangeYear() {
      this.handleInitAnalysis();
      this.getList();
    },
    getList() {
      CUA_yearAreaList({
        year: this.year,
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        status: 2,
      }).then((res) => {
        res.records.forEach((v) => {
          v.m_id = guid();
        });
        this.list = res.records;
        this.total = res.total;
      });
    },
    handleSelectionChange(selection, row) {
      this.$refs.table.clearSelection();
      if (this.areaDetail?.m_id != row.m_id) {
        this.$refs.table.toggleRowSelection(row, true);
        this.areaDetail = row;
        this.handleInitAnalysis();
        this.getAnalysisList(row);
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
    handleOpenAddAnalysis(row) {
      if (row) {
        this.addAnalysisSpet = 3;
      } else {
        this.addAnalysisSpet = 1;
      }
      this.showAddAnalysis = true;
    },
    handleCloseAddAnalysis() {
      this.showAddAnalysis = false;
    },

    handleEnable() {
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleDisable() {
      this._GeoJSONLayer.removeFromParent();
      this.handleCloseDetailForm();
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
