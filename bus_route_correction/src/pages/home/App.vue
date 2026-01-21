<!-- App -->
<template>
  <div id="app" class="App">
    <div class="home">
      <div class="nav">
        <img src="@/assets/image/home/logo2.svg?url" alt="" class="logo" />

        <el-dropdown class="language" @command="changeLanguage" placement="top-start" trigger="click">
          <div class="module_menu">{{ { "zh-CN": "中文（简体）", "en-US": "English" }[page_language] }}<i class="el-icon-arrow-down el-icon--right"></i></div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
            <!-- <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item> -->
            <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown class="language" @command="openPage" placement="top-start" trigger="click">
          <img class="icon" src="@/assets/image/home/菜单.svg?url" alt="" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="user.html">登录</el-dropdown-item>
            <el-dropdown-item command="pt.html">建模平台</el-dropdown-item>
            <el-dropdown-item command="index.html">可视化平台</el-dropdown-item>
            <el-dropdown-item command="feedback.html">反馈与建议</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <video class="video" src="@/assets/image/home/53941bcfa09e859cc89db3753af9fb78.mp4" autoplay muted @timeupdate="handleTimeupdate"></video>
      <Typewriter :lines="tpyelines" :speed="200" />
      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item one" v-show="playTime > 2000">
          <img src="@/assets/image/home/科研建设.svg?url" alt="" class="icon" />
          <div class="text_box">
            <div class="text1">拖拽式建模</div>
            <!-- <div class="text2">275+</div> -->
          </div>
          <div class="_box">
            <div class="d1"></div>
            <div class="d2"></div>
          </div>
        </div>
      </transition>
      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item two" v-show="playTime > 4000">
          <img src="@/assets/image/home/项目.svg?url" alt="" class="icon" />
          <div class="text_box">
            <div class="text1">多模型集成</div>
            <!-- <div class="text2">144项</div> -->
          </div>

          <div class="_box">
            <div class="d1"></div>
            <div class="d2"></div>
          </div>
        </div>
      </transition>
      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item three" v-show="playTime > 6000">
          <img src="@/assets/image/home/github.svg?url" alt="" class="icon" />
          <div class="text_box">
            <div class="text1">开源可扩展</div>
            <!-- <div class="text2">93%</div> -->
          </div>

          <div class="_box">
            <div class="d1"></div>
            <div class="d2"></div>
          </div>
        </div>
      </transition>
      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item four" v-show="playTime > 8000">
          <img src="@/assets/image/home/比例.svg?url" alt="" class="icon" />
          <div class="text_box">
            <div class="text1">低使用门槛</div>
            <!-- <div class="text2">93%</div> -->
          </div>

          <div class="_box">
            <div class="d1"></div>
            <div class="d2"></div>
          </div>
        </div>
      </transition>
      <div class="footer">
        <VueSeamlessScroll :data="footer_list" :classOption="{ direction: 2 }">
          <div class="footer_box">
            <template v-for="item in footer_list">
              <a class="footer_item" :href="item.link" target="_blank">
                <img :src="item.icon" alt="" class="icon" />
                <div class="text_box">
                  <div class="text1">{{ item.text1 }}</div>
                  <div class="text2">{{ item.text2 }}</div>
                </div>
              </a>
            </template>
          </div>
        </VueSeamlessScroll>
        <BeiAnBox />
      </div>
    </div>
  </div>
</template>

<language>
{
  进入页面: {
    "zh-CN": "进入页面",
    "en-US": "Enter page",
  },
  typewriter:{
    "zh-CN":"MATSim 可视化建模与仿真开源平台 是一个面向城市交通研究的网页端拖拽式建模平台，将复杂的 MATSim 建模过程模块化、图形化。平台集成 UrbanSim、ActivitySim 与 MATSim，实现从城市空间、出行需求到交通运行的一体化仿真与分析，坚持开源与可扩展设计，适用于科研、规划与工程应用。项目由 广州城市交通科学研究院有限公司赞助并由模型团队负责长期维护，如在建模过程中有任何疑问和问题请在留言板块留言或直接联系开发人员，邮箱convel@163.com。",
    "en-US":"This is a web-based, drag-and-drop modeling platform for urban transportation research, transforming complex MATSim modeling processes into modular and intuitive graphical workflows. The platform integrates UrbanSim, ActivitySim, and MATSim to enable unified simulation and analysis across urban spatial development, travel demand, and traffic operations, with an open-source and extensible design suitable for research, planning, and engineering applications. The project is sponsored by Guangzhou Urban Transportation Research Institute Co., Ltd. and maintained long-term by the modeling team. If you have any questions or encounter issues during modeling, please leave a message on the discussion board or contact the developers directly at convel@163.com."
  }
}
</language>

<script>
import VueSeamlessScroll from "vue-seamless-scroll";
import Typewriter from "@/components/Typewriter.vue";

export default {
  name: "App",
  components: {
    VueSeamlessScroll,
    Typewriter,
  },
  data() {
    return {
      playTime: 10000,
      footer_list: new Array(3)
        .fill([
          {
            icon: require("@/assets/image/home/概况.svg?url"),
            text1: "MATSim",
            text2: "多智能体交通模型",
            link: "./pt.html",
          },
          {
            icon: require("@/assets/image/home/新闻.svg?url"),
            text1: "ActivitySim",
            text2: "活动出行链构建",
            link: "",
          },
          {
            icon: require("@/assets/image/home/项目.svg?url"),
            text1: "UrbanSim",
            text2: "时空分布预测",
            link: "",
          },
          {
            icon: require("@/assets/image/home/科研.svg?url"),
            text1: "建模/Modeling",
            text2: "拖拽式建模",
            link: "",
          },
          {
            icon: require("@/assets/image/home/招聘.svg?url"),
            text1: "可视化/Viz",
            text2: "3d模型可视化",
            link: "",
          },
          {
            icon: require("@/assets/image/home/github.svg?url"),
            text1: "Github",
            text2: "源代码开源",
            link: "https://github.com/convelming",
          },
        ])
        .flat(2),
    };
  },
  computed: {
    tpyelines() {
      return this.$l("typewriter");
    },
    playTime() {
      return this.playTime;
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    clearInterval(this._interval);
  },
  methods: {
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
    openPage(url) {
      window.open(url);
    },
    handleTimeupdate(e) {
      // playTime.value = e.timeStamp
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #666;
}
.language {
  color: #fff;
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
  .module_menu {
    cursor: pointer;
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

  transform: translateX(-50%);
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
        content: "";
        position: absolute;
        top: 12px;
        left: 12px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid #ffffff;
      }
      &::after {
        content: "";
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
    left: 40vw;
  }
  &.three {
    top: 35vh;
    left: 60vw;
  }
  &.four {
    top: 45vh;
    left: 80vw;
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
    width: 100vw;
    padding: 60px 0 0 0;
    box-sizing: border-box;
    display: flex;
    width: fit-content;
    justify-content: center;
    align-items: center;
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
    margin-left: 40px;

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
.typewriter {
  position: absolute;
  top: 80px;
  left: 20px;
  color: #000;

  width: 30vw;

  // text-shadow: -0.5px -0.5px 0 black, /* 左上 */ 0.5px -0.5px 0 black, /* 右上 */ -0.5px 0.5px 0 black, /* 左下 */ 0.5px 0.5px 0 black; /* 右下 */
}
</style>
