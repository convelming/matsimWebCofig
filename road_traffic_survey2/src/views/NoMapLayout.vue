<!-- NoMapLayout -->
<template>
  <el-scrollbar class="scrollbar">
    <div class="NoMapLayout">
      <div class="header2">
        <div class="max_box">
          <Logo class="logo" />
          <div class="sreach">
            <input class="input" type="text" placeholder="输入关键词搜索..." />
            <div class="line"></div>
            <Sreach class="icon" />
          </div>
        </div>
      </div>
      <div class="header">
        <div class="max_box">
          <div class="menu1">
            <RouterLink class="menu_item" activeClass="active" :to="{ name: 'home' }">
              <!-- <img class="icon" src="@/assets/images/tab_home_nor.svg" alt="" /> -->
              <TabHome class="icon" />
              <span class="text">首页</span>
            </RouterLink>
            <RouterLink class="menu_item" activeClass="active" :to="{ name: 'upload' }">
              <TabUpload class="icon" />
              <span class="text">数据上传</span>
            </RouterLink>
            <RouterLink class="menu_item" activeClass="active" :to="{ name: 'download' }">
              <TabDownload class="icon" />
              <span class="text">数据下载</span>
            </RouterLink>
            <RouterLink class="menu_item" activeClass="active" :to="{ name: 'feedback' }">
              <TabQuestion class="icon" />
              <span class="text">问题反馈</span>
            </RouterLink>
            <RouterLink class="menu_item" activeClass="active" :to="{ name: 'feedback' }">
              <TabWeb class="icon" />
              <span class="text">研究院官网</span>
            </RouterLink>
          </div>
          <div class="menu2">
            <div class="btn">帮助</div>
            <a
              class="btn"
              href="https://doc.weixin.qq.com/sheet/e3_AdQA8Aa_ADMt1qh97LkSHer6ALqI2?scode=APwA6gfEAA0aeGdABPAdQA8Aa_ADM&tab=BB08J2"
              target="_blank"
              >BUG</a
            >
            <div class="btn">日志</div>
            <div class="btn">视频</div>
          </div>
        </div>
      </div>
      <RouterView />

      <div class="footer"></div>
    </div>
  </el-scrollbar>
</template>

<script setup>
import Logo from '@/assets/images/Home/logo.svg'
import TabHome from '@/assets/images/Home/icon_home2.svg'
import TabUpload from '@/assets/images/Home/icon_dateup1.svg'
import TabDownload from '@/assets/images/Home/icon_download1.svg'
import TabQuestion from '@/assets/images/Home/icon_question1.svg'
import TabWeb from '@/assets/images/Home/icon_web1.svg'
import Sreach from '@/assets/images/Home/搜索.svg'
</script>

<style lang="scss" scoped>
.scrollbar {
  height: 100vh;
  background-color: #f5f5fa;
}
.header {
  position: sticky;
  top: 88px;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0px 2px 4px 0px rgba(128, 128, 128, 0.05);
  .max_box {
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .menu1 {
    display: flex;
    gap: 42px;
    .menu_item {
      cursor: pointer;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      color: #999999;
      font-size: 18px;
      line-height: 18px;
      .icon {
        width: 20px;
        height: 20px;
        display: block;
        :deep(.fill) {
          fill: #999999;
        }
      }

      &.active {
        color: #12b385;
        .icon {
          :deep(.fill) {
            fill: #12b385;
          }
        }
      }
    }
  }
  .menu2 {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 40px;
    * {
      cursor: pointer;
      color: #999999;
      font-size: 16px;
    }
  }
}
.header2 {
  position: sticky;
  top: 0px;
  z-index: 1000;
  background-color: #12b385;
  .max_box {
    padding: 0 20px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo {
    width: 342px;
    height: 40px;
    display: block;
  }
  .sreach {
    width: 400px;
    height: 40px;
    background: #ffffff;
    border-radius: 33px;

    display: flex;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
    .input {
      outline: 0;
      height: 40px;
      line-height: 40px;
      flex: 1;
      width: 0;
      tab-size: 0;
      border: 0;
      margin: 0;
      font-size: 16px;
      padding: 0 16px;
      &::placeholder {
        color: #b2b2b2;
      }
    }
    .line {
      width: 1px;
      height: 20px;
      background: #d8d8d8;
    }
    .icon {
      cursor: pointer;
      width: 24px;
      height: 24px;
      padding: 0 20px;
    }
  }
}
</style>
