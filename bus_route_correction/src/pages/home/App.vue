<!-- App -->
<template>
  <div id="app" class="App">
    <div class="home">
      <div class="nav">
        <img src="@/assets/image/home/logo2.svg?url" alt="" class="logo" />
        <a href="http://192.168.60.231:23105/pt.html#/" class="icon" target="_blank">
          <img src="@/assets/image/home/菜单.svg?url" alt="" />
        </a>
        <a class="icon">
          <img src="@/assets/image/home/搜索.svg?url" alt="" />
        </a>
      </div>
      <video class="video" src="/53941bcfa09e859cc89db3753af9fb78.mp4" autoplay muted @timeupdate="handleTimeupdate"></video>

      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item one" v-show="playTime > 2000">
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
      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item two" v-show="playTime > 4000">
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
      <transition name="el-zoom-in-bottom">
        <div class="bodyer_item three" v-show="playTime > 6000">
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
      <div class="footer">
        <LoopScroll class="footer_box" :dataSource="footer_list" direction="left">
          <template #default="{ item }">
            <a class="footer_item" :href="item.link">
              <img :src="item.icon" alt="" class="icon" />
              <div class="text_box">
                <div class="text1">{{ item.text1 }}</div>
                <div class="text2">{{ item.text2 }}</div>
              </div>
            </a>
          </template>
        </LoopScroll>
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
}
</language>

<script>
const BASE_API_URL = "";

export default {
  name: "App",
  data() {
    return {
      page_language: "zh-CN",
    };
  },
  // computed: {
  //   $l() {
  //     return (key) => internationalize(key, this.language, this.page_language);
  //   },
  // },
  created() {
    this.page_language = sessionStorage.getItem("language") || this.page_language;
    Promise.all([this.handleGetDataBaseList(), this.getDefaultDataSource()]).then((res) => {
      this.dataBase = res[1].dataBase;
      this.handleGetDateSourceList(res[1].dataBase);
    });
    this._interval = setInterval(() => {
      this.getDefaultDataSource();
    }, 5000);
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this._interval);
  },
  methods: {
    getDefaultDataSource() {
      return fetch(BASE_API_URL + "/pt/main/getDefault", {
        headers: {
          uuid: "123",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const [database, datasource] = res.data.name.split("/");
          res.data.dataBase = database;
          res.data.dataSource = datasource;
          this.defaultDataSource = res.data;
          return res.data;
        });
    },
    changeLanguage(lang) {
      this.page_language = lang;
      sessionStorage.setItem("language", lang);
    },
    handleOperationsAnalysisLoad(name) {
      const item = this.dataSourceList.find((v) => v.name === name);
      this.$set(item, "loadStatus", "加载中");
      fetch(BASE_API_URL + "/pt/main/loadScheme?key=" + name)
        .then((res) => res.json())
        .then((res) => {
          this.dataBaseList = res.data.map((v) => ({ name: v }));
          this.$set(item, "loadStatus", "已加载");
        });
    },
    handleOperationsAnalysisToDetail(name) {
      const [database, datasource] = name.split("/");
      const href = `/pt.html#/operationsAnalysis/${database}/${datasource}`;
      // const href = this.$router.resolve({
      //   name: "operationsAnalysis",
      //   params: { database: database, datasource: datasource },
      // }).href;
      window.open(href, "_blank");
    },
    handleGetDataBaseList() {
      fetch(BASE_API_URL + "/pt/main/getAllBase")
        .then((res) => res.json())
        .then((res) => {
          this.dataBaseList = res.data.map((v) => ({ name: v }));
        });
    },
    handleGetDateSourceList(dataBase) {
      fetch(BASE_API_URL + "/pt/main/getAllScheme" + "?base=" + dataBase)
        .then((res) => res.json())
        .then((res) => {
          this.dataSourceList = res.data;
        });
    },
    handleShowDataBase(itemKey = "") {
      this.dataBaseDialog.show = true;
      this.dataBaseDialog.dataBase = this.dataBase;
      this.dataBaseDialog.itemKey = itemKey;
    },
    handleSelectDataBase(row, column, event) {
      this.dataBaseDialog.dataBase = row.name;
    },
    handleChangeDataBase() {
      this.dataBase = this.dataBaseDialog.dataBase;
      this.handleGetDateSourceList(this.dataBase);
      const itemKey = this.dataBaseDialog.itemKey;
      this.dataBaseDialog.dataBase = "";
      this.dataBaseDialog.itemKey = "";
      this.dataBaseDialog.show = false;
      if (itemKey) {
        this.$nextTick(() => {
          this.handleClickItem(itemKey);
        });
      }
    },
    handleClickItem(key) {
      if (!this.dataBase && key != "systemEvaluation") {
        this.handleShowDataBase(key);
        return;
      }
      switch (key) {
        case "operationsAnalysis":
          this.handleShowOperationsAnalysisDialog();
          break;
      }
    },
    handleToSelectDataBase(key) {
      this.handleShowDataBase(key);
      switch (key) {
        case "operationsAnalysis":
          this.operationsAnalysisDialog.show = false;
          this.operationsAnalysisDialog.dataSource = "";
          break;
      }
    },
    handleShowOperationsAnalysisDialog() {
      this.operationsAnalysisDialog.show = true;
      this.operationsAnalysisDialog.dataSource = "";
    },
    handleChangeScale(row) {
      this.$prompt(this.$l("请输入系数"), this.$l("提示"), {
        confirmButtonText: this.$l("确定"),
        cancelButtonText: this.$l("取消"),
        inputValue: row.scale,
        inputValidator: (value) => {
          if (!Number.isFinite(Number(value))) return this.$l("请输入数字作为系数");
        },
      })
        .then(({ value }) => updateScale({ key: row.name, scale: value }))
        .then(() => {
          this.$message.success(this.$l("修改成功"));
          this.handleGetDateSourceList();
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
html,
body {
  margin: 0;
  padding: 0;
  border: 0;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

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
    width: 100vw;
    padding: 60px 40px 0 40px;
    box-sizing: border-box;
    // display: flex;
    // width: fit-content;
    // justify-content: center;
    // align-items: center;
    // gap: 40px;
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
</style>
