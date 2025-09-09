<!-- home -->
<template>
  <el-scrollbar class="scrollbar">
    <div class="header">
      <div class="menu1">
        <RouterLink class="menu_item" activeClass="active" :to="{ name: 'home' }">
          <!-- <img class="icon" src="@/assets/images/tab_home_nor.svg" alt="" /> -->
          <TabHome class="icon" />
          <span class="text">首页</span>
        </RouterLink>
        <RouterLink class="menu_item" activeClass="active" :to="{ name: 'upload' }">
          <TabUpload class="icon" />
          <span class="text">数据上传</span>
        </RouterLink>
        <RouterLink class="menu_item" activeClass="active" :to="{ name: 'download' }">
          <TabDownload class="icon" />
          <span class="text">数据下载</span>
        </RouterLink>
        <RouterLink class="menu_item" activeClass="active" :to="{ name: 'feedback' }">
          <TabFeedback class="icon" />
          <span class="text">问题反馈</span>
        </RouterLink>
      </div>
      <div class="menu2">
        <div class="btn">帮助</div>
        <a
          class="btn"
          href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=BB08J2"
          target="_blank"
          >BUG</a
        >
        <div class="btn">日志</div>
        <div class="btn">视频</div>
      </div>
    </div>
    <div class="header2">
      <div class="title">交通数据采集应用平台</div>
      <div class="btns">
        <span>道路路况</span>
        <span>PTAL</span>
        <span>道路可达性</span>
        <span>交评仿真</span>
      </div>
      <div class="sreach">
        <input class="input" type="text" placeholder="输入关键词搜索..." />
        <Sreach class="icon" />
      </div>
    </div>
    <div class="home">
      <div class="left card">
        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_shujuku.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">数据库</div>
            <div class="text2">查看下载数据</div>
          </div>
        </div>

        <div class="sjk_box">
          <div class="row" v-for="(v1, i1) in sjk_list" :key="i1">
            <div class="label">{{ v1.title }}</div>
            <div class="value">
              <a href="#/" class="btn" target="_blank" v-for="(v2, i2) in v1.btns" :key="i2">{{
                v2.title
              }}</a>
            </div>
          </div>
        </div>

        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_modelbase2.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">模型库</div>
            <div class="text2">道路交通模型数据图片下载</div>
          </div>
        </div>
        <div class="mxk_box">
          <a class="btn" href="#/" target="_blank" v-for="(v1, i1) in mxk_list" :key="i1">{{
            v1.title
          }}</a>
        </div>

        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_library.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">知识库</div>
            <div class="text2">政策规范快速了解</div>
          </div>
        </div>
        <div class="mxk_box">
          <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in zsk_list" :key="i1">{{
            v1.title
          }}</a>
        </div>
      </div>
      <div class="center">
        <div class="box1 card">
          <div class="title">平台库</div>
          <div class="list">
            <a class="item" v-for="(v, i) in ptk_list" :href="v.path" target="_blank">
              <img :src="v.icon" alt="" class="icon" />
              <div class="text">{{ v.title }}</div>
            </a>
          </div>
        </div>
        <div class="box2 card">
          <div class="nav">
            <div class="item">新闻</div>
            <div class="item">通知</div>
            <div class="upload_btn">
              <div class="icon"></div>
              <div class="text"></div>
            </div>
          </div>
        </div>
        <div class="box1 card">
          <div class="title">地区库</div>
          <div class="list">
            <a
              class="item"
              href="http://192.168.60.234:8080/"
              target="_blank"
              v-for="(v, i) in dzk_list"
              :key="i"
            >
              <div class="text">{{ v.title }}</div>
            </a>
          </div>
        </div>
      </div>
      <div class="right card">
        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_resource.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">资源库</div>
            <div class="text2">其他实用工具</div>
          </div>
        </div>
        <div class="mxk_box">
          <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in zyk_list" :key="i1">{{
            v1.title
          }}</a>
        </div>

        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_modelbase.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">宣传库</div>
            <div class="text2">道路交通模型数据图片下载</div>
          </div>
        </div>
        <div class="mxk_box">
          <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in xck_list" :key="i1">{{
            v1.title
          }}</a>
        </div>

        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_anli.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">案例库</div>
            <div class="text2">优秀项目快速了解</div>
          </div>
        </div>
        <div class="mxk_box">
          <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in alk_list" :key="i1">{{
            v1.title
          }}</a>
        </div>

        <div class="title_box">
          <img class="icon" src="@/assets/images/icon_wenjian.svg?url" alt="" />
          <div class="text_box">
            <div class="text1">总院文件</div>
            <!-- <div class="text2">优秀项目快速了解</div> -->
          </div>
        </div>

        <div class="mxk_box">
          <a class="btn" :href="v1.path" target="_blank" v-for="(v1, i1) in zywj_list" :key="i1">{{
            v1.title
          }}</a>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup>
import TabHome from '@/assets/images/tab_home_nor.svg'
import TabUpload from '@/assets/images/tab_upload_nor.svg'
import TabDownload from '@/assets/images/tab_download_nor.svg'
import TabFeedback from '@/assets/images/tab_feedback_nor.svg'
import Sreach from '@/assets/images/sreach.svg'

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
const dzk_list = [
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
.scrollbar {
  height: 100vh;
  background-color: #f5f5fa;
}
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  height: 60px;
  background: #2fb48f;
  padding: 0 100px 0 60px;
  .menu1 {
    display: flex;
    .menu_item {
      cursor: pointer;
      width: 128px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      color: #fff;
      font-size: 16px;
      &.active {
        &::before {
          position: absolute;
          content: '';
          width: 44px;
          height: 3px;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          background: #fff;
          border-radius: 3px;
        }
      }
      .icon {
        width: 24px;
        height: 24px;
        display: block;
        :deep(.fill) {
          fill: #fff;
        }
      }
    }
  }
  .menu2 {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 40px;
    * {
      cursor: pointer;
      color: #fff;
      font-size: 16px;
    }
  }
}
.header2 {
  height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background-image: url('@/assets/images/top bg.png');
  background-size: cover;
  background-position: bottom left;
  .title {
    font-weight: 700;
    font-size: 56px;
    color: #ffffff;
    line-height: 78px;
  }
  .btns {
    display: flex;
    gap: 40px;
    * {
      cursor: pointer;
      color: #fff;
      font-size: 16px;
    }
  }
  .sreach {
    display: flex;
    align-items: center;
    gap: 24px;
    box-sizing: border-box;
    padding: 0 24px;
    width: 640px;
    height: 48px;
    background: #ffffff;
    border-radius: 33px 33px 33px 33px;
    .input {
      outline: 0;
      height: 48px;
      line-height: 48px;
      flex: 1;
      width: 0;
      tab-size: 0;
      padding: 0;
      border: 0;
      margin: 0;
      font-size: 16px;
      color: #b2b2b2;
    }
    .icon {
    }
  }
}

.home {
  padding: 20px;
  max-width: 1720px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .card {
    box-sizing: border-box;
    padding: 30px;
    background: #ffffff;
    border-radius: 16px 16px 16px 16px;
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
        font-weight: 700;
        font-size: 20px;
        color: #2c3e50;
      }
      .text2 {
        font-size: 14px;
        color: #25a582;
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
      .title {
        font-weight: 600;
        font-size: 20px;
        color: #2c3e50;
        line-height: 24px;
        text-align: center;
        padding-bottom: 20px;
      }
      .list {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 20px 10px;
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          .icon {
            width: 48px;
            height: 48px;
            display: block;
          }
          .text {
            font-size: 16px;
            color: #2c3e50;
            white-space: nowrap;
          }
        }
      }
    }
    .box2 {
      padding: 0;
      border: 1px solid #ffffff;
      overflow: hidden;
      .nav {
        height: 74px;
        background: linear-gradient(
          to right,
          rgba(17, 190, 141, 0.2) 0%,
          rgba(18, 179, 133, 0.05) 100%
        );
        display: flex;
        padding: 0 30px;
        gap: 20px;
        align-items: center;
        .item {
          padding: 0 10px;
          position: relative;
          height: 74px;
          line-height: 74px;
          font-weight: 600;
          font-size: 24px;
          color: #2c3e50;
        }
      }
    }
  }

  .left,
  .right {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .sjk_box {
      padding-bottom: 20px;
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
            color: #2c3e50;
            &:hover {
              color: #247ce7;
            }
          }
        }
      }
    }

    .mxk_box {
      margin-bottom: 20px;
      padding: 16px;
      display: flex;
      background: #f5f7fa;
      border-radius: 8px 8px 8px 8px;
      gap: 16px 24px;
      flex-wrap: wrap;
      .btn {
        cursor: pointer;
        font-weight: 400;
        font-size: 14px;
        color: #2c3e50;
        &:hover {
          color: #247ce7;
        }
      }
    }
  }
}
</style>
