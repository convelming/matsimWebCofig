<!-- MFooter -->
<template>
  <div class="MFooter">
    <div class="f_box1">
      <img src="@/assets/image/footer/logo2.svg?url" alt="" class="logo" />
      <div class="link_box">
        <div class="item">
          <a class="title">本院概括</a>
          <a class="link">本院介绍</a>
          <a class="link">人才结构</a>
          <a class="link">组织架构</a>
        </div>
        <div class="item">
          <a class="title">项目展示</a>
          <a class="link">城市综合交通规划</a>
          <a class="link">枢纽与物流</a>
          <a class="link">智慧交通</a>
          <a class="link">低空经济</a>
        </div>
        <div class="item">
          <a class="title">科研成果</a>
          <a class="link">项目获奖</a>
          <a class="link">集体荣誉</a>
          <a class="link">科研建设</a>
        </div>
        <div class="item">
          <a class="title">加入我们</a>
          <a class="link">校园招聘</a>
          <a class="link">社会招聘</a>
          <a class="link">招聘答疑</a>
        </div>
      </div>
      <div class="ecode_box">
        <img class="img" src="@/assets/image/footer/ecode.png?url" alt="" />
        <div class="text">扫码关注公众号</div>
      </div>
    </div>
    <div class="f_copy">
      广州市城市规划勘测设计研究院 版权所有粤ICP备12054983号-1公网安备44060402002904号
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.MFooter {
  background: #353535;

  .f_box1 {
    padding: 120px min(6.5vw, 120px) 80px min(6.5vw, 120px);
    gap: 24px;

    display: flex;
    align-items: flex-start;
    .logo {
      display: block;
      height: 80px;
      margin-right: min(120px, 4vw);
    }

    .link_box {
      display: flex;
      margin-right: auto;
      gap: min(72px, 2vw);
      .item {
        a {
          display: block;
          text-decoration: none;
          text-wrap: nowrap;
        }
        .title {
          font-weight: 500;
          font-size: 18px;
          color: #ffffff;
          line-height: 28px;
          margin-bottom: 16px;
        }
        .link {
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;
          margin-bottom: 12px;
        }
      }
    }

    .ecode_box {
      .img {
        display: block;
        width: 140px;
        height: 140px;
        margin-bottom: 10px;
      }
      .text {
        font-size: 18px;
        color: #ffffff;
        line-height: 25px;
        text-align: center;
      }
    }
  }

  .f_copy {
    margin: 0 6.25vw;
    border-top: 1px solid rgba($color: #ffffff, $alpha: 0.2);
    padding: 32px 0;
    text-align: center;
    font-size: 18px;
    color: #9e9e9e;
    line-height: 25px;
  }
}
</style>
