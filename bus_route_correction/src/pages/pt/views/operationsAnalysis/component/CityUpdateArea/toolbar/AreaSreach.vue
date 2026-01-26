<!-- AreaSreach 相似片区搜索 -->
<template>
  <div class="AreaSreach">
    <div class="sreach_box">
      <el-date-picker v-model="query.year" size="small" type="year" placeholder="选择年" value-format="yyyy" />
      <el-button type="primary" size="small" @click="">确认</el-button>
    </div>
    <AutoSize style="height: 20%">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" />
          <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
          <el-table-column width="50">
            <template>
              <el-button type="text" size="small" icon="el-icon-edit" @click=""></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>
    <div class="title">{{ $l("区域详情") }}</div>
    <el-descriptions class="margin-top" title="" :column="2" size="mini" border>
      <el-descriptions-item :label="$l('用户名')">kooriookami</el-descriptions-item>
      <el-descriptions-item :label="$l('手机号')"> 18100000000 </el-descriptions-item>
      <el-descriptions-item :label="$l('居住地')"> 苏州市 </el-descriptions-item>
      <el-descriptions-item :label="$l('学校')"> <el-tag size="small">学校</el-tag> </el-descriptions-item>
      <el-descriptions-item :label="$l('联系地址')"> 江苏省苏州市吴中区吴中大道 1188 号 </el-descriptions-item>
    </el-descriptions>
    <div class="title">{{ $l("相似区域列表") }}</div>
    <AutoSize class="flex-h">
      <template slot-scope="{ width, height }">
        <el-table class="small" :data="list" border :height="height">
          <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
          <el-table-column :label="$l('相似度')" prop="name"> </el-table-column>
          <el-table-column width="50">
            <template>
              <el-button type="text" size="small" icon="el-icon-view" @click=""></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </AutoSize>

    <Dialog class="AreaSreach_Dialog" ref="dialog" :title="$l('')" hideMinimize :visible="showDetailForm" @close="handleCloseDetailForm" keepRight right="330" top="100" width="450px">
      <div class="scroll_box">
        <div class="AreaSreach_form">
          <div class="item">
            <div class="row">
              <div class="text1"></div>
              <el-input-number v-model="detailForm.value" size="small" label="" :min="20" :max="80" :step="1" :controls="false" @change=""> </el-input-number>
            </div>
            <div class="row">
              <MySlider v-model="detailForm.value" :step="1"></MySlider>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import MySlider from "./MySlider.vue";
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

      showDetailForm: true,
      detailForm: {},
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
  },
};
</script>

<style lang="scss" scoped>
.AreaSreach {
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
}
.AreaSreach_Dialog {
  height: calc(100vh - 130px);
  .scroll_box {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
