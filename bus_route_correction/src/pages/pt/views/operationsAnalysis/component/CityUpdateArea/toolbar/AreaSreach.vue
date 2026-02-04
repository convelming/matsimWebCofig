<!-- AreaSreach 相似片区搜索 -->
<template>
  <div class="AreaSreach">
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
    <el-button v-if="areaDetail && (areaDetail.status == 0 || areaDetail.status == 3)" class="block" type="primary" size="small" @click="handleSreachLikeList">{{ $l("搜索相似区域") }}</el-button>
    <template v-if="areaDetail && areaDetail.status == 2">
      <div class="title">{{ $l("搜索结果") }}</div>
      <el-button type="primary" size="small" @click="handleOpenDialog(areaParam)">{{ $l("点击查看区域详情") }}</el-button>
      <AutoSize class="flex-h">
        <template slot-scope="{ width, height }">
          <el-table class="small" :data="likeList" border :height="height">
            <el-table-column :label="$l('相似区域列表')" prop="name">
              <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
              <el-table-column :label="$l('相似度')" prop="name"> </el-table-column>
              <el-table-column width="50">
                <template slot-scope="{ row }">
                  <el-button type="text" size="small" icon="el-icon-view" @click="handleOpenDetailForm(row)"></el-button>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </template>
      </AutoSize>
    </template>
    <Dialog class="AreaSreach_Dialog" ref="dialog" title="" hideMinimize :visible.sync="showDialog" @close="handleCloseDialog" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box" v-if="dialogDetail">
        <div class="AreaSreach_form">
          <div class="title">总体情况</div>
          <AreaFromItem :label="$l('总开发强度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总出行产生量')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("出行结构") }}</div>
          <AreaFromItem :label="$l('小汽车')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('轨道交通')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('慢行')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('其他')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("业态开发强度") }}</div>
          <AreaFromItem :label="$l('住宅开发强度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('办公开发强度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('商业开发强度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('工业开发强度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("交通设施") }}</div>
          <AreaFromItem :label="$l('地铁站数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交首末站数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交中间站数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('主干路及以上长度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('次干路及以下长度')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("特殊地点") }}</div>
          <AreaFromItem :label="$l('医院数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('运动场数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('高中数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('大学数')" v-model="dialogDetail.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
        </div>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AreaFromItem from "../component/AreaFromItem.vue";
import { GeoJSONLayer, parserGeoJSON } from "../../GeoJSON/layer/GeoJSONLayer2";

import { CUA_yearAreaList, CUA_downloadGeojson, CUA_searchSimilarCUAArea } from "@/api/index";
import { guid } from "@/utils/index2";

function boldToText(bold) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.readAsText(res.data);
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve("");
  });
}

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
      dialogDetail: null,
    };
  },
  created() {
    this._GeoJSONLayer = new GeoJSONLayer({
      lineAutoWidth: 2,
    });
    // parserGeoJSON(JSON.stringify(data)).then((res) => {
    //   this._GeoJSONLayer.setGeoJsonData(res);
    // });
  },
  mounted() {},
  beforeDestroy() {
    // this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleChangeYear() {
      this.handleInitLike();
      this.getList();
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
    handleInitLike() {
      this.areaDetail = null;
      this.areaParam = null;
      this.likeList = [];
      this.showDialog = false;
      this.dialogDetail = {};
    },
    handleGetLike(row) {
      if (row.resultJsonPath) {
        // 获取相似区域列表
        CUA_downloadGeojson({
          path: row.resultJsonPath,
        })
          .then((res) => boldToText(res.data))
          .then((res) => parserGeoJSON(res))
          .then((res) => {
            console.log(res);
          });
      } else {
      }
    },
    handleSelectionChange(selection, row) {
      this.$refs.table.clearSelection();
      if (this.areaDetail?.m_id != row.m_id) {
        this.areaDetail = row;
        this.$refs.table.toggleRowSelection(row, true);
        this.handleInitLike();
        this.handleGetLike(this.areaDetail);
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
        });
      }
    },
    handleOpenDialog(row) {
      this.dialogDetail = row;
      this.showDetailForm = true;
    },
    handleCloseDialog() {
      this.showDetailForm = false;
    },
    handleEnable() {
      this.getList();
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleDisable() {
      this._GeoJSONLayer.removeFromParent();
      this.handleCloseDialog();
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
