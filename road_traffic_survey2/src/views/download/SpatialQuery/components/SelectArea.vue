<!-- SelectArea -->
<template>
  <div class="SelectArea_minibtn" v-show="!showDialog" @click="showDialog = true">+</div>
  <MDialog
    ref="SelectArea_bialog"
    class="SelectArea_bialog"
    title="圈选统计"
    subTitle="点击地图开始"
    :y="80"
    :x="20"
    placement="top-right"
    width="300px"
    v-model:visible="showDialog"
  >
    <div class="SelectArea_bialog_bodyer">
      <div
        class="btn"
        :class="{ active: selectType == SelectTypeEnum.Rectangle }"
        @click="handleChangeSelectType(SelectTypeEnum.Rectangle)"
      >
        <div class="icon"></div>
        <div class="text">
          <span class="text1">矩形圈选</span>
          <span class="text2">点击绘制矩形范围</span>
        </div>
      </div>
      <div
        class="btn"
        :class="{ active: selectType == SelectTypeEnum.Polygon }"
        @click="handleChangeSelectType(SelectTypeEnum.Polygon)"
      >
        <div class="icon"></div>
        <div class="text">
          <span class="text1">多边形圈选</span>
          <span class="text2">点击绘制多边形范围</span>
        </div>
      </div>
      <div
        class="btn"
        :class="{ active: selectType == SelectTypeEnum.Circle }"
        @click="handleChangeSelectType(SelectTypeEnum.Circle)"
      >
        <div class="icon"></div>
        <div class="text">
          <span class="text1">圆形圈选</span>
          <span class="text2">点击绘制圆形范围</span>
        </div>
      </div>
      <div
        class="btn2"
        @click="handleStartSelect"
        v-if="
          (selectState == SELECT_STATE_KEY.NOT_STARTED || selectState == SELECT_STATE_KEY.ENDED) &&
          selectPath.length <= 0
        "
      >
        开始圈选
      </div>
      <div class="btn2" @click="handleResetSelect" v-if="selectPath.length > 0">重新圈选</div>
      <div
        class="btn2"
        @click="handleStopSelect"
        v-if="
          selectState == SELECT_STATE_KEY.CAN_START || selectState == SELECT_STATE_KEY.IN_PROGREES
        "
      >
        退出圈选
      </div>
    </div>
  </MDialog>
</template>

<script setup>
import { addWatch, injectSync } from '@/utils'
import {
  RectangleSelectLayer,
  PolygonSelectLayer,
  CircleSelectLayer,
  SELECT_EVENT,
  SELECT_STATE_KEY,
} from '@/utils/MapLayer/SelectLayer'
const SelectTypeEnum = {
  Rectangle: 'Rectangle',
  Polygon: 'Polygon',
  Circle: 'Circle',
}

let _Map = null
const _RectangleSelectLayer = new RectangleSelectLayer({
  event: {
    [SELECT_EVENT.STATE_CHANGE]: (data) => handleChangeSelectState(SelectTypeEnum.Rectangle, data),
  },
})
const _PolygonSelectLayer = new PolygonSelectLayer({
  event: {
    [SELECT_EVENT.STATE_CHANGE]: (data) => handleChangeSelectState(SelectTypeEnum.Polygon, data),
  },
})
const _CircleSelectLayer = new CircleSelectLayer({
  event: {
    [SELECT_EVENT.STATE_CHANGE]: (data) => handleChangeSelectState(SelectTypeEnum.Circle, data),
  },
})
injectSync('MapRef').then((map) => {
  console.log('map', map)
  _Map = map.value
  _Map.addLayer(_CircleSelectLayer)
  _Map.addLayer(_RectangleSelectLayer)
  _Map.addLayer(_PolygonSelectLayer)
})

const showDialog = ref(true)
const selectState = ref(SELECT_STATE_KEY.NOT_STARTED)
const selectType = ref(SelectTypeEnum.Rectangle)
const selectPath = ref([])
function handleChangeSelectType(type) {
  selectType.value = type
  _RectangleSelectLayer.stop()
  _PolygonSelectLayer.stop()
  _CircleSelectLayer.stop()
}

function handleChangeSelectState(type, data) {
  selectState.value = data.data.state
  selectPath.value = data.data.path
}

// 开始圈选
function handleStartSelect() {
  if (selectType.value === SelectTypeEnum.Polygon) {
    _PolygonSelectLayer.play()
  }
  if (selectType.value === SelectTypeEnum.Rectangle) {
    _RectangleSelectLayer.play()
  }
  if (selectType.value === SelectTypeEnum.Circle) {
    _CircleSelectLayer.play()
  }
}
// 停止圈选
function handleStopSelect() {
  _RectangleSelectLayer.reset()
  _PolygonSelectLayer.reset()
  _CircleSelectLayer.reset()
}
// 重新圈选
function handleResetSelect() {
  _RectangleSelectLayer.reset()
  _PolygonSelectLayer.reset()
  _CircleSelectLayer.reset()
  if (selectType.value === SelectTypeEnum.Polygon) {
    _PolygonSelectLayer.play()
  }
  if (selectType.value === SelectTypeEnum.Rectangle) {
    _RectangleSelectLayer.play()
  }
  if (selectType.value === SelectTypeEnum.Circle) {
    _CircleSelectLayer.play()
  }
}

onUnmounted(() => {
  _RectangleSelectLayer.stop()
  _PolygonSelectLayer.stop()
  _CircleSelectLayer.stop()
  _RectangleSelectLayer.dispose()
  _PolygonSelectLayer.dispose()
  _CircleSelectLayer.dispose()
})
</script>

<style lang="scss" scoped>
.SelectArea_minibtn {
  position: fixed;
  z-index: 1000;
  top: 80px;
  right: 20px;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #065f46;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.SelectArea_bialog_bodyer {
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #065f46;
  .btn {
    position: relative;
    cursor: pointer;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1a6953;
    border-radius: 15px;
    .icon {
      width: 40px;
      height: 40px;
      background: red;
      border-radius: 12px;
      flex-shrink: 0;
      background: #3c7e6c;
    }
    .text {
      color: #fff;
      flex: 1;
      width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 3px;
      .text1 {
        font-size: 14px;
        color: #8cddba;
      }
      .text2 {
        font-size: 12px;
        color: #0cc58c;
      }
    }

    &.active {
      background: #448371;
      .icon {
        background: #00d492;
      }
      .text1 {
        font-size: 14px;
        color: #fff;
      }
      &::before {
        content: '';
        position: absolute;
        top: calc(50% - 5px);
        right: 20px;
        display: block;
        width: 10px;
        height: 10px;
        background: #00d492;
        border-radius: 50%;
      }
    }
  }
  .btn2 {
    position: relative;
    cursor: pointer;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #448371;

    font-size: 14px;
    color: #0cc58c;
  }
}
</style>
