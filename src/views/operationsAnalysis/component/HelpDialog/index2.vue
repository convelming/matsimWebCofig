<template>
  <el-dialog class="HelpDialog" :visible="s_visible" width="500px" append-to-body center @close="handleClose" :close-on-click-modal="false">
    <div class="body">
      <div class="page1">
        <h2>{{ $l("MATSim模型的可视化") }}</h2>
        <el-image class="video" :src="img" :preview-src-list="[img]"> </el-image>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<language>
{
  "MATSim模型的可视化":{
    "zh-CN": "MATSim模型的可视化",
    "en-US": "MATSim visualizatin"
  },
}
</language>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      s_visible: false,
      img: require("@/assets/helpImages/opAndca/MATSimGZ.gif"),
    };
  },
  watch: {
    visible: {
      handler(val) {
        if (val !== this.s_visible) {
          this.s_visible = val;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleClose() {
      this.s_visible = false;
      this.$emit("update:visible", this.s_visible);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dialog__headerbtn {
    top: 10px;
    right: 10px;
  }
  .el-dialog__header {
    display: none;
  }
  .el-dialog__footer {
    padding: 10px;
  }

  .el-dialog__body {
    padding: 10px 10px 0 10px;
  }
  .el-carousel__item h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
    text-align: center;
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
