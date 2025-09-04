<template>
  <el-select
    :model-value="s_value"
    @update:model-value="handleInput"
    filterable
    remote
    reserve-keyword
    placeholder="请输入关键词"
    :remote-method="remoteMethod"
    :loading="loading"
    :size="size"
  >
    <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script setup>
import { getWayByName } from '@/api/index'

const emits = defineEmits(['update:model-value', 'update:label', 'change'])
const props = defineProps({
  modelValue: {},
  label: {},
  size: {},
})
const s_value = ref(null)
const options = ref([])
const loading = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    if (val !== s_value) {
      s_value.value = val
    }
  },
)
function handleInput(val) {
  let item = options.value.find((v) => v.id == val)
  if (item) {
    s_value.value = item.id
    emits('update:model-value', item.id)
    emits('update:label', item.name)
    emits('change', { value: item.id, item: item })
  }
}

function remoteMethod(query) {
  if (query !== '') {
    loading.value = true
    getWayByName({
      name: query,
    }).then((res) => {
      loading.value = false
      options.value = res.data
    })
  } else {
    options.value = []
  }
}

defineExpose({
  remoteMethod,
})
// export default {
//   emits: ['update:model-value', 'update:label', 'change'],
//   props: ['modelValue', 'label', 'size'],
//   watch: {
//     modelValue: {
//       handler(val) {
//         if (val !== this.s_value) {
//           this.s_value = val
//         }
//       },
//     },
//   },
//   data() {
//     return {
//       options: [],
//       s_value: null,
//       loading: false,
//     }
//   },
//   mounted() {},
//   methods: {
//     handleInput(val) {
//       let item = this.options.find((v) => v.id == val)
//       if (item) {
//         this.s_value = item.id
//         this.$emit('update:model-value', item.id)
//         this.$emit('update:label', item.name)
//         this.$emit('change', { value: item.id, item: item })
//       }
//     },
//     remoteMethod(query) {
//       if (query !== '') {
//         this.loading = true
//         getWayByName({
//           name: query,
//         }).then((res) => {
//           this.loading = false
//           this.options = res.data
//         })
//       } else {
//         this.options = []
//       }
//     },
//   },
// }
</script>
