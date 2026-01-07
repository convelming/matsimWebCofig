<!-- kycg -->
<template>
  <div class="kycg">
    <MHeader />
    <div class="box1">
      <div class="text1">
        <div>Scientific research achievements</div>
        <div>科研成果</div>
      </div>
    </div>
    <div class="box2" id="xmhj">
      <div class="title1">Award-winning project</div>
      <div class="title2">项目获奖</div>
      <div class="content">
        <div class="left">
          <div class="item">
            <img src="@/assets/image/kycg/容器.svg?url" alt="" class="icon" />
            <div class="text1">项目获奖</div>
            <div class="text2">
              <span>144</span>
              <span class="text3">项</span>
            </div>
          </div>
          <div class="item">
            <div class="text1">国家及部级奖</div>
            <div class="text2">
              <span>19</span>
              <span class="text3">项</span>
            </div>
          </div>
          <div class="item">
            <div class="text1">国家及部级奖</div>
            <div class="text2">
              <span>19</span>
              <span class="text3">项</span>
            </div>
          </div>
          <div class="item">
            <div class="text1">国家及部级奖</div>
            <div class="text2">
              <span>19</span>
              <span class="text3">项</span>
            </div>
          </div>
          <div class="item">
            <div class="text1">国家及部级奖</div>
            <div class="text2">
              <span>19</span>
              <span class="text3">项</span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="b1">
            <img src="@/assets/image/kycg/more.svg?url" alt="" class="icon" />
            <img src="@/assets/image/kycg/more.svg?url" alt="" class="icon" />
            <div class="line"></div>
          </div>
          <el-auto-resizer class="list">
            <template #default="{ height, width }">
              <el-scrollbar :width="width" :height="height">
                <div class="item" v-for="value in 6">
                  <div class="time">2024年</div>
                  <div class="title">广东省优秀城市规划设计项目三等奖</div>
                  <div class="detail">《国土空间规划背景下的揭阳市点状交通设施城乡融合规划》</div>
                </div>
              </el-scrollbar>
            </template>
          </el-auto-resizer>
        </div>
      </div>
    </div>
    <div class="box3" id="jtry">
      <div class="title1">Collective Honor</div>
      <div class="title2">集体荣誉</div>
      <div class="content">
        <img src="@/assets/image/kycg/蒙版组 2.svg?url" alt="" class="back" />
        <img src="@/assets/image/kycg/蒙版组 1.svg?url" alt="" class="back2" />
        <div class="b1">
          <img src="@/assets/image/kycg/容器(1).svg?url" alt="" class="icon" />
          <div>
            <div class="text1">集体荣誉</div>
            <div class="text2">
              <span>11</span>
              <span class="text3">次</span>
            </div>
          </div>
        </div>
        <div class="b2">
          <img src="@/assets/image/kycg/组 126.svg?url" alt="" class="icon" />
          <div class="text1">5次先进集体，连续3年蝉联</div>
          <div class="text2">2022年度院先进集体</div>
          <div class="text2">2021年度院先进集体</div>
          <div class="text2">2020年度院先进集体</div>
          <div class="text2">2018年度院先进集体</div>
          <div class="text2">2015年度院先进集体</div>
        </div>
        <div class="b3">
          <img src="@/assets/image/kycg/组 126.svg?url" alt="" class="icon" />
          <div class="text1">3次优秀党支部</div>
          <div class="text2">2024年度院优秀基层党支部</div>
          <div class="text2">2021年度院优秀基层党支部</div>
          <div class="text2">2016年度院优秀基层党支部</div>
        </div>
        <div class="b4">
          <img src="@/assets/image/kycg/组 126.svg?url" alt="" class="icon" />
          <div class="text1">3次质量管理奖</div>
          <div class="text2">2021年度院优秀质量管理奖</div>
          <div class="text2">2017年度院质量管理表扬奖</div>
          <div class="text2">2016年度院优秀质量管理奖</div>
        </div>
      </div>
    </div>
    <div class="box4" id="kyjs">
      <div class="title1">Scientific research and construction</div>
      <div class="title2">科研建设</div>
      <div class="content">
        <div class="item">
          <div class="back">01</div>
          <div class="title">科研课题</div>
          <div class="text1">开展科研课题 <span class="text2">50</span> 项</div>
          <div class="text1">国家自然科学基金面上项目 <span class="text2">1</span> 项</div>
          <div class="text1">获评优秀课题 <span class="text2">22</span> 项</div>
        </div>
        <div class="item">
          <div class="back">02</div>
          <div class="title">论文专著</div>
          <div class="text1">累计发表论文 <span class="text2">167</span> 篇</div>
          <div class="text1">核心期刊 <span class="text2">51</span> 篇</div>
          <div class="text1">出版专著 <span class="text2">8</span> 篇</div>
        </div>
        <div class="item2">
          <img src="@/assets/image/kycg/容器(2).svg?url" alt="" class="icon" />
          <div class="text1">科研建设</div>
          <div>
            <span class="text2">275</span>
            <span class="text3">+</span>
          </div>
        </div>
        <div class="item">
          <div class="back">03</div>
          <div class="title">知识产权</div>
          <div class="text1">获批知识产权 <span class="text2">40</span> 项</div>
          <div class="text1">实用新型专利 <span class="text2">7</span> 项</div>
          <div class="text1">发明专利 <span class="text2">23</span> 项</div>
          <div class="text1">软件著作权 <span class="text2">11</span> 项</div>
        </div>
        <div class="item">
          <div class="back">04</div>
          <div class="title">参编标准</div>
          <div class="text1">主编和参编标准 <span class="text2">18</span> 项</div>
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
.kycg {
  width: 100vw;
  min-height: 100vh;
}

.box1 {
  width: 100%;
  background: url('@/assets/image/xwzx/矩形 6091.jpg');
  background-size: cover;
  background-position: center;
  .text1 {
    padding-top: 180px;
    padding-bottom: 100px;
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
  background: #f5f5f5;
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
  }
  .content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .left {
      padding-top: 80px;
      width: 36.5vw;
      display: flex;
      flex-wrap: wrap;
      .item:nth-child(1) {
        padding-left: 15.6vw;
        position: relative;
        width: 36.5vw;
        height: 18.5vw;
        background: #009491;
        border: 1px solid #009491;
        .icon {
          position: absolute;
          top: 4.55vw;
          left: 3.125vw;
          width: 9.4vw;
          height: 9.4vw;
        }

        .text1 {
          font-weight: 700;
          font-size: max(1.875vw, 16px);
          color: #fff;
          margin-bottom: max(0.75vw, 15px);
        }
        .text2 {
          font-weight: 700;
          font-size: max(3.3vw, 20px);
          color: #fff;
        }
        .text3 {
          font-weight: 400;
          font-size: max(1.25vw, 12px);
          color: #fff;
          margin-left: 10px;
        }
      }
      .item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 1vw;

        box-sizing: border-box;
        padding-left: 2.34vw;
        width: 18.25vw;
        height: 13.5vw;
        border: 1px solid #dbe0e0;
        background-color: #ededed;
        .text1 {
          font-size: 1.25vw;
          color: #333333;
          line-height: 1.25vw;
        }
        .text2 {
          font-weight: 700;
          font-size: max(2.5vw, 16px);
          color: #009491;
          line-height: max(2.5vw, 16px);
        }
        .text3 {
          font-weight: 400;
          font-size: max(1.25vw, 12px);
          color: #009491;
          margin-left: 5px;
        }
      }
    }
    .right {
      width: 44.3vw;
      .b1 {
        height: 80px;
        position: relative;
        border-bottom: 4px solid #ededed;
        margin-bottom: -4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .icon {
          display: block;
          width: 34px;
          height: 34px;
          cursor: pointer;
          &:nth-child(1) {
            transform: rotate(90deg);
          }
          &:nth-child(2) {
            transform: rotate(-90deg);
          }
        }
        .line {
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 4px;
          width: 10%;
          background: #009491;
        }
      }
      .list {
        box-sizing: border-box;
        margin-top: 20px;
        height: calc(45.5vw - 20px) !important;
        .item {
          padding: 20px 0;
          border-bottom: 1px solid #eee;
          .time {
            font-size: 18px;
            color: #666666;

            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .title {
            font-weight: 500;
            font-size: 24px;
            margin-bottom: 10px;

            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .detail {
            font-size: 18px;
            color: #666666;

            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }
  }
}

.box3 {
  padding: 100px 0 140px 0;
  background: #fff;
  height: 74.32vw;
  .title1 {
    position: relative;
    z-index: 30;
    padding: 0 6.25vw;
    font-weight: 800;
    font-size: 64px;
    color: #d7e0e0;
    line-height: 64px;
    margin-bottom: 30px;
  }
  .title2 {
    position: relative;
    z-index: 30;
    padding: 0 6.25vw;
    font-weight: 700;
    font-size: 48px;
    color: #1a1a1a;
    line-height: 48px;
  }
  .content {
    margin-top: 28px;
    position: relative;
    z-index: 20;
    position: relative;
    height: 52vw;
    .back {
      position: absolute;
      top: -15.5vw;
      left: 0;
      display: block;
      width: 100vw;
      height: 78.125vw;
    }
    .back2 {
      position: absolute;
      top: 0;
      left: 32.25vw;
      width: 26vw;
      height: 52vw;
    }
    .b1 {
      position: absolute;
      left: 0;
      top: 14vw;
      width: 44.8vw;
      height: 22.9vw;
      background-color: #009491;
      border-top-right-radius: 11.5vw;
      border-bottom-right-radius: 11.5vw;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        display: block;
        width: max(9.375vw, 100px);
        height: max(9.375vw, 100px);
        margin-right: max(3vw, 30px);
      }
      .text1 {
        font-weight: 700;
        font-size: max(1.875vw, 16px);
        color: #ffffff;
        margin-bottom: max(0.75vw, 15px);
      }
      .text2 {
        font-weight: 800;
        font-size: max(3.3vw, 20px);
        color: #ffffff;
      }
      .text3 {
        font-weight: 500;
        font-size: max(1.25vw, 12px);
        color: #ffffff;
        margin-left: 10px;
      }
    }

    .b2 {
      position: absolute;
      top: 2.1vw;
      left: 42.8vw;
      padding-left: 5vw;
      .icon {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: max(2.5vw, 20px);
        height: max(2.5vw, 20px);
      }
      .text1 {
        font-weight: 500;
        font-size: max(2.5vw, 20px);
        line-height: max(2.5vw, 20px);
        margin-bottom: max(1.66vw, 16px);
      }
      .text2 {
        font-weight: 400;
        font-size: max(1.04vw, 12px);
        line-height: max(1.04vw, 12px);
        color: #666666;
        margin-bottom: max(0.8vw, 8px);
      }

      @for $n from 3 through 7 {
        .text2:nth-child(#{$n}) {
          margin-left: calc(#{$n} * 1.5625vw);
        }
      }
    }

    .b3 {
      position: absolute;
      top: 23vw;
      left: 56.8vw;
      padding-left: 5vw;
      .icon {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: max(2.5vw, 20px);
        height: max(2.5vw, 20px);
      }
      .text1 {
        font-weight: 500;
        font-size: max(2.5vw, 20px);
        line-height: max(2.5vw, 20px);
        margin-bottom: max(1.66vw, 16px);
      }
      .text2 {
        font-weight: 400;
        font-size: max(1.04vw, 12px);
        line-height: max(1.04vw, 12px);
        color: #666666;
        margin-bottom: max(0.8vw, 8px);
      }
    }

    .b4 {
      position: absolute;
      top: 40.1vw;
      left: 51.8vw;
      padding-left: 5vw;
      .icon {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: max(2.5vw, 20px);
        height: max(2.5vw, 20px);
      }
      .text1 {
        font-weight: 500;
        font-size: max(2.5vw, 20px);
        line-height: max(2.5vw, 20px);
        margin-bottom: max(1.66vw, 16px);
      }
      .text2 {
        font-weight: 400;
        font-size: max(1.04vw, 12px);
        line-height: max(1.04vw, 12px);
        color: #666666;
        margin-bottom: max(0.8vw, 8px);
      }

      @for $n from 3 through 5 {
        .text2:nth-child(#{$n}) {
          margin-left: calc(#{2 - $n} * 1.5625vw);
        }
      }
    }
  }
}

.box4 {
  padding: 100px 6.25vw 140px 6.25vw;
  background: #f5f5f5;
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
    margin-bottom: 80px;
  }
  .content {
    display: grid;
    grid-gap: 40px;
    grid-template-columns: 28vw 28vw 1fr;
    grid-template-rows: 25vw 21vw;
    flex-wrap: wrap;

    .item:nth-child(4) {
      grid-column-start: 1;
      grid-column-end: 3;
    }
    .item {
      position: relative;
      background: #fff;
      padding-left: 4.17vw;
      padding-top: 4.17vw;
      .back {
        font-family:
          BioRhyme Expanded,
          BioRhyme Expanded;
        position: absolute;
        top: 0;
        left: 0;
        font-size: 7.5vw;
        line-height: 7.5vw;
        color: rgba(0, 148, 145, 0.1);
      }
      .title {
        width: 100%;
        font-weight: 700;
        font-size: max(2.5vw, 24px);
        color: #009491;
        line-height: max(3.5vw, 34px);
        margin-bottom: max(2vw, 22px);
      }
      .text1 {
        display: inline-block;
        width: 23vw;
        position: relative;
        font-size: max(1.25vw, 12px);
        line-height: max(1.9vw, 14px);
        padding-left: max(1.56vw, 16px);
        margin-bottom: max(1.56vw, 16px);
        &::before {
          position: absolute;
          top: 60%;
          left: 0;
          transform: translateY(-50%);
          content: '';
          display: block;
          width: max(1vw, 8px);
          height: max(1vw, 8px);
          background: #009491;
          border-radius: 50%;
        }
      }
      .text2 {
        font-weight: 500;
        font-size: max(1.66vw, 20px);
        color: #009491;
      }
    }
    .item2 {
      padding-left: 4.17vw;
      padding-top: 3.125vw;
      background: #009491;
      .icon {
        display: block;
        width: 9.375vw;
        height: 9.375vw;
        margin-bottom: 1vw;
      }
      .text1 {
        font-weight: 700;
        font-size: max(1.875vw, 20px);
        color: #ffffff;
        margin-bottom: 1vw;
      }
      .text2 {
        font-weight: 800;
        font-size: max(3.75vw, 40px);
        color: #ffffff;
      }
      .text3 {
        font-weight: 500;
        font-size: max(2.5vw, 25px);
        color: #ffffff;
      }
    }
  }
}
</style>
