<!-- UploadVideo -->
<template>
  <MDialog
    class="UploadVideo"
    title="仅视频"
    subTitle="上传航拍视频 / 仅视频"
    :top="80"
    :left="80"
    width="365px"
    hideClose
    :visible="showMain"
    @close="handleClose"
  >
    <el-scrollbar class="flex-scrollbar">
      <div class="UploadVideo_body">
        <img src="@/assets/images/close.svg?url" class="close_btn" @click.stop="handleClose" />
        <div class="title1">请选择上传视频：</div>
        
        
        <div class="checkbox">
          <el-checkbox v-model="showLayer" @change="">
            <span class="text1">显示图标</span>
            <span class="text2">(已上传数据点位)</span>
          </el-checkbox>
        </div>
        <el-collapse class="collapse" v-model="activeNames">
          <el-collapse-item title="显示设置" name="显示设置">
            <el-form label-position="left" label-width="80px">
              <el-form-item label="图标颜色">
                <div class="color_picker_box">
                  <div class="color_picker_item" v-for="(v, i) in stateOptions" :key="i">
                    <div>{{ v }}</div>
                    <el-color-picker v-model="stateColorOptions[i]"></el-color-picker>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="路段宽度">
                <el-slider :min="1" :max="30" v-model="wayWidth"></el-slider>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-scrollbar>
  </MDialog>
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

const emits = defineEmits(['update:visible', 'close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const watchVisible = addWatch(
  props,
  (val) => {
    if (val) {
    } else {
    }
  },
  {
    deep: true,
    immediated: true,
  },
)

const showMain = computed(() => {
  return props.visible
})

function handleClose() {
  emits('update:visible', false)
  emits('close')
}
</script>

<style lang="scss" scoped>
.flex-scrollbar {
  max-height: calc(100vh - 200px);
}
.UploadVideo_body {
  position: relative;
  padding: 20px;
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
}
</style>
