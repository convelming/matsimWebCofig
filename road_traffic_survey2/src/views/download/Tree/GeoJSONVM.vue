<template>
  <Teleport to="body">
    <transition name="el-zoom-in-center">
      <div v-show="visible" class="GeoJSONDialog" :class="class" :style="s_style" @click="toTop">
        <!-- 图例弹窗的头部 -->
        <div class="dg_header" @mousedown="startMove">
          <div class="dg_title_box">
            <div class="dg_sub_title">{{ title }}&nbsp;</div>
          </div>
          <img src="@/assets/images/close.svg?url" class="dg_close_btn" @click.stop="close" />
        </div>
        <div class="dg_bodyer">
          <div class="item" v-for="value in list">
            <div class="color" :style="{ background: value.color }"></div>
            <div class="text" v-if="type == 'Number'">{{ `${value.min} ~ ${value.max}` }}</div>
            <div class="text" v-if="type == 'String'">{{ value.label }}</div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import icon from '@/assets/images/icon_computer@2x.png'
import { computed, nextTick, onMounted } from 'vue'

if (!window.GeoJSONDialogData) {
  window.GeoJSONDialogData = {
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
  // 标题
  title: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  // 默认的上边距
  bottom: {
    type: [Number, String],
    default: '20',
  },
  // 默认的左边距
  right: {
    type: [Number, String],
    default: '20',
  },
  list: {
    type: Array,
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
  s_top: 0,
  s_left: 0,
  moveObj: {
    s_top: 0,
    s_left: 0,
    top: 0,
    left: 0,
  },
  s_zIndex: ++window.GeoJSONDialogData.zIndex,
})

const s_style = computed(() => {
  let style = ''
  style += `bottom:calc(${s_data.s_top}px + ${s_data.moveObj.top || 0}px);`
  style += `right:calc(${s_data.s_left}px + ${s_data.moveObj.left || 0}px);`
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
  s_data.moveObj.s_top = event.pageY
  s_data.moveObj.s_left = event.pageX
  s_data.moveObj.top = 0
  s_data.moveObj.left = 0
  document.body.addEventListener('mousemove', moveing)
  document.body.addEventListener('mouseup', endMove)
  document.body.addEventListener('mouseleave', endMove)
}
function moveing(event) {
  s_data.moveObj.top = -(event.pageY - s_data.moveObj.s_top)
  s_data.moveObj.left = -(event.pageX - s_data.moveObj.s_left)
}

function endMove(event) {
  s_data.s_top += s_data.moveObj.top
  s_data.s_left += s_data.moveObj.left
  s_data.moveObj.s_top = 0
  s_data.moveObj.s_left = 0
  s_data.moveObj.top = 0
  s_data.moveObj.left = 0
  document.body.removeEventListener('mousemove', moveing)
  document.body.removeEventListener('mouseleave', endMove)
}
function open() {
  emit('update:visible', true)
  emit('open')
  nextTick(() => {
    toTop()
    s_data.s_top = parseFloat(props.bottom)
    s_data.s_left = parseFloat(props.right)
  })
}
function close() {
  emit('update:visible', false)
  emit('close')
}
function offset(top, left) {
  s_data.s_top += Number(top) || 0
  s_data.s_left += Number(left) || 0
}
function toTop() {
  if (s_data.s_zIndex < window.GeoJSONDialogData.zIndex)
    s_data.s_zIndex = ++window.GeoJSONDialogData.zIndex
}
</script>

<style lang="scss">
.GeoJSONDialog {
  min-width: 200px;
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
    .dg_sub_title {
      font-weight: 700;
      font-size: 14px;
      color: #333333;
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
    background: #fff;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    padding: 20px;
    gap: 10px;
    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      .color {
        border: 1px solid rgba(0, 0, 0, 1);
        width: 30px;
        height: 15px;
        border-radius: 3px;
      }
      .text {
        font-size: 14px;
        color: #333333;
      }
    }
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
