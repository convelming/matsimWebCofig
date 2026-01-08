import { ref, getCurrentInstance } from 'vue'

export function initCheck(ctx, defaultValue = false) {
  const { emit } = ctx || getCurrentInstance()
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
