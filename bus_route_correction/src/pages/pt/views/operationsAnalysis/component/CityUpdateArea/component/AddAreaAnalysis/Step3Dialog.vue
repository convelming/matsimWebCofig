<!-- Step3Dialog -->
<template>
  <div>
    <Dialog class="Step3_Dialog" ref="dialog" :title="$l('方案结果')" hideMinimize :visible="s_visible" @close="handleClose" keepRight right="330" top="100" width="450px">
      <div class="Step3_box">
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleOpenAddLineForm()">{{ $l("方案调整") }}</el-button>
        </div>
        <AutoSize style="height: 400px">
          <template slot-scope="{ width, height }">
            <el-table class="small" :data="list" border :height="height" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="40" />
              <el-table-column :label="$l('名称')" prop="name"> </el-table-column>
              <el-table-column :label="$l('操作')" width="90">
                <div slot-scope="{ row, $index }" class="cz_btn">
                  <!-- <el-button type="text" size="small" icon="el-icon-view" @click=""></el-button> -->
                  <el-button type="text" size="small" icon="el-icon-edit" @click="handleOpenAddLineForm(row)"></el-button>
                  <el-button type="text" size="small" icon="el-icon-delete" style="color: var(--color-danger)" @click=""></el-button>
                </div>
              </el-table-column>
            </el-table>
          </template>
        </AutoSize>
        <div class="btn_box">
          <el-button type="primary" size="small" @click="handleNext">{{ $l("搜索最优方案") }}</el-button>
          <el-button type="info" size="small" @click="handlePrev">{{ $l("上一步") }}</el-button>
        </div>
      </div>
    </Dialog>
    <Dialog class="Step3_Adjust_Dialog" ref="dialog" :title="$l('方案调整')" hideMinimize :visible.sync="showAdjust" @close="handleCloseAdjust" keepRight right="330" top="100" width="450px">
      <el-scrollbar wrap-class="scroll_box ">
        <div class="Step3_Adjust_box">
          <div class="title">{{ $l("总体情况") }}</div>
          <AreaFromItem :label="$l('方案名称')" v-model="adjustForm.value" class="item" input :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总开发强度')" v-model="adjustForm.value" class="item" inputNumber slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总出行产生量')" v-model="adjustForm.value" class="item" inputNumber slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("出行结构") }}</div>
          <AreaFromItem :label="$l('小汽车')" v-model="adjustForm.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('轨道交通')" v-model="adjustForm.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('慢行')" v-model="adjustForm.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('其他')" v-model="adjustForm.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="btn_box">
            <el-button type="primary" size="small" @click="handleCloseAdjust">{{ $l("确认") }}</el-button>
            <el-button type="info" size="small" @click="handleCloseAdjust">{{ $l("取消") }}</el-button>
          </div>
        </div>
      </el-scrollbar>
    </Dialog>
  </div>
</template>

<script>
import AreaFromItem from "../AreaFromItem.vue";
export default {
  name: "Step3Dialog",
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
  components: { AreaFromItem },
  computed: {
    s_visible() {
      return this.visible && !this.showAdjust;
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
      showAdjust: false,
      s_value: {},
      adjustForm: {},
      list: [],
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
    handleCloseAdjust() {},
  },
};
</script>

<style lang="scss" scoped>
.Step3_Dialog {
}
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
.Step3_Adjust_Dialog {
  .el-scrollbar {
    height: 100%;
  }
  ::v-deep .scroll_box {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .Step3_Adjust_box {
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
</style>
