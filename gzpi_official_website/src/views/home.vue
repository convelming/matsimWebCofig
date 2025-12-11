<!-- home -->
<template>
  <div class="home">
    <div class="nav">
      <img src="@/assets/image/home/logo2.svg?url" alt="" class="logo" />
      <a href="http://192.168.60.231:23105/pt.html#/" class="icon" target="_blank">
        <img src="@/assets/image/home/菜单.svg?url" alt="" />
      </a>
      <!-- <a href="http://192.168.60.231:23105/pt.html#/" class="icon">
        <img src="@/assets/image/home/菜单.svg?url" alt="" />
      </a> -->
      <a href="http://192.168.60.231:23105/pt.html#/" class="icon">
        <img src="@/assets/image/home/搜索.svg?url" alt="" />
      </a>
    </div>
    <video class="video" src="/53941bcfa09e859cc89db3753af9fb78.mp4" autoplay muted></video>

    <transition name="el-fade-in-linear">
      <div class="bodyer_item one">
        <img src="@/assets/image/home/科研建设.svg?url" alt="" class="icon" />
        <div class="text_box">
          <div class="text1">科研建设</div>
          <div class="text2">275+</div>
        </div>
        <div class="_box">
          <div class="d1"></div>
          <div class="d2"></div>
        </div>
      </div>
    </transition>

    <transition name="el-fade-in-linear">
      <div class="bodyer_item two">
        <img src="@/assets/image/home/获奖项目.svg?url" alt="" class="icon" />
        <div class="text_box">
          <div class="text1">获奖项目</div>
          <div class="text2">144项</div>
        </div>

        <div class="_box">
          <div class="d1"></div>
          <div class="d2"></div>
        </div>
      </div>
    </transition>
    <transition name="el-fade-in-linear">
      <div class="bodyer_item three">
        <img src="@/assets/image/home/比例.svg?url" alt="" class="icon" />
        <div class="text_box">
          <div class="text1">研究生比例</div>
          <div class="text2">93%</div>
        </div>

        <div class="_box">
          <div class="d1"></div>
          <div class="d2"></div>
        </div>
      </div>
    </transition>

    <el-scrollbar class="footer" width="100vw" height="160px">
      <div class="footer_box">
        <a class="footer_item" v-for="item in footer_list" :href="item.link">
          <img :src="item.icon" alt="" class="icon" />
          <div class="text_box">
            <div class="text1">{{ item.text1 }}</div>
            <div class="text2">{{ item.text2 }}</div>
          </div>
        </a>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const footer_list = [
  {
    icon: new URL('@/assets/image/home/概况.svg?url', import.meta.url).href,
    text1: '本院概况',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/bygk'),
  },
  {
    icon: new URL('@/assets/image/home/新闻.svg?url', import.meta.url).href,
    text1: '新闻中心',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/xwzx'),
  },
  {
    icon: new URL('@/assets/image/home/项目.svg?url', import.meta.url).href,
    text1: '项目展示',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/xmzs'),
  },
  {
    icon: new URL('@/assets/image/home/科研.svg?url', import.meta.url).href,
    text1: '科研成果',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/kycg'),
  },
  {
    icon: new URL('@/assets/image/home/招聘.svg?url', import.meta.url).href,
    text1: '人才招聘',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/rczp'),
  },
  {
    icon: new URL('@/assets/image/home/概况.svg?url', import.meta.url).href,
    text1: '本院概况',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/bygk'),
  },
  {
    icon: new URL('@/assets/image/home/新闻.svg?url', import.meta.url).href,
    text1: '新闻中心',
    text2: '创造更美好的人居环境',
    link: router.options.history.createHref('/kycg'),
  },
]
</script>

<style lang="scss" scoped>
.home {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #666;
}
.nav {
  position: absolute;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 80px;
  height: 60px;
  background-color: rgba($color: #000000, $alpha: 0.2);
  display: flex;
  align-items: center;
  gap: 24px;
  .logo {
    display: block;
    height: 40px;
    margin-right: auto;
    cursor: pointer;
  }
  .icon {
    display: block;
    width: 24px;
    height: 24px;
    cursor: pointer;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}
.video {
  display: block;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}
.bodyer_item {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  .icon {
    display: block;
    width: 60px;
    height: 60px;
  }
  .text1 {
    font-size: 14px;
    color: #ffffff;
    line-height: 20px;
    margin-bottom: 4px;
  }
  .text2 {
    font-size: 24px;
    color: #ffffff;
    line-height: 24px;
    font-weight: 600;
  }
  ._box {
    position: absolute;
    top: 56px;
    left: 30px;
    .d1 {
      position: absolute;
      width: 1px;
      height: 72px;
      background-color: #fff;
    }
    .d2 {
      position: absolute;
      top: 60px;
      left: -24px;
      width: 48px;
      height: 48px;
      background-color: rgba($color: #fff, $alpha: 0.4);
      border-radius: 50%;
      &::before {
        content: '';
        position: absolute;
        top: 12px;
        left: 12px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid #ffffff;
      }
      &::after {
        content: '';
        position: absolute;
        top: 18px;
        left: 18px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #ffffff;
      }
    }
  }
  &.one {
    top: 40vh;
    left: 20vw;
  }
  &.two {
    top: 45vh;
    left: 50vw;
  }
  &.three {
    top: 35vh;
    left: 75vw;
  }
}

.footer {
  z-index: 30;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%);

  .footer_box {
    box-sizing: border-box;
    min-width: 100%;
    padding: 60px 40px 0 40px;

    display: flex;
    width: fit-content;
    justify-content: center;
    align-items: center;
    gap: 40px;
  }
  &::-webkit-scrollbar {
    display: none;
  }

  .footer_item {
    flex-shrink: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    text-wrap: nowrap;
    text-decoration: none;

    cursor: pointer;
    .icon {
      display: block;
      width: 60px;
      height: 60px;
    }
    .text1 {
      font-weight: 600;
      font-size: 18px;
      color: #ffffff;
      line-height: 24px;
      margin-bottom: 4px;
    }
    .text2 {
      font-size: 14px;
      color: #ffffff;
      line-height: 20px;
    }
  }
}
</style>
