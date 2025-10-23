<template>
  <view class="city-selector">
    <!-- 选择器触发区域 -->
    <view class="selector-input" @click="showSelector">
      <slot v-if="$slots.default"></slot>
      <view v-else class="default-input">
        <text class="input-text" :class="{ placeholder: !selectedText }">
          {{ selectedText || placeholder }}
        </text>
        <u-icon name="arrow-down" size="16" color="#999" />
      </view>
    </view>
    
    <!-- 城市选择器 -->
    <u-picker
      v-model="showPicker"
      :columns="pickerColumns"
      keyName="label"
      @confirm="onConfirm"
      @cancel="onCancel"
      @change="onColumnChange"
      :immediately="true"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { areaList } from '@/utils/area'

// 定义组件Props
interface Props {
  modelValue?: {
    province?: string
    city?: string
    district?: string
  }
  placeholder?: string
  mode?: 'province-city-district' | 'province-city' | 'region'
  disabled?: boolean
}

// 定义组件Emits
interface Emits {
  (e: 'update:modelValue', value: { province: string, city: string, district: string }): void
  (e: 'change', value: { province: string, city: string, district: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择地区',
  mode: 'province-city-district',
  disabled: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const showPicker = ref(false)
const pickerColumns = ref<Array<Array<{label: string, value: number}>>>([])
const currentSelection = ref({
  province: '',
  city: '',
  district: ''
})

// 计算属性：显示文本
const selectedText = computed(() => {
  const { province, city, district } = currentSelection.value
  
  if (props.mode === 'province-city') {
    return province && city ? `${province} ${city}` : ''
  } else if (props.mode === 'region') {
    // region模式使用uview-pro的内置三级联动
    return province && city && district ? `${province} ${city} ${district}` : ''
  } else {
    // 默认province-city-district模式
    return province && city && district ? `${province} ${city} ${district}` : ''
  }
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
  
  console.log('🎯 显示城市选择器')
  
  if (props.mode === 'region') {
    // 使用uview-pro内置的region模式
    showPicker.value = true
  } else {
    // 自定义模式，初始化数据
    initPickerData()
    showPicker.value = true
  }
}

// 初始化选择器数据
const initPickerData = () => {
  console.log('📊 初始化选择器数据，模式:', props.mode)
  
  const columns: Array<Array<{label: string, value: number}>> = []
  
  // 第一列：省份
  columns[0] = areaList.map(province => ({ 
    label: province.label, 
    value: province.value 
  }))
  
  if (props.mode === 'province-city' || props.mode === 'province-city-district') {
    // 第二列：城市（默认第一个省份的城市）
    columns[1] = areaList[0]?.children?.map(city => ({ 
      label: city.label, 
      value: city.value 
    })) || []
    
    if (props.mode === 'province-city-district') {
      // 第三列：区县（默认第一个省份第一个城市的区县）
      columns[2] = areaList[0]?.children?.[0]?.children?.map(district => ({ 
        label: district.label, 
        value: district.value 
      })) || []
    }
  }
  
  pickerColumns.value = columns
  
  console.log('📊 数据初始化完成:')
  console.log('  省份数量:', columns[0]?.length)
  console.log('  城市数量:', columns[1]?.length || 0)
  console.log('  区县数量:', columns[2]?.length || 0)
}

// 列变化处理
const onColumnChange = (e: any) => {
  if (props.mode === 'region') return // region模式由uview-pro内部处理
  
  console.log('🔄 列变化事件:', e)
  
  const { columnIndex, index, indexs } = e
  
  if (columnIndex === 0) {
    // 省份变化，更新城市和区县
    const provinceIndex = index
    console.log('🏦 省份变化，索引:', provinceIndex)
    
    if (provinceIndex !== undefined && provinceIndex < areaList.length) {
      const cities = areaList[provinceIndex]?.children || []
      pickerColumns.value[1] = cities.map(city => ({ 
        label: city.label, 
        value: city.value 
      }))
      
      if (props.mode === 'province-city-district' && cities.length > 0) {
        const districts = cities[0]?.children || []
        pickerColumns.value[2] = districts.map(district => ({ 
          label: district.label, 
          value: district.value 
        }))
      }
      
      console.log('🏦 更新城市数据:', pickerColumns.value[1].length)
      console.log('🏢 更新区县数据:', pickerColumns.value[2]?.length || 0)
    }
  } else if (columnIndex === 1 && props.mode === 'province-city-district') {
    // 城市变化，更新区县
    const provinceIndex = indexs?.[0]
    const cityIndex = index
    
    console.log('🏢 城市变化，省份索引:', provinceIndex, '城市索引:', cityIndex)
    
    if (provinceIndex !== undefined && cityIndex !== undefined && 
        provinceIndex < areaList.length && 
        areaList[provinceIndex]?.children?.[cityIndex]) {
      
      const districts = areaList[provinceIndex]?.children?.[cityIndex]?.children || []
      pickerColumns.value[2] = districts.map(district => ({ 
        label: district.label, 
        value: district.value 
      }))
      
      console.log('🏢 更新区县数据:', pickerColumns.value[2].length)
    }
  }
  
  // 强制触发组件更新
  nextTick(() => {
    pickerColumns.value = [...pickerColumns.value]
  })
}

// 确认选择
const onConfirm = (e: any) => {
  console.log('✅ 确认选择事件:', e)
  
  if (props.mode === 'region') {
    // uview-pro的region模式
    const { value } = e
    if (value && value.length >= 2) {
      const result = {
        province: value[0]?.text || '',
        city: value[1]?.text || '',
        district: value[2]?.text || ''
      }
      
      currentSelection.value = result
      emit('update:modelValue', result)
      emit('change', result)
    }
  } else {
    // 自定义模式
    const { indexs } = e
    
    if (!indexs || !Array.isArray(indexs)) {
      console.error('⚠️ 索引数据不完整:', indexs)
      return
    }
    
    try {
      const provinceIndex = indexs[0]
      const cityIndex = indexs[1]
      const districtIndex = indexs[2]
      
      // 验证索引有效性
      if (provinceIndex === undefined || 
          provinceIndex >= areaList.length) {
        console.error('⚠️ 省份索引无效')
        return
      }
      
      const province = areaList[provinceIndex]
      const result = {
        province: province.label,
        city: '',
        district: ''
      }
      
      if (props.mode === 'province-city' || props.mode === 'province-city-district') {
        if (cityIndex !== undefined && 
            province.children && 
            cityIndex < province.children.length) {
          
          const city = province.children[cityIndex]
          result.city = city.label
          
          if (props.mode === 'province-city-district') {
            if (districtIndex !== undefined && 
                city.children && 
                districtIndex < city.children.length) {
              
              result.district = city.children[districtIndex].label
            }
          }
        }
      }
      
      console.log('✅ 设置选择结果:', result)
      
      currentSelection.value = result
      emit('update:modelValue', result)
      emit('change', result)
      
    } catch (error) {
      console.error('⚠️ 处理选择结果出错:', error)
    }
  }
  
  showPicker.value = false
}

// 取消选择
const onCancel = () => {
  console.log('❌ 取消选择')
  showPicker.value = false
}

// 组件挂载时初始化
onMounted(() => {
  console.log('🚀 CitySelector组件挂载，模式:', props.mode)
  
  // 检查地区数据
  if (!areaList || areaList.length === 0) {
    console.error('⚠️ 地区数据未加载')
  } else {
    console.log('✅ 地区数据已加载，省份数量:', areaList.length)
  }
})
</script>

<style lang="scss" scoped>
.city-selector {
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
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;
  min-height: 80rpx;
  
  &:active {
    background-color: #f8f9fa;
  }
}

.input-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  
  &.placeholder {
    color: #999;
  }
}
</style>