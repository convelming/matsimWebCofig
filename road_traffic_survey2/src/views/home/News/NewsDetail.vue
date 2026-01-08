<!-- NewsDetail -->
<template>
  <div class="NewsDetail">
    <div class="box1" v-if="route.meta.type == 0">
      首页 > 新闻管理 > 新闻动态 > <span class="end">院内新闻</span>
    </div>
    <div class="box1" v-if="route.meta.type == 1">
      首页 > 通知管理 > 通知动态 > <span class="end">院内通知</span>
    </div>
    <div class="title">{{ detail.title }}</div>
    <div class="info">
      <div class="time">{{ $moment(detail.date).format('YYYY-MM-DD HH:mm') }}</div>
      <span class="author">作者：{{ detail.author }}</span>
    </div>
    <div class="content ql-container ql-snow">
      <div class="ql-editor ql-snow" v-html="detail.content"></div>
    </div>
    <div class="file_list" v-if="file_list.length > 0">
      <div class="list_header">
        <img src="@/assets/images/附件.svg?url" alt="" class="icon" />
        <div class="text">文档附件（{{ file_list.length }}）</div>
      </div>
      <div class="list_bodyer">
        <div class="checkbox">
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate">全选</el-checkbox>
          <el-button
            class="button"
            type="text"
            @click="handleDownloadChecked"
            :disabled="!checked.length"
          >
            批量下载</el-button
          >
        </div>
        <el-checkbox-group v-model="checked">
          <div class="checkbox" v-for="file in file_list" :key="file.id">
            <el-checkbox class="name" :value="file.id">
              <img src="@/assets/images/xlsx.svg?url" alt="" class="icon" />
              <span>{{ file.name }}</span>
            </el-checkbox>
            <span class="size">（{{ file.size }}）</span>
            <!-- <el-button class="button" type="text" @click="">预览</el-button> -->
            <a
              class="el-button el-button--text button"
              type="text"
              :href="VITE_APP_BASE_API + file.url"
              :download="file.name"
              >下载</a
            >
            <!-- <el-button class="button" type="text" @click="">打印</el-button> -->
          </div>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { newsDetail, newsAnnexBatchDownload } from '@/api/home.js'
import { computed, ref } from 'vue'

const VITE_APP_BASE_API = import.meta.env.VITE_APP_BASE_API
const checkAll = computed({
  get() {
    return !!checked.value.length
  },
  set(val) {
    if (val) {
      checked.value = file_list.value.map((v) => v.id)
    } else {
      checked.value = []
    }
  },
})
const isIndeterminate = computed(() => {
  return checked.value.length > 0 && checked.value.length < file_list.value.length
})
const checked = ref([])
const file_list = ref([])

const detail = ref({})

const route = useRoute()
newsDetail(route.query.id).then((res) => {
  const { annexs, ...data } = res.data
  console.log(annexs, data)

  file_list.value = annexs?.filter((v) => v.type == 1)
  detail.value = data
})

function handleDownloadChecked() {
  const el = document.createElement('a')
  el.href = `${VITE_APP_BASE_API}/newsAnnex/batchDownload/${checked.value.join(',')}`
  el.download = `附件-${new Date().getTime()}.zip` //'附件.zip'
  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)
}
</script>

<style lang="scss" scoped>
.NewsDetail {
  box-sizing: border-box;
  background-color: #fff;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 80px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  .box1 {
    font-size: 14px;
    color: #999;
    padding-bottom: 10px;
    .end {
      color: #2c3e50;
    }
  }
  .title {
    font-size: 32px;
    line-height: 32px;
  }
  .info {
    font-size: 12px;
    color: #999999;
    line-height: 12px;
    display: flex;
    gap: 30px;
  }
  .ql-container,
  .ql-editor {
    padding: 0;
    border: 0;
    margin: 0;
  }
  .content {
    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }
  .file_list {
    border: 1px solid #e1f0eb;
    .el-checkbox {
      --el-checkbox-height: 20px;
      --el-checkbox-checked-bg-color: #30b690;
      --el-checkbox-checked-input-border-color: #30b690;
      --el-checkbox-checked-text-color: var(--el-text-color-regular);
      :deep(.el-checkbox__label) {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .icon {
        width: 20px;
        height: 20px;
        display: block;
      }
    }
    .checkbox {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      .name {
        width: 0;
        flex: 1;
      }
      .size {
        font-size: 16px;
        color: #999999;
      }
      .button {
        color: #30b690;
        padding: 0;
        height: 20px;
        margin: 0;
      }
    }
    .list_header {
      background: #f5faf8;
      border-bottom: 1px solid #e1f0eb;
      padding: 16px 30px;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .list_bodyer {
      padding: 20px;
    }
    .list_bodyer,
    .list_bodyer .el-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }
}
</style>
