<!-- menu -->
<template>
  <!-- <div class="menu">
    <template v-for="item in demoPage">
      <a class="button" :href="`#${item.path}`" target="_blank">{{ item.name }} —— {{ item.title }}</a>
    </template>

    <a class="button" :href="`http://192.168.60.234:8088/`" target="_blank">OSM 地图样式配置</a>
    <a class="button" :href="`http://192.168.60.234:8081/`" target="_blank">OSM TileServer</a>
    <a class="button" :href="`http://192.168.60.231:23105/vue/pt.html#/operationsAnalysis/%E5%B9%BF%E5%B7%9E/nscard0920`" target="_blank">matsim 航路自动划设</a>
  </div> -->
  <div class="bodyer">
    <div class="title">
      <img class="logo" src="./image/favicon.png" alt="" />
      <span>低空示范库</span>
    </div>
    <div class="scrollbar">
      <div class="list">
        <div class="groud4">
          <div class="groud_title">综合演示</div>
          <a class="item item1_2" target="_blank" href="#/demo/page11" style="background-color: yellowgreen">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">低空全景运行监控</div>
            <div class="item_detail">
              大屏动态集成了运行容量（航线数、空域分层占比）、环境（实时天气与风向）、流量（各型无人机作业数量、高峰热力图）等核心数据。在三维地理信息底图上，叠加了结构化航路网、禁限飞区与建筑物，实现了无人机实时位置与直播视频流的同屏融合显示。
            </div>
          </a>
          <a class="item item1_2" target="_blank" href="http://192.168.60.231:23105/vue/pt.html#/operationsAnalysis/%E6%B5%B7%E7%8F%A0/%E6%88%98%E7%95%A5%E8%AF%BE%E9%A2%98demo2" style="background-color: yellowgreen">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">海珠战略课题demo</div>
            <div class="item_detail">
              <!-- 大屏动态集成了运行容量（航线数、空域分层占比）、环境（实时天气与风向）、流量（各型无人机作业数量、高峰热力图）等核心数据。在三维地理信息底图上，叠加了结构化航路网、禁限飞区与建筑物，实现了无人机实时位置与直播视频流的同屏融合显示。 -->
            </div>
          </a>
        </div>
        <div class="groud4">
          <div class="groud_title">航线划设</div>
          <a class="item item1_2" target="_blank" href="http://192.168.60.231:23105/vue/pt.html#/operationsAnalysis/%E5%B9%BF%E5%B7%9E/nscard0920" style="background-color: #f0704b">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">MATSim 航路自动划设</div>
            <div class="item_detail">以matsim可视化平台为基础，通过导入或设定起降点位置，自动生成满足效率与容量约束的初始航路网络。</div>
          </a>
          <a class="item item1_2" target="_blank" href="#/demo/page2" style="background-color: #f0704b">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">城市多层网格航路生成</div>
            <div class="item_detail">基于多层结构化空域网格，自动生成符合空域规则的三维可行航线，并启动高保真无人机飞行推演动画，全程模拟飞行姿态、轨迹与时间。</div>
          </a>
        </div>
        <div class="groud4">
          <div class="groud_title">场景应用</div>
          <a class="item item1_2" target="_blank" href="#/demo/page3" style="background-color: #52b3ba">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">新丰县地形融合航线模拟</div>
            <div class="item_detail">以新丰县为模拟区域，在多层网格化三维空域模型基础上，深度融合高精度地形高程数据，自动生成兼顾地形规避与空域规则的最优航线，并提供无人机全程飞行仿真动画。</div>
          </a>
          <a class="item item1_2" target="_blank" href="#/demo/page8" style="background-color: #52b3ba">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">广州市建筑融合航线模拟</div>
            <div class="item_detail">以广州市为模拟区域，在多层网格化三维空域模型基础上，深度融合建筑白膜数据，自动生成兼顾地形规避与空域规则的最优航线，并提供无人机全程飞行仿真动画。</div>
          </a>
        </div>
        <div class="groud4">
          <div class="groud_title">地图配置</div>
          <a class="item item1_2" target="_blank" href="http://192.168.60.234:8088/" style="background-color: #474ba6">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">开放式地图样式编辑器</div>
            <div class="item_detail">用户无需编程基础，即可通过点选方式，自由定制地图的视觉呈现，包括调整道路、建筑、水系、绿地等图层颜色、线宽、标签及可见性。该工具旨在为院内各项低空研究提供个性化、专题化的地理信息底图。</div>
          </a>
          <a class="item item1_2" target="_blank" href="http://192.168.60.234:8081/" style="background-color: #474ba6">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">地图样式资源库</div>
            <div class="item_detail">本资源库集成并封装了多种适用于专业地理信息系统的现成地图样式方案。</div>
          </a>
        </div>
        <div class="groud8">
          <div class="groud_title">环境模拟</div>
          <a class="item item1_2" target="_blank" href="#/demo/UAVBox" style="background-color: #983379">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">无人机气象环境模拟</div>
            <div class="item_detail">模拟一架无人机在由风向、风速、降水等多要素构成的动态三维气象场中的飞行状态，在其航迹周围空间单元实时可视化封装区域内的微观气象条件。</div>
          </a>
          <a class="item item1_2" target="_blank" href="#/demo/page12" style="background-color: #983379">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">低空风场环境模拟</div>
            <div class="item_detail">以简洁直观的方式，呈现特定时间段内风向、风速的时空演变规律，模拟结果可直接服务于低空飞行安全评估与航路规划。</div>
          </a>
          <a class="item item1_2" target="_blank" href="#/demo/page13" style="background-color: #983379">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">低空类鸟群环境模拟</div>
            <div class="item_detail">通过模拟鸟群的飞行行为，用于研究无人机在共享空域中如何感知、预测并与生物群体安全共存。</div>
          </a>
          <a class="item item1_2" target="_blank" href="#/demo/UAVPhysicsBox" style="background-color: #983379">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">无人机碰撞测试</div>
            <div class="item_detail"></div>
          </a>
        </div>
        <div class="groud2">
          <div class="groud_title">其他应用</div>
          <a class="item item1_2" target="_blank" href="#/demo/page1" style="background-color: green">
            <img class="item_icon" src="./image/数据底座.png" />
            <div class="item_title">低空视角路网车辆全息感知</div>
            <div class="item_detail">基于无人机航拍视频，深度融合计算机视觉与时空数据分析技术，实现了对城市道路车辆的精确检测、轨迹追踪与行为还原。</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "menu",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<!-- <style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  .button {
    text-align: center;
    text-decoration: none;
    color: #000;
    border-radius: 5px;
    border: 1px solid #ccc;
    padding: 10px 20px;
    cursor: pointer;
    &:hover {
      background-color: #eee;
    }
  }
}
</style> -->

<style scoped>
/* html,
body {
  margin: 0;
  padding: 0;
  border: 0;
} */
.bodyer {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background-image: url("./image/back.jpg");
  background-size: cover;
  background-repeat: no-repeat;
}
.bodyer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  width: calc(100vw - 80px);
  max-width: calc(420px * 4 + 10px * 3 + 20px);
  height: 70px;
  line-height: 70px;
  font-size: 60px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #fff;
  display: flex;
  align-items: center;
}
.logo {
  display: block;
  width: auto;
  height: 70px;
  margin-right: 20px;
}

.scrollbar {
  width: calc(100vw - 100px);
  max-width: calc(420px * 4 + 10px * 3 + 20px);
  height: calc(100vh - 160px);
  overflow-y: auto;
}
.scrollbar::-webkit-scrollbar {
  display: none;
}
.list {
  width: calc(100vw - 100px);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.item {
  display: block;
  text-decoration: none;
  box-sizing: border-box;
  border-radius: 10px;
  overflow: hidden;
  padding: 15px;
  color: #fff;
  background-size: cover;
  background-repeat: no-repeat;
  user-select: none;
}
.item1_1 {
  width: 200px;
  height: 200px;
}
.item1_2 {
  width: 420px;
  height: 200px;
}
.item1_2 .item_icon {
  margin-right: 10px;
}
.item1_2 .item_title {
  position: relative;
  bottom: 15px;
  width: 310px;
  font-size: 30px;
  display: inline-block;
}

.item1_2 .item_detail {
  margin-top: 0px;
}

.item_icon {
  width: 70px;
  height: 70px;
  font-size: 70px;
  line-height: 70px;
}
.item_title,
.item_title2 {
  width: 100%;
  font-weight: bold;
  font-size: 18px;
  line-height: 30px;
  margin-top: 10px;
}

.item_detail {
  width: 100%;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  margin-top: 10px;
}

.one_line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.groud2 {
  display: inline-flex;
  flex-wrap: wrap;
  width: 420px;
  gap: 10px;
}

.groud4 {
  flex-grow: 0;
  display: inline-flex;
  flex-wrap: wrap;
  flex-grow: 0;
  max-width: calc(420px * 2 + 10px * 1);
  min-width: 420px;
  gap: 10px;
}

.groud6 {
  flex-grow: 0;
  display: inline-flex;
  flex-wrap: wrap;
  flex-grow: 0;
  max-width: calc(420px * 3 + 10px * 2);
  min-width: 420px;
  gap: 10px;
}
.groud8 {
  flex-grow: 0;
  display: inline-flex;
  flex-wrap: wrap;
  flex-grow: 0;
  max-width: calc(420px * 4 + 10px * 3);
  min-width: 420px;
  gap: 10px;
}

.groud_title {
  color: #fff;
  width: 100%;
  height: 50px;
  flex-grow: 0;
  padding: 10px;
  font-size: 30px;
  font-weight: bold;
}

@media screen and (max-width: 1200px) {
  .title {
    font-size: 5vw;
    margin-bottom: 2vw;
    display: flex;
    align-items: center;
  }
  .logo {
    width: auto;
    height: 8vw;
    margin-right: 2vw;
  }

  .scrollbar {
    width: 90vw;
    height: calc(100vh - 30vw);
  }
  .list {
    padding-top: 2vw;
    width: 90vw;
    gap: 1vw;
    /* margin: -1vw; */
  }
  .item {
    border-radius: 1vw;
    padding: 2vw;
  }
  .item1_1 {
    width: calc(20.5vw);
    height: calc(20.5vw);
  }
  .item1_2 {
    width: calc(43vw);
    height: calc(20.5vw);
  }

  .item1_2 .item_icon {
    margin-right: 1vw;
  }
  .item1_2 .item_title {
    position: relative;
    bottom: 1.2vw;
    width: 31vw;
    line-height: 3vw;
    font-size: 3vw;
    display: inline-block;
  }

  .item_icon {
    width: 7vw;
    height: 7vw;
    font-size: 7vw;
    line-height: 7vw;
  }
  .item_title,
  .item_title2 {
    width: 100%;
    font-size: 2.5vw;
    line-height: 4vw;
    margin-top: 0.5vw;
    font-weight: 400;
  }

  .item_detail {
    width: 100%;
    font-size: 1.4vw;
    line-height: 1.7vw;
    margin-top: 0.5vw;
    font-weight: 400;
    margin-top: 10px;
  }

  .groud2,
  .groud4,
  .groud6 {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 0;
    width: auto;
    max-width: calc(94vw);
    min-width: calc(45vw);
    gap: 1vw;
  }

  .groud_title {
    color: #fff;
    width: 100%;
    height: 5vw;
    flex-grow: 0;
    padding: 1vw;
    font-size: 3vw;
    font-weight: bold;
  }
}
</style>
