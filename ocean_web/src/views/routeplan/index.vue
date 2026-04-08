<template>
  <!-- 航路搜索面板 -->
  <transition name="el-zoom-in-center">
    <div class="left-box" v-show="showMain">
      <CustomTitle style="margin: 0" title="航路规划" :showBottomShape="true" />
      <!-- 路线选择区域（美化升级） -->
      <div class="path-select-section">
        <div class="lineEndBox">
          <div class="select_box">
            <MSelect
              class="input-row"
              title="起点:"
              :options="pointList"
              v-model:value="queryParams.startId"
              placeholder="请选择起点"
              label-key="name"
              value-key="id"
              @change="handleGetList"
            ></MSelect>
            <AimOutlined
              class="icon"
              :class="{ active: clickPointType == 'start' }"
              @click="handleSetClickPointType('start')"
            />
          </div>
          <div class="select_box">
            <MSelect
              class="input-row"
              title="终点:"
              :options="pointList"
              v-model:value="queryParams.endId"
              placeholder="请选择终点"
              label-key="name"
              value-key="id"
              @change="handleGetList"
            ></MSelect>
            <AimOutlined
              class="icon"
              :class="{ active: clickPointType == 'end' }"
              @click="handleSetClickPointType('end')"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮（美化+hover动效） -->
      <div class="sidebar-actions">
        <div class="btn-primary" @click="handleGetList">搜索航线</div>
        <div class="btn-primary" @click="handleShowAdd">添加航线</div>
      </div>

      <a-empty v-if="loading" description="搜索中..." />
      <template v-else-if="!!routeList.length">
        <div class="scroll-box">
          <div class="route-list">
            <!-- 路线详情卡片（美化+层次感） -->
            <div
              class="route-detail-card seletced"
              v-for="(item, index) in routeList"
              @click="handleSetCenterByRoute(item)"
            >
              <!-- 卡片头部 -->
              <div class="card-header">
                <!-- <svg-icon icon="航线详情" class="header-icon" /> -->
                <span class="header-title">航线详情</span>
                <span @click.native.stop>
                  <a-switch
                    v-model:checked="item.show"
                    checked-children="显示"
                    un-checked-children="隐藏"
                  />
                </span>
              </div>
              <!-- 卡片内容 -->
              <div class="card-content">
                <div class="info-row w100">
                  <div class="info-label">
                    <!-- <svg-icon icon="名称" class="info-icon" /> -->
                    航线名称
                  </div>
                  <div class="info-value">{{ item.name }}</div>
                </div>
                <div class="info-row w50">
                  <div class="info-label">
                    <!-- <svg-icon icon="航程" class="info-icon" /> -->
                    首班时间
                  </div>
                  <div class="info-value">{{ formatTime(0, item.departureStartTime) }}</div>
                </div>
                <div class="info-row w50">
                  <div class="info-label">
                    <!-- <svg-icon icon="时间" class="info-icon" /> -->
                    发班间隔
                  </div>
                  <div class="info-value">{{ formatTime(0, item.departureIntervalTime) }}</div>
                </div>
                <div class="info-row w50">
                  <div class="info-label">
                    <!-- <svg-icon icon="航程" class="info-icon" /> -->
                    航程距离
                  </div>
                  <div class="info-value">{{ formatDistance(item.distance) }}</div>
                </div>
                <div class="info-row w50">
                  <div class="info-label">
                    <!-- <svg-icon icon="时间" class="info-icon" /> -->
                    预计耗时
                  </div>
                  <div class="info-value">{{ formatTime(item.startTime, item.endTime) }}</div>
                </div>
                <!-- 可选：步骤列表（有数据才显示，增加丰富度） -->
                <div class="steps-section w100" v-if="item.steps?.length">
                  <div class="steps-title">
                    <!-- <svg-icon icon="步骤" class="steps-icon" /> -->
                    途经节点
                  </div>
                  <ul class="steps-list">
                    <li class="step-item" v-for="(step, idx) in item.steps" :key="idx">
                      <div class="step-number">{{ idx + 1 }}</div>
                      <div class="step-content">
                        <div class="step-name">{{ step.name }}</div>
                        <div class="step-dist">{{ step.dist }}</div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="sidebar-actions w100">
                  <div class="btn-primary" @click.stop="handleShowFlight(index)">飞行模拟</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </transition>
  <!-- 添加航线面板 -->
  <transition name="el-zoom-in-center">
    <div class="left-box" v-show="addFormShow">
      <CustomTitle style="margin: 0" title="添加航线" :showBottomShape="true" />
      <MInput
        class="input-row"
        title="航线名称："
        v-model:value="addFormState.name"
        placeholder="请输入航线名称"
      ></MInput>
      <MSelect
        class="input-row"
        title="航线起点："
        :options="pointList"
        v-model:value="addFormState.startId"
        placeholder="请选择航线起点"
        label-key="name"
        value-key="id"
        @change="handleComputedName"
      ></MSelect>
      <MSelect
        class="input-row"
        title="航线终点："
        :options="pointList"
        v-model:value="addFormState.endId"
        placeholder="请选择航线终点"
        label-key="name"
        value-key="id"
        @change="handleComputedName"
      ></MSelect>
      <MTimePicker
        class="input-row"
        title="首班时间："
        v-model:value="addFormState.departureStartTime"
        placeholder="请输入首班时间"
      ></MTimePicker>
      <MTimePicker
        class="input-row"
        title="末班时间："
        v-model:value="addFormState.departureEndTime"
        placeholder="请输入末班时间"
      ></MTimePicker>
      <MInput
        class="input-row"
        title="发班间隔："
        v-model:value="addFormState.departureIntervalTime"
        placeholder="请输入发班间隔（秒）"
      ></MInput>
      <MInput
        class="input-row"
        title="巡航高度："
        v-model:value="addFormState.startHeight"
        placeholder="请输入巡航高度（米）"
      ></MInput>
      <!-- 操作按钮（美化+hover动效） -->
      <div class="sidebar-actions">
        <div class="btn-primary" @click="handleSubmitAdd" :loading="addFormLoading">
          <!-- <svg-icon icon="生成" class="btn-icon" /> -->
          添加航线
        </div>
        <div class="btn-primary" @click="handleCloseAdd" :loading="addFormLoading">
          <!-- <svg-icon icon="生成" class="btn-icon" /> -->
          取消
        </div>
      </div>
    </div>
  </transition>
  <!-- 模拟面板 -->
  <transition name="el-zoom-in-center">
    <div class="left-box flight" v-show="flightShow">
      <CustomTitle style="margin: 0" title="飞行模拟" :showBottomShape="true" />
      <CloseOutlined class="close_btn" @click="handleCloseFlight" />
      <div class="route-detail-card seletced">
        <!-- 卡片头部 -->
        <div class="card-header">
          <!-- <svg-icon icon="航线详情" class="header-icon" /> -->
          <span class="header-title">航线详情</span>
        </div>
        <!-- 卡片内容 -->
        <div class="card-content">
          <div class="info-row w100">
            <div class="info-label">
              <!-- <svg-icon icon="名称" class="info-icon" /> -->
              航线名称
            </div>
            <div class="info-value">{{ flightRoute?.name }}</div>
          </div>
          <div class="info-row w50">
            <div class="info-label">
              <!-- <svg-icon icon="航程" class="info-icon" /> -->
              首班时间
            </div>
            <div class="info-value">{{ formatTime(0, flightRoute?.departureStartTime) }}</div>
          </div>
          <div class="info-row w50">
            <div class="info-label">
              <!-- <svg-icon icon="时间" class="info-icon" /> -->
              发班间隔
            </div>
            <div class="info-value">{{ formatTime(0, flightRoute?.departureIntervalTime) }}</div>
          </div>
          <div class="info-row w50">
            <div class="info-label">
              <!-- <svg-icon icon="航程" class="info-icon" /> -->
              航程距离
            </div>
            <div class="info-value">{{ formatDistance(flightRoute?.distance) }}</div>
          </div>
          <div class="info-row w50">
            <div class="info-label">
              <!-- <svg-icon icon="时间" class="info-icon" /> -->
              预计耗时
            </div>
            <div class="info-value">
              {{ formatTime(flightRoute?.startTime, flightRoute?.endTime) }}
            </div>
          </div>
          <!-- 可选：步骤列表（有数据才显示，增加丰富度） -->
          <div class="steps-section" v-if="flightRoute?.steps?.length">
            <div class="steps-title">
              <!-- <svg-icon icon="步骤" class="steps-icon" /> -->
              途经节点
            </div>
            <ul class="steps-list">
              <li class="step-item" v-for="(step, idx) in detail?.steps" :key="idx">
                <div class="step-number">{{ idx + 1 }}</div>
                <div class="step-content">
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-dist">{{ step.dist }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="select_box" style="align-items: center">
        <a-slider
          style="flex: 1"
          v-model:value="flightTime"
          :max="flightRoute?.endTime - flightRoute?.startTime"
          :tooltipOpen="false"
        />
        <!-- <div class="time">{{ formatTime(flightRoute?.departureStartTime || 0, time) }}</div> -->
        <div class="time">
          <a-time-picker
            class="s_input"
            :value="formatTime(flightRoute?.departureStartTime || 0, time)"
            :bordered="false"
            valueFormat="HH:mm:ss"
            @openChange="handleOpenTimeChange"
            @update:value="time = strToTime($event, flightRoute?.departureStartTime || 0)"
            :disabledTime="handleDisabledTime(flightRoute?.endTime - flightRoute?.startTime)"
          />
        </div>
      </div>
      <div class="select_box">
        <MSelect
          class="flex1_w"
          title="视角:"
          :options="camera_type_list"
          v-model:value="camera_type"
          placeholder="请选择视角"
          label-key="label"
          value-key="value"
        ></MSelect>
        <MSelect
          class="w35"
          title="倍速:"
          :options="time_step_list"
          v-model:value="time_step"
          placeholder="请选择"
          label-key="label"
          value-key="value"
        ></MSelect>
      </div>
      <div class="sidebar-actions">
        <div v-if="time_step > 0" class="btn-primary" @click="handlePlayFlight">开始模拟</div>
        <div v-else class="btn-primary" @click="handleStopFlight">停止模拟</div>
      </div>
    </div>
  </transition>

  <transition name="el-zoom-in-center">
    <div class="right-box" v-show="showMain">
      <div class="time">
        <a-time-picker
          class="s_input"
          :value="formatTime(0, time)"
          :bordered="false"
          valueFormat="HH:mm:ss"
          @openChange="handleOpenTimeChange"
          @update:value="time = strToTime($event, 0)"
        />
      </div>

      <MSelect
        title="倍速:"
        :options="time_step_list"
        v-model:value="time_step"
        placeholder="请选择"
        label-key="label"
        value-key="value"
      ></MSelect>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { AimOutlined, CloseOutlined } from '@ant-design/icons-vue'
import CustomTitle from '@/components/CustomTitle.vue'

// import { UamLayer } from './layers/UamLayer.js'
// import { PointLayer } from './layers/PointLayer.js'

// @ts-ignore
import { listUam, genUamRoute, saveRoute, getRouteList } from '@/api/routeplan.js'
import MSelect from './components/MSelect.vue'
import MInput from './components/MInput.vue'
import MTimePicker from './components/MTimePicker.vue'
import { message } from 'ant-design-vue'

const showMain = computed(() => {
  return !addFormShow.value && !flightShow.value && true
})
const time = ref(3600 * 6 + 45 * 60)
const time_step = ref(0)
const camera_type = ref(0)
const camera_type_list = [
  { value: 0, label: '自由移动' },
  { value: 1, label: '第一人称' },
  { value: 3, label: '第三人称' },
  { value: 4, label: '第一人称(周佩需求)' },
  { value: 6, label: '第三人称(周佩需求)' },
]
const time_step_list = [
  { value: 0, label: 'x0' },
  { value: 1, label: 'x1' },
  { value: 2, label: 'x2' },
  { value: 5, label: 'x5' },
  { value: 10, label: 'x10' },
  { value: 20, label: 'x20' },
]

let player_time = performance.now()

let player: any = async function (now: number) {
  let dTime = now - player_time
  player_time = now

  if (time_step.value > 0) {
    time.value += (dTime / 1000) * time_step.value

    if (time.value > 48 * 3600) time.value = 0
    // TODO
    // for (let i = 0, l = routeList.value.length; i < l; i++) {
    //   const route = routeList.value[i]
    //   if (route.show) {
    //     const points = route.layer.updateRunnerByTime(time.value)
    //     if (i == flightIndex.value && $view) {
    //       if (points[0]) {
    //         const { point, nextPoint } = points[0]
    //         if (camera_type.value == 1) {
    //           // 第一人称 我

    //           // 摄像头位置
    //           const point3 = point.clone().sub(nextPoint)
    //           // 高度归零 取消仰角的影响
    //           point3.z = 0
    //           // 把摄像头前移
    //           point3.setLength(-17.3)
    //           // 拉高无人机高度
    //           point3.z = 10.0
    //           // 重新设置摄像头和无人机的距离为300米，防抖动
    //           point3.setLength(20.0)

    //           // 以当前位置的坐标系，还原摄像头位置
    //           point3.add(point)

    //           // 摄像头方向
    //           // 以摄像头位置的坐标系，计算摄像头方向
    //           const point4 = nextPoint.clone().sub(point)

    //           const camera = $view.camera.clone()
    //           camera.heading = point4.heading
    //           camera.tilt = 90
    //           camera.position = new Point({
    //             x: point3.x,
    //             y: point3.y,
    //             z: point3.z,
    //             spatialReference
    //           })
    //           $view.camera = camera
    //         } else if (camera_type.value == 3) {
    //           // 第三人称 他

    //           // 摄像头位置
    //           // 以下一秒位置为原点构建坐标系，计算摄像头方向
    //           const point3 = point.clone().sub(nextPoint)
    //           // 高度归零 取消仰角的影响
    //           point3.z = 0
    //           // 把摄像头后移
    //           point3.setLength(173)
    //           // 拉高无人机高度
    //           point3.z = 100
    //           // 重新设置摄像头和无人机的距离为300米，防抖动
    //           point3.setLength(200)

    //           // 以当前位置的坐标系，还原摄像头位置
    //           point3.add(point)

    //           // 摄像头方向
    //           // 以摄像头位置的坐标系，计算摄像头方向
    //           const point4 = point.clone().sub(point3)

    //           const camera = $view.camera.clone()
    //           camera.heading = point4.heading
    //           camera.tilt = 180 - point4.tilt
    //           camera.position = new Point({
    //             x: point3.x,
    //             y: point3.y,
    //             z: point3.z,
    //             spatialReference
    //           })
    //           $view.camera = camera
    //         } else if (camera_type.value == 4) {

    //           // 第一人称 我
    //           const camera = $view.camera.clone()

    //           const point3 = point.clone()
    //           point3.z += 20
    //           point3.getCameraPosition(camera.heading, camera.tilt, 20)

    //           camera.position = new Point({
    //             x: point3.x,
    //             y: point3.y,
    //             z: point3.z,
    //             spatialReference
    //           })
    //           $view.camera = camera
    //         } else if (camera_type.value == 6) {
    //           const camera = $view.camera.clone()
    //           const point3 = point.clone().getCameraPosition(camera.heading, camera.tilt, 200)

    //           camera.position = new Point({
    //             x: point3.x,
    //             y: point3.y,
    //             z: point3.z,
    //             spatialReference
    //           })
    //           $view.camera = camera
    //         }
    //       } else {
    //         handleStopFlight()
    //       }
    //     }
    //   } else {
    //     route.layer.updateRunnerByTime(-1)
    //   }
    // }
  }

  if (player) requestAnimationFrame(player)
}

const openTimeBack = {}

function handleOpenTimeChange(open: boolean) {
  if (open) {
    openTimeBack.time_step = time_step.value
    time_step.value = 0
  } else {
    time_step.value = openTimeBack.time_step
  }
}
function handleDisabledTime(maxValue: number) {
  return () => {
    return {
      disabledHours: () => {
        return Array.from({ length: 24 }, (_, i) => i).filter((item) => item * 3600 > maxValue)
      },
      disabledMinutes: (h) => {
        return Array.from({ length: 60 }, (_, i) => i).filter(
          (item) => h * 3600 + item * 60 > maxValue,
        )
      },
      disabledSeconds: (h, m) => {
        return Array.from({ length: 60 }, (_, i) => i).filter(
          (item) => h * 3600 + m * 60 + item > maxValue,
        )
      },
    }
  }
}

// 格式化显示距离
function formatDistance(distance: number) {
  if (!distance) {
    return `——`
  } else if (distance < 1000) {
    return `${distance.toFixed(2)} m`
  } else {
    return `${(distance / 1000).toFixed(2)} km`
  }
}

function formatTime(startTime: number, endTime: number) {
  try {
    const time = endTime - startTime
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    const list = []
    list.push(hours >= 10 ? hours : `0${hours}`)
    list.push(minutes >= 10 ? minutes : `0${minutes}`)
    list.push(seconds >= 10 ? seconds : `0${seconds}`)
    return list.join(':')
  } catch (error) {
    console.log(error)
    return '——'
  }
}

function strToTime(str: string, startTime: number) {
  const [h, m, s] = str
    .split(':')
    .map((item: string) => (Number.isNaN(Number(item)) ? 0 : Number(item)))
  return h! * 3600 + m! * 60 + s! + startTime
}

/*************************************************** 航线 ***************************************************/
const loading = ref(false)
const queryParams = ref<{ startId: number | null; endId: number | null }>({
  startId: null,
  endId: null,
})
const routeList = ref([])
function handleGetList() {
  routeList.value.forEach((v: any, i: number) => {
    v.layer.destroy()
  })
  routeList.value = []
  loading.value = true
  getRouteList(queryParams.value)
    .then((res: any) => {
      res.data.forEach((v: any, i: number) => {
        v.show = false
        // v.layer = markRaw(new UamLayer(v))
        v.links = markRaw(v.links)
        v.times = markRaw(v.times)
      })
      routeList.value = res.data
      // nextTick(() => {
      //   if (res.data[0]) handleShowFlight(0)
      // })
    })
    .finally(() => {
      loading.value = false
    })
}
handleGetList()
/*************************************************** 航线 ***************************************************/

/*************************************************** 起终点 ***************************************************/
const pointList = ref([])
function handleGetPoints() {
  listUam().then((res: any) => {
    pointList.value = res.data
  })
}
handleGetPoints()
const clickPointType = ref('none')
function handlePointClick(e: number) {
  if (clickPointType.value == 'start') {
    queryParams.value.startId = e
    clickPointType.value = 'end'
    handleGetList()
  } else if (clickPointType.value == 'end') {
    queryParams.value.endId = e
    clickPointType.value = 'none'
    handleGetList()
  }
}
function handleSetClickPointType(type: string) {
  if (type == clickPointType.value) {
    clickPointType.value = 'none'
  } else {
    clickPointType.value = type
  }
}
function handleSetCenterByRoute(route: any) {
  route?.layer?.goToStart()
}
/*************************************************** 起终点 ***************************************************/

/*************************************************** 新增航线 ***************************************************/
const addFormState = ref<any>({})
const addFormLoading = ref(false)
const addFormShow = ref(false)

function handleShowAdd() {
  addFormState.value = {
    name: '',
    startId: '',
    endId: '',
    departureStartTime: '',
    departureEndTime: '',
    departureIntervalTime: '',
    startHeight: '',
  }
  addFormLoading.value = false
  addFormShow.value = true
}

function handleComputedName() {
  if (!!addFormState.value.startId && addFormState.value.endId && !addFormState.value.name) {
    const start: any = pointList.value.find((v: any) => v.id == addFormState.value.startId)
    const end: any = pointList.value.find((v: any) => v.id == addFormState.value.endId)
    addFormState.value.name = `${start.name} - ${end.name}`
  }
}
function handleCloseAdd() {
  addFormLoading.value = false
  addFormShow.value = false
}

// 时间转秒数
function time2Second(time: string) {
  const list = time.split(':')
  return parseInt(list[0] || '0') * 3600 + parseInt(list[1] || '0') * 60 + parseInt(list[2] || '0')
}

function handleSubmitAdd() {
  const form = JSON.parse(JSON.stringify(addFormState.value))
  if (addFormLoading.value) return
  if (!form.name) {
    message.error('请输入航线名称')
    return
  }
  if (!form.startId) {
    message.error('请选择航线起点')
    return
  }
  if (!form.endId) {
    message.error('请选择航线终点')
    return
  }
  if (!form.departureStartTime) {
    message.error('请选择首班时间')
    return
  }
  if (!form.departureEndTime) {
    message.error('请选择末班时间')
    return
  }
  if (!form.departureIntervalTime) {
    message.error('请输入发班间隔')
    return
  }
  if (!form.startHeight) {
    message.error('请输入巡航高度')
    return
  }
  form.departureStartTime = time2Second(form.departureStartTime)
  form.departureEndTime = time2Second(form.departureEndTime)
  addFormLoading.value = true
  saveRoute(form)
    .then((res: any) => {
      message.success('新增航线成功')
      addFormShow.value = false
      handleGetList()
    })
    .finally(() => {
      addFormLoading.value = false
    })
}

/*************************************************** 新增航线 ***************************************************/
/*************************************************** 飞行模拟 ***************************************************/
const flightShow = ref(false)
const flightIndex = ref(-1)
const flightRoute = computed<any>(() => {
  return routeList.value[flightIndex.value]
})
const flightTime = computed({
  get() {
    try {
      return time.value - flightRoute.value.departureStartTime
    } catch (error) {
      return 0
    }
  },
  set(value) {
    try {
      time.value = value + flightRoute.value.departureStartTime
    } catch (error) {}
  },
})
const showFlightBack = {
  time: 0,
  time_step: 0,
}
function handleShowFlight(index: number) {
  try {
    flightIndex.value = index

    showFlightBack.time_step = time_step.value
    showFlightBack.time = time.value
    time_step.value = 0
    time.value = flightRoute.value.departureStartTime

    flightRoute.value.show = true
    flightRoute.value.layer?.goToStart(18)
    // 手动调用一次更新，让无人机停在起点
    flightRoute.value.layer?.updateRunnerByTime(flightRoute.value.departureStartTime + 0.016)

    camera_type.value = 3

    flightShow.value = true
  } catch (error) {
    console.log(error)
    message.error('未知错误')
    handleCloseFlight()
  }
}
function handleCloseFlight() {
  flightIndex.value = -1
  flightShow.value = false

  time.value = showFlightBack.time
  time_step.value = showFlightBack.time_step
  camera_type.value = 0
}

function handlePlayFlight() {
  // 需要减一秒，防止小数影响判断
  const bcEndtime = flightRoute.value.departureStartTime + flightRoute.value.endTime - 1
  if (time.value >= bcEndtime) time.value = flightRoute.value.departureStartTime
  if (camera_type.value == 0) camera_type.value = 1
  time_step.value = 2
}
function handleStopFlight() {
  time_step.value = 0
}
/*************************************************** 飞行模拟 ***************************************************/

// watch(
//   routeList,
//   (val) => {
//     console.log(routeList.value, $view)
//     routeList.value.forEach((v, i) => {
//       if (v.show) {
//         v.layer.setView($view)
//       } else {
//         v.layer.setView(null)
//       }
//     })
//   },
//   {
//     deep: true,
//   },
// )

// watch(
//   $mapStore.getView,
//   (val) => {
//     $view = val
//     console.log($view.afterRender)

//     routeList.value.forEach((v, i) => {
//       if (v.show) {
//         v.layer.setView($view)
//       } else {
//         v.layer.setView(null)
//       }
//     })
//   },
//   {
//     immediate: true,
//   },
// )

onMounted(() => {
  player_time = performance.now()
  player(player_time)
})
onUnmounted(() => {
  routeList.value.forEach((v: any, i) => {
    v.layer?.destroy()
  })
  player = null
})
</script>

<style lang="scss" scoped>
// 左侧面板主样式（保留原有基础，优化细节）
.left-box {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 416px;
  max-height: calc(100% - 80px);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(235, 243, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 20px rgba(15, 66, 125, 0.3);
  display: flex;
  flex-direction: column;
  padding: 20px 18px;
  z-index: 10;
  // overflow: auto;
  gap: 16px;

  // 滚动条美化
  // &::-webkit-scrollbar {
  //   width: 6px;
  // }
  // &::-webkit-scrollbar-thumb {
  //   background: rgba(130, 188, 255, 0.6);
  //   border-radius: 3px;
  // }
  // &::-webkit-scrollbar-track {
  //   background: rgba(235, 243, 255, 0.5);
  // }
}

// 路线选择区域（核心美化）
.path-select-section {
  display: flex;
  align-items: center;
  width: 100%;

  .lineIcon {
    display: block;
    width: 63px;
    height: 63px;
  }

  .lineEndBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .select_box {
      display: flex;
      .input-row {
        flex: 1;
      }
      .icon {
        padding: 8px;
        cursor: pointer;
        &.active {
          color: rgba(48, 225, 252, 1);
        }
      }
    }

    :deep(.input-row .s_dian) {
      background: rgba(48, 225, 252, 1);
    }
  }

  .path-meta {
    margin-left: 16px;
    display: flex;
    align-items: center;

    .speed {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #2a82e4;

      .speed-unit {
        font-size: 12px;
        color: #6699cc;
        margin-bottom: 2px;
      }

      .more {
        font-size: 36px;
        font-weight: 700;
        line-height: 1;
      }

      .speed-text {
        font-size: 12px;
        margin-top: 2px;
      }
    }
  }
}

.scroll-box {
  flex: 1;
  height: 0;
  overflow-x: hidden;
  overflow-y: scroll;

  // 滚动条美化
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(130, 188, 255, 0.6);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(235, 243, 255, 0.5);
  }

  .route-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
}

// 路线详情卡片（精致层次感）
.route-detail-card {
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  border: 2px dashed rgba(54, 141, 255);
  overflow: hidden;

  opacity: 0.5;

  &.seletced {
    opacity: 1;
    border: 2px solid rgba(130, 188, 255, 1);
  }

  .card-header {
    background: linear-gradient(90deg, #ebf3ff 0%, #e8f0fe 100%);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(130, 188, 255, 0.2);

    .header-icon {
      width: 18px;
      height: 18px;
      color: #2a82e4;
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #1565c0;
      width: 0;
      flex: 1;
    }
  }

  .card-content {
    padding: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .w50 {
      width: calc(50% - 7px);
    }
    .w100 {
      width: 100%;
    }

    .info-row {
      display: flex;
      align-items: center;
      padding: 4px 0;

      .info-label {
        min-width: 80px;
        font-size: 14px;
        color: #6699cc;
        display: flex;
        align-items: center;
        gap: 4px;

        .info-icon {
          width: 14px;
          height: 14px;
        }
      }

      .info-value {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
    }

    .steps-section {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px dashed rgba(130, 188, 255, 0.3);

      .steps-title {
        font-size: 14px;
        font-weight: 600;
        color: #336699;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;

        .steps-icon {
          width: 16px;
          height: 16px;
          color: #2a82e4;
        }
      }

      .steps-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .step-item {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 4px;
          background: rgba(235, 243, 255, 0.5);

          .step-number {
            width: 24px;
            height: 24px;
            background: #2a82e4;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            margin-right: 10px;
            flex-shrink: 0;
          }

          .step-content {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .step-name {
              font-size: 14px;
              color: #336699;
              font-weight: 500;
            }

            .step-dist {
              font-size: 12px;
              color: #6699cc;
            }
          }
        }
      }
    }
  }
}

// 操作按钮（美化+动效）
.sidebar-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  width: 100%;

  .btn-primary {
    flex: 1;
    border-radius: 8px;
    background: linear-gradient(90deg, #2a82e4 0%, #1565c0 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 0;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(42, 130, 228, 0.2);
    transition: all 0.2s ease;

    .btn-icon {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: linear-gradient(90deg, #1565c0 0%, #0d47a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(42, 130, 228, 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(42, 130, 228, 0.2);
    }
  }
}

.flight {
  .close_btn {
    cursor: pointer;
    position: absolute;
    padding: 10px;
    right: 15px;
    top: 15px;
  }

  .time {
    background: #fff;
    border-radius: 6px;
    padding: 0 12px;
    box-shadow: 0 2px 8px rgba(42, 130, 228, 0.1);
    border: 1px solid rgba(130, 188, 255, 0.2);
    padding: 0 8px;
    height: 44px;
    line-height: 44px;
    width: 140px;

    .s_input {
      padding: 0;
      width: 100%;
      :deep(.ant-picker-input) {
        input {
          text-align: center;
          border-radius: 0;
          line-height: 40px;

          font-family: wending;
          font-size: 20px;
          &::placeholder {
            color: inherit;
          }
        }
        .ant-picker-suffix {
          display: none;
          color: #6699cc;
        }
        .ant-picker-clear {
          display: none;
          color: #6699cc;
        }
      }
    }
  }

  .select_box {
    display: flex;
    gap: 10px;
    .w35 {
      width: 35%;
    }
  }

  .flex1_w {
    width: 0;
    flex: 1;
  }
}

.right-box {
  z-index: 100;
  position: absolute;
  right: 20px;
  top: 20px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(235, 243, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 1);
  box-shadow: 0px 4px 20px rgba(15, 66, 125, 0.3);
  .time {
    background: #fff;
    border-radius: 6px;
    padding: 0 12px;
    box-shadow: 0 2px 8px rgba(42, 130, 228, 0.1);
    border: 1px solid rgba(130, 188, 255, 0.2);
    padding: 0 8px;
    height: 44px;
    line-height: 44px;

    width: 140px;
    .s_input {
      padding: 0;
      width: 100%;
      :deep(.ant-picker-input) {
        input {
          text-align: center;
          border-radius: 0;
          line-height: 40px;

          font-family: wending;
          font-size: 20px;
          &::placeholder {
            color: inherit;
          }
        }
        .ant-picker-suffix {
          display: none;
          color: #6699cc;
        }
        .ant-picker-clear {
          display: none;
          color: #6699cc;
        }
      }
    }
  }
  .step {
    width: 120px;
  }
}
</style>
