<template>
  <div class="HelpDialog">
    <div class="el-icon-question" @click.stop="open = true"></div>
    <el-dialog :visible.sync="open" width="500px" append-to-body center @close="handleClose" :close-on-click-modal="false">
      <div class="body">
        <component v-show="carouselIndex == item" v-for="item in pageNum" :key="item" :is="`page${item}`"></component>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="handleClose">关闭</el-button>
        <el-button v-if="carouselIndex != 1" size="mini" type="info" @click="carouselIndex--">上一步</el-button>
        <el-button v-if="carouselIndex < pageNum" size="mini" type="primary" @click="carouselIndex++">下一步</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import page1 from "./page1.vue";
import page2 from "./page2.vue";
import page3 from "./page3.vue";
import page4 from "./page4.vue";
import page5 from "./page5.vue";
import page6 from "./page6.vue";

export default {
  components: {
    page1,
    page2,
    page3,
    page4,
    page5,
    page6,
  },
  data() {
    return {
      // open: !localStorage.getItem("HelpDialogClose"),
      open: false,
      carouselIndex: 1,
      pageNum: 6,
    };
  },
  watch: {
    open(val) {
      if (val) {
        this.carouselIndex = 1;
      }
    },
  },
  methods: {
    handleClose() {
      this.open = false;
      // localStorage.setItem("HelpDialogClose", true);
    },
    handleNext() {
      this.$refs.carousel.next();
    },
    handlePrev() {
      this.$refs.carousel.prev();
    },
    changeLanguage(lan) {
      this.$setLanguage(lan);
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

  // .el-carousel__item:nth-child(2n) {
  //   background-color: #99a9bf;
  // }

  // .el-carousel__item:nth-child(2n + 1) {
  //   background-color: #d3dce6;
  // }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.HelpDialog {
  .el-icon-question {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
