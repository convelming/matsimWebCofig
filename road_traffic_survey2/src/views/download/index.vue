<!-- index -->
<template>
  <MDialog
    ref="treeRef"
    id="DownloadDialog"
    class="DownloadDialog"
    title="数据下载"
    subTitle="数据下载 /"
    :y="80"
    :x="80"
    width="400px"
    hideClose
    :visible="showMenu"
  >
    <el-scrollbar class="flex-scrollbar">
      <Tree class="Tree" :children="menuList" open hideTitle />
    </el-scrollbar>
  </MDialog>

  <SpatialQuery></SpatialQuery>
</template>

<script setup>
import * as API from '@/api/index'
import { computed, onMounted } from 'vue'
import Tree, { TreeItemEnum } from './Tree/index.js'
import { NetworkLayer } from '@/utils/MapLayer/NetworkLayer'
import SpatialQuery from './SpatialQuery/index.vue'

const route = useRoute()
const showMenu = computed(() => {
  return !Object.values(showGeoJSONParams.value).some((v) => v) && true
})

const showGeoJSONParams = ref({})
provide('showGeoJSONParams', showGeoJSONParams)

const checkList = String(route.query.open || '')
  .split(';')
  .filter((v) => !!v)
const openList = checkList
  .map((v) => v.split(',') || [])
  .flat(2)
  .filter((v) => !!v)
const tree = [...window.win_download_menu]
const list = [...tree]
while (list.length) {
  const item = list.shift()
  item.checkKey = item.checkKey || item.title
  item.check = false
  item.range = []
  if (item.children && item.children.length) {
    item.open = openList.includes(item.title)
    item.range = []
    item.children.forEach((item2) => {
      item2.checkKey = [item.checkKey, item2.title].filter((v) => !!v).join(',')

      // TODO 不在当前循环判断是否点击，改成在节点判断   节点标题,all 代表节点下的全部都需要勾选
      if (!item2.children) {
        item2.check =
          checkList.includes(item2.checkKey) || checkList.includes(item.checkKey + ',ALL')
      } else {
        item2.check = false
      }
    })
    list.push(...item.children)
  } else {
    item.check = checkList.includes(item.checkKey)
  }
}

// menuList.value = tree
const menuList = ref(tree)

const _NetworkData = shallowRef(null)
API.getGeomjson({
  selectAll: true,
}).then((res) => {
  _NetworkData.value = res.data
})

provide('_NetworkData', _NetworkData)

function handleCurrentChange(data, node) {
  console.log(data, node)
}
function handleCheckChange(data, info) {
  console.log(data, info)
}

onMounted(() => {})
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
