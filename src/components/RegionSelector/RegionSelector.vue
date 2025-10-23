<template>
  <view class="region-selector">
    <!-- 选择器触发区域 -->
    <view class="selector-input" @tap="showSelector">
      <slot v-if="$slots.default"></slot>
      <view v-else class="default-input">
        <text class="input-text" :class="{ placeholder: !selectedText }">
          {{ selectedText || placeholder }}
        </text>
        <u-icon name="arrow-down" size="16" color="#999" />
      </view>
    </view>
    
    <!-- 省市区选择器 -->
    <u-picker
      :show="showPicker"
      mode="region"
      @confirm="onConfirm"
      @cancel="onCancel"
      @close="onCancel"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 定义组件Props
interface Props {
  modelValue?: {
    province?: string
    city?: string
    district?: string
  }
  placeholder?: string
  disabled?: boolean
}

// 定义组件Emits
interface Emits {
  (e: 'update:modelValue', value: { province: string, city: string, district: string }): void
  (e: 'change', value: { province: string, city: string, district: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择省市区',
  disabled: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const showPicker = ref(false)
const currentSelection = ref({
  province: '',
  city: '',
  district: ''
})

// 计算属性：显示文本
const selectedText = computed(() => {
  const { province, city, district } = currentSelection.value
  return province && city && district ? `${province} ${city} ${district}` : ''
})

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    currentSelection.value = {
      province: newValue.province || '',
      city: newValue.city || '',
      district: newValue.district || ''
    }
  }
}, { immediate: true, deep: true })

// 显示选择器
const showSelector = () => {
  if (props.disabled) return
  console.log('🎯 显示省市区选择器，当前状态:', showPicker.value)
  console.log('🎯 组件props:', props)
  showPicker.value = true
  console.log('🎯 设置后状态:', showPicker.value)
}

// 确认选择
const onConfirm = (e: any) => {
  console.log('✅ 省市区选择确认:', e)
  
  const { value } = e
  if (value && value.length === 3) {
    const result = {
      province: value[0].text,
      city: value[1].text,
      district: value[2].text
    }
    
    console.log('✅ 选择结果:', result)
    
    currentSelection.value = result
    emit('update:modelValue', result)
    emit('change', result)
  }
  
  showPicker.value = false
}

// 取消选择
const onCancel = () => {
  console.log('❌ 取消省市区选择')
  showPicker.value = false
}
</script>

<style lang="scss" scoped>
.region-selector {
  width: 100%;
}

.selector-input {
  width: 100%;
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
  }
}

.default-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  padding: 24rpx 20rpx;
  font-size: 28rpx;
  min-height: 80rpx;
  
  &:active {
    background-color: #e9ecef;
  }
}

.input-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  
  &.placeholder {
    color: #999;
  }
}
</style>