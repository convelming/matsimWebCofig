<!-- rczp -->
<template>
  <div class="rczp">
    <MHeader />
    <div class="box1">
      <div class="text1">
        <div>Talent Recruitment</div>
        <div>人才招聘</div>
      </div>
    </div>

    <div class="box2">
      <div class="title1">Job Information</div>
      <div class="title2">招聘岗位</div>
      <div class="table">
        <div class="theader">
          <div class="row">
            <div class="col1">岗位名称</div>
            <div class="col2">地区</div>
            <div class="col3">招聘人数</div>
            <div class="col4">学历要求</div>
            <div class="col5">发布日期</div>
            <div class="col6"></div>
          </div>
        </div>
        <div class="tbodyer">
          <template v-for="item in list">
            <div class="row">
              <div class="col1">{{ item.name }}</div>
              <div class="col2">{{ item.city }}</div>
              <div class="col3">{{ item.num }}</div>
              <div class="col4">{{ item.edu }}</div>
              <div class="col5">{{ item.time }}</div>
              <div class="col6">
                <img
                  src="@/assets/image/rczp/more.svg?url"
                  alt=""
                  class="icon"
                  @click="item.id == openId ? (openId = null) : (openId = item.id)"
                />
              </div>
            </div>
            <el-collapse-transition>
              <div class="row2" v-show="item.id == openId">
                <div class="title">职位描述：</div>
                <div class="text" v-html="item.detail"></div>
                <div class="title">投递方式：</div>
                <div class="text" v-html="item.delivery"></div>
              </div>
            </el-collapse-transition>
          </template>
        </div>
      </div>
    </div>

    <MFooter />
  </div>
</template>

<script setup>
import MHeader from '@/components/MHeader.vue'
import MFooter from '@/components/MFooter.vue'
const detailHtml = `
<div>1、开展低空经济、物流等行业形势和前瞻课题研究；</div>
<div>2、负责市、区层面的产业发展规划和产业政策等研究工作；</div>
<div>3、负责低空、物流产业园区的策划和规划等相关工作；</div>
<div>4、区域经济、产业经济、人文地理、区域规划等专业优先；</div>
<div>5、具有2年以上相关领域的工作经验，有中级职称及城市战略咨询、产业发展规划、产业园策划等经验者优先考虑；</div>
<div></div>
<div>学历|经验：硕士/3年及以上工作经验</div>
<div>薪资范围：1.3万-2.5万</div>
`

const openId = ref(null)

const list = [
  {
    id: 1,
    name: '低空经济与物流产业策划师/规划师',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
  {
    id: 2,
    name: '中高级 Java 开发',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
  {
    id: 3,
    name: '中高级 webGIS 开发',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
  {
    id: 4,
    name: '主创规划师及规划师岗（TOD规划设计）',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
  {
    id: 5,
    name: '规划师岗（低空规划设计）',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
  {
    id: 6,
    name: '规划师岗（物流规划/产业咨询）',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
  {
    id: 7,
    name: '助理规划师岗（物流规划/产业咨询）',
    city: '广州',
    num: '1人',
    edu: '硕士',
    time: '2025-09-10',
    detail: detailHtml,
    delivery: '简历投递邮箱：<a href="mailto:XXXXX@jky.com">XXXXX@jky.com</a>，备注官网招聘',
  },
]
</script>

<style lang="scss" scoped>
.rczp {
  width: 100vw;
  min-height: 100vh;
}

.box1 {
  width: 100%;
  height: 520px;
  background: url('@/assets/image/rczp/矩形 6091.jpg');
  background-size: cover;
  background-position: center;
  .text1 {
    padding-top: 180px;
    width: 80vw;
    margin: 0 auto;
    font-weight: 500;
    font-size: 72px;
    color: #ffffff;
    line-height: 112px;
  }
}

.box2 {
  padding: 100px 6.25vw 140px 6.25vw;
  background-color: #fff;

  .title1 {
    font-weight: 800;
    font-size: 64px;
    color: #d7e0e0;
    line-height: 64px;
    margin-bottom: 30px;
    text-align: center;
  }
  .title2 {
    font-weight: 700;
    font-size: 48px;
    color: #1a1a1a;
    line-height: 48px;
    margin-bottom: 40px;
    text-align: center;
  }
  .table {
    .theader {
      .row {
        padding-top: 2vw;
        padding-bottom: 2vw;
        font-size: max(1.66vw, 20px);
      }
      border-bottom: 1px solid #eee;
    }
    .tbodyer {
      .row {
        padding-top: 2.5vw;
        padding-bottom: 2.5vw;
        font-size: max(1.25vw, 14px);
        line-height: max(1.66vw, 20px);
        border-bottom: 1px solid #eee;
      }
      .row2 {
        padding: max(4vw, 40px);
        padding-top: max(2vw, 20px);
        border-bottom: 1px solid #eee;
        .title {
          margin: max(1.66vw, 20px) 0;
          font-weight: 500;
          font-size: max(1.66vw, 20px);
          line-height: max(2vw, 20px);
        }
        .text {
          font-size: max(1.25vw, 14px);
          line-height: max(2vw, 20px);
        }
      }
      .icon {
        display: block;
        width: max(1.66vw, 20px);
        height: max(1.66vw, 20px);
        margin: auto;
      }
    }
    .row {
      padding: 0 max(4vw, 40px);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .col1 {
      width: 27vw;
    }
    .col2 {
      width: 10.4vw;
    }
    .col3 {
      width: 13vw;
    }
    .col4 {
      width: 14vw;
    }
    .col5 {
      width: 13vw;
    }
    .col6 {
      width: 0;
      flex: 1;
    }
  }
}
</style>
