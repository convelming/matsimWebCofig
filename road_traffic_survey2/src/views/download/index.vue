<!-- index -->
<template>
  <MDialog
    ref="treeRef"
    class="ImageDialog"
    title="数据下载"
    subTitle="数据下载 /"
    :top="80"
    :left="80"
    width="400px"
    hideClose
    :visible="showMenu"
  >
    <el-scrollbar class="flex-scrollbar">
      <Tree class="Tree" :children="menuList" open hideTitle />
    </el-scrollbar>
  </MDialog>
</template>

<script setup>
import Tree from './Tree/FolderItem.vue'
import { guid } from '@/utils/index'

const route = useRoute()
const showMenu = computed(() => {
  return showGeoJSONParams.value <= 0 && true
})

const showGeoJSONParams = ref(0)
provide('showGeoJSONParams', showGeoJSONParams)

const menuList = ref([])
fetch(import.meta.env.VITE_APP_PUBLIC_PATH + 'download_menu.json')
  .then((res) => res.json())
  .then((tree) => {
    const openList = route.query.open?.split(',') || []
    const list = [...tree]
    while (list.length) {
      const item = list.shift()
      item.check = openList.includes(item.title)
      if (item.children && item.children.length) {
        item.open = openList.includes(item.title)
        list.push(...item.children)
      }
    }
    menuList.value = tree
  })

function handleCurrentChange(data, node) {
  console.log(data, node)
}
function handleCheckChange(data, info) {
  console.log(data, info)
}
</script>

<style lang="scss" scoped>
.flex-scrollbar {
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

.Tree {
  padding: 10px 20px;
  min-height: 400px;
}
</style>
