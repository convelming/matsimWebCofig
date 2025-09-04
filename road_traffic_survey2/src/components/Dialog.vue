<template>
  <Teleport to="body">
    <transition name="el-zoom-in-center">
      <div v-show="visible" class="Dialog" :class="mClass" :style="s_style" @click="toTop">
        <div class="dg_header" @mousedown="startMove">
          <img class="dg_icon" :src="icon" alt="" />
          <div class="dg_title_box">
            <div class="dg_title">{{ title }}</div>
            <div class="dg_sub_title">{{ subTitle }}</div>
          </div>
          <img
            v-show="!hideClose"
            src="@/assets/images/close.svg"
            class="dg_close_btn"
            @click.stop="close"
          />
        </div>
        <div class="dg_bodyer">
          <slot></slot>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
let zIndex = 1000
import icon from '@/assets/images/icon_computer@2x.png'

export default {
  emits: ['close', 'update:visible', 'open'],
  props: {
    mClass: {
      type: String,
      default: '',
    },
    // 是否显示
    visible: {
      type: Boolean,
      default: false,
    },
    // icon
    icon: {
      default: icon,
    },
    // 标题
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    // 默认的上边距
    top: {
      type: [Number, String],
      default: '20',
    },
    // 默认的左边距
    left: {
      type: [Number, String],
      default: '20',
    },
    // 宽度
    width: {
      type: [Number, String],
      default: 'auto',
    },
    // 是否隐藏关闭和最小化按钮
    hideClose: {
      type: Boolean,
    },
    // 开启调整大小功能，传入一个默认高度 单位为px
    resize: {
      type: [Number, String],
      default: '',
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.open()
      }
    },
  },
  data() {
    return {
      s_top: 0,
      s_left: 0,
      moveObj: {
        s_top: 0,
        s_left: 0,
        top: 0,
        left: 0,
      },
      s_zIndex: ++zIndex,
    }
  },
  computed: {
    s_style() {
      let style = ''
      style += `top:calc(${this.s_top}px + ${this.moveObj.top || 0}px);`
      style += `left:calc(${this.s_left}px + ${this.moveObj.left || 0}px);`
      const width = Number(this.width)
      if (width === width) {
        style += `width:${width}px;`
      } else {
        style += `width:${this.width};`
      }
      style += `z-index:${this.s_zIndex};`
      return style
    },
  },
  created() {},
  mounted() {
    if (this.visible) {
      this.open()
    }
  },
  methods: {
    startMove(event) {
      this.toTop()
      this.moveObj = {
        s_top: event.pageY,
        s_left: event.pageX,
        top: 0,
        left: 0,
      }
      document.body.addEventListener('mousemove', this.moveing)
      document.body.addEventListener('mouseup', this.endMove)
      document.body.addEventListener('mouseleave', this.endMove)
    },
    moveing(event) {
      this.moveObj.top = event.pageY - this.moveObj.s_top
      this.moveObj.left = event.pageX - this.moveObj.s_left
    },
    endMove(event) {
      this.s_top += this.moveObj.top
      this.s_left += this.moveObj.left
      this.moveObj = {
        s_top: 0,
        s_left: 0,
        top: 0,
        left: 0,
      }
      document.body.removeEventListener('mousemove', this.moveing)
      document.body.removeEventListener('mouseleave', this.endMove)
    },
    open() {
      this.$emit('update:visible', true)
      this.$emit('open')
      this.$nextTick(() => {
        this.toTop()
        this.s_top = parseFloat(this.top)
        if (this.keepRight) {
          console.log(this.right, this.$el.clientWidth, window.innerWidth)
          this.s_left =
            window.innerWidth - parseFloat(this.right) - parseFloat(this.$el.clientWidth)
        } else if (this.left == 'center') {
          this.s_left = (window.innerWidth - parseFloat(this.$el.clientWidth)) / 2
        } else {
          this.s_left = parseFloat(this.left)
        }
      })
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    offset(top, left) {
      this.s_top += Number(top) || 0
      this.s_left += Number(left) || 0
    },
    toTop() {
      if (this.s_zIndex < zIndex) this.s_zIndex = ++zIndex
    },
  },
}
</script>

<style lang="scss" scoped>
.Dialog {
  position: fixed;
  z-index: 1000;
  background: #fff;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
  .dg_header {
    cursor: move;
    box-sizing: border-box;
    padding: 16px 16px 28px 16px;
    margin-bottom: -16px;
    background-image: url('@/assets/images/bg_line.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: left bottom;

    display: flex;
    align-items: center;
    gap: 8px;
    .dg_icon {
      width: 56px;
      height: 56px;
      display: block;
    }
    .dg_title {
      font-weight: 700;
      font-size: 20px;
      color: #333333;
    }
    .dg_sub_title {
      font-weight: 400;
      font-size: 14px;
      color: #666666;
    }
  }
  .dg_bodyer {
    border-radius: 16px;
    overflow: hidden;
    height: 0;
    flex: 1;
    position: relative;
    height: 100px;
    background: #fff;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  }
  .dg_close_btn {
    cursor: pointer;
    position: absolute;
    fill: #000;
    right: 16px;
    top: 16px;
    width: 20px;
    height: 20px;
  }
}
</style>
