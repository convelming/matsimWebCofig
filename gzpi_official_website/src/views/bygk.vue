<!-- gk -->
<template>
  <div class="gk">
    <MHeader class="header" />
    <div class="box1">
      <div class="text1">
        <div>Overview of this court</div>
        <div>本院概况</div>
      </div>
    </div>
    <div class="box2">
      <div class="left">
        <div class="text1">认识GZPI</div>
        <div class="text2">创造更美好的人居环境</div>
        <div class="text3">
          城市交通科学研究院是广州市城市规划勘测设计研究院（GZP I）
          的一支重要特色化专业团队，下设智慧交通研究所、轨道与 TOD 规
          划设计所、交通规划设计所、低空经济研究中心 4 个二级所。围绕“交 通
          +”形成数据驱动的城市交通精细化治理规划与设计、站城融合导
          向下轨道与枢纽一体化设计、低空经济全链条整体解决方案、交通物 流 - 产业 -
          空间协同一体规划设计四大特色产品。团队秉承“创新、
          跨界、融合、共赢”理念，以“为政府和市场提供城市智慧交通全体
          系、全链条解决方案”为愿景，不断创新深化“交通 +”全链条核心
          技术和产品，致力于建设成为粤港澳大湾区技术领先、特色
        </div>
        <img class="img" src="@/assets/image/bygk/2.svg" alt="" />
        <div class="sj_box">
          <div class="item">
            <div class="text1">93%</div>
            <div class="text2">研究生占比</div>
          </div>
          <div class="line"></div>
          <div class="item">
            <div class="text1">72%</div>
            <div class="text2">90后、00后占比</div>
          </div>
          <div class="line"></div>
          <div class="item">
            <div class="text1">40%</div>
            <div class="text2">非交通专业人员比例</div>
          </div>
          <div class="line"></div>
          <div class="item">
            <div class="text1">27%</div>
            <div class="text2">副高以上占比</div>
          </div>
        </div>
      </div>
      <div class="right">
        <img class="img" src="@/assets/image/bygk/矩形6092.jpg" alt="" />
      </div>
    </div>
    <div class="box3">
      <div class="title1">Organizational structure</div>
      <div class="title2">组织架构</div>
      <div class="tree">
        <div class="node1">
          <div class="text">城市交通研究院</div>
          <div class="line"></div>
        </div>
        <div class="node2">
          <div class="line_box">
            <div class="top_line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
          <div class="text_box">
            <div class="text">智慧交通研究所</div>
            <div class="text">
              <span>轨道交通设计所<br />TOD规划设计所</span>
            </div>
            <div class="text">交通规划设计所</div>
            <div class="text">低空经济研究中心</div>
          </div>
          <div class="line_box">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>
        <div class="node3">
          <div class="item">
            <div class="line_box">
              <div class="top_line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <div class="text_box">
              <div class="text">智慧交通规划与治理</div>
              <div class="text">智慧交通工程与咨询</div>
              <div class="text">城市交通数字化治理</div>
            </div>
          </div>
          <div class="item">
            <div class="line_box">
              <div class="top_line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <div class="text_box">
              <div class="text">轨道交通规划设计</div>
              <div class="text">各类TOD规划设计</div>
              <div class="text">TOD全过程咨询</div>
            </div>
          </div>
          <div class="item">
            <div class="line_box">
              <div class="top_line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <div class="text_box">
              <div class="text">国土空间体系综合交通专项</div>
              <div class="text">面向实施交通详细规划设计</div>
              <div class="text">城市交通规划设计与评估咨询</div>
            </div>
          </div>
          <div class="item">
            <div class="line_box">
              <div class="top_line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <div class="text_box">
              <div class="text">低空基础设施规划设计</div>
              <div class="text">低空空域规划研究</div>
              <div class="text">现代物流规划研究中心</div>
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
</script>

<style lang="scss" scoped>
.gk {
  width: 100vw;
  min-height: 100vh;
}
.box1 {
  width: 100%;
  height: 520px;
  background: url('@/assets/image/bygk/矩形6091.jpg');
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
  display: flex;
  padding: 120px 6.25vw 60px 6.25vw;
  align-items: stretch;
  .left {
    position: relative;
    z-index: 20;
    width: 45vw;
    padding-bottom: 80px;
    padding-right: 7.25vw;
    .text1 {
      font-weight: 700;
      font-size: 48px;
      line-height: 67px;
    }
    .text2 {
      font-size: 48px;
      line-height: 67px;
    }
    .text3 {
      font-size: 18px;
      color: #767676;
      line-height: 40px;
      text-align: justify;
    }
    .img {
      width: 48vw;
      height: auto;
    }
    .sj_box {
      width: 62.5vw;
      height: 12.5vw;
      background: #009491;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4vw;
      .item {
        color: #ffffff;
        text-align: center;
        .text1 {
          font-size: 3.3vw;
          line-height: 4.6vw;
          margin-bottom: 1vw;
        }
        .text2 {
          font-size: 1vw;
          line-height: 1.5vw;
        }
      }
      .line {
        width: 1px;
        height: 4.1vw;
        background: rgba($color: #ffffff, $alpha: 0.5);
      }
    }
  }
  .right {
    position: relative;
    z-index: 10;
    width: 0;
    flex: 1;
    .img {
      position: absolute;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      background-color: #767676;
    }
  }
}
.box3 {
  padding: 120px 6.25vw 60px 6.25vw;
  background: url('@/assets/image/bygk/蒙版组 2.png');
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
  .tree {
    width: 72vw;
    margin: auto;
    .node1 {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      .text {
        border-left: 24px solid #009491;
        font-weight: 700;
        font-size: 40px;
        color: #333333;
        line-height: 76px;
        height: 76px;
        padding-left: 20px;
      }
      .line {
        width: 2px;
        height: 100px;
        background: #009491;
        &::before {
          position: relative;
          left: -1px;
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          background: #009491;
          border-radius: 50%;
        }
      }
    }
    .node2 {
      .line_box {
        position: relative;
        width: 100%;
        height: 100px;
        .top_line {
          position: relative;
          top: 1px;
          height: 2px;
          width: 100%;
          background-color: #009491;
        }
        .line {
          position: absolute;
          top: 0;
          display: inline-block;
          width: 2px;
          height: 100px;
          background: #009491;
          &:nth-child(1) {
            left: 0;
          }
          &:nth-child(2) {
            left: 33.3%;
          }
          &:nth-child(3) {
            right: 33.3%;
            transform: translate(100%, 0);
          }
          &:nth-child(4) {
            right: 0;
            transform: translate(100%, 0);
          }
          &::before {
            position: relative;
            left: -1px;
            content: '';
            display: block;
            width: 4px;
            height: 4px;
            background: #009491;
            border-radius: 50%;
          }
        }
      }
      .text_box {
        position: relative;
        width: 100%;
        height: 110px;

        .text {
          position: absolute;
          top: 50%;
          border-left: 20px solid #009491;
          font-weight: 500;
          font-size: 32px;
          color: #333333;
          line-height: 64px;
          height: 64px;
          padding-left: 20px;

          display: inline-block;

          &:nth-child(1) {
            left: 0;
            transform: translate(-50%, -50%);
          }
          &:nth-child(2) {
            left: 33.3%;
            transform: translate(-50%, -50%);
            line-height: 32px;
          }
          &:nth-child(3) {
            right: 33.3%;
            transform: translate(50%, -50%);
          }
          &:nth-child(4) {
            right: 0;
            transform: translate(50%, -50%);
          }
        }
      }
    }
    .node3 {
      position: relative;
      height: 640px;
      .item {
        position: absolute;
        top: 0;
        width: 192px;

        &:nth-child(1) {
          left: 0;
          transform: translate(-50%, 0);
        }
        &:nth-child(2) {
          left: 33.3%;
          transform: translate(-50%, 0);
        }
        &:nth-child(3) {
          right: 33.3%;
          transform: translate(50%, 0);
        }
        &:nth-child(4) {
          right: 0;
          transform: translate(50%, 0);
        }
        .line_box {
          position: relative;
          width: 100%;
          height: 100px;
          .top_line {
            position: relative;
            top: 1px;
            height: 2px;
            width: 100%;
            background-color: #009491;
          }
          .line {
            position: absolute;
            top: 0;
            display: inline-block;
            width: 2px;
            height: 100px;
            background: #009491;
            &:nth-child(1) {
              left: 0;
            }
            &:nth-child(2) {
              left: 50%;
            }
            &:nth-child(4) {
              right: 0;
            }
            &::before {
              position: relative;
              left: -1px;
              content: '';
              display: block;
              width: 4px;
              height: 4px;
              background: #009491;
              border-radius: 50%;
            }
          }
        }
        .text_box {
          position: relative;
          width: 100%;
          margin-top: 20px;

          .text {
            position: absolute;
            top: 0;
            height: 400px;
            border-top: 16px solid #009491;
            font-weight: 500;
            font-size: 28px;
            color: #333333;
            width: 64px;
            line-height: 64px;
            padding-top: 20px;

            writing-mode: vertical-lr; /* 从右向左竖排 */
            text-orientation: mixed; /* 中文保持原方向 */

            display: inline-block;

            &:nth-child(1) {
              left: 0;
              transform: translate(-50%, 0);
            }
            &:nth-child(2) {
              left: 50%;
              transform: translate(-50%, 0);
            }
            &:nth-child(3) {
              right: 0;
              transform: translate(50%, 0);
            }
          }
        }
      }
    }
  }
}
</style>
