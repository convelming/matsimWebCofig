<!-- MButton -->
<template>
  <RouterLink v-if="type == 'router'" :class="$attrs.class" :activeClass="activeClass" :to="to">
    <slot v-if="$slots.default"></slot>
    <template v-else>{{ title }}</template>
  </RouterLink>
  <a v-else :class="$attrs.class" @click="handleClick">
    <slot v-if="$slots.default"></slot>
    <template v-else>{{ title }}</template>
  </a>

  <el-dialog v-model="showIframe" width="900px" v-if="type == 'iframe'">
    <div style="color: red" v-if="msg">{{ msg }}</div>
    <el-auto-resizer style="width: 100%; height: calc(100vh - 300px)">
      <template #default="{ height, width }">
        <iframe v-if="showIframe" style="border: 0" :width="width" :height="height" :src="path">
        </iframe>
      </template>
    </el-auto-resizer>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  type: String,
  title: String,
  path: String,
  msg: String,

  activeClass: String,
  to: Object,
})

const showIframe = ref(false)

function handleClick() {
  switch (props.type) {
    case 'a':
      {
        window.open(props.path, '_blank')
      }
      break
    case 'iframe':
      {
        showIframe.value = true
      }
      break
    case 'message':
      {
        ElMessage.warning(props.msg)
      }
      break
    default: {
      ElMessage.warning('功能研发中，敬请期待')
    }
  }
}
</script>
