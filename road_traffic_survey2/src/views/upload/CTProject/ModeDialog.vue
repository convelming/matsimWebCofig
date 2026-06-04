<!-- ModeDialog -->
<template>
  <MDialog
    title="项目名称"
    class="CTPModeDialog"
    :y="80"
    :x="80"
    width="500px"
    hideMinimize
    :visible="visible"
    @close="handleClose"
  >
    <div class="ctp_mode_bodyer">
      <el-form label-width="70px" :inline="false" size="mini">
        <el-form-item label="">
          <!-- 输入模式直接弹窗 LineFlow -->
          <el-button type="primary" size="mini" @click="emit('inputMode')">输入模式</el-button>
          <el-button type="primary" size="mini" @click="emit('drawingMode')">出图模式</el-button>
        </el-form-item>
        <el-form-item label="注：">
          <div>
            <span style="color: red">输入模式</span>为录入交评重点路段的数据，<span
              style="color: red"
              >请确保数据准确性。</span
            >
          </div>
          <div>
            <span style="color: red">出图模式</span>中的数据仅为保证出图效果，<span
              style="color: red"
              >仅在本项目中使用。</span
            >
          </div>
        </el-form-item>
      </el-form>
    </div>
  </MDialog>
</template>

<script setup>
import { injectSync, addWatch, selectFile } from '@/utils/index'

const emit = defineEmits(['update:visible', 'close', 'inputMode', 'drawingMode'])
const { proxy } = getCurrentInstance()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  proId: {
    type: Number,
    default: 0,
  },
})

function handleClose() {
  emit('update:visible', false)
  emit('close')
}
</script>

<style lang="scss" scoped>
.CTPModeDialog {
  .close_btn {
    z-index: 100;
    cursor: pointer;
    position: absolute;
    fill: #000;
    right: 16px;
    top: 16px;
    width: 20px;
    height: 20px;
    z-index: 10;
  }
  .flex-scrollbar {
    max-height: calc(100vh - 200px);
  }
  .ctp_mode_bodyer {
    padding: 16px;
  }
}
</style>
