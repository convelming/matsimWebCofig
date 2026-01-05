<!-- GeoJSONColorBar -->
<template>
  <div class="GeoJSONColorBar">
    <template v-if="data?.type == 'Number'">
      <div style="display: flex; padding-bottom: 20px">
        <el-select style="width: 150px;" v-model="s_item.model" @change="">
          <el-option label="Equal Count" value="count" />
          <el-option label="Equal Interval" value="interval" />
        </el-select>
        <el-input-number
          v-model="s_item.modelClass"
          :min="1"
          :step="1"
          step-strictly
          controls-position="right"
        />
        <el-button type="primary" @click="handleAutogenerate">自动生成</el-button>
      </div>
      <el-table :data="s_value" border stripe height="200px">
        <el-table-column label="颜色" width="80px">
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <el-checkbox v-model="row.use" style="padding-right: 10px" />
              <el-color-picker
                v-model="row.color"
                size="mini"
                :predefine="predefine"
                @change="handleChangeImage(row, $event)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最小值">
          <template #default="{ row }">
            <el-input-number
              v-model="row.min"
              size="mini"
              :step="1"
              controls-position="right"
              @change="handleChangeImage(row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="最大值">
          <template #default="{ row }">
            <el-input-number
              v-model="row.max"
              size="mini"
              :step="1"
              controls-position="right"
              @change="handleChangeImage(row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="标签">
          <template #default="{ row }">
            <el-input v-model="row.label" size="mini" />
          </template>
        </el-table-column>
        <el-table-column width="65" align="center">
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              size="mini"
              @click="handleDeleteColorBarItem($index)"
              icon="el-icon-delete"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        style="width: 100%; display: block;border-radius: 0;"
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="handleAddColorBarItem()"
        >ADD</el-button
      >
    </template>
    <!-- <template v-if="s_form[lItem.name].valueType == 'String'">
      <el-form-item label="模式" v-if="!(lItem.attrs && lItem.attrs.hideModel)">
        <el-button type="primary" @click="handleAutogenerate(lItem)">自动生成</el-button>
      </el-form-item>
      <el-form-item label-width="0">
        <el-table class="small" :data="s_form[lItem.name].data" border stripe>
          <el-table-column label="颜色" prop="symbol" width="80px">
            <div #default="{ row }" style="display: flex; align-items: center">
              <el-checkbox v-model="row.use" style="padding-right: 10px" />
              <el-color-picker v-model="row.color" size="mini" :predefine="predefine" />
            </div>
          </el-table-column>
          <el-table-column label="类型" prop="min">
            <template #default="{ row }">
              <el-select v-model="row.min" @change="row.max = $event" size="mini">
                <el-option
                  v-for="(mi, mk) in lItem.options[s_form[lItem.name].valueKey].map"
                  :key="mi - 0.5"
                  :label="mk"
                  :value="mi - 0.5"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="标签" prop="label">
            <template #default="{ row }">
              <el-input v-model="row.label" size="mini" />
            </template>
          </el-table-column>
          <el-table-column
            width="65"
            align="center"
            v-if="!(lItem.attrs && lItem.attrs.hideDelete)"
          >
            <template #default="{ row, $index }">
              <el-button
                type="danger"
                size="mini"
                @click="handleDeleteColorBarItem(lItem, $index)"
                icon="el-icon-delete"
              ></el-button>
            </template>
          </el-table-column>
          <el-button
            slot="append"
            v-if="!(lItem.attrs && lItem.attrs.hideAdd)"
            style="width: 100%; display: block"
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="handleAddColorBarItem(lItem)"
          ></el-button>
        </el-table>
      </el-form-item>
    </template> -->
  </div>
</template>

<script setup>
import { injectSync, addWatch } from '@/utils/index'

const props = defineProps({
  value: Array,
  data: Object,
})

function toFixed2(num, fractionDigits) {
  try {
    num = Number(num)
    if (isNaN(num)) return num

    // 处理极端小的数值或大的小数位数
    if (Math.abs(num) < Number.EPSILON) return 0

    // 限制最大小数位数为10
    const safeFractionDigits = Math.min(Math.max(0, Math.floor(fractionDigits)), 10)
    const _fd = Math.pow(10, safeFractionDigits)

    // 直接计算，避免无限循环
    const _num = Math.round(num * _fd) / _fd
    return _num
  } catch (error) {
    console.log(error)
    return num
  }
}

function getLabel(labelRule, { min, max, index }) {
  try {
    switch (labelRule) {
      case 'EN': {
        const n1 = Math.floor(index / 26)
        const n2 = index % 26
        const arr = new Array(n1).fill('z')
        arr.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[n2])
        return arr.join('')
      }
      case 'en': {
        const n1 = Math.floor(index / 26)
        const n2 = index % 26
        const arr = new Array(n1).fill('z')
        arr.push('abcdefghijklmnopqrstuvwxyz'[n2])
        return arr.join('')
      }
    }
  } catch (error) {}
  return `${min} ~ ${max}`
}

function lerpColors(sc, ec, alpha) {
  const scn = Number(sc.replace('#', '0x'))
  const ecn = Number(ec.replace('#', '0x'))

  const r1 = (scn >> 16) & 255
  const g1 = (scn >> 8) & 255
  const b1 = scn & 255

  const r2 = (ecn >> 16) & 255
  const g2 = (ecn >> 8) & 255
  const b2 = ecn & 255

  const r = Math.max(0, Math.min(255, Math.floor(r1 + (r2 - r1) * alpha)))
  const g = Math.max(0, Math.min(255, Math.floor(g1 + (g2 - g1) * alpha)))
  const b = Math.max(0, Math.min(255, Math.floor(b1 + (b2 - b1) * alpha)))

  const color = (r << 16) ^ (g << 8) ^ (b << 0)

  return '#' + color.toString(16).padStart(6, '0')
}

function getNumberColor(p, cl) {
  let _color = null

  if (p <= 0) {
    _color = cl[0]
  } else if (p >= 1) {
    _color = cl[cl.length - 1]
  } else {
    const s = 1 / (cl.length - 1)
    const index = Math.floor(p / s)
    const startColor = cl[index]
    const endColor = cl[index + 1]
    _color = lerpColors(startColor, endColor, p % s)
  }
  return _color
}

function getNumberColorBar(aData, aItem) {
  const data = Object.assign({}, defaultNumberData, aData)
  const item = Object.assign({}, defaultNumberItem, aItem)
  let list = []
  if (item.model === 'count') {
    const modelClass = item.modelClass
    let min = data.min
    let max = data.max
    if (min == max) {
      min--
      max++
    }
    let min2 = Number(toFixed2(min, item.toFixed))
    const step = (max - min) / modelClass
    for (let i = 0; i < modelClass; i++) {
      let max2 = Number(toFixed2(min + step * (i + 1), item.toFixed))
      if (max2 != max2) max2 = min + Math.pow(10, item.toFixed)
      list.push({
        min: min2,
        max: max2,
        range: [min, max],
        color: '',
        label: '',
        use: true,
      })
      min2 = max2
    }
  } else if (item.model === 'interval') {
    const values = data.values.map((v) => v).sort((a, b) => a - b)
    const modelClass = Math.min(item.modelClass, values.length - 1)
    let min = data.min
    let max = data.max
    if (min == max) {
      min--
      max++
    }
    let step = Math.ceil(values.length / modelClass)

    for (let i = 0; i < values.length; ) {
      let sIndex = i
      let eIndex = i + step
      if (eIndex >= values.length) eIndex = values.length - 1
      if (sIndex == eIndex) break
      let min2 = Number(toFixed2(values[sIndex], item.toFixed))
      let max2 = Number(toFixed2(values[eIndex], item.toFixed))
      while (min2 == max2) {
        eIndex += Math.ceil(step / 5)
        if (eIndex >= values.length) eIndex = values.length - 1
        max2 = Number(toFixed2(values[eIndex], item.toFixed))
      }
      list.push({
        min: min2,
        max: max2,
        range: [min, max],
        color: '',
        label: '',
        use: true,
      })
      i = eIndex
      step = Math.ceil((values.length - i) / (modelClass - list.length))
    }
  }

  list.forEach((v, i) => {
    v.color = getNumberColor(i / (list.length - 1), item.colorList)
    v.label = getLabel(item.labelRule, { min: v.min, max: v.max, index: i })
  })

  return list
}

function getStringColorBar(aData, aItem) {
  const data = Object.assign({}, defaultStringData, aData)
  const item = Object.assign({}, defaultStringItem, aItem)
  const list = []
  const mapList = Object.entries(data.map)
  for (let i = 0, l = mapList.length; i < l; i++) {
    const [mk, mi] = mapList[i]
    const color = item.colorList[i % item.colorList.length] //new THREE.Color().lerpColors(startColor, endColor, i / l);
    list.push({
      min: mi - 0.5,
      max: mi + 0.5,
      range: [data.min, data.max],
      color: color,
      label: mk == 'null' || !mk ? '未知' : mk,
      use: true,
    })
  }
  return list
}


// const emit = defineEmits(['update:value'])

const s_value = ref([])
const s_item = ref({})

addWatch(
  () => props.value,
  (val) => {
    s_value.value = val.map((v) => Object.assign({}, v))
  },
)
addWatch(
  () => props.data,
  (val) => {
    console.log(val)
    if (!val) {
    } else if (val.type === 'Number') {
      s_item.value = {
        model: 'count', // count interval
        modelClass: 5,
        labelRule: undefined, // null || undefined 使用`${min} ~ ${max}` en 使用字母顺序
        toFixed: 2,
        colorList: ['#FEE0D2', '#B50404'],
      }
    } else if (val.type === 'String') {
      s_item.value = {
        colorList: [
          '#91cc75',
          '#fac858',
          '#ee6666',
          '#73c0de',
          '#3ba272',
          '#fc8452',
          '#9a60b4',
          '#ea7ccc',
        ],
      }
    }
  },
)
</script>

<style lang="scss" scoped>
.GeoJSONColorBar {
}
</style>
