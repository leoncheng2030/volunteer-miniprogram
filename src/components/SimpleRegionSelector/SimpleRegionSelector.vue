<template>
  <view class="simple-region-selector">
    <!-- 选择器触发区域 -->
    <picker 
      mode="region" 
      @change="onRegionChange"
      :disabled="disabled"
    >
      <view class="selector-input">
        <view class="input-display">
          <text class="input-text" :class="{ placeholder: !selectedText }">
            {{ selectedText || placeholder }}
          </text>
          <u-icon name="arrow-down" size="16" color="#999" />
        </view>
      </view>
    </picker>
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

// 当前选择的值
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

// 地区选择变化
const onRegionChange = (e: any) => {
  console.log('🌏 原生picker地区选择:', e)
  
  const { value } = e.detail
  if (value && value.length === 3) {
    const result = {
      province: value[0],
      city: value[1],
      district: value[2]
    }
    
    console.log('✅ 选择结果:', result)
    
    currentSelection.value = result
    emit('update:modelValue', result)
    emit('change', result)
  }
}
</script>

<style lang="scss" scoped>
.simple-region-selector {
  width: 100%;
}

.selector-input {
  width: 100%;
}

.input-display {
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