<template>
  <div class="HelpDialog">
    <div class="_flex">
      <div class="el-icon-question" @click="open = true"></div>
      <a class="bug" href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=f2oofj" target="_blank">BUG</a>
      <el-dropdown class="language" @command="changeLanguage" placement="top-start" trigger="click">
        <img src="@/assets/image/locale.svg" style="width: 100%; height: 100%" />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
          <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item>
          <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog :visible.sync="open" width="500px" append-to-body center @close="handleClose" :close-on-click-modal="false">
      <div class="body">
        <!-- <component v-show="carouselIndex == item" v-for="item in pageNum" :key="item" :is="`page${item}`"></component> -->
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
      open: !localStorage.getItem("HelpDialogClose"),
      carouselIndex: 1,
      pageNum: 5,
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
      localStorage.setItem("HelpDialogClose", true);
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
  ._flex {
    display: flex;
    align-items: center;
  }
  .el-icon-question {
    color: #409eff;
    font-size: 40px;
    cursor: pointer;
  }
  .bug {
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    border-radius: 50%;
    background-color: #f56c6c;
    color: #fff;
    font-weight: bold;
    text-align: center;
    line-height: 40px;
    font-size: 12px;
    text-decoration: none;
    display: block;
  }
  .language {
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin-left: 20px;
    border-radius: 50%;
    background-color: #e6a23c;
    color: #fff;
    display: block;
    padding: 5px;
    box-sizing: border-box;
    cursor: pointer;
  }
}
</style>
