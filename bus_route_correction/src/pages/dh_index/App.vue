<!-- App -->
<template>
  <div id="app" class="App">
    <!-- #52b3ba #f0704b #0ec2ee #9d9d9d #1ba5e4 #474ba6 #97b634 #983379 #3abec8 -->
    <div class="title">
      <img class="logo" src="./static/favicon.png" alt="" />
      <span>城市交通数字治理平台</span>
    </div>
    <div class="scrollbar">
      <div class="list">
        <div class="groud4">
          <div class="groud_title">数据底座</div>
          <a class="item item1_2" target="_blank" href="http://192.168.60.231:8080/index.html" style="background-color: yellowgreen">
            <img class="item_icon" src="./static/数据底座.png" />
            <div class="item_title">黄埔区治理平台</div>
          </a>
          <a class="item item1_1" target="_blank" href="http://192.168.24.62:8088/" style="background-color: yellowgreen">
            <img class="item_icon" src="./static/物流监测.png" />
            <div class="item_title">物流数据中台</div>
          </a>
          <a class="item item1_1" target="_blank" href="http://192.168.24.62:5678/td/" style="background-color: yellowgreen">
            <img class="item_icon" src="./static/数据底座.png" />
            <div class="item_title">物流数据底座</div>
          </a>
        </div>
        <div class="groud4">
          <div class="groud_title">模型工具</div>
          <a class="item item1_2" style="background-color: #f0704b" target="_blank" href="http://192.168.60.231:23103/static/login/loginPage.html">
            <!-- href="http://192.168.60.231:23103" -->
            <img class="item_icon" src="./static/MATSim.png" style="width: auto" />
            <div class="item_title2">MATSim onLine 场景建模</div>
          </a>
          <a class="item item1_2" target="_blank" href="http://192.168.60.231:23104/#/demo/menu" style="background-color: #f0704b">
            <img class="item_icon" src="./static/工具包.png" />
            <div class="item_title">分析工具包</div>
          </a>
        </div>
      </div>

      <div class="list">
        <div class="groud_title">治理场景</div>
        <div class="groud2">
          <a class="item item1_2" target="_blank" href="http://192.168.60.234:7050" style="background-color: #52b3ba">
            <img class="item_icon" src="./static/职住平衡.png" />
            <div class="item_title">城市更新分析</div>
          </a>

          <a class="item item1_1" style="background-color: #52b3ba" target="_blank" href="https://www.wenjuan.com/s/zYzANrx/#">
            <img class="item_icon" src="./static/business-icon-feeds-fill.svg" />
            <div class="item_title">出行日记及意向性调查问卷</div>
          </a>

          <a class="item item1_1" style="background-color: #52b3ba" target="_blank" href="http://192.168.60.231:8083/">
            <img class="item_icon" src="./static/business-icon-feeds-fill.svg" />
            <div class="item_title">可配置平台</div>
          </a>
        </div>
        <div class="groud2">
          <a class="item item1_2" target="_blank" href="http://192.168.60.231:23105" style="background-color: #983379">
            <!-- href="http://192.168.3.147:8081/csjt?openType=/cggjcj" -->
            <img class="item_icon" src="./static/常规公交.png" />
            <div class="item_title">常规公交治理</div>
          </a>

          <a class="item item1_1" target="_blank" href="http://192.168.60.232:9195/csjt?openType=/gdjtcj" style="background-color: #983379">
            <img class="item_icon" src="./static/轨道交通.png" />
            <div class="item_title">轨道交通治理</div>
          </a>

          <a class="item item1_1" style="background-color: #983379" target="_blank" href="http://192.168.60.231:23105">
            <img class="item_icon" src="./static/bus.svg" />
            <div class="item_title">广州公交线路矫正</div>
          </a>
        </div>
        <div class="groud2">
          <a class="item item1_2" target="_blank" href="http://192.168.60.232:9195/csjt?openType=/dljtcj" style="background-color: #474ba6">
            <img class="item_icon" src="./static/道路交通.png" />
            <div class="item_title">道路交通治理</div>
          </a>

          <a class="item item1_1" style="background-color: #474ba6" target="_blank" href="http://192.168.60.231:23104/#/index2">
            <img class="item_icon" src="./static/路网.svg" />
            <div class="item_title">道路流量调查</div>
          </a>

          <a class="item item1_1" style="background-color: #474ba6" target="_blank" href="http://192.168.60.231:23101">
            <img class="item_icon" src="./static/network.svg" />
            <div class="item_title">道路拥堵溯源</div>
          </a>
        </div>

        <div class="groud2">
          <a class="item item1_2" style="background-color: green" target="_blank" href="http://192.168.60.231:23100">
            <img class="item_icon" src="./static/Parking, sign.svg" />
            <div class="item_title">停车交通治理</div>
          </a>
          <a class="item item1_2" target="_blank" href="http://192.168.60.232:9195/csjt?openType=hyjtzl" style="background-color: #0070c0">
            <img class="item_icon" src="./static/货运交通.png" />
            <div class="item_title">货运交通治理</div>
          </a>
        </div>
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
    };
  },
  computed: {
  },
  async created() {
  },
  mounted() {},
  beforeDestroy() {
  },
  methods: {

  },
};
</script>

<style lang="scss" scoped>
.back {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  // background-image: url("../img/gz.jpeg");
  background-image: url("~@/assets/image/gz.jpeg");
  background-size: cover;
  background-repeat: no-repeat;
  overflow: auto;
}

.root {
  box-sizing: border-box;
  width: 100%;
  /* min-width: 1200px; */
  padding: 40px;
}

.module {
  /* width: 1100px;
  margin: 0 auto; 
  height: 80px; */
  margin-bottom: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.module .module_menu {
  cursor: pointer;
  font-size: 16px;
  color: #fff;
}

.title {
  /* width: 1100px;
  font-size: 60px; */
  line-height: 60px;
  font-weight: bold;
  margin: 0 auto;
  color: #fff;
  display: flex;
  align-items: center;
  padding-bottom: 50px;
}

.title .logo {
  width: auto;
  height: 60px;
  margin-right: 20px;
  margin-top: 5px;
}

.box {
  /* width: 1100px;
  margin: auto; */
  padding-bottom: 50px;
  /* margin: -10px; */
  display: flex;
  justify-content: flex-end;
}

.box .left {
  box-sizing: border-box;
  width: 350px;
  background: #ffffffcc;
  padding: 20px 25px;
  border-radius: 5px;
}
.box .left .footer {
  padding-top: 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid #999999;
}
.defaultDataSource {
  cursor: pointer;
  height: 30px;
  font-size: 14px;
  border: 1px solid #999999;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-right: 10px;
  padding: 0 10px;
}
.dian {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.tabel_dialog .el-dialog__body {
  padding-top: 10px;
}

.tabel_dialog .tabel_toolbar {
  display: flex;
  margin-bottom: 10px;
}

.BeiAnBox {
  position: absolute;
  bottom: 0px;
}
</style>
