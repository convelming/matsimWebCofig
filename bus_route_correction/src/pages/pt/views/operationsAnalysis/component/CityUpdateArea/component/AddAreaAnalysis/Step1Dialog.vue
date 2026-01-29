<!-- Step1_Dialog -->
<template>
  <Dialog class="Step1_Dialog" ref="dialog" :title="$l('基本情况确认')" hideMinimize :visible="s_visible" @close="handleClose" keepRight right="330" top="100" width="450px">
    <div class="Step1_box">
      <el-scrollbar wrap-class="scroll_box ">
        <div class="scroll_body">
          <div class="title">{{ $l("总体情况") }}</div>
          <AreaFromItem :label="$l('方案名称')" v-model="s_value.value" class="item" input :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总开发强度')" v-model="s_value.value" class="item" inputNumber slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('总出行产生量')" v-model="s_value.value" class="item" inputNumber slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("出行结构") }}</div>
          <AreaFromItem :label="$l('小汽车')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('轨道交通')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('慢行')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('其他')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("业态开发强度") }}</div>
          <AreaFromItem :label="$l('住宅开发强度')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('办公开发强度')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('商业开发强度')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('工业开发强度')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("交通设施") }}</div>
          <AreaFromItem :label="$l('地铁站数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交首末站数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('公交中间站数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('主干路及以上长度')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('次干路及以下长度')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <div class="title">{{ $l("特殊地点") }}</div>
          <AreaFromItem :label="$l('医院数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('运动场数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('高中数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
          <AreaFromItem :label="$l('大学数')" v-model="s_value.value" class="item" checkBox slider :start="0" :end="100" :min="20" :max="80" :step="1" />
        </div>
      </el-scrollbar>
      <div class="btn_box">
        <el-button type="primary" size="small" @click="handleNext">{{ $l("下一步") }}</el-button>
        <el-button type="info" size="small" @click="handlePrev">{{ $l("取消") }}</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import AreaFromItem from "../AreaFromItem.vue";
export default {
  name: "Step1_Dialog",
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
      return this.visible;
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
      s_value: {},
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
  },
};
</script>

<style lang="scss" scoped>
.Step1_Dialog {
  height: calc(100vh - 130px);

  .Step1_box {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .el-scrollbar {
      flex: 1;
      height: 0;
    }
    ::v-deep .scroll_box {
      overflow-x: hidden;
      overflow-y: auto;
    }

    .scroll_body {
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

    .btn_box {
      display: flex;
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
