<template>
  <Teleport to="body">
    <transition name="el-zoom-in-center">
      <div v-show="visible" class="MDialog" :class="class" :style="s_style" @click="toTop">
        <div class="dg_header" @mousedown="startMove">
          <img class="dg_icon" :src="icon" alt="" />
          <div class="dg_title_box">
            <div class="dg_title">{{ title }}</div>
            <div class="dg_sub_title">{{ subTitle }}</div>
          </div>
          <img
            v-show="!hideClose"
            src="@/assets/images/close.svg?url"
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

<script setup>
import icon from '@/assets/images/icon_computer@2x.png'
import { computed, nextTick, onMounted } from 'vue'

if (!window.MDialogData) {
  window.MDialogData = {
    zIndex: 1000,
  }
}

const emit = defineEmits(['close', 'update:visible', 'open'])
const props = defineProps({
  class: {
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
  x: {
    type: [Number, String],
    default: '20',
  },
  // 默认的左边距
  y: {
    type: [Number, String],
    default: '20',
  },
  placement: {
    type: String, // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    default: 'top-left',
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
})

const watchVisible = watch(
  () => props.visible,
  (val) => {
    if (val) {
      open()
    }
  },
)

const s_data = reactive({
  s_y: 0,
  s_x: 0,
  moveObj: {
    s_y: 0,
    s_x: 0,
    y: 0,
    x: 0,
  },
  s_zIndex: ++window.MDialogData.zIndex,
})

const s_style = computed(() => {
  let style = ''
  if (props.placement.includes('top')) {
    style += `top:calc(${s_data.s_y}px + ${s_data.moveObj.y || 0}px);`
  } else if (props.placement.includes('bottom')) {
    style += `bottom:calc(${s_data.s_y}px + ${s_data.moveObj.y || 0}px);`
  }
  if (props.placement.includes('left')) {
    style += `left:calc(${s_data.s_x}px + ${s_data.moveObj.x || 0}px);`
  } else if (props.placement.includes('right')) {
    style += `right:calc(${s_data.s_x}px + ${s_data.moveObj.x || 0}px);`
  }
  const width = Number(props.width)
  if (width === width) {
    style += `width:${width}px;`
  } else {
    style += `width:${props.width};`
  }
  style += `z-index:${s_data.s_zIndex};`
  return style
})

onMounted(() => {
  if (props.visible) {
    open()
  }
})

function startMove(event) {
  toTop()
  s_data.moveObj.s_y = event.pageY
  s_data.moveObj.s_x = event.pageX
  s_data.moveObj.y = 0
  s_data.moveObj.x = 0
  document.body.addEventListener('mousemove', moveing)
  document.body.addEventListener('mouseup', endMove)
  document.body.addEventListener('mouseleave', endMove)
}
function moveing(event) {
  if (props.placement.includes('top')) {
    s_data.moveObj.y = event.pageY - s_data.moveObj.s_y
  } else if (props.placement.includes('bottom')) {
    s_data.moveObj.y = s_data.moveObj.s_y - event.pageY
  }
  if (props.placement.includes('left')) {
    s_data.moveObj.x = event.pageX - s_data.moveObj.s_x
  } else if (props.placement.includes('right')) {
    s_data.moveObj.x = s_data.moveObj.s_x - event.pageX
  }
}

function endMove(event) {
  s_data.s_y += s_data.moveObj.y
  s_data.s_x += s_data.moveObj.x
  s_data.moveObj.s_y = 0
  s_data.moveObj.s_x = 0
  s_data.moveObj.y = 0
  s_data.moveObj.x = 0
  document.body.removeEventListener('mousemove', moveing)
  document.body.removeEventListener('mouseleave', endMove)
}
function open() {
  emit('update:visible', true)
  emit('open')
  nextTick(() => {
    toTop()
    s_data.s_y = parseFloat(props.y)
    s_data.s_x = parseFloat(props.x)
  })
}
function close() {
  emit('update:visible', false)
  emit('close')
}
function offset(y, x) {
  s_data.s_y += Number(y) || 0
  s_data.s_x = Number(x) || 0
}
function toTop() {
  if (s_data.s_zIndex < window.MDialogData.zIndex) s_data.s_zIndex = ++window.MDialogData.zIndex
}
</script>

<style lang="scss">
.MDialog {
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
    user-select: none;
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
    display: flex;
    flex-direction: column;
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
