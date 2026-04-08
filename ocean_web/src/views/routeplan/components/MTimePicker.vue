<!-- MInput -->
<template>
  <div class="MInput">
    <div class="s_dian"></div>
    <div class="s_label">{{ title }}</div>
    <a-time-picker
      class="s_input"
      v-model:value="s_value"
      :bordered="false"
      @ok="handleInput"
      valueFormat="HH:mm:ss"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

const emit = defineEmits(['update:value', 'change'])
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入'
  },
  value: {
    type: [String, Number],
    default: null
  }
})

watch(
  () => props.value,
  (newValue) => {
    s_value.value = newValue
  }
)

const s_value = ref(props.value)

function handleInput(value) {
  console.log(value)

  s_value.value = value
  emit('update:value', s_value.value)
  emit('change', s_value.value)
}
</script>

<style lang="scss" scoped>
.MInput {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: 44px;
  padding: 0 12px;
  box-shadow: 0 2px 8px rgba(42, 130, 228, 0.1);
  border: 1px solid rgba(130, 188, 255, 0.2);

  .s_dian {
    content: '';
    width: 8px;
    height: 8px;
    background: #2a82e4;
    border-radius: 50%;
    margin-right: 8px;
  }

  .s_label {
    margin: 0 8px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: #336699;
    line-height: 40px;
  }

  .s_input {
    padding: 0;
    width: 0;
    flex: 1;
    :deep(.ant-picker-input) {
      input {
        border-radius: 0;
        line-height: 40px;
        font-size: 15px;
        font-weight: 500;
        color: #1565c0;
        &::placeholder {
          color: inherit;
        }
      }
      .ant-picker-suffix {
        color: #6699cc;
      }
      .ant-picker-clear {
        color: #6699cc;
      }
    }
  }
}
</style>
