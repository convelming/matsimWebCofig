<!-- AreaSreach 相似片区搜索 -->
<template>
  <div class="AreaSreach">
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
    <el-button class="block" type="primary" size="small" @click="">{{ $l("搜索相似区域") }}</el-button>
    <div class="title">{{ $l("搜索结果") }}</div>
    <el-button type="primary" size="small" @click="handleOpenDetailForm()">{{ $l("点击查看区域详情") }}</el-button>
    <AutoSize class="flex-h">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="list" border :height="height">
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

    <Dialog class="AreaSreach_Dialog" ref="dialog" :title="detailForm.name" hideMinimize :visible.sync="showDetailForm" @close="handleCloseDetailForm" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box">
        <div class="AreaSreach_form">
          <div class="title">总体情况</div>
          <AreaFromItem :label="$l('总开发强度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总出行产生量')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("出行结构") }}</div>
          <AreaFromItem :label="$l('小汽车')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('轨道交通')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('慢行')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('其他')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("业态开发强度") }}</div>
          <AreaFromItem :label="$l('住宅开发强度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('办公开发强度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('商业开发强度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('工业开发强度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("交通设施") }}</div>
          <AreaFromItem :label="$l('地铁站数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交首末站数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交中间站数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('主干路及以上长度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('次干路及以下长度')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("特殊地点") }}</div>
          <AreaFromItem :label="$l('医院数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('运动场数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('高中数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('大学数')" v-model="detailForm.value" class="item" disabled slider :start="0" :end="100" :min="20" :max="80" :step="1" />
        </div>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AreaFromItem from "../component/AreaFromItem.vue";
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

      showDetailForm: false,
      detailForm: {
        name: "区域1",
        value: 50,
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
    handleSelectionChange() {},
    handleOpenDetailForm(row) {
      this.showDetailForm = true;
    },
    handleCloseDetailForm() {
      this.showDetailForm = false;
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
