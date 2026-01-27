<!-- AreaAnalysis 片区承载力分析 -->
<template>
  <div class="AreaAnalysis">
    <div class="sreach_box">
      <el-date-picker v-model="query.year" size="small" type="year" :placeholder="$l('选择年')" value-format="yyyy" />
      <el-button type="primary" size="small" @click="">{{ $l("搜索") }}</el-button>
    </div>
    <template v-if="!qrDetail">
      <AutoSize style="height: 20%">
        <template slot-scope="{ width, height }">
          <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="40" />
            <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
            <el-table-column :label="$l('状态')" prop="name">
              <div slot-scope="{ row, $index }" class="tag-list">
                <el-tag v-if="$index / 2 == 0" size="small" effect="dark">{{ $l("已搜索相似区域") }}</el-tag>
                <el-tag v-if="$index / 2 == 0" size="small" effect="dark">{{ $l("已确认基本情况") }}</el-tag>
                <el-tag v-if="$index / 2 == 1" size="small" effect="dark" type="warning">{{ $l("未搜索相似区域") }}</el-tag>
                <el-tag v-if="$index / 2 == 1" size="small" effect="dark" type="warning">{{ $l("未确认基本情况") }}</el-tag>
              </div>
            </el-table-column>
          </el-table>
        </template>
      </AutoSize>
      <div class="btn_box">
        <el-button type="primary" size="small" @click="qrDetail = true">{{ $l("确认") }}</el-button>
        <!-- <el-button type="info" size="small" @click="">取消</el-button> -->
      </div>
    </template>
    <template v-else>
      <div class="title">{{ $l("区域详情") }}</div>
      <el-descriptions class="margin-top" title="" :column="2" size="mini" border>
        <el-descriptions-item :label="$l('用户名')">kooriookami</el-descriptions-item>
        <el-descriptions-item :label="$l('手机号')"> 18100000000 </el-descriptions-item>
        <el-descriptions-item :label="$l('居住地')"> 苏州市 </el-descriptions-item>
        <el-descriptions-item :label="$l('学校')"> <el-tag size="small">学校</el-tag> </el-descriptions-item>
        <el-descriptions-item :label="$l('联系地址')"> 江苏省苏州市吴中区吴中大道 1188 号 </el-descriptions-item>
      </el-descriptions>
      <div class="btn_box">
        <el-button type="primary" size="small" @click="showDetailForm = true">{{ $l("基本情况确认") }}</el-button>
      </div>
      <div class="btn_box">
        <el-button type="primary" size="small" @click="qrDetail = true">{{ $l("选择限制路段") }}</el-button>
      </div>
      <div class="btn_box">
        <el-button type="primary" size="small" @click="qrDetail = true">{{ $l("搜索最优方案") }}</el-button>
      </div>
    </template>

    <Dialog class="AreaAnalysis_Dialog" ref="dialog" :title="detailForm.name" hideMinimize :visible.sync="showDetailForm" @close="handleCloseDetailForm" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box">
        <div class="AreaAnalysis_form">
          <div class="title">总体情况</div>
          <AreaFromItem :label="$l('总开发强度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总出行产生量')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("出行结构") }}</div>
          <AreaFromItem :label="$l('小汽车')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('轨道交通')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('慢行')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('其他')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("业态开发强度") }}</div>
          <AreaFromItem :label="$l('住宅开发强度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('办公开发强度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('商业开发强度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('工业开发强度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("交通设施") }}</div>
          <AreaFromItem :label="$l('地铁站数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交首末站数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交中间站数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('主干路及以上长度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('次干路及以下长度')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("特殊地点") }}</div>
          <AreaFromItem :label="$l('医院数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('运动场数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('高中数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('大学数')" v-model="detailForm.value" class="item" disabled :start="0" :end="100" :min="20" :max="80" :step="1" />
        </div>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import MySlider from "../component/MySlider.vue";
import AreaFromItem from "../component/AreaFromItem.vue";
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

      qrDetail: false,

      showDetailForm: false,
      detailForm: {
        name: "区域1",
        value: 50,
      },
    };
  },
  created() {},
  mounted() {},
  befforDestroy() {
    // this._PolygonSelectLayer.dispose();
  },
  methods: {
    handleEnable() {},
    handleDisable() {},
    handleSelectionChange() {},
    handleCloseDetailForm() {},
  },
};
</script>

<style lang="scss" scoped>
.AreaAnalysis {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  .sreach_box {
    display: flex;
    gap: 10px;
    .el-select {
      width: 100%;
    }
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .el-tag {
      color: var(--color-white);
    }
  }
  .btn_box {
    display: flex;
    .el-button {
      flex: 1;
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
  }
}
</style>
