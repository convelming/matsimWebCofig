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
const showMenu = computed(() => {
  return showGeoJSONParams.value <= 0 && true
})

const showGeoJSONParams = ref(0)
provide('showGeoJSONParams', showGeoJSONParams)

function createTree(tree) {
  function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const list = [...tree]
  while (list.length) {
    const item = list.shift()
    item.id = guid()
    item.check = false
    if (item.children && item.children.length) {
      list.push(...item.children)
    }
  }
  return tree
}
const bast_path = 'http://192.168.60.231:8085'

const menuList = createTree([
  {
    title: '测试',
    type: 'geojson',
    download: bast_path + '/数据库/普查人口.geojson',
    path: bast_path + '/数据库/普查人口.geojson',
  },
  {
    title: '数据底座',
    type: 'folder',
    open: false,
    children: [],
  },
  {
    title: '职住通勤',
    type: 'folder',
    open: false,
    children: [
      {
        title: '通勤OD',
        type: 'file',
        path: '',
      },
      {
        title: '普查人口',
        type: 'file',
        path: '',
      },
    ],
  },
  {
    title: '道路流量',
    type: 'folder',
    open: false,
    children: [
      {
        title: '路段流量',
        type: 'file',
        path: '',
      },
      {
        title: '交叉口流量',
        type: 'file',
        path: '',
      },
      {
        title: '道路路况',
        type: 'file',
        path: '',
      },
    ],
  },
  {
    title: '公共交通',
    type: 'folder',
    open: true,
    children: [
      {
        title: '公交线网',
        type: 'file',
        path: '',
      },
      {
        title: '地铁线网',
        type: 'file',
        path: '',
      },
      {
        title: 'PTAL',
        type: 'geojson',
        path: bast_path + '/数据库/PTAL.geojson',
      },
      {
        title: '公交客流',
        type: 'file',
        path: '',
      },
    ],
  },
  {
    title: '物流货运',
    type: 'folder',
    open: false,
    children: [],
  },
  {
    title: '其他',
    type: 'folder',
    open: false,
    children: [
      {
        title: '行政边界',
        type: 'folder',
        open: false,
        children: [
          {
            title: '行政边界_从化',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_从化.geojson',
          },
          {
            title: '行政边界_南沙',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_南沙.geojson',
          },
          {
            title: '行政边界_增城',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_增城.geojson',
          },
          {
            title: '行政边界_天河',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_天河.geojson',
          },
          {
            title: '行政边界_广州_区级',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_广州_区级.geojson',
          },
          {
            title: '行政边界_广州_市级',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_广州_市级.geojson',
          },
          {
            title: '行政边界_广州_村级',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_广州_村级.geojson',
          },
          {
            title: '行政边界_海珠',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_海珠.geojson',
          },
          {
            title: '行政边界_番禺',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_番禺.geojson',
          },
          {
            title: '行政边界_白云',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_白云.geojson',
          },
          {
            title: '行政边界_花都',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_花都.geojson',
          },
          {
            title: '行政边界_荔湾',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_荔湾.geojson',
          },
          {
            title: '行政边界_越秀',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_越秀.geojson',
          },
          {
            title: '行政边界_黄埔',
            type: 'geojson',
            path: bast_path + '/数据库/行政边界/行政边界_黄埔.geojson',
          },
        ],
      },
      {
        title: '路况态势',
        type: 'folder',
        open: false,
        children: [
          {
            title: 'congestion_result_by',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_by.geojson',
          },

          {
            title: 'congestion_result_ch',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_ch.geojson',
          },

          {
            title: 'congestion_result_hd',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_hd.geojson',
          },

          {
            title: 'congestion_result_hp',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_hp.geojson',
          },

          {
            title: 'congestion_result_hz',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_hz.geojson',
          },

          {
            title: 'congestion_result_lw',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_lw.geojson',
          },

          {
            title: 'congestion_result_ns',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_ns.geojson',
          },

          {
            title: 'congestion_result_py',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_py.geojson',
          },

          {
            title: 'congestion_result_th',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_th.geojson',
          },

          {
            title: 'congestion_result_yx',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_yx.geojson',
          },

          {
            title: 'congestion_result_zc',
            type: 'geojson',
            path: bast_path + '/数据库/路况态势/congestion_result_zc.geojson',
          },
        ],
      },
      {
        title: 'A级景区',
        type: 'geojson',
        path: bast_path + '/数据库/A级景区.geojson',
      },
      {
        title: 'POI',
        type: 'geojson',
        path: bast_path + '/数据库/POI.geojson',
      },
      {
        title: 'PTAL',
        type: 'geojson',
        path: bast_path + '/数据库/PTAL.geojson',
      },
      {
        title: '医疗卫生机构',
        type: 'geojson',
        path: bast_path + '/数据库/医疗卫生机构.geojson',
      },
      {
        title: '建筑白膜',
        type: 'geojson',
        path: bast_path + '/数据库/建筑白膜.geojson',
      },
      {
        title: '星级酒店',
        type: 'geojson',
        path: bast_path + '/数据库/星级酒店.geojson',
      },
      {
        title: '普查人口',
        type: 'geojson',
        path: bast_path + '/数据库/普查人口.geojson',
      },
      {
        title: '末端物流网点',
        type: 'geojson',
        path: bast_path + '/数据库/末端物流网点.geojson',
      },
      {
        title: '高速服务区',
        type: 'geojson',
        path: bast_path + '/数据库/高速服务区.geojson',
      },
    ],
  },
])

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
