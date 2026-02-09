<!-- AreaSreach 相似片区搜索 -->
<template>
  <div class="AreaSreach">
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
    <el-button v-if="!!areaDetail && (areaDetail.status == 0 || areaDetail.status == 3)" class="block" type="primary" size="small" @click="handleSreachLikeList">{{ $l("搜索相似区域") }}</el-button>
    <template v-if="!!areaDetail && areaDetail.status == 2">
      <div class="flex-box">
        <div class="title block">{{ $l("搜索结果") }}</div>
        <el-button type="primary" size="small" @click="handleRefreshLike()" icon="el-icon-refresh-right"></el-button>
      </div>
      <el-button type="primary" size="small" @click="handleOpenDialog('区域详情', areaParam)">{{ $l("点击查看区域详情") }}</el-button>
      <AutoSize class="flex-h">
        <template slot-scope="{ width, height }">
          <el-table class="small" :data="likeList" border :height="height">
            <el-table-column :label="$l('相似区域列表')" prop="name">
              <el-table-column :label="$l('名称')" prop="m_name"> </el-table-column>
              <el-table-column :label="$l('相似度')" prop="p_like"> </el-table-column>
              <el-table-column width="50">
                <template slot-scope="{ row }">
                  <el-button type="text" size="small" icon="el-icon-view" @click="handleOpenDialog(`相似区域详情：${row.m_name}`, row.param)"></el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </template>
      </AutoSize>
    </template>
    <Dialog class="AreaSreach_Dialog" ref="dialog" :title="dialogTitle" hideMinimize :visible.sync="showDialog" @close="handleCloseDialog" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box" v-if="dialogDetail">
        <div class="AreaSreach_form">
          <template v-for="item in dialogDetail">
            <div class="title" v-if="item.type == 'title'">{{ $l(item.label) }}</div>
            <AreaFromItem v-if="item.type == 'item'" :label="$l(item.label)" v-bind="item" />
          </template>
        </div>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AreaFromItem from "../component/AreaFromItem.vue";
import { GeoJSONLayer, parserGeoJSON, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer2";

import { CUA_yearAreaList, CUA_downloadGeojson, CUA_searchSimilarCUAArea, CUA_roadGeoJSONByYear } from "@/api/index";
import { guid, boldToText } from "@/utils/index2";

const dialogList = [
  { type: "title", label: "总体情况" },
  { type: "item", label: "总开发强度", key: "总开发强度", start: 0, end: -1, step: 0.001 },
  { type: "item", label: "平均容积率", key: "平均容积率", start: 0, end: -1, step: 0.001 },
  { type: "title", label: "出行结构" },
  { type: "item", label: "小汽车占比", key: "小汽车占比", start: 0, end: 1, step: 0.001 },
  { type: "item", label: "轨道交通占比", key: "轨道交通占比", start: 0, end: 1, step: 0.001 },
  { type: "item", label: "公交占比", key: "公交占比", start: 0, end: 1, step: 0.001 },
  { type: "item", label: "慢行占比", key: "慢行占比", start: 0, end: 1, step: 0.001 },
  { type: "title", label: "业态开发强度" },
  { type: "item", label: "居住开发强度", key: "居住开发强度", start: 0, end: -1, step: 0.001 },
  { type: "item", label: "办公开发强度", key: "办公开发强度", start: 0, end: -1, step: 0.001 },
  { type: "item", label: "商业开发强度", key: "商业开发强度", start: 0, end: -1, step: 0.001 },
  { type: "item", label: "工业开发强度", key: "工业开发强度", start: 0, end: -1, step: 0.001 },
  { type: "title", label: "交通设施" },
  { type: "item", label: "地铁站点数", key: "地铁站点数", start: 0, end: -1 },
  { type: "item", label: "公交站点数", key: "公交站点数", start: 0, end: -1, step: 1 },
  { type: "item", label: "主干路及以上长度", key: "主干路及以上长度", start: 0, end: -1, step: 1 },
  { type: "item", label: "次干路及以下长度", key: "次干路及以下长度", start: 0, end: -1, step: 1 },
  { type: "title", label: "特殊地点" },
  { type: "item", label: "医疗设施数", key: "医疗设施数", start: 0, end: -1, step: 1 },
  { type: "item", label: "教育设施数", key: "教育设施数", start: 0, end: -1, step: 1 },
  { type: "item", label: "文化设施数", key: "文化设施数", start: 0, end: -1, step: 1 },
  { type: "item", label: "政府设施数", key: "政府设施数", start: 0, end: -1, step: 1 },
];

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
    AreaFromItem,
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
          }, 200);
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
      areaParam: null,
      likeList: [],

      showDialog: false,
      dialogTitle: "",
      dialogDetail: null,
    };
  },
  created() {
    this._GeoJSONLayer_road = new GeoJSONLayer({
      lineAutoWidth: 1,
    });
    this._GeoJSONLayer_like = new GeoJSONLayer({
      polygonBorderAutoWidth: 0.5,
    });
  },
  mounted() {},
  beforeDestroy() {
    this._GeoJSONLayer_road.dispose();
    this._GeoJSONLayer_like.dispose();
  },
  methods: {
    handleChangeYear() {
      this.handleInitLike();
      this.getList();
      CUA_roadGeoJSONByYear(this.year)
        .then((res) => {
          console.log(res);
          return res;
        })
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
    handleRefreshLike() {
      this.handleGetLike();
    },
    getList() {
      return CUA_yearAreaList({
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
    handleInitLike() {
      this._GeoJSONLayer_like.clearScene();
      this.areaDetail = null;
      this.areaParam = null;
      this.likeList = [];
      this.showDialog = false;
      this.dialogTitle = "";
      this.dialogDetail = null;
    },
    handleGetLike() {
      const row = this.areaDetail;
      if (row.resultJsonPath) {
        // 获取相似区域列表
        CUA_downloadGeojson({
          path: row.resultJsonPath,
        })
          .then((res) => boldToText(res.data))
          .then((res) => parserGeoJSON(res))
          .then((res) => {
            console.log(res.propertiesLabels);

            const areaParam = JSON.parse(JSON.stringify(dialogList));
            areaParam.forEach((item) => {
              const prop = res.propertiesLabels[item.key];
              if (prop && item.type == "item") {
                const list = prop.values.slice(1);
                item.min = Number(Math.min(...list).toFixed(4));
                item.max = Number(Math.max(...list).toFixed(4));
                item.value = Number(Number(list.reduce((a, b) => a + b, 0) / list.length).toFixed(4));
                if (item.end == -1) {
                  item.end = Math.ceil(item.max * 1.5);
                }
                item.disabled = true;
                item.slider = true;
                item.input = false;
                item.inputNumber = false;
              }
            });
            this.areaParam = areaParam;

            this.likeList = res.propertiesList.slice(1).map((v, i) => {
              const index = i + 1;
              const { br, tl } = res.geomList[index];
              const param = JSON.parse(JSON.stringify(dialogList));
              param.forEach((item) => {
                if (item.type == "item") {
                  const prop = res.propertiesLabels[item.key];
                  if (prop) {
                    const list = prop.values.slice(1);
                    item.min = Number(Math.min(...list).toFixed(4));
                    item.max = Number(Math.max(...list).toFixed(4));
                    if (item.end == -1) {
                      item.end = Math.ceil(item.max * 1.5);
                    }
                  }

                  item.value = Number(Number(v[item.key]).toFixed(4));
                  item.disabled = true;
                  item.slider = true;
                  item.input = false;
                  item.inputNumber = false;
                }
              });
              const item = {
                m_name: `区域${index}`,
                p_like: Number(v["相似度"] * 100).toFixed(2) + "%",
                center: [(tl.x + br.x) / 2, (tl.y + br.y) / 2],
                param: param,
              };
              return item;
            });
            this._GeoJSONLayer_like.setGeoJsonData(res);
          });
      } else {
      }
    },
    handleSelectionChange(selection, row) {
      const oldArea = this.areaDetail;

      this.handleInitLike();
      this.$refs.table.clearSelection();

      if (oldArea?.m_id != row.m_id) {
        this.$refs.table.toggleRowSelection(row, true);
        this.areaDetail = row;
        this.handleGetLike();
      } else {
        this.handleInitLike();
      }
    },
    handleSreachLikeList() {
      if (this.areaDetail) {
        CUA_searchSimilarCUAArea({
          year: this.year,
          areaId: this.areaDetail.areaId,
        }).then((res) => {
          this.likeList = res;
          this.getList();
          this.handleInitLike();
        });
      }
    },
    handleOpenDialog(title, row) {
      this.dialogTitle = title;
      this.dialogDetail = row;
      this.showDialog = true;
    },
    handleCloseDialog() {
      this.showDialog = false;
    },
    handleEnable() {
      this.handleChangeYear();
      this._Map.addLayer(this._GeoJSONLayer_road);
      this._Map.addLayer(this._GeoJSONLayer_like);
    },
    handleDisable() {
      this._GeoJSONLayer_road.removeFromParent();
      this._GeoJSONLayer_like.removeFromParent();
      this.handleInitLike();
      this.$refs.table.clearSelection();
    },
  },
};
</script>

<style lang="scss" scoped>
.AreaSreach {
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

  .title_box {
    display: flex;
    align-items: center;
    .title {
      flex: 1;
    }
  }

  ::v-deep th.el-table-column--selection .el-checkbox {
    display: none;
  }
}
.AreaSreach_Dialog {
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
  .AreaSreach_form {
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
}
</style>
