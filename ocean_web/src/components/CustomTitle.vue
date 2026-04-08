<template>
  <div class="custom-title">
    <div class="content-box">
      <div class="left-shape">
        <div class="item"></div>
        <div class="item"></div>
      </div>
      <div class="text">
        {{ title }}
        <a-tooltip
          :overlayStyle="{ transform: `scale(${scaleVal})` }"
          :overlayClassName="tooltipText.length > 200 ? 'custom-tooltip' : ''"
          v-if="isShowTooltip"
        >
          <template #title>
            <p class="tooltipText" v-html="tooltipText"></p>
          </template>
          <i class="iconfont icon-tishishuoming"></i>
        </a-tooltip>
        <!-- 发布时间 -->
        <span v-if="releaseTime" class="release-time">{{ releaseTime }}</span>
      </div>

      <div class="right-btns">
        <a-button v-if="showManageBtn" class="manage-btn" type="text" @click="emit('click:manage')">
          管理
        </a-button>

        <a-button
          v-if="showRefreshBtn"
          class="refresh-btn"
          type="text"
          @click="emit('click:refresh')"
        >
          刷新
        </a-button>

        <a-button v-if="showMoreBtn" class="more-btn" type="text" @click="emit('click:more')">
          更多
        </a-button>

        <i v-if="showManageBtn || showRefreshBtn || showMoreBtn" class="iconfont icon-you"></i>
      </div>
    </div>
    <div class="bottom-shape" v-if="showBottomShape">
      <img src="@/assets/images/bottom-shape.png" />
    </div>
  </div>
</template>

<script setup lang="ts" name="CustomTitle">
import { onUnmounted, ref } from 'vue'

const emit = defineEmits(['click:more', 'click:refresh', 'click:manage'])
/**
 * 自定义标题组件
 * @component CustomTitle
 * @props {String} title - 标题文本
 * @props {Boolean} showBottomShape - 是否显示底部形状
 * @props {Boolean} showMoreBtn - 是否显示更多按钮
 */
const props = defineProps({
  title: {
    type: String,
    default: '标题',
  },
  showBottomShape: {
    type: Boolean,
    default: false,
  },
  showMoreBtn: {
    type: Boolean,
    default: false,
  },
  showManageBtn: {
    type: Boolean,
    default: false,
  },
  isShowTooltip: {
    type: Boolean,
    default: false,
  },
  tooltipText: {
    type: String,
    default: '',
  },
  // 发布时间
  releaseTime: {
    type: String,
    default: '',
  },
  // 刷新按钮
  showRefreshBtn: {
    type: Boolean,
    default: false,
  },
  refreshLoading: {
    type: Boolean,
    default: false,
  },
})

const scaleVal = ref<number>(1)
const getScaleVal = () => {
  const app: HTMLElement | null = document.querySelector('#app')
  const appTransformVal = app?.style.transform
  const match = appTransformVal?.match(/scale\(([\d.]+)\)/)
  if (match && match[1]) {
    scaleVal.value = Number(match[1])
  }
}

window.addEventListener('resize', getScaleVal)

onUnmounted(() => window.removeEventListener('resize', getScaleVal))
</script>

<style scoped lang="scss">
.custom-title {
  margin: 14px;
  user-select: none;
  .content-box {
    position: relative;
    display: flex;
    align-items: center;

    .left-shape {
      display: flex;
      align-items: center;
      .item {
        background: linear-gradient(45deg, rgba($main-color, 0) 0%, rgba($main-color, 1) 100%);
        box-shadow: 2px 1px 4px rgba($card-shadow-color, 0.35);
        transform-origin: center;
        transform: rotate(45deg);
      }

      .item:nth-of-type(1) {
        width: 8px;
        height: 8px;
      }
      .item:nth-of-type(2) {
        width: 12px;
        height: 12px;
      }
    }

    .text {
      flex: 1;
      margin-left: 10px;
      font-size: 16px;
      color: $title-font-color;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 8px;
      .iconfont {
        margin-left: 6px;
        color: $sub-sub-title-font-color;
        font-size: 16px;
        cursor: pointer;
        font-weight: 500;

        &:hover {
          color: $main-color;
        }
      }
    }

    .right-btns {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-45%);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      .manage-btn,
      .refresh-btn,
      .more-btn {
        padding: 0;
        font-size: 18px;
        color: $main-color;

        &:hover {
          background-color: transparent;
        }
      }

      .icon-you {
        margin-left: -6px;
      }
    }

    .iconfont {
      color: $main-color;
    }
  }

  .bottom-shape img {
    width: 100%;
  }
}

.tooltipText {
  white-space: pre-line;
}
</style>
