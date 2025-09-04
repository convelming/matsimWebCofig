<!-- index -->
<template>
  <Dialog
    mClass="ImageDialog"
    title="查看图片"
    subTitle="数据上传 /"
    :top="80"
    :left="80"
    width="300px"
    hideClose
    :visible="showMenu"
  >
    <el-scrollbar class="scrollbar">
      <el-collapse
        class="collapse"
        v-model="activeNames"
        @change="handleChange"
        expand-icon-position="left"
      >
        <template v-for="(v1, i1) in menuList">
          <el-collapse-item :title="v1.title" :name="v1.name">
            <template #icon="{ isActive }">
              <img
                src="@/assets/images/icon_tri_nor.svg"
                class="icon_tri_nor"
                :class="{ active: isActive }"
              />
            </template>
            <template v-for="(v2, i2) in v1.children">
              <div class="collapse_item">{{ v2.title }}</div>
            </template>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-scrollbar>
  </Dialog>
  <LinkFlow v-model:visible="showLinkFlow" />
</template>

<script setup>
import Dialog from '@/components/Dialog.vue'
import LinkFlow from './LinkFlow.vue'

const showMenu = computed(() => {
  return !showLinkFlow.value && true
})
const activeNames = ref([])
const menuList = [
  {
    name: '1',
    title: '人工数车',
    children: [
      {
        name: '1-1',
        title: '路段流量录入',
      },
      {
        name: '1-1',
        title: '交叉口流量录入',
      },
    ],
  },
  {
    name: '2',
    title: '航拍视频',
    children: [],
  },
  {
    name: '3',
    title: '拍照图片',
    children: [],
  },
  {
    name: '4',
    title: 'GIS文件',
    children: [],
  },
  {
    name: '5',
    title: 'CAD文件',
    children: [],
  },
  {
    name: '6',
    title: '栅格文件',
    children: [],
  },
]

const showLinkFlow = ref(true)

function handleChange() {}
</script>

<style lang="scss" scoped>
.scrollbar {
  max-height: calc(100vh - 200px);
}
.icon_tri_nor {
  width: 10px;
  height: 10px;
  display: block;
  transition: transform 0.3s ease-in-out;
  fill: #2c3e50;
  &.active {
    transform: rotate(90deg);
  }
}
.collapse {
  padding: 10px 20px;
  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
  .collapse_item {
    box-sizing: border-box;
    height: 44px;
    padding: 7px 34px;
    line-height: 44px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333333;
    border-radius: 6px 6px 6px 6px;
    &:hover {
      color: #409eff;
      background: #edf6ff;
    }
  }
}
</style>
