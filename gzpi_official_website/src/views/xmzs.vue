<!-- xmzs -->
<template>
  <div class="xmzs">
    <MHeader />
    <div class="box1">
      <div class="text1">
        <div>Project Display</div>
        <div>项目展示</div>
      </div>
    </div>
    <div
      class="box2"
      id="cszhjtgh"
      style="background-image: url('@/assets/image/bygk/蒙版组 2.png')"
    >
      <div class="title1">Urban Integrated Transport Planning</div>
      <div class="title2">城市综合交通规划</div>
      <div class="list">
        <div class="item" v-for="item in list1">
          <div class="img_box">
            <el-image class="img" :src="item.img" fit="cover" :lazy="true"></el-image>
          </div>
          <div class="text">
            <div class="title">{{ item.title }}</div>
            <div class="content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="box3" id="zhjt">
      <div class="title1">Smart Traffic</div>
      <div class="title2">智慧交通</div>
      <div class="list">
        <div class="item" v-for="item in list2">
          <div class="img_box">
            <el-image class="img" :src="item.img" fit="cover" :lazy="true"></el-image>
          </div>
          <div class="text">
            <div class="title">{{ item.title }}</div>
            <div class="content">
              <span class="time">{{ item.time }}</span>
              <span class="detail">查看详情</span>
              <img src="@/assets/image/xmzs/more.svg" alt="" class="icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box2" id="znywl">
      <div class="title1">Hub and Logistics</div>
      <div class="title2">枢纽与物流</div>
      <div class="list">
        <div class="item" v-for="item in list3">
          <div class="img_box">
            <el-image class="img" :src="item.img" fit="cover" :lazy="true"></el-image>
          </div>
          <div class="text">
            <div class="title">{{ item.title }}</div>
            <div class="content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="box3" id="dkjj">
      <div class="title1">Low-altitude economy</div>
      <div class="title2">低空经济</div>
      <div class="list">
        <div class="item" v-for="item in list4">
          <div class="img_box">
            <el-image class="img" :src="item.img" :fit="item.fil || cover" :lazy="true"></el-image>
          </div>
          <div class="text">
            <div class="title">{{ item.title }}</div>
            <div class="content">
              <span class="time">{{ item.time }}</span>
              <span class="detail">查看详情</span>
              <img src="@/assets/image/xmzs/more.svg" alt="" class="icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <MFooter />
  </div>
</template>

<script setup>
import MHeader from '@/components/MHeader.vue'
import MFooter from '@/components/MFooter.vue'

const list1 = [
  {
    title: '广州综合交通枢纽总体规划(2016-2030年)',
    content: '',
    img: new URL('@/assets/image/xmzs/1.png', import.meta.url).href,
  },
  {
    title: '东莞市区综合交通规划(2008-2020)',
    content: '',
    img: new URL('@/assets/image/xmzs/2.png', import.meta.url).href,
  },
  {
    title: '遵义市中心城区全流程综合交通及建设规划',
    content: '',
    img: new URL('@/assets/image/xmzs/3.png', import.meta.url).href,
  },
  {
    title: '广州南沙新区综合交通体系规划',
    content: '',
    img: new URL('@/assets/image/xmzs/4.png', import.meta.url).href,
  },
]

const list2 = [
  {
    title: '广州市多智能体城市交通仿真平台',
    time: '2025-09-12',
    img: new URL('@/assets/image/xmzs/5.png', import.meta.url).href,
  },
  {
    title: '科学城拥堵片区动态评估优化及交通数字治理平台',
    time: '2025-09-12',
    img: new URL('@/assets/image/xmzs/6.png', import.meta.url).href,
  },
  {
    title: '广州市白云湖大道智慧道路工程建设方案',
    time: '2025-09-12',
    img: new URL('@/assets/image/xmzs/7.png', import.meta.url).href,
  },
  {
    title: '黄埔区停车数字治理及示范片区提升方案',
    time: '2025-09-12',
    img: new URL('@/assets/image/xmzs/8.png', import.meta.url).href,
  },
]

const list3 = [
  {
    title: '广州铁路客运枢纽概念方案及周边土地综合开发规划研究',
    content: '',
    img: new URL('@/assets/image/xmzs/9.png', import.meta.url).href,
  },
  {
    title: '广州铁路枢纽物流基地多式联运概念方案及周边地区规划',
    content: '',
    img: new URL('@/assets/image/xmzs/10.png', import.meta.url).href,
  },
  {
    title: '广州交通物流融合发展规划',
    content: '',
    img: new URL('@/assets/image/xmzs/11.png', import.meta.url).href,
  },
  {
    title: '粤东城际揭阳段TOD总体策划与站点周边综合开发规划',
    content: '',
    img: new URL('@/assets/image/xmzs/12.png', import.meta.url).href,
  },
]

const list4 = [
  {
    title: '基于空天地一体的低空智能网联（广州）基础设施关键技术研发',
    time: '2025-09-12',
    img: new URL('@/assets/image/xmzs/13.png', import.meta.url).href,
    fil: 'contain',
  },
  {
    title: '广州市多智能体低空仿真平台',
    time: '2025-09-12',
    img: new URL('@/assets/image/xmzs/14.png', import.meta.url).href,
  },
]
</script>

<style lang="scss" scoped>
.xmzs {
  width: 100vw;
  min-height: 100vh;
}

.box1 {
  width: 100%;
  height: 520px;
  background: url('@/assets/image/xmzs/矩形 6091.jpg');
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
  background-color: #fafafa;

  background-size: cover;
  background-position: top center;
  .title1 {
    font-weight: 800;
    font-size: 64px;
    color: #d7e0e0;
    line-height: 64px;
    margin-bottom: 30px;
  }
  .title2 {
    font-weight: 700;
    font-size: 48px;
    color: #1a1a1a;
    line-height: 48px;
    margin-bottom: 40px;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    .item {
      width: calc((100% - 40px * 2) / 2 - 1px);
      border-radius: 16px;
      overflow: hidden;
      background-color: #fff;
      .img_box {
        position: relative;
        width: 100%;
        padding-bottom: 66%;
        .img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
      }
      .text {
        padding: 30px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        .title {
          font-weight: 500;
          font-size: 24px;

          // 一行文字
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .content {
          font-weight: 400;
          font-size: 14px;
          color: #999999;

          // 两行文字
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          line-clamp: 2;
        }
      }
    }

    @media screen and (max-width: 1300px) {
      .item {
        width: calc((100% - 40px * 1) / 2 - 1px);
      }
    }
  }
}
.box3 {
  padding: 100px 6.25vw 140px 6.25vw;
  background-color: #fff;

  .title1 {
    font-weight: 800;
    font-size: 64px;
    color: #d7e0e0;
    line-height: 64px;
    margin-bottom: 30px;
  }
  .title2 {
    font-weight: 700;
    font-size: 48px;
    color: #1a1a1a;
    line-height: 48px;
    margin-bottom: 40px;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
    .item {
      width: calc((100% - 40px * 1) / 2 - 1px);
      .img_box {
        position: relative;
        width: 100%;
        padding-bottom: 62.5%;
        .img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
      }
      .text {
        padding: 30px 0 20px 0;
        border-bottom: 2px solid #eee;

        .title {
          font-weight: 500;
          font-size: 24px;
          margin-bottom: 40px;
          // 一行文字
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .content {
          font-weight: 400;
          font-size: 14px;
          color: #999999;

          display: flex;
          align-items: center;
          gap: 10px;
          padding-right: 40px;
          .time {
            margin-right: auto;
          }
          .icon {
            width: 20px;
            height: 20px;
            display: flex;
          }
        }
      }
    }
  }
}
</style>
