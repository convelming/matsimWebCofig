<template>
  <div class="box">
    <div class="top">
      <Luopan class="Luopan"></Luopan>
      <Bug v-show="showFun" href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=f2oofj"></Bug>
      <MapStyle v-show="showFun"></MapStyle>
      <Help v-show="showFun"></Help>
      <Language v-show="showFun"></Language>
      <div class="time" :style="{ background: showFun ? '#E5E5E5' : '' }" @click="showFun = !showFun">
        {{ getTime }}
      </div>
    </div>
    <div v-show="showFun" class="bottom">
      <slot name="bottom"></slot>
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
import Luopan from "./Luopan.vue";
import Bug from "./Bug.vue";
import MapStyle from "./MapStyle.vue";
import Help from "./Help.vue";
import Language from "./Language.vue";

export default {
  props: {
    time: Number,
  },
  components: {
    Luopan,
    Bug,
    MapStyle,
    Help,
    Language,
  },
  data() {
    return {
      // open: !localStorage.getItem("HelpDialogClose"),
      open: false,
      carouselIndex: 1,
      pageNum: 5,
      showFun: false,
    };
  },
  computed: {
    getTime() {
      console.log(this.time);
      return this.formatTime(Math.ceil(this.time));
    },
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
    formatTime(seconds) {
      // 计算小时数
      const hours = Math.floor(seconds / 3600);
      // 计算剩余的分钟数
      const minutes = Math.floor((seconds % 3600) / 60);
      // 计算剩余的秒数
      const remainingSeconds = seconds % 60;

      // 将小时、分钟和秒数转换为两位数的字符串
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

      // 返回格式化后的字符串
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    },
  },
};
</script>
<style lang="scss" scoped>
.box {
  padding: 12px;
  background: #ffffff;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;

  .top {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 32px;

    .time {
      cursor: pointer;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      height: 100%;
      display: flex;
      align-items: center;
      font-family: wending;
      padding: 0 4px;
    }
  }
}
</style>
