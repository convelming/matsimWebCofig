<!-- home -->
<template>
  <div class="box box1">
    <div class="title_box">
      <img class="icon" src="@/assets/images/icon_database@2x.png" alt="" />
      <div class="text_box">
        <div class="text1">数据库</div>
        <div class="text2">查看下载数据</div>
      </div>
    </div>
    <el-scrollbar wrap-class="scrollbar">
      <div class="content">
        <div class="card">
          <div class="title">城市底座</div>
          <div class="btn_list">
            <a class="btn" href="#/" target="_blank">区划边界</a>
            <a class="btn">土地利用建筑白模</a>
            <a class="btn">POI</a>
          </div>
        </div>
        <div class="card">
          <div class="title">职住通勤</div>
          <div class="btn_list">
            <a class="btn">通勤OD</a>
            <a class="btn">普查人口</a>
          </div>
        </div>
        <div class="card">
          <div class="title">道路流量</div>
          <div class="btn_list">
            <div class="btn">路段流量</div>
            <div class="btn">交叉口流量</div>
            <div class="btn">道路路况</div>
          </div>
        </div>
        <div class="card">
          <div class="title">公共交通</div>
          <div class="btn_list">
            <div class="btn">公交线网</div>
            <div class="btn">地铁线网</div>
            <div class="btn">PTAL</div>
            <div class="btn">公交客流</div>
          </div>
        </div>
        <div class="card">
          <div class="title">货运物流</div>
          <div class="btn_list">
            <div class="btn">企业位置</div>
            <div class="btn">星级酒店</div>
            <div class="btn">末端物流网点</div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
  <div class="box box2">
    <!-- 平台库 -->
    <div class="title_box">
      <div class="text_box">
        <div class="text1">平台库</div>
      </div>
    </div>
    <div class="row">
      <a class="item" href="http://192.168.60.234:8080/" target="_blank">
        <img class="icon" src="@/assets/images/icon_chip@2x.png" alt="" />
        <div class="text">本地大模型</div>
      </a>
      <a class="item" href="http://192.168.60.231:23105/" target="_blank">
        <img class="icon" src="@/assets/images/icon_visualization@2x.png" alt="" />
        <div class="text">Matsim可视化</div>
      </a>
      <a class="item" href="http://192.168.60.231:23105/pt.html#/" target="_blank">
        <img class="icon" src="@/assets/images/icon_bus@2x.png" alt="" />
        <div class="text">公交优化</div>
      </a>
    </div>
    <div class="row">
      <a class="item" href="http://192.168.10.124/gzpi/user/login" target="_blank">
        <img class="icon" src="@/assets/images/icon_cloud@2x.png" alt="" />
        <div class="text">总院时空数据云</div>
      </a>
      <a class="item" href="http://192.168.60.231:8080/index.html" target="_blank">
        <img class="icon" src="@/assets/images/icon_number@2x.png" alt="" />
        <div class="text">黄埔交通数字化</div>
      </a>
    </div>
    <!-- 平台库 -->
  </div>
  <!-- <div class="big_title">交科院信息门户</div> -->
  <div class="box3">
    <div class="big_title text_stroke" value="交科院信息门户"></div>
    <div class="small_title text_stroke" value="-- 常用功能 --"></div>
    <div class="btn_list">
      <div class="btn">道路路况</div>
      <div class="btn">PTAL</div>
      <div class="btn">道路可达性</div>
      <div class="btn">交评仿真</div>
    </div>
  </div>
  <div class="box box4">
    <!-- 新闻 -->
    <div class="title_box">
      <div class="text_box">
        <div class="text1">新闻</div>
      </div>
    </div>
    <div class="list">
      <el-scrollbar wrap-class="scrollbar">
        <div class="content">
          <a class="item">
            <div class="point"></div>
            <div class="value">院向联合国副秘书长、人居署执行主任报告广州可持续发展实践</div>
            <div class="time">2025年8月19日</div>
          </a>
          <a class="item">
            <div class="point"></div>
            <div class="value">湾区区战略|惠州分院受邀为惠州市住建局授课</div>
            <div class="time">2025年8月19日</div>
          </a>
          <a class="item">
            <div class="point"></div>
            <div class="value">举办第13期"A赋能生产"技术交流</div>
            <div class="time">2025年8月19日</div>
          </a>
          <a class="item">
            <div class="point"></div>
            <div class="value">院向联合国副秘书长、人居署执行主任报告广州可持续发展实践</div>
            <div class="time">2025年8月19日</div>
          </a>
          <a class="item">
            <div class="point"></div>
            <div class="value">院向联合国副秘书长、人居署执行主任报告广州可持续发展实践</div>
            <div class="time">2025年8月19日</div>
          </a>
          <a class="item">
            <div class="point"></div>
            <div class="value">院向联合国副秘书长、人居署执行主任报告广州可持续发展实践</div>
            <div class="time">2025年8月19日</div>
          </a>
        </div>
      </el-scrollbar>
    </div>
    <!-- 模型库 -->
  </div>
  <div class="box box5">
    <el-scrollbar wrap-class="scrollbar">
      <!-- 模型库 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_modelbase@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">模型库</div>
          <div class="text2">道路交通模型数据图片下载</div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a class="btn" href="#/" target="_blank">道路路况</a>
          <a class="btn" href="" target="_blank">PTAL</a>
          <a class="btn" href="" target="_blank">道路可达性</a>
          <a class="btn" href="" target="_blank">交评仿真</a>
          <a class="btn" href="" target="_blank">高德地图下载</a>
          <a class="btn" href="" target="_blank">PDF加水印</a>
          <a class="btn" href="" target="_blank">人工数车助手</a>
        </div>
      </div>
      <!-- 模型库 -->
      <!-- 知识库 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_library@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">知识库</div>
          <div class="text2">政策规范快速了解</div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a class="btn" href="http://192.168.60.231:8085/知识库/国家标准规范/" target="_blank"
            >国家标准规范</a
          >
          <a class="btn" href="http://192.168.60.231:8085/知识库/广州交通年鉴/" target="_blank"
            >广州交通年鉴</a
          >
          <a class="btn" href="http://192.168.60.231:8085/知识库/总院流程文件/" target="_blank"
            >总院流程文件</a
          >
          <a class="btn" href="http://192.168.60.231:8085/知识库/物流相关政策/" target="_blank"
            >物流相关政策</a
          >
          <a class="btn" href="http://192.168.60.231:8085/知识库/低空相关政策/" target="_blank"
            >低空相关政策</a
          >
          <a class="btn" href="http://192.168.60.231:8085/知识库/公交相关政策/" target="_blank"
            >公交相关政策</a
          >
        </div>
      </div>
      <!-- 知识库 -->
      <!-- 资源库 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_resource@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">资源库</div>
          <div class="text2">其他实用工具</div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a
            class="btn"
            href="https://doc.weixin.qq.com/smartsheet/s3_AH8AwwajAB82Xowv0CiRpSNLSzdOs?scode=APwA6gfEAA0WkqjoUeAbUANgb6AHE&tab=lvruym&viewId=vXJ7Dv"
            target="_blank"
            >密码狗租借台</a
          >
          <a
            class="btn"
            href="https://doc.weixin.qq.com/smartsheet/s3_AH8AwwajAB81VRWMidLTjynEfcoh3?scode=APwA6gfEAA01FipaXnAbUANgb6AHE&tab=q979lj&viewId=vukaF8"
            target="_blank"
            >效率工具推荐</a
          >
          <a
            class="btn"
            href="https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsM7pwuaBRSyS5gO0dH5?scode=APwA6gfEAA0ZP18PaFAbUANgb6AHE&tab=000001"
            target="_blank"
            >网络资源账号</a
          >
          <a
            class="btn"
            href="https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsjSNSuMCYQjy1MF50wd?scode=APwA6gfEAA0hBfJy6hAbUANgb6AHE&tab=000001"
            target="_blank"
            >部门专家库</a
          >
          <a
            class="btn"
            href="https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsc1vaY1hhTbSBSeG7AC?scode=APwA6gfEAA01rv8LfWAbUANgb6AHE&tab=000001"
            target="_blank"
            >行业期刊</a
          >
        </div>
      </div>
      <!-- 资源库 -->

      <!-- 地区库 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_database@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">地区库</div>
          <div class="text2"></div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a class="btn" href="http://192.168.60.231:8085/地区库/越秀/" target="_blank">越秀</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/天河/" target="_blank">天河</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/黄埔/" target="_blank">黄埔</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/南沙/" target="_blank">南沙</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/白云/" target="_blank">白云</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/海珠/" target="_blank">海珠</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/荔湾/" target="_blank">荔湾</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/番禺/" target="_blank">番禺</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/增城/" target="_blank">增城</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/花都/" target="_blank">花都</a>
          <a class="btn" href="http://192.168.60.231:8085/地区库/从化/" target="_blank">从化</a>
        </div>
      </div>
      <!-- 地区库 -->
      <!-- 案例库 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_database@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">案例库</div>
          <div class="text2"></div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a class="btn" href="http://192.168.60.231:8085/案例库/优秀项目/" target="_blank"
            >优秀项目</a
          >
          <a class="btn" href="http://192.168.60.231:8085/案例库/优秀汇报/" target="_blank"
            >优秀汇报</a
          >
          <a class="btn" href="http://192.168.60.231:8085/案例库/技术沙龙/" target="_blank"
            >技术沙龙</a
          >
        </div>
      </div>
      <!-- 案例库 -->
      <!-- 宣传库 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_database@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">宣传库</div>
          <div class="text2"></div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a class="btn" href="http://192.168.60.231:8085/宣传库/宣传视频/" target="_blank"
            >宣传视频</a
          >
          <a class="btn" href="http://192.168.60.231:8085/宣传库/宣传手册/" target="_blank"
            >宣传手册</a
          >
          <a class="btn" href="http://192.168.60.231:8085/宣传库/活动风采/" target="_blank"
            >活动风采</a
          >
        </div>
      </div>
      <!-- 宣传库 -->
      <!-- 总院文件 -->
      <div class="title_box">
        <img class="icon" src="@/assets/images/icon_database@2x.png" alt="" />
        <div class="text_box">
          <div class="text1">总院文件</div>
          <div class="text2"></div>
        </div>
      </div>
      <div class="card">
        <div class="btn_list">
          <a
            class="btn"
            href="https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a49828b46c70875de4e9419eb77ed"
            target="_blank"
            >规章制度</a
          >
          <a
            class="btn"
            href="https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a49cec675e94fd618ed845f3bc862"
            target="_blank"
            >工作文件</a
          >
          <a
            class="btn"
            href="https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a4a1a6532d42ab1024e54c7a9ccaf"
            target="_blank"
            >资质证书</a
          >
        </div>
      </div>
      <!-- 总院文件 -->
    </el-scrollbar>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style lang="scss" scoped>
.box {
  box-sizing: border-box;
  border-radius: 16px;
  padding: 20px;
  position: absolute;
  z-index: 100;
  backdrop-filter: blur(5px);
  border: 1px solid #ffffff;
}
.title_box {
  display: flex;
  align-items: center;
  gap: 6px;
  .icon {
    width: 64px;
    height: 64px;
    display: block;
  }
  .text_box {
    width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    & > * {
      text-overflow: ellipsis;
      white-space: nowarp;
      overflow: hidden;
    }
    .text1 {
      font-weight: 600;
      font-size: func.fs(24px);
      color: #2c3e50;
    }
    .text2 {
      font-weight: 400;
      font-size: func.fs(16px);
      color: #25a582;
      line-height: 16px;
    }
  }
}
.card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px 8px 8px 8px;
  border: 1px solid #d1ebe4;
  padding: 16px 12px;
  .title {
    font-weight: 600;
    font-size: func.fs(18px);
    color: #2c3e50;
  }
  .title + .btn_list {
    margin-top: 12px;
  }
  .btn_list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 10px;
    .btn {
      cursor: pointer;
      font-weight: 400;
      font-size: func.fs(16px);
      color: #2c3e50;
      &:hover {
        color: #247ce7;
      }
    }
  }
}
.box1 {
  top: func.sy(20px);
  left: func.sx(20px);
  width: func.sx(352px);
  height: func.sy(581px);
  background:
    linear-gradient(
      135deg,
      rgba($color: #cbf0ec, $alpha: 0.5) 0,
      rgba($color: #c8ece8, $alpha: 0.41) 50px,
      rgba($color: #bdd8d5, $alpha: 0) 242px
    ),
    rgba($color: #dae4ee, $alpha: 0.5);

  display: flex;
  flex-direction: column;
  gap: 10px;
  .scrollbar {
    height: 0;
    flex: 1;
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.box2 {
  transform-origin: left bottom;
  bottom: func.sy(20px);
  left: func.sx(20px);

  width: func.sx(350px);
  // height: func.sy(240px);
  height: 240px;
  background:
    linear-gradient(
      135deg,
      rgba($color: #cbf0ec, $alpha: 0.5) 0,
      rgba($color: #c8ece8, $alpha: 0.41) 50px,
      rgba($color: #bdd8d5, $alpha: 0) 242px
    ),
    rgba($color: #dae4ee, $alpha: 0.5);
  display: flex;
  flex-direction: column;
  gap: 10px;
  .row {
    display: flex;
    justify-content: space-around;
    .item {
      cursor: pointer;
      width: 33%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      .icon {
        width: 48px;
        height: 48px;
      }
      .text {
        white-space: nowrap;
        font-weight: 400;
        font-size: func.fs(16px);
        color: #2c3e50;
      }
      &:hover .text {
        color: #247ce7;
      }
    }
  }
}
.text_stroke {
  position: relative;
  &::before {
    content: attr(value);
    text-shadow: 0px 4px 10px rgba(63, 150, 126, 0.44);
    text-stroke: 2px rgba(255, 255, 255, 0.7);
    -webkit-text-stroke: 2px rgba(255, 255, 255, 0.7);
    text-align: left;
    font-style: normal;
    text-transform: none;
  }
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    content: attr(value);

    background: linear-gradient(64.00447218991306deg, #205244 0%, #105d47 52%, #0c3f31 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
.box3 {
  z-index: 100;
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  .big_title {
    font-weight: 800;
    font-size: 72px;
    line-height: 72px;
    color: #105d47;
  }
  .small_title {
    margin-top: 40px;
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
    color: #105d47;
  }
  .btn_list {
    margin-top: 27px;
    display: flex;
    gap: 12px;
    .btn {
      cursor: pointer;
      text-align: center;
      line-height: 50px;
      width: 140px;
      height: 50px;
      background: #ffffff;
      box-shadow: 0px 4px 10px 0px rgba(121, 161, 150, 0.31);
      border-radius: 33px 33px 33px 33px;
      font-weight: 500;
      font-size: 18px;
      color: #30b690;
      &:hover {
        background-color: #30b690;
        color: #fff;
      }
    }
  }
}

.box4 {
  bottom: func.sy(20px);
  left: func.sx(390px);
  right: func.sx(430px);

  // width: 1029px;
  // height: func.sy(240px);
  height: 240px;
  background:
    linear-gradient(
      135deg,
      rgba($color: #cbf0ec, $alpha: 0.5) 0,
      rgba($color: #c8ece8, $alpha: 0.41) 50px,
      rgba($color: #bdd8d5, $alpha: 0) 242px,
      rgba($color: #bdd8d5, $alpha: 0) calc(100% - 242px),
      rgba($color: #c8ece8, $alpha: 0.41) calc(100% - 50px),
      rgba($color: #cbf0ec, $alpha: 0.5) 100%
    ),
    rgba($color: #dae4ee, $alpha: 0.5);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  .list {
    height: 0;
    flex: 1;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 10px 10px 10px 10px;
    border: 1px solid #d1ebe4;
    padding: 15px;
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      &:hover {
        .value {
          color: #247ce7;
        }
        .time {
          color: #247ce7;
        }
      }
      .point {
        margin: 0 6px;
        width: 6px;
        height: 6px;
        background: #3ba185;
        border-radius: 3px;
      }
      .value {
        width: 0;
        flex: 1;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: 400;
        font-size: 16px;
        color: #2c3e50;
      }
      .time {
        margin-left: 10px;
        font-weight: 400;
        font-size: 16px;
        color: #666666;
      }
    }
  }
}
.box5 {
  top: func.sy(20px);
  bottom: func.sy(20px);
  right: func.sx(20px);

  width: func.sx(394px);
  // height: 240px;
  background:
    url('@/assets/images/bg_wave02@2x.png'),
    linear-gradient(
      135deg,
      rgba($color: #cbf0ec, $alpha: 0.5) 0,
      rgba($color: #c8ece8, $alpha: 0.41) 10%,
      rgba($color: #bdd8d5, $alpha: 0) 30%
    ),
    rgba($color: #dae4ee, $alpha: 0.5);
  background-size:
    392px 524px,
    100% 100%,
    100% 100%;
  background-position:
    bottom left,
    top left,
    top left;
  background-repeat: no-repeat;
  .title_box + .card {
    margin-top: 10px;
  }
  .card + .title_box {
    margin-top: 32px;
  }
}
</style>
