<!-- index -->
<template>
  <MDialog
    class="ImageDialog"
    title="查看图片"
    subTitle="数据上传 /"
    :top="80"
    :left="80"
    width="300px"
    hideClose
    :visible="showMenu"
  >
    <el-scrollbar class="scrollbar">
      <el-collapse class="collapse" v-model="activeNames" expand-icon-position="left">
        <template v-for="(v1, i1) in menuList">
          <el-collapse-item :title="v1.title" :name="v1.name">
            <template #icon="{ isActive }">
              <img
                src="@/assets/images/icon_tri_nor.svg?url"
                class="icon_tri_nor"
                :class="{ active: isActive }"
              />
            </template>
            <template v-for="(v2, i2) in v1.children">
              <div class="collapse_item" @click="handleClick(v1, v2)">{{ v2.title }}</div>
            </template>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-scrollbar>
  </MDialog>
  <LinkFlow v-model:visible="showLinkFlow" />
  <IntersectionFlow v-model:visible="showIntersectionFlow" />
</template>

<script setup>
import * as API from '@/api/index'
import LinkFlow from './LinkFlow/index.vue'
import IntersectionFlow from './IntersectionFlow/index.vue'
import { NetworkLayer } from '@/utils/MapLayer/NetworkLayer'

const showMenu = computed(() => {
  return !showLinkFlow.value && !showIntersectionFlow.value && true
})
const showLinkFlow = ref(false)
const showIntersectionFlow = ref(true)
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

const _NetworkLayer = shallowRef(new NetworkLayer({ zIndex: 10, lineWidth: 10 }))
API.getGeomjson({
  selectAll: true,
}).then((res) => {
  _NetworkLayer.value.setData(res.data)
})

provide('_NetworkLayer', _NetworkLayer)

function handleClick(v1, v2) {
  if (v2.title == '路段流量录入') {
    showLinkFlow.value = true
  } else if (v2.title == '交叉口流量录入') {
    showIntersectionFlow.value = true
  }
}

onUnmounted(() => {
  _NetworkLayer.value.dispose()
})
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
    cursor: pointer;
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
