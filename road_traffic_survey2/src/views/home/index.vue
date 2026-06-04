<!-- home -->
<template>
  <div class="home max_box">
    <div class="left card">
      <!-- 数据库 -->
      <div class="title_box">
        <IconSJK class="icon" />
        <div class="text_box">
          <div class="text1">数据库</div>
          <div class="text2">查看下载数据</div>
        </div>
      </div>
      <div class="box1">
        <div class="row" v-for="(v1, i1) in sjk_list" :key="i1">
          <div class="label">{{ v1.title }}</div>
          <div class="value">
            <template v-for="(v2, i2) in v1.children">
              <MButton v-bind="v2" class="btn" />
            </template>
          </div>
        </div>
      </div>
      <!-- 数据库 -->

      <!-- 模型库 -->
      <div class="title_box">
        <IconMXK class="icon" />
        <div class="text_box">
          <div class="text1">工具库</div>
          <div class="text2">道路交通模型数据图片下载</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in mxk_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 模型库 -->

      <!-- 平台库 -->
      <div class="title_box">
        <IconPTK class="icon" />
        <div class="text_box">
          <div class="text1">平台库</div>
          <div class="text2">平台搭建汇总</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in ptk_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 平台库 -->
    </div>
    <div class="center">
      <div class="box2 card">
        <div class="row">
          <div class="label">热门功能</div>
          <div class="value">
            <template v-for="(v1, i1) in rm_list">
              <MButton v-bind="v1.params" class="btn" />
            </template>
          </div>
        </div>
      </div>
      <div class="box1 card">
        <div class="title_box">
          <div class="title">
            <IconBQ class="icon" />
            <span>新闻</span>
          </div>
          <div class="btn" @click="handleShowAddNews(null)">
            <IconSC class="icon2" />
            <span>上传</span>
          </div>
          <div class="btn" @click="showEditNews = !showEditNews">
            <Setting class="icon2" />
            <span v-if="showEditNews">完成</span>
            <span v-else>编辑</span>
          </div>
        </div>
        <div class="body1">
          <div class="left_box">
            <el-image
              :src="VITE_APP_BASE_API + news_cover"
              fit="cover"
              :preview-src-list="[VITE_APP_BASE_API + news_cover]"
            ></el-image>
          </div>
          <div class="right_box" style="height: 400px">
            <div class="row1">
              <a :href="`#/news/detail?id=${news_one.id}`" v-if="news_one">
                <!-- <div class="text1">{{ news_one.date }}</div> -->
                <div class="text1">{{ $moment(news_one.date).format('YYYY-MM-DD') }}</div>

                <div class="text2">{{ news_one.title }}</div>
                <div class="text3">{{ news_one.content_text }}</div>
              </a>
              <template v-if="showEditNews">
                <el-icon
                  class="btn"
                  color="#30b690"
                  size="16px"
                  @click="handleShowAddNews(news_one)"
                  ><Edit
                /></el-icon>
                <el-icon
                  class="btn"
                  color="var(--el-color-danger)"
                  size="16px"
                  @click="handleDeleteNews(news_one)"
                  ><Delete
                /></el-icon>
              </template>
            </div>
            <div class="row2" v-for="value in news_list" :key="value">
              <a :href="`#/news/detail?id=${value.id}`">
                <span class="text1">{{ value.title }}</span>
              </a>
              <template v-if="showEditNews">
                <el-icon class="btn" color="#30b690" size="16px" @click="handleShowAddNews(value)"
                  ><Edit
                /></el-icon>
                <el-icon
                  class="btn"
                  color="var(--el-color-danger)"
                  size="16px"
                  @click="handleDeleteNews(value)"
                  ><Delete
                /></el-icon>
              </template>
            </div>
            <el-pagination
              style="margin-left: auto; margin-top: auto"
              @current-change="updateNews"
              v-model:currentPage="news_params.pageNum"
              :page-size="news_params.pageSize"
              layout=" prev, pager, next, total"
              :total="news_total"
              :pager-count="5"
            />
          </div>
        </div>
      </div>

      <div class="box1 card">
        <div class="title_box">
          <div class="title">
            <IconBQ class="icon" />
            <span>通知</span>
          </div>
          <div class="btn" @click="handleShowAddNotice(null)">
            <IconSC class="icon2" />
            <span>上传</span>
          </div>
          <div class="btn" @click="showEditNotice = !showEditNotice">
            <Setting class="icon2" />
            <span v-if="showEditNotice">完成</span>
            <span v-else>编辑</span>
          </div>
        </div>
        <div class="body2" style="height: 360px">
          <div class="row2" v-for="value in notice_list" :key="value">
            <a :href="`#/notice/detail?id=${value.id}`">
              <span class="text1">{{ value.title }}</span>
              <span class="text2">{{ $moment(value.date).format('YYYY年MM月DD日') }}</span>
            </a>
            <template v-if="showEditNotice">
              <el-icon class="btn" color="#30b690" size="16px" @click="handleShowAddNotice(value)"
                ><Edit
              /></el-icon>
              <el-icon
                class="btn"
                color="var(--el-color-danger)"
                size="16px"
                @click="handleDeleteNotice(value)"
                ><Delete
              /></el-icon>
            </template>
          </div>
          <el-pagination
            style="margin: auto auto 0 auto"
            @current-change="updateNotice"
            v-model:currentPage="notice_params.pageNum"
            :page-size="notice_params.pageSize"
            layout=" prev, pager, next, total"
            :total="notice_total"
            :pager-count="5"
          />
        </div>
      </div>
    </div>
    <div class="right card">
      <!-- 资源库 -->
      <div class="title_box">
        <IconZYK class="icon" />
        <div class="text_box">
          <div class="text1">资源库</div>
          <div class="text2">其他实用工具</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in zyk_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 资源库 -->

      <!-- 宣传库 -->
      <div class="title_box">
        <IconSCK class="icon" />
        <div class="text_box">
          <div class="text1">宣传库</div>
          <div class="text2">院内风采快速了解</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in xck_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 宣传库 -->

      <!-- 知识库 -->
      <div class="title_box">
        <IconZSK class="icon" />
        <div class="text_box">
          <div class="text1">知识库</div>
          <div class="text2">政策规范快速了解</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in zsk_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 知识库 -->

      <!-- 案例库 -->
      <div class="title_box">
        <IconALK class="icon" />
        <div class="text_box">
          <div class="text1">案例库</div>
          <div class="text2">优秀项目快速了解</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in alk_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 案例库 -->

      <!-- 地区库 -->
      <div class="title_box">
        <IconDQK class="icon" />
        <div class="text_box">
          <div class="text1">地区库</div>
          <div class="text2">地区归类快速了解</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in dqk_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 地区库 -->

      <!-- 总院文件 -->
      <div class="title_box">
        <IconZYWJ class="icon" />
        <div class="text_box">
          <div class="text1">总院文件</div>
          <div class="text2">总院资讯快速了解</div>
        </div>
      </div>
      <div class="box2">
        <template v-for="(v1, i1) in zywj_list">
          <MButton v-bind="v1" class="btn" />
        </template>
      </div>
      <!-- 总院文件 -->
    </div>
  </div>

  <AddNews
    v-model:visible="showAddNews"
    type="0"
    :title="addNewsTitle"
    :id="editNewsId"
    @close="updateNews"
  />
  <AddNews
    v-model:visible="showAddNotice"
    type="1"
    :title="addNoticeTitle"
    :id="editNoticeId"
    @close="updateNotice"
  />
</template>

<script setup>
import AddNews from './News/AddNews.vue'
import MButton from '@/components/MButton.vue'
import { newsList, newsDelete, indexHotLinkHotLinks } from '@/api/home.js'

import { Setting, Delete, Edit } from '@element-plus/icons-vue'

import IconSJK from '@/assets/images/Home/icon_shujuku.svg?component'
import IconMXK from '@/assets/images/Home/icon_modelbase.svg?component'
import IconALK from '@/assets/images/Home/icon_resource.svg?component'
import IconPTK from '@/assets/images/Home/icon_pingtai.svg?component'
import IconZYK from '@/assets/images/Home/icon_ziyuan.svg?component'
import IconSCK from '@/assets/images/Home/icon_xuanchuan.svg?component'
import IconZSK from '@/assets/images/Home/icon_library.svg?component'
import IconZYWJ from '@/assets/images/Home/icon_wenjian.svg?component'
import IconDQK from '@/assets/images/Home/icon_diqu.svg?component'

import IconBQ from '@/assets/images/Home/biaoqian.svg?component'
import IconSC from '@/assets/images/Home/update.svg?component'
import { onUnmounted } from 'vue'

const VITE_APP_BASE_API = import.meta.env.VITE_APP_BASE_API
const { proxy } = getCurrentInstance()

/************************ 热门功能 ************************/
const rm_list = ref([])
function getRMList() {
  indexHotLinkHotLinks().then((res) => {
    res.data.forEach((e) => {
      e.params = JSON.parse(e.link)
    })
    rm_list.value = res.data
  })
}
const rm_timer = setInterval(getRMList, 1000 * 60)
getRMList()
/************************ 新闻 ************************/
const showAddNews = ref(false)
const editNewsId = ref(-1)
const addNewsTitle = ref('添加新闻')
const showEditNews = ref(false)
const news_params = ref({
  pageNum: 1,
  pageSize: 5,
  type: 0,
})
const news_total = ref(0)
const news_one = ref(null)
const news_list = ref([])
const news_cover = ref('')
function updateNews() {
  newsList(news_params.value).then((res) => {
    const one = res.data.data[0]
    if (one) {
      one.content_text =
        one.content
          ?.replace(/<[^>]+>/g, '')
          .replace(/&[^&]+;/g, '')
          .substring(0, 200) || ''
      news_one.value = one
    } else {
      news_one.value = null
    }
    news_list.value = res.data.data?.slice(1)
    news_total.value = res.data.total

    const hasCoverNews = res.data.data.find((v) => v.annexs && v.annexs.find((v2) => v2.type == 0))
    if (hasCoverNews) {
      news_cover.value = hasCoverNews.annexs.find((v) => v.type == 0).url
    }
  })
}
updateNews()

function handleShowAddNews(row) {
  addNewsTitle.value = !row ? '添加新闻' : '编辑新闻'
  editNewsId.value = row?.id || -1
  showAddNews.value = true
}
function handleDeleteNews(row) {
  proxy
    .$confirm('是否删除新闻——' + row.title + '？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'error',
    })
    .then(function () {
      return newsDelete(row.id)
    })
    .then(() => {
      proxy.$message.success('删除成功')
      updateNews()
    })
    .catch(() => {})
}

/************************ 通知 ************************/
const showAddNotice = ref(false)
const editNoticeId = ref(-1)
const addNoticeTitle = ref('添加通知')
const showEditNotice = ref(false)
const notice_params = ref({
  pageNum: 1,
  pageSize: 5,
  type: 1,
})
const notice_total = ref(0)
const notice_list = ref([])
function updateNotice() {
  newsList(notice_params.value).then((res) => {
    notice_list.value = res.data.data || []
    notice_total.value = res.data.total
  })
}
updateNotice()
function handleShowAddNotice(row) {
  addNoticeTitle.value = !row ? '添加通知' : '编辑通知'
  editNoticeId.value = row?.id || -1
  showAddNotice.value = true
}
function handleDeleteNotice(row) {
  proxy
    .$confirm('是否删除通知——' + row.title + '？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'error',
    })
    .then(function () {
      return newsDelete(row.id)
    })
    .then(() => {
      proxy.$message.success('删除成功')
      updateNotice()
    })
    .catch(() => {})
}
/************************ 数据库 ************************/
const sjk_list = window.win_sjk_list
/************************ 模型库 ************************/
const mxk_list = window.win_mxk_list
/************************ 知识库 ************************/
const zsk_list = window.win_zsk_list
/************************ 资源库 ************************/
const zyk_list = window.win_zyk_list
/************************ 宣传库 ************************/
const xck_list = window.win_xck_list
/************************ 案例库 ************************/
const alk_list = window.win_alk_list
/************************ 总院文件 ************************/
const zywj_list = window.win_zywj_list
/************************ 平台库 ************************/
const ptk_list = window.win_ptk_list
/************************ 地区库 ************************/
const dqk_list = window.win_dqk_list

onUnmounted(() => {
  clearInterval(rm_timer)
})
</script>

<style lang="scss" scoped>
.max_box {
  box-sizing: border-box;
  max-width: 1640px;
  margin: auto;
}

.home {
  padding: 20px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .card {
    box-sizing: border-box;
    padding: 30px;
    background: #ffffff;
    border-radius: 8px;
  }

  .title_box {
    display: flex;
    align-items: stretch;
    gap: 10px;
    .icon {
      width: 48px;
      height: 48px;
      display: block;
    }
    .text_box {
      width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      & > * {
        text-overflow: ellipsis;
        white-space: nowarp;
        overflow: hidden;
      }
      .text1 {
        font-weight: 600;
        font-size: 20px;
      }
      .text2 {
        font-size: 14px;
        color: #999999;
      }
    }
  }

  .left,
  .center,
  .right {
    display: flex;
    flex-grow: 1;
    width: 0;
    min-width: 300px;
  }
  .center {
    min-width: 500px;
    flex-grow: 2.5;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    .box1 {
      padding: 0;
      border: 1px solid #ffffff;
      overflow: hidden;
      .title_box {
        display: flex;
        align-items: center;
        padding: 0 30px;
        height: 64px;
        background: linear-gradient(
          to right,
          rgba(17, 190, 141, 0.2) 0%,
          rgba(18, 179, 133, 0.05) 100%
        );
        gap: 15px;
        .title {
          flex: 1;
          width: 0;
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 24px;
          gap: 8px;
          .icon {
            position: relative;
            top: 3px;
            width: 14px;
            height: 16px;
            display: block;
          }
        }
        .btn {
          display: flex;
          align-items: center;
          color: #30b690;
          gap: 4px;
          .icon2 {
            width: 24px;
            height: 24px;
            display: block;
          }
        }
      }

      .body1 {
        padding: 30px;
        display: flex;
        align-items: stretch;
        gap: 20px;
        .left_box {
          position: relative;
          width: 50%;
          border-radius: 8px;
          background-color: #f5f5fa;
          overflow: hidden;
          .el-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: block;
          }
        }
        .right_box {
          width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          .row1 {
            .text2 {
              display: -webkit-box; /* 必须 */
              -webkit-box-orient: vertical; /* 必须 */
              -webkit-line-clamp: 2; /* 显示的行数 */
              overflow: hidden;
            }
            .text3 {
              display: -webkit-box; /* 必须 */
              -webkit-box-orient: vertical; /* 必须 */
              -webkit-line-clamp: 3; /* 显示的行数 */
              overflow: hidden;
            }
          }
        }
      }
      .body2 {
        box-sizing: border-box;
        padding: 30px;
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      .row1 {
        display: flex;
        align-items: center;
        gap: 15px;
        a {
          flex: 1;
          padding: 20px;
          background: rgba(18, 179, 133, 0.05);
          border-radius: 8px;
          border: 1px solid #12b385;

          display: flex;
          flex-direction: column;
          gap: 8px;

          .text1 {
            font-size: 12px;
            color: #9e9e9e;
          }
          .text2 {
            font-size: 16px;
          }
          .text3 {
            font-size: 14px;
            color: #666666;
            overflow: hidden;
            word-wrap: break-word; /* 旧版写法，兼容性较好 */
            overflow-wrap: break-word; /* 新版写法，推荐使用 */
          }
        }
      }

      .row2 {
        display: flex;
        align-items: center;
        gap: 15px;

        a {
          display: flex;
          align-items: center;

          flex: 1;
          width: 0;
          gap: 8px;

          &::before {
            display: block;
            content: '';
            width: 6px;
            height: 6px;
            background: #3ba185;
            border-radius: 3px;
          }
          .text1 {
            flex: 1;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 16px;
          }

          .text2 {
            flex-grow: 0;
            font-size: 16px;
            color: #666666;
            white-space: nowrap;
          }
          &:hover {
            .text1,
            .text2 {
              color: #247ce7;
            }
          }
        }
      }
    }

    .box2 {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 15px 20px;

      .row {
        width: 100%;
        display: flex;
        gap: 10px;
        line-height: 20px;
        .label {
          font-weight: bold;
          font-size: 14px;
          flex-grow: 0;
          &::before {
            content: '';
            display: inline-block;
            margin-right: 8px;
            width: 3px;
            height: 12px;
            background: #12b385;
            border-radius: 6px 6px 6px 6px;
          }
        }
        .value {
          width: 0;
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
      }
    }
  }

  .left,
  .right {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .box1 {
      padding-bottom: 10px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      .row {
        width: 100%;
        display: flex;
        gap: 10px;
        line-height: 20px;
        .label {
          font-weight: bold;
          font-size: 14px;
          flex-grow: 0;
          &::before {
            content: '';
            display: inline-block;
            margin-right: 8px;
            width: 3px;
            height: 12px;
            background: #12b385;
            border-radius: 6px 6px 6px 6px;
          }
        }
        .value {
          width: 0;
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
      }
    }

    .box2 {
      margin-bottom: 10px;
      padding: 16px;
      display: flex;
      background: #f5f7fa;
      border-radius: 8px;
      gap: 16px 24px;
      flex-wrap: wrap;
    }
  }

  :deep(.btn) {
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    &:hover {
      color: #247ce7;
    }
  }
}
</style>
