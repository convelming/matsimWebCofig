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
            <a href="#/" class="btn" target="_blank" v-for="(v2, i2) in v1.btns" :key="i2">{{
              v2.title
            }}</a>
          </div>
        </div>
      </div>
      <!-- 数据库 -->

      <!-- 模型库 -->
      <div class="title_box">
        <IconMXK class="icon" />
        <div class="text_box">
          <div class="text1">模型库</div>
          <div class="text2">道路交通模型数据图片下载</div>
        </div>
      </div>
      <div class="box2">
        <a class="btn" href="#/" target="_blank" v-for="(v1, i1) in mxk_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 模型库 -->

      <!-- 案例库 -->
      <div class="title_box">
        <IconALK class="icon" />
        <div class="text_box">
          <div class="text1">案例库</div>
          <div class="text2">优秀项目快速了解</div>
        </div>
      </div>
      <div class="box2">
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in alk_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 案例库 -->
      <!-- 平台库 -->
      <div class="title_box">
        <IconPTK class="icon" />
        <div class="text_box">
          <div class="text1">平台库</div>
          <div class="text2">平台搭建汇总</div>
        </div>
      </div>
      <div class="box2">
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in ptk_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 平台库 -->
    </div>
    <div class="center">
      <div class="box1 card">
        <div class="title_box">
          <IconBQ class="icon" />
          <div class="title">新闻</div>
          <a class="btn" @click="showAddNews = true">
            <IconSC class="icon2" />
            <span>上传</span>
          </a>
        </div>
        <div class="body1">
          <div class="left_box"></div>
          <div class="right_box">
            <a class="row1" :href="`#/news/detail?id=${news_one.id}`" v-if="news_one">
              <!-- <div class="text1">{{ news_one.date }}</div> -->
              <div class="text1">{{ $moment(news_one.date).format('YYYY-MM-DD') }}</div>
              <div class="text2">{{ news_one.title }}</div>
              <div class="text3">{{ news_one.content_text }}</div>
            </a>
            <a
              class="row2"
              :href="`#/news/detail?id=${value.id}`"
              v-for="value in news_list"
              :key="value"
            >
              <span class="text1">{{ value.title }}</span>
              <!-- <span class="text2">{{ $moment(value.date).format('YYYY年MM月DD日') }}</span> -->
            </a>
          </div>
        </div>
      </div>

      <div class="box1 card">
        <div class="title_box">
          <IconBQ class="icon" />
          <div class="title">通知</div>
          <a class="btn">
            <IconSC class="icon2" />
            <span>上传</span>
          </a>
        </div>
        <div class="body2">
          <a class="row2" href="" v-for="value in 5" :key="value">
            <span class="text1">院向联合国副秘书长、人居署执行主任报告广州可持续发展实践</span>
            <span class="text2">2025年8月19日</span>
          </a>
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
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in zyk_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 资源库 -->

      <!-- 宣传库 -->
      <div class="title_box">
        <IconSCK class="icon" />
        <div class="text_box">
          <div class="text1">宣传库</div>
          <div class="text2">道路交通模型数据图片下载</div>
        </div>
      </div>
      <div class="box2">
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in xck_list" :key="i1">{{
          v1.title
        }}</a>
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
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in zsk_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 知识库 -->

      <!-- 总院文件 -->
      <div class="title_box">
        <IconZYWJ class="icon" />
        <div class="text_box">
          <div class="text1">总院文件</div>
          <div class="text2">总院资讯快速了解</div>
        </div>
      </div>
      <div class="box2">
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in zywj_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 总院文件 -->

      <!-- 地区库 -->
      <div class="title_box">
        <IconDQK class="icon" />
        <div class="text_box">
          <div class="text1">地区库</div>
          <div class="text2">地区归类快速了解</div>
        </div>
      </div>
      <div class="box2">
        <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in dqk_list" :key="i1">{{
          v1.title
        }}</a>
      </div>
      <!-- 地区库 -->
    </div>
  </div>

  <AddNews v-model:visible="showAddNews" />
</template>

<script setup>
import AddNews from './News/AddNews.vue'
import { newsList } from '@/api/home.js'

import IconSJK from '@/assets/images/Home/icon_shujuku.svg'
import IconMXK from '@/assets/images/Home/icon_modelbase.svg'
import IconALK from '@/assets/images/Home/icon_resource.svg'
import IconPTK from '@/assets/images/Home/icon_pingtai.svg'
import IconZYK from '@/assets/images/Home/icon_ziyuan.svg'
import IconSCK from '@/assets/images/Home/icon_xuanchuan.svg'
import IconZSK from '@/assets/images/Home/icon_library.svg'
import IconZYWJ from '@/assets/images/Home/icon_wenjian.svg'
import IconDQK from '@/assets/images/Home/icon_diqu.svg'

import IconBQ from '@/assets/images/Home/biaoqian.svg'
import IconSC from '@/assets/images/Home/update.svg'

const showAddNews = ref(false)

const news_one = ref(null)
const news_list = ref([])
newsList().then((res) => {
  const one = res.data.data[0]
  if (one) {
    one.content_text = one.content.replace(/<[^>]+>/g, '').replace(/&[^&]+;/g, '')
    if (one.content_text.length > 100) {
      one.content_text = one.content_text.substring(0, 100) + '...'
    }
    news_one.value = one
  } else {
    news_one.value = null
  }
  news_list.value = res.data.data?.slice(1, 6)
})

const sjk_list = [
  {
    title: '城市底座：',
    btns: [
      {
        title: '区划边界',
        path: '',
      },
      {
        title: '土地利用',
        path: '',
      },
      {
        title: '建筑白模',
        path: '',
      },
      {
        title: 'POI',
        path: '',
      },
    ],
  },
  {
    title: '职住通勤：',
    btns: [
      {
        title: '通勤OD',
        path: '',
      },
      {
        title: '普查人口',
        path: '',
      },
    ],
  },
  {
    title: '道路流量：',
    btns: [
      {
        title: '路段流量',
        path: '',
      },
      {
        title: '交叉口流量',
        path: '',
      },
      {
        title: '道路路况',
        path: '',
      },
    ],
  },
  {
    title: '公共交通：',
    btns: [
      {
        title: '公共交通',
        path: '',
      },
      {
        title: '地铁网线',
        path: '',
      },
      {
        title: 'PTAL',
        path: '',
      },
      {
        title: '公交客流',
        path: '',
      },
    ],
  },
  {
    title: '货运物流：',
    btns: [
      {
        title: '企业位置',
        path: '',
      },
      {
        title: '星级酒店',
        path: '',
      },
      {
        title: '末端物流网点',
        path: '',
      },
    ],
  },
]
const mxk_list = [
  {
    title: '道路路况',
    path: '',
  },
  {
    title: 'PTAL',
    path: '',
  },
  {
    title: '道路可达性',
    path: '',
  },
  {
    title: '交评仿真',
    path: '',
  },
  {
    title: '高德地图下载',
    path: '',
  },
  {
    title: 'PDF加水印',
    path: '',
  },
  {
    title: '人工数车助手',
    path: '',
  },
]
const zsk_list = [
  {
    title: '国家标准规范',
    path: 'http://192.168.60.231:8085/知识库/国家标准规范/',
  },
  {
    title: '广州交通年鉴',
    path: 'http://192.168.60.231:8085/知识库/广州交通年鉴/',
  },
  {
    title: '总院流程文件',
    path: 'http://192.168.60.231:8085/知识库/总院流程文件/',
  },
  {
    title: '物流相关政策',
    path: 'http://192.168.60.231:8085/知识库/物流相关政策/',
  },
  {
    title: '低空相关政策',
    path: 'http://192.168.60.231:8085/知识库/低空相关政策/',
  },
  {
    title: '公交相关政策',
    path: 'http://192.168.60.231:8085/知识库/公交相关政策/',
  },
]
const zyk_list = [
  {
    title: '密码狗租借台',
    path: 'https://doc.weixin.qq.com/smartsheet/s3_AH8AwwajAB82Xowv0CiRpSNLSzdOs?scode=APwA6gfEAA0WkqjoUeAbUANgb6AHE&tab=lvruym&viewId=vXJ7Dv',
  },
  {
    title: '效率工具推荐',
    path: 'https://doc.weixin.qq.com/smartsheet/s3_AH8AwwajAB81VRWMidLTjynEfcoh3?scode=APwA6gfEAA01FipaXnAbUANgb6AHE&tab=q979lj&viewId=vukaF8',
  },
  {
    title: '网络资源账号',
    path: 'https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsM7pwuaBRSyS5gO0dH5?scode=APwA6gfEAA0ZP18PaFAbUANgb6AHE&tab=000001',
  },
  {
    title: '部门专家库',
    path: 'https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsjSNSuMCYQjy1MF50wd?scode=APwA6gfEAA0hBfJy6hAbUANgb6AHE&tab=000001',
  },
  {
    title: '行业期刊',
    path: 'https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsc1vaY1hhTbSBSeG7AC?scode=APwA6gfEAA01rv8LfWAbUANgb6AHE&tab=000001',
  },
]
const xck_list = [
  {
    title: '宣传手册',
    path: 'http://192.168.60.231:8085/宣传库/宣传手册/',
  },
  {
    title: '宣传视频',
    path: 'http://192.168.60.231:8085/宣传库/宣传视频/',
  },
  {
    title: '活动风采',
    path: 'http://192.168.60.231:8085/宣传库/活动风采/',
  },
]
const alk_list = [
  {
    title: '优秀项目',
    path: 'http://192.168.60.231:8085/案例库/优秀项目/',
  },
  {
    title: '优秀汇报',
    path: 'http://192.168.60.231:8085/案例库/优秀汇报/',
  },
  {
    title: '技术沙龙',
    path: 'http://192.168.60.231:8085/案例库/技术沙龙/',
  },
]
const zywj_list = [
  {
    title: '规章制度',
    path: 'https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a49828b46c70875de4e9419eb77ed',
  },
  {
    title: '工作文件',
    path: 'https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a49cec675e94fd618ed845f3bc862',
  },
  {
    title: '资质证书',
    path: 'https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a4a1a6532d42ab1024e54c7a9ccaf',
  },
]
const ptk_list = [
  {
    title: '本地大模型',
    path: 'http://192.168.60.234:8080/',
    icon: new URL('@/assets/images/icon_chip.svg?url', import.meta.url),
  },
  {
    title: 'Matsim可视化',
    path: 'http://192.168.60.231:23105/',
    icon: new URL('@/assets/images/icon_visualization.svg?url', import.meta.url),
  },
  {
    title: '公交优化',
    path: 'http://192.168.60.231:23105/pt.html#/',
    icon: new URL('@/assets/images/icon_bus.svg?url', import.meta.url),
  },
  {
    title: '总院时空数据云',
    path: 'http://192.168.10.124/gzpi/user/login',
    icon: new URL('@/assets/images/icon_cloud.svg?url', import.meta.url),
  },
  {
    title: '黄埔交通数字化',
    path: 'http://192.168.60.231:8080/index.html',
    icon: new URL('@/assets/images/icon_number.svg?url', import.meta.url),
  },
]
const dqk_list = [
  {
    title: '越秀',
    path: 'http://192.168.60.231:8085/地区库/越秀/',
  },
  {
    title: '天河',
    path: 'http://192.168.60.231:8085/地区库/天河/',
  },
  {
    title: '黄埔',
    path: 'http://192.168.60.231:8085/地区库/黄埔/',
  },
  {
    title: '南沙',
    path: 'http://192.168.60.231:8085/地区库/南沙/',
  },
  {
    title: '白云',
    path: 'http://192.168.60.231:8085/地区库/白云/',
  },
  {
    title: '海珠',
    path: 'http://192.168.60.231:8085/地区库/海珠/',
  },
  {
    title: '荔湾',
    path: 'http://192.168.60.231:8085/地区库/荔湾/',
  },
  {
    title: '番禺',
    path: 'http://192.168.60.231:8085/地区库/番禺/',
  },
  {
    title: '增城',
    path: 'http://192.168.60.231:8085/地区库/增城/',
  },
  {
    title: '花都',
    path: 'http://192.168.60.231:8085/地区库/花都/',
  },
  {
    title: '从化',
    path: 'http://192.168.60.231:8085/地区库/从化/',
  },
]
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
        gap: 8px;
        .title {
          flex: 1;
          width: 0;
          font-weight: 600;
          font-size: 24px;
        }
        .icon {
          position: relative;
          top: 3px;
          width: 14px;
          height: 16px;
          display: block;
        }
        .btn {
          cursor: pointer;
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
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
          width: 0;
          flex-grow: 3.4;
          border-radius: 8px;
          background-color: #f5f5fa;
        }
        .right_box {
          width: 0;
          flex-grow: 3.6;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      }
      .body2 {
        padding: 30px;
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      .row1 {
        cursor: pointer;
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
        }
      }

      .row2 {
        cursor: pointer;
        display: flex;
        align-items: center;
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
          .btn {
            font-weight: 400;
            font-size: 14px;
            &:hover {
              color: #247ce7;
            }
          }
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
      .btn {
        cursor: pointer;
        font-weight: 400;
        font-size: 14px;
        &:hover {
          color: #247ce7;
        }
      }
    }
  }
}
</style>
