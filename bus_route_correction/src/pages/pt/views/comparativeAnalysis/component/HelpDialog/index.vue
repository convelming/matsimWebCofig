<template>
  <el-dialog class="HelpDialog" :visible="s_visible" width="500px" append-to-body center @close="handleClose" :close-on-click-modal="false">
    <div class="body">
      <component v-show="carouselIndex == item" v-for="item in pageList" :key="item" :is="item"></component>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handleClose">关闭</el-button>
      <el-button v-if="carouselIndex != 0" size="mini" type="info" @click="carouselIndex--">上一步</el-button>
      <el-button v-if="carouselIndex < pageList.length - 1" size="mini" type="primary" @click="carouselIndex++">下一步</el-button>
    </div>
  </el-dialog>
</template>

<script>
import page1 from "../../../operationsAnalysis/component/HelpDialog/page1.vue";
import page2 from "../../../operationsAnalysis/component/HelpDialog/page2.vue";
import page3 from "../../../operationsAnalysis/component/HelpDialog/page3.vue";
import page4 from "../../../operationsAnalysis/component/HelpDialog/page4.vue";
import page5 from "../../../operationsAnalysis/component/HelpDialog/page5.vue";
import page6 from "../../../operationsAnalysis/component/HelpDialog/page6.vue";
import page7 from "../../../operationsAnalysis/component/HelpDialog/page7.vue";
import page8 from "../../../operationsAnalysis/component/HelpDialog/page8.vue";

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    page1,
    page2,
    page3,
    page4,
    page5,
    page6,
    page7,
    page8,
  },
  data() {
    return {
      s_visible: false,
      carouselIndex: 0,
      pageList: ["page7", "page8", "page1", "page2", "page3", "page4", "page5", "page6"],
    };
  },
  watch: {
    visible: {
      handler(val) {
        if (val !== this.s_visible) {
          this.s_visible = val;
          this.carouselIndex = 0;
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
    handleNext() {
      this.$refs.carousel.next();
    },
    handlePrev() {
      this.$refs.carousel.prev();
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
    color: var(--color-text-regular);
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
