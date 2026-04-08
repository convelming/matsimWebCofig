<!-- MInput -->
<template>
  <div class="MInput">
    <div class="s_dian"></div>
    <div class="s_label">{{ title }}</div>
    <input
      class="s_input"
      :value="s_value"
      type="text"
      @input="handleInput"
      :title="placeholder"
      :placeholder="placeholder"
    />
    <CloseCircleFilled v-if="!!value" class="s_close" @click="handleClear()" />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { CloseCircleFilled } from '@ant-design/icons-vue'

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

function handleInput(e) {
  s_value.value = e.target.value
  emit('update:value', s_value.value)
  emit('change', s_value.value)
}

function handleClear() {
  s_value.value = null
  emit('update:value', null)
  emit('change', null)
  handleShowDropdown(false)
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
    line-height: 40px;

    font-size: 15px;
    color: #1565c0;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 0;
    padding: 0;
    text-indent: 0;

    width: 0;
    flex: 1;
    &::placeholder {
      color: inherit;
    }
  }
  
  .s_close {
    display: none;
    cursor: pointer;
    position: absolute;
    top: 11px;
    right: 8px;
    font-size: 14px;
    padding: 4px;
    color: #6699cc;
    background-color: #fff;
  }
  &:hover {
    .s_close {
      display: block;
    }
  }
}
</style>
