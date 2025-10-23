<template>
  <view class="image-upload-container">
    <!-- 上传区域 -->
    <view class="upload-wrapper" @click="chooseImage">
      <!-- 已上传图片预览 -->
      <image 
        v-if="imageUrl"
        :src="imageUrl" 
        class="uploaded-image"
        mode="aspectFill"
        @click.stop="previewImage"
      />
      
      <!-- 上传占位符 -->
      <view v-else class="upload-placeholder">
        <u-icon :name="icon" :size="iconSize" :color="iconColor"></u-icon>
        <text class="placeholder-text">{{ placeholder }}</text>
      </view>
      
      <!-- 删除按钮 -->
      <view 
        v-if="imageUrl && deletable" 
        class="delete-btn" 
        @click.stop="deleteImage"
      >
        <u-icon name="close" size="24" color="#ffffff"></u-icon>
      </view>
    </view>
    
    <!-- 提示信息 -->
    <text v-if="tip" class="upload-tip">{{ tip }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadImageForMini, uploadAvatarForMini } from '@/api/file'
import { showToast } from '@/utils'

// Props 定义
interface Props {
  modelValue?: string // v-model 绑定的图片URL
  placeholder?: string // 占位符文本
  tip?: string // 提示信息
  icon?: string // 图标名称
  iconSize?: number | string // 图标大小
  iconColor?: string // 图标颜色
  width?: number | string // 组件宽度
  height?: number | string // 组件高度
  maxSize?: number // 最大文件大小（MB）
  maxCount?: number // 最大选择数量
  acceptTypes?: string[] // 接受的文件类型
  deletable?: boolean // 是否可删除
  sourceType?: ('album' | 'camera')[] //图片来源
  uploadType?: 'image' | 'avatar' // 上传类型
  previewFullImage?: boolean // 是否支持全屏预览
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '点击上传图片',
  tip: '',
  icon: 'camera',
  iconSize: 60,
  iconColor: '#cccccc',
  width: 160,
  height: 160,
  maxSize: 5,
  maxCount: 1,
  acceptTypes: () => ['jpg', 'jpeg', 'png', 'gif'],
  deletable: true,
  sourceType: () => ['album', 'camera'],
  uploadType: 'image',
  previewFullImage: true
})

// Emits 定义
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'success', result: any): void
  (e: 'error', error: any): void
  (e: 'delete'): void
  (e: 'beforeUpload', file: any): boolean | Promise<boolean>
}

const emit = defineEmits<Emits>()

// 响应式数据
const uploading = ref(false)

// 计算属性
const imageUrl = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 选择图片
const chooseImage = () => {
  if (uploading.value) return
  
  uni.chooseImage({
    count: props.maxCount,
    sizeType: ['compressed'],
    sourceType: props.sourceType,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      handleFileUpload(tempFilePath)
    },
    fail: (error) => {
      console.error('选择图片失败:', error)
      emit('error', error)
      showToast('选择图片失败')
    }
  })
}

// 处理文件上传
const handleFileUpload = async (filePath: string) => {
  try {
    // 获取文件信息
    const fileInfo = await uni.getFileInfo({
      filePath: filePath
    })
    
    // 验证文件大小
    const maxSizeBytes = props.maxSize * 1024 * 1024
    if (fileInfo.size > maxSizeBytes) {
      showToast(`文件大小不能超过${props.maxSize}MB`)
      return
    }
    
    // 验证文件类型
    const fileExtension = filePath.toLowerCase().split('.').pop()
    if (!props.acceptTypes.includes(fileExtension || '')) {
      const typesText = props.acceptTypes.join('、').toUpperCase()
      showToast(`只支持 ${typesText} 格式`)
      return
    }
    
    // 上传前钩子
    const beforeResult = emit('beforeUpload', {
      path: filePath,
      size: fileInfo.size,
      type: fileExtension
    })
    
    if (beforeResult === false) {
      return
    }
    
    uploading.value = true
    uni.showLoading({ title: '上传中...' })
    
    // 根据上传类型选择不同的上传方法
    const uploadFn = props.uploadType === 'avatar' ? uploadAvatarForMini : uploadImageForMini
    const uploadResult = await uploadFn(filePath)
    
    // 更新图片URL
    imageUrl.value = uploadResult.url
    
    // 触发成功事件
    emit('success', uploadResult)
    
    uni.hideLoading()
    showToast('上传成功', 'success')
    
  } catch (error) {
    console.error('图片上传失败:', error)
    emit('error', error)
    
    uni.hideLoading()
    showToast('上传失败')
  } finally {
    uploading.value = false
  }
}

// 删除图片
const deleteImage = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        imageUrl.value = ''
        emit('delete')
        showToast('已删除', 'success')
      }
    }
  })
}

// 预览图片
const previewImage = () => {
  if (!props.previewFullImage || !imageUrl.value) return
  
  uni.previewImage({
    current: imageUrl.value,
    urls: [imageUrl.value]
  })
}
</script>

<style scoped lang="scss">
.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.upload-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx dashed #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.placeholder-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  text-align: center;
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.upload-tip {
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
  line-height: 1.4;
}

/* 上传中的状态 */
.upload-wrapper.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* 响应式样式 */
@media (max-width: 750rpx) {
  .upload-wrapper {
    width: 140rpx;
    height: 140rpx;
  }
  
  .placeholder-text {
    font-size: 22rpx;
  }
}
</style>
