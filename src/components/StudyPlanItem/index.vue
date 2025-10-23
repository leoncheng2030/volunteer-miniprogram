<template>
  <view class="study-plan-item" @click="handleClick">
    <view class="plan-content">
      <view class="plan-header">
        <view class="plan-title">{{ plan.title }}</view>
        <view class="plan-progress">
          <text class="progress-text">{{ plan.progress }}%</text>
        </view>
      </view>
      <view class="plan-description">{{ plan.description }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface StudyPlanItem {
  id: string | number
  title: string
  description: string
  progress: number
}

interface Props {
  plan: StudyPlanItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [plan: StudyPlanItem]
}>()

const handleClick = () => {
  emit('click', props.plan)
}
</script>

<style scoped lang="scss">
.study-plan-item {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
  border: 1rpx solid #f0f0f0;
  
  &:active {
    background-color: #f8f8f8;
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.plan-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-width: 0;
}

.plan-progress {
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%);
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
  border: 1rpx solid rgba(255, 107, 107, 0.2);
  min-width: 80rpx;
  text-align: center;
}

.progress-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #ff6b6b;
}

.plan-description {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
