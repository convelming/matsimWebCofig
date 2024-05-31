<template>
  <div class="config">
    <div class="_header">
      <img class="logo" src="@/assets/image/logo.png" alt="" />
      <div class="btn_box">
        <el-dropdown class="language" @command="changeLanguage" placement="top-start" trigger="click">
          <div class="btn1">
            <img class="icon" src="@/assets/image/切换语言.png" alt="" />
            <span>{{ $l("切换语言") }}</span>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh-CN" :disabled="page_language == 'zh-CN'">中文（简体）</el-dropdown-item>
            <!-- <el-dropdown-item command="zh_MO" :disabled="page_language == 'zh-MO'">中文（繁體）</el-dropdown-item> -->
            <el-dropdown-item command="en-US" :disabled="page_language == 'en-US'">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="btn1">
          <img class="icon" src="@/assets/image/用户指南.png" alt="" />
          <span>{{ $l("用户指南") }}</span>
        </div>
      </div>
    </div>
    <ConfigBodyerV15 ref="bodyer" :xml="xmlStr" />
    <div class="btn_qhst btn1" @click="handleChangeView()">
      <img class="icon" src="@/assets/image/切换视图.png" alt="" />
      <span>{{ $l("切换视图") }}</span>
    </div>
    <div class="toolbar">
      <a class="btn2" style="font-size: 20px; color: red !important" target="_blank" href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=psngzw">
        <div class="text">BUG</div>
      </a>
      <div class="btn2" @click="handleScrollTop()">
        <img class="icon" src="@/assets/image/顶部.png" alt="" />
        <div class="text">{{ $l("顶部") }}</div>
      </div>
      <div class="btn2" @click="handleUpload()">
        <img class="icon" src="@/assets/image/上传.png" alt="" />
        <div class="text">{{ $l("上传") }}</div>
      </div>
      <div class="btn2" @click="handleSave()">
        <img class="icon" src="@/assets/image/保存.svg" alt="" />
        <div class="text">{{ $l("保存") }}</div>
      </div>
      <div class="btn2" @click="handleRun()">
        <img class="icon" src="@/assets/image/运行.png" alt="" />
        <div class="text">{{ $l("运行") }}</div>
      </div>
      <div class="btn2" @click="handleDownload()">
        <img class="icon" src="@/assets/image/下载.png" alt="" />
        <div class="text">{{ $l("下载") }}</div>
      </div>
    </div>
  </div>
</template>

<language>
{
  "用户指南": {
    "zh-CN": "用户指南",
    "en-US": "用户指南"
  },
  "切换语言": {
    "zh-CN": "切换语言",
    "en-US": "切换语言"
  },
  "切换视图": {
    "zh-CN": "切换视图",
    "en-US": "切换视图"
  },
  "顶部": {
    "zh-CN": "顶部",
    "en-US": "顶部"
  },
  "上传": {
    "zh-CN": "上传",
    "en-US": "上传"
  },
  "刷新": {
    "zh-CN": "刷新",
    "en-US": "刷新"
  },
  "运行": {
    "zh-CN": "运行",
    "en-US": "运行"
  },
  "下载": {
    "zh-CN": "下载",
    "en-US": "下载"
  },
}
</language>

<script>
import ConfigBodyerV15 from "./v15/ConfigBodyer";
export default {
  components: {
    ConfigBodyerV15,
  },
  data() {
    return {
      xmlStr: "",
    };
  },
  created() {
    console.log(ConfigBodyerV15);
    const { database, datasource } = this.$route.params;
    this.$store.dispatch("setDataBase", database);
    this.$store.dispatch("setDataSource", database + "/" + datasource);
  },
  mounted() {
    this.handleReload();
  },
  methods: {
    changeLanguage(lan) {
      this.$setLanguage(lan);
    },
    handleChangeView() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleChangeView();
      }
    },
    handleScrollTop() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleScrollTop();
      }
    },
    handleUpload() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleUpload();
      }
    },
    handleReload() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleReload();
      }
    },
    handleSave() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleSave();
      }
    },
    handleRun() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleRun();
      }
    },
    handleDownload() {
      if (this.$refs.bodyer) {
        this.$refs.bodyer.handleDownload();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none !important;
}
.config {
  overflow: hidden;
  ._header {
    box-sizing: border-box;
    background: #fff;
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    padding: 0 60px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .logo {
      height: 46px;
    }
    .btn_box {
      display: flex;
      margin-left: auto;
      .btn1 {
        margin-left: 20px;
      }
    }
  }
  .toolbar {
    position: fixed;
    z-index: 3000;
    right: 50px;
    bottom: 50px;
    .btn2 {
      margin-top: 20px;
    }
  }
  .btn_qhst {
    position: fixed;
    z-index: 3000;
    right: 60px;
    top: 130px;
  }
  .btn1 {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 40px;
    border: 1px solid rgba($color: #a3a3a3, $alpha: 0.4);
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    .icon {
      width: 24px;
      height: 24px;
      margin-right: 10px;
    }
  }
  .btn2 {
    cursor: pointer;
    user-select: none;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    width: 64px;
    height: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #268bff;
    font-size: 16px;
    .icon {
      width: 24px;
      height: 24px;
      object-fit: cover;
    }
  }
}
</style>
