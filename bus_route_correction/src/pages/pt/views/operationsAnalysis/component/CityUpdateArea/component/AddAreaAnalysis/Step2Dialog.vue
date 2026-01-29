<!-- Step2Dialog -->
<template>
  <div class="Step2Dialog">
    <Dialog class="Step2_Dialog" ref="dialog" :title="$l('限制路段确认')" hideMinimize :visible="s_visible" @close="handleClose" keepRight right="330" top="100" width="450px">
      <div class="Step2_box">
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleOpenAddLine()">{{ $l("添加限制路段") }}</el-button>
        </div>
        <AutoSize style="height: 400px">
          <template slot-scope="{ width, height }">
            <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="40" />
              <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
              <el-table-column :label="$l('操作')" width="90">
                <div slot-scope="{ row, $index }" class="cz_btn">
                  <!-- <el-button type="text" size="small" icon="el-icon-view" @click=""></el-button> -->
                  <el-button type="text" size="small" icon="el-icon-edit" @click="handleOpenAddLine(row)"></el-button>
                  <el-button type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger)" @click=""></el-button>
                </div>
              </el-table-column>
            </el-table>
          </template>
        </AutoSize>
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleNext">{{ $l("下一步") }}</el-button>
          <el-button type="info" size="small" @click="handlePrev">{{ $l("上一步") }}</el-button>
        </div>
      </div>
    </Dialog>
    <Dialog class="Step2_AddLine_Dialog" ref="dialog" :title="$l('添加限制路段')" hideMinimize :visible.sync="showAddLine" @close="handleCloseAddLine" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box">
        <el-form :model="addLineForm" ref="addLineForm" :rules="addLineRules" label-width="120px" :inline="false" size="small">
          <el-form-item :label="$l('选择路段')"> </el-form-item>
          <el-form-item :label="$l('LOS限制值')">
            <el-input-number v-model="addLineForm.value1" :controls="true" controls-position="both" />
          </el-form-item>
          <el-form-item :label="$l('LOS限制时段')">
            <el-input v-model="addLineForm.value2" placeholder="" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="">{{ $l("确定") }}</el-button>
            <el-button @click="handleCloseAddLine">{{ $l("取消") }}</el-button>
          </el-form-item>
        </el-form>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import AreaFromItem from "../AreaFromItem.vue";
export default {
  name: "Step2Dialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  components: {
    AreaFromItem,
  },
  computed: {
    s_visible() {
      return this.visible && !this.showAddLine;
    },
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.s_value = JSON.parse(JSON.stringify(this.value));
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      list: [],
      showAddLine: false,
      s_value: {},
      addLineForm: {},
      addLineRules: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleNext() {
      this.$emit("update:value", this.s_value);
      this.$emit("next");
    },
    handlePrev() {
      this.$emit("prev");
    },
    handleSelectionChange() {},
    handleOpenAddLine(row) {
      this.showAddLine = true;
    },
    handleCloseAddLine() {
      this.showAddLine = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.Step2_Dialog {
  .el-scrollbar {
    height: 100%;
  }
  ::v-deep .scroll_box {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .Step2_box {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
.Step2_AddLine_Dialog {
}
</style>
