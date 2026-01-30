<!-- AreaAnalysis 片区承载力分析 -->
<template>
  <div class="AreaAnalysis">
    <el-date-picker class="block" v-model="query.year" size="small" type="year" :placeholder="$l('选择年')" value-format="yyyy" />
    <AutoSize style="height: 20%">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" />
          <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
          <el-table-column :label="$l('状态')" prop="name" width="75">
            <div slot-scope="{ row, $index }" class="tag-list">
              <el-tag v-if="$index / 2 == 0" size="small" effect="dark">{{ $l("已搜索") }}</el-tag>
              <el-tag v-else size="small" effect="dark" type="warning">{{ $l("未搜索") }}</el-tag>
            </div>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>
    <div class="title">{{ $l("方案列表") }}</div>
    <el-button class="block" type="primary" size="small" @click="handleOpenAddAnalysis()">{{ $l("添加方案") }}</el-button>
    <AutoSize class="flex-h">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
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
    <AddAreaAnalysis :visible.sync="showAddAnalysis" :step="addAnalysisSpet" />
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AddAreaAnalysis from "../component/AddAreaAnalysis/index.vue";
import { GeoJSONLayer, parserGeoJSON } from "../../GeoJSON/layer/GeoJSONLayer2";
import data from "./line2.json";

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
      query: {
        year: new Date().getFullYear().toString(),
      },
      list: [
        {
          name: "区域1",
        },
        {
          name: "区域2",
        },
        {
          name: "区域3",
        },
      ],
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
  },
  mounted() {},
  beforeDestroy() {
    // this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleEnable() {
      this._Map.addLayer(this._GeoJSONLayer);
    },
    handleDisable() {
      this._GeoJSONLayer.removeFromParent();
      this.handleCloseDetailForm();
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
    handleSelectionChange() {},
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
