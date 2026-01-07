<!-- xwzx -->
<template>
  <div class="xwzx">
    <MHeader />
    <div class="box1">
      <div class="text1">
        <div>News Center</div>
        <div>新闻中心</div>
      </div>
    </div>
    <div class="box2">
      <div class="title1">Campus News</div>
      <div class="title2">院内新闻</div>
      <div class="list">
        <div class="item" v-for="item in list1">
          <div class="img_box">
            <el-image class="img" :src="item.img" fit="cover" :lazy="true"></el-image>
          </div>
          <div class="text">
            <div class="time">{{ item.time }}</div>
            <div class="title">{{ item.title }}</div>
            <div class="content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="box3">
      <div class="title1">Notification</div>
      <div class="title2">消息通知</div>
      <div class="list">
        <div class="item" v-for="item in list1">
          <div class="time">{{ item.time }}</div>
          <div class="title">{{ item.title }}</div>
          <div class="content">{{ item.content }}</div>
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
    title: '广州综合交通枢纽总体规划（2016-2030年）',
    time: '2025-09-05',
    content:
      '广州是我国涵盖海、陆、空各种运输方式的典型枢纽代表，是全国三大综合交通枢纽之一，主要基础设施包括广州白云国际机场、广州港、铁路枢纽',
    img: new URL('@/assets/image/xwzx/矩形 6084.jpg', import.meta.url).href,
  },
  {
    title: '东莞市区综合交通规划(2008-2020)',
    time: '2025-09-05',
    content:
      '广州是我国涵盖海、陆、空各种运输方式的典型枢纽代表，是全国三大综合交通枢纽之一，主要基础设施包括广州白云国际机场、广州港、铁路枢纽...',
    img: new URL('@/assets/image/xwzx/矩形 6084(1).jpg', import.meta.url).href,
  },
  {
    title: '遵义市中心城区全流程综合交通及建设规划',
    time: '2025-09-05',
    content:
      '广州是我国涵盖海、陆、空各种运输方式的典型枢纽代表，是全国三大综合交通枢纽之一，主要基础设施包括广州白云国际机场、广州港、铁路枢纽...',
    img: new URL('@/assets/image/xwzx/矩形 6084(2).jpg', import.meta.url).href,
  },
  {
    title: '广州南沙新区综合交通体系规划',
    time: '2025-09-05',
    content:
      '广州是我国涵盖海、陆、空各种运输方式的典型枢纽代表，是全国三大综合交通枢纽之一，主要基础设施包括广州白云国际机场、广州港、铁路枢纽...',
    img: new URL('@/assets/image/xwzx/矩形 6084(3).jpg', import.meta.url).href,
  },
]


</script>

<style lang="scss" scoped>
.xwzx {
  width: 100vw;
  min-height: 100vh;
}

.box1 {
  width: 100%;
  height: 520px;
  background: url('@/assets/image/xwzx/矩形 6091.jpg');
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
  background-color: #f5f5f5;

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
      box-sizing: border-box;
      padding: 20px;
      width: calc((100% - 40px * 1) / 2 - 1px);
      overflow: hidden;
      background-color: #fff;
      .img_box {
        position: relative;
        width: 100%;
        padding-bottom: 45%;
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
        padding: 20px;
        .time {
          font-weight: 400;
          font-size: 18px;
          color: #009491;
          margin-bottom: 15px;
        }
        .title {
          font-weight: 500;
          font-size: 24px;
          margin-bottom: 15px;
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
  }
}

.box3 {
  padding: 100px 6.25vw 140px 6.25vw;
  background-color: #fff;

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
    .item {
      padding: 30px 0;
      border-bottom: 2px solid #eee;
      .time {
        font-weight: 400;
        font-size: 18px;
        color: #009491;

        margin-bottom: 15px;
      }
      .title {
        font-weight: 600;
        font-size: 24px;
        color: #333333;
        margin-bottom: 15px;
      }
      .content {
        font-weight: 400;
        font-size: 18px;
        color: #999999;
      }
    }
  }
}
</style>
