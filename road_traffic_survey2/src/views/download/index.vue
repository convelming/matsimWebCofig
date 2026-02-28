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
import * as API from '@/api/index'
import { computed } from 'vue'
import Tree, { TreeItemEnum } from './Tree/index.js'
import { NetworkLayer } from '@/utils/MapLayer/NetworkLayer'

const route = useRoute()
const showMenu = computed(() => {
  return !Object.values(showGeoJSONParams.value).some((v) => v) && true
})

const showGeoJSONParams = ref({})
provide('showGeoJSONParams', showGeoJSONParams)

const s_menuList = [
  {
    title: '拍照图片',
    type: TreeItemEnum.upload_image,
  },
  {
    title: '人工数车',
    type: TreeItemEnum.folder,
    children: [
      {
        title: '路段流量',
        type: TreeItemEnum.upload_link_flow,
      },
      {
        title: '交叉口流量',
        type: TreeItemEnum.upload_intersection_flow,
      },
    ],
  },
]
const r_menuList = ref([])

const menuList = ref([])

fetch(import.meta.env.VITE_APP_PUBLIC_PATH + 'download_menu.json')
  .then((res) => res.json())
  .then((data) => {
    const checkList = String(route.query.open || '')
      .split(';')
      .filter((v) => !!v)
    const openList = checkList
      .map((v) => v.split(',') || [])
      .flat(2)
      .filter((v) => !!v)
    const tree = [...data, ...s_menuList]
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
    menuList.value = tree
  })

const _NetworkLayer = shallowRef(new NetworkLayer({ zIndex: 10, lineWidth: 10 }))
const _NetworkData = shallowRef(null)
API.getGeomjson({
  selectAll: true,
}).then((res) => {
  _NetworkLayer.value.setData(res.data)
  _NetworkData.value = res.data
})

provide('_NetworkLayer', _NetworkLayer)
provide('_NetworkData', _NetworkData)

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
