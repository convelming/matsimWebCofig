<!-- MSelect -->
<template>
  <div class="MSelect">
    <div class="s_dian"></div>
    <div class="s_label">{{ title }}</div>
    <input
      class="s_input"
      :value="inputLabel"
      type="text"
      @input="handleFilter"
      @focus="handleShowDropdown(true)"
      @blur="handleShowDropdown(false)"
      :title="inputLabel"
      :placeholder="placeholder"
    />
    <span class="s_arrow" @click="handleShowDropdown(!showDropdown)">▼</span>
    <CloseCircleFilled v-if="!!value" class="s_close" @click="handleClear()" />
    <template v-if="showDropdown">
      <div v-if="options.length" class="s_dropdown">
        <div
          v-for="opt in filterOptions"
          :key="opt[valueKey]"
          class="dropdown-option"
          :class="{ 'dropdown-option-active': s_value === opt[valueKey] }"
          @click="handleSelect(opt)"
        >
          <!-- <svg-icon icon="路线" class="option-icon" /> -->
          {{ opt[labelKey] }}
        </div>
      </div>
      <div
        v-else
        class="s_dropdown"
        style="display: flex; flex-direction: column; align-items: center"
      >
        <a-empty description="无数据" />
      </div>
    </template>
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
    default: '请选择'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  options: {
    type: Array,
    default: () => []
  },
  value: {
    type: [String, Number],
    default: null
  }
})

watch(
  () => props.value,
  (newValue) => {
    console.log('props.value', newValue)
    s_value.value = newValue
  }
)

const showDropdown = ref(false)
const s_value = ref(props.value)
const inputValue = ref('')
const filterOptions = computed(() => {
  if (inputValue.value) {
    return props.options.filter((v) => String(v[props.labelKey]).includes(inputValue.value))
  }
  return props.options
})

// 当前选中的路线名称
const inputLabel = computed(() => {
  if (showDropdown.value) {
    return inputValue.value
  } else if (s_value.value || s_value.value === 0) {
    const currentOption = props.options.find((opt) => opt[props.valueKey] == s_value.value)
    return currentOption ? currentOption[props.labelKey] : s_value.value
  } else {
    return props.placeholder
  }
})

function handleSelect(opt) {
  console.log('handleSelect')
  s_value.value = opt[props.valueKey]
  emit('update:value', opt[props.valueKey])
  emit('change', opt)
  handleShowDropdown(false)
}

function handleClear() {
  s_value.value = null
  emit('update:value', null)
  emit('change', null)
  handleShowDropdown(false)
}

function handleFilter(event) {
  inputValue.value = event.target.value
}

function handleShowDropdown(open) {
  console.log('handleShowDropdown')
  if (open) {
    showDropdown.value = true
  } else {
    setTimeout(() => {
      showDropdown.value = false
      inputValue.value = ''
    }, 200)
  }
}

// onMounted(() => {
//   console.log('onMounted')
//   s_value.value = props.value
// })
</script>

<style lang="scss" scoped>
.MSelect {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: 44px;
  padding: 0 12px;
  box-shadow: 0 2px 8px rgba(42, 130, 228, 0.1);
  border: 1px solid rgba(130, 188, 255, 0.2);

  .s_label {
    margin: 0 8px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: #336699;
    line-height: 40px;
  }

  .s_dian {
    content: '';
    width: 8px;
    height: 8px;
    background: #2a82e4;
    border-radius: 50%;
    margin-right: 8px;
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
  .s_arrow {
    font-size: 12px;
    color: #6699cc;
    transition: transform 0.2s ease;
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

  .s_dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    width: calc(100% - 70px);
    margin-top: 6px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(42, 130, 228, 0.15);
    z-index: 20;
    border: 1px solid rgba(130, 188, 255, 0.3);
    max-height: 300px;
    overflow: hidden;
    overflow-y: auto;

    .dropdown-option {
      padding: 10px 12px;
      font-size: 14px;
      color: #336699;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;

      .option-icon {
        width: 16px;
        height: 16px;
        color: #2a82e4;
      }

      &:hover {
        background: #ebf3ff;
        padding-left: 14px;
      }

      &.dropdown-option-active {
        background: linear-gradient(90deg, #ebf3ff 0%, #e8f0fe 100%);
        color: #1565c0;
        font-weight: 500;
      }
    }
  }
}
</style>
