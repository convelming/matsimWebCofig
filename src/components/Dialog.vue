<template>
  <transition name="el-zoom-in-center">
    <div v-show="visible" class="Dialog" :style="s_show ? s_style : s_style2">
      <div v-show="s_show" class="flex_box">
        <div class="header" @mousedown="startMove">
          <span class="title">{{ title }}</span>
          <span v-show="!hideMinimize" class="close_btn el-icon-minus" @click.stop="handleMinimize(false)"></span>
          <span v-show="!hideClose" class="close_btn el-icon-close" @click.stop="close" />
        </div>
        <div class="bodyer" :style="!title && hideClose && hideMinimize ? 'height:calc(100% - 20px)' : ''">
          <slot></slot>
        </div>
      </div>

      <span v-show="!s_show" class="close_btn">
        <span class="el-icon-full-screen" @click.stop="handleMinimize(true)"></span>
      </span>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    // 是否显示
    visible: {
      type: Boolean,
      default: false,
    },
    // 标题
    title: {
      type: String,
      default: "",
    },
    // 默认的上边距
    top: {
      type: [Number, String],
      default: "20",
    },
    // 默认的左边距
    left: {
      type: [Number, String],
      default: "20",
    },
    // 是否靠右
    keepRight: {
      type: Boolean,
      default: false,
    },
    // 开启靠右时默认的右边距
    right: {
      type: [Number, String],
      default: "20",
    },
    // 宽度
    width: {
      type: [Number, String],
      default: "auto",
    },
    // 是否隐藏关闭和最小化按钮
    hideClose: {
      type: Boolean,
    },
    hideMinimize: {
      type: Boolean,
    },
    // 开启调整大小功能，传入一个默认高度单位为px
    resize: {
      type: [Number, String],
      default: "",
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.open();
      }
    },
    rootEl(val) {},
  },
  data() {
    return {
      s_top: 0,
      s_left: 0,
      s_height: -1,
      s_show: true,
      moveObj: {
        s_top: 0,
        s_left: 0,
        top: 0,
        left: 0,
      },
      s_style2: "top: 20px; left: 20px; padding: 10px 15px;height: auto;",
    };
  },
  computed: {
    s_style() {
      let style = "";
      style += `top:calc(${this.s_top}px + ${this.moveObj.top || 0}px);`;
      style += `left:calc(${this.s_left}px + ${this.moveObj.left || 0}px);`;
      if (this.width == "auto") {
        style += `width:auto;`;
      } else {
        style += `width:${parseFloat(this.width)}px;`;
      }
      if (!!this.resize) {
        style += `resize:both;`;
      }
      return style;
    },
  },
  created() {},
  mounted() {
    if (this.visible) {
      this.open();
    }
    document.body.appendChild(this.$el);
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
  methods: {
    startMove(event) {
      this.moveObj = {
        s_top: event.pageY,
        s_left: event.pageX,
        top: 0,
        left: 0,
      };
      document.body.addEventListener("mousemove", this.moveing);
      document.body.addEventListener("mouseup", this.endMove);
      document.body.addEventListener("mouseleave", this.endMove);
    },
    moveing(event) {
      this.moveObj.top = event.pageY - this.moveObj.s_top;
      this.moveObj.left = event.pageX - this.moveObj.s_left;
    },
    endMove(event) {
      this.s_top += this.moveObj.top;
      this.s_left += this.moveObj.left;
      this.moveObj = {
        s_top: 0,
        s_left: 0,
        top: 0,
        left: 0,
      };
      document.body.removeEventListener("mousemove", this.moveing);
      document.body.removeEventListener("mouseleave", this.endMove);
    },
    open() {
      this.$emit("update:visible", true);
      this.$emit("open");
      this.$nextTick(() => {
        this.$el.style.height = this.resize;
        this.s_top = parseFloat(this.top);
        if (this.keepRight) {
          this.s_left = window.innerWidth - parseFloat(this.right) - parseFloat(this.$el.clientWidth);
        } else if (this.left == "center") {
          this.s_left = (window.innerWidth - parseFloat(this.$el.clientWidth)) / 2;
        } else {
          this.s_left = parseFloat(this.left);
        }
        if (!!this.resize) {
          this.$el.style.height = parseFloat(this.resize) + "px";
        }
      });
    },
    close() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
    handleMinimize(s_show) {
      this.s_show = s_show;
      if (!!this.resize) {
        if (s_show) {
          this.$nextTick(() => {
            this.$el.style.height = parseFloat(this.s_height) + "px";
          });
        } else {
          this.s_height = parseFloat(this.$el.style.height || this.resize);
        }
      }
    },
    offset(top, left) {
      console.log(this.s_top, this.s_left);
      this.s_top += Number(top) || 0;
      this.s_left += Number(left) || 0;
      console.log(this.s_top, this.s_left);
    },
  },
};
</script>

<style lang="scss" scoped>
.Dialog {
  position: fixed;
  z-index: 1000;
  background: #fff;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  .flex_box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .header {
    flex-shrink: 0;
    position: relative;
    padding: 20px 20px 0px 20px;
    line-height: 25px;
    user-select: none;
    cursor: move;
    display: flex;
  }
  .title {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .close_btn {
    flex-shrink: 0;
    line-height: 25px;
    height: 25px;
    font-size: 16px;
    color: #409eff;
    margin-left: auto;
    cursor: pointer;
    padding-left: 10px;
  }
  .bodyer {
    box-sizing: border-box;
    height: calc(100% - 45px);
    padding: 20px;
  }
}
</style>
