<!-- Sreach -->
<template>
  <MDialog
    class="Sreach"
    title="查询图片"
    subTitle="拍照图片 / 仅图片 / 查询图片"
    :top="80"
    :left="80"
    width="500px"
    :visible="showMain"
    @close="handleClose"
  >
    <div class="Sreach_body">
      <el-form :model="queryparam" ref="form" label-width="auto" :inline="true">
        <el-form-item label="名称">
          <el-input
            style="width: 150px"
            v-model="queryparam.name"
            placeholder="请输入文件夹名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input
            style="width: 150px"
            v-model="queryparam.type"
            placeholder="请输入文件夹类型"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            style="width: 250px"
            v-model="queryparam.time"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getTree">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-auto-resizer style="height: calc(100vh - 450px)">
        <template #default="{ height, width }">
          <el-tree-v2
            ref="treeRef"
            style="width: 100%"
            :data="dirList"
            :props="{
              value: 'path',
              label: 'name',
              children: 'subdir',
            }"
            show-checkbox
            scrollbar-always-on
            :height="height"
            @check-change="handleCheckChange"
          >
            <template #default="{ node, data }">
              <div class="row">
                <span class="col1">{{ data.name }}</span>
                <span class="col2">{{ data.type }}</span>
                <span class="col2">{{ data.createTime }}</span>
                <span class="col3">
                  <el-button
                    v-if="data.pictures && data.pictures.length"
                    type="text"
                    :icon="View"
                    @click.stop="handleShowImageList(data)"
                  >
                  </el-button>
                  <el-button type="text" :icon="Edit" @click.stop="handleRename(data)"> </el-button>
                  <el-button
                    type="text"
                    :icon="Delete"
                    style="color: red"
                    @click.stop="handleDeleteDir(data)"
                  >
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree-v2>
        </template>
      </el-auto-resizer>
    </div>
  </MDialog>
  <ImageList v-model:visible="showImageList" :data="imageListData" @refresh="getTree" />
</template>

<script setup>
import * as API from '@/api/index'
import { injectSync, addWatch } from '@/utils/index'

import { MAP_EVENT } from '@/mymap/index.js'
import { ImageListLayer } from '@/utils/MapLayer/ImageListLayer'

import { Delete, Edit, View } from '@element-plus/icons-vue'
import { computed } from 'vue'

import ImageList from './ImageList.vue'

const BASE_API = import.meta.env.VITE_APP_BASE_API
let _Map = null
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:visible', 'close', 'submited'])
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

const queryparam = ref({
  name: '',
  type: '',
  time: [],
})
const dirList = ref([])
const treeRef = ref(null)

const showImageList = ref(false)
const imageListData = ref(null)

const color = ref('#ffa500')
const hColor = ref('#67C23A')

const _ImageListLayer = new ImageListLayer({
  zIndex: 110,
  color: color.value,
  hColor: hColor.value,
  event: {
    [MAP_EVENT.HANDLE_PICK_LEFT]: (res) => {
      handleShowImageDialog(res.data)
    },
  },
})

const showMain = computed(() => props.visible && !showImageList.value)

const watchProps = addWatch(
  props,
  (val) => {
    if (val.visible) {
      getTree()
      _Map.addLayer(_ImageListLayer)
    } else {
      _Map.removeLayer(_ImageListLayer)
    }
  },
  {
    deep: true,
  },
)

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function getTree() {
  let selectTree = []
  if (treeRef.value) selectTree = treeRef.value.getCheckedKeys()
  console.log(selectTree)

  const { name, time, type } = queryparam.value
  API.mappictureTreeList({
    type: type,
    name: name,
    beginTime: (time || [])[0] || '',
    endTime: (time || [])[1] || '',
  }).then((res) => {
    dirList.value = res.data

    const list = [...res.data]
    let _imageListData = null
    while (list.length) {
      const item = list.shift()
      if (item.subdir && item.subdir.length) {
        list.push(...item.subdir)
      }
      if (item.path == imageListData.value) {
        _imageListData = item
        break
      }
    }
    handleShowImageList(_imageListData)
    nextTick(() => {
      treeRef.value.setCheckedKeys(treeRef.value.getCheckedKeys())
      handleCheckChange()
    })
  })
}

function handleShowImageList(row) {
  if (row) {
    imageListData.value = row
    showImageList.value = true
  } else {
    imageListData.value = null
    showImageList.value = false
  }
}
function handleRename(data) {
  proxy
    .$prompt('请输入新名称', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: data.name,
    })
    .then(({ value }) => {
      API.mappictureRename({
        path: data.path,
        name: value,
      })
        .then(() => {
          getTree()
          proxy.$message.success('修改成功')
        })
        .catch(() => {})
    })
}
function handleDeleteDir(row) {
  proxy
    .$confirm(`是否确认删除目录“${row.path}”及目录下全部内容?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      mappictureDeleteByPath({
        path: row.path,
      })
        .then(() => {
          getTree()
          proxy.$message.success('删除成功')
        })
        .catch(() => {})
    })
}
function handleCheckChange() {
  if (treeRef.value) {
    const pathList = treeRef.value.getCheckedNodes()
    const imageList = pathList.map((item) => item.pictures).flat(2)
    _ImageListLayer.setData(imageList)
  }
}

injectSync('MapRef').then((map) => {
  _Map = map.value
  watchProps.callback(props)
})

onUnmounted(() => {
  _ImageListLayer.dispose()
})
</script>

<style lang="scss" scoped>
.Sreach_body {
  position: relative;
  padding: 20px;
  .row {
    width: 100%;
    display: flex;
    gap: 10px;
    align-items: center;
    padding-right: 15px;
    .col1 {
      width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .col3 {
      width: 70px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      .el-button {
        padding: 0;
        margin: 0;
      }
    }
  }
}
</style>
