import { addWatch, injectSync } from '@/utils'
import { ref, getCurrentInstance, toRaw } from 'vue'

export function initCheck(ctx, defaultValue = false) {
  const { emit } = ctx
  const check = ref(defaultValue)
  const indeterminate = ref(false)
  function getCheck() {
    return { check: check.value, indeterminate: indeterminate.value }
  }
  function setCheck(data) {
    check.value = data
  }
  function handleChangeCheck() {
    emit('check-change', getCheck())
  }
  onMounted(() => {
    handleChangeCheck()
  })
  return { check, indeterminate, getCheck, setCheck, handleChangeCheck }
}

let range_timer = null
export function initRange(ctx, defaultValue = []) {
  const { emit, check, indeterminate } = ctx
  let _Map = null
  const range = ref(defaultValue)
  const watchRange = addWatch(
    range,
    (data) => {
      emit('update-range')
    },
    {
      deep: true,
    },
  )

  function getRange() {
    return { range: toRaw(range.value), check: check.value || indeterminate.value }
  }

  function handleSetCenterAndZoom() {
    const _range = toRaw(range.value)
    if (_Map) {
      console.log(_range)
      if (range_timer) clearTimeout(range_timer)
      range_timer = setTimeout(() => {
        _Map.setFitZoomAndCenterByPoints(_range)
        range_timer = null
      }, 300)
    }
  }
  injectSync('MapRef').then((map) => {
    _Map = map.value
  })
  return { range, getRange, handleSetCenterAndZoom }
}
