<template>
  <view class="activity-item" @click="handleClick">
    <view class="activity-date">
      <text class="date-text">{{ activity.day }}</text>
    </view>
    <view class="activity-content">
      <text class="activity-title">{{ activity.title }}</text>
      <view class="activity-location">
        <u-icon name="map" color="#999" size="24" class="location-icon"></u-icon>
        <text class="location-text">{{ activity.location }}</text>
      </view>
      <view class="activity-meta">
        <text class="activity-date-text">{{ activity.date }}</text>
        <view class="meta-divider"></view>
        <text class="activity-status">{{ activity.status }}</text>
      </view>
    </view>
    <view v-if="activity.status === '报名中'" class="signup-button" @click.stop="handleSignUp">
      <text class="signup-text">立即报名</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface ActivityItem {
  id: string | number
  title: string
  location: string
  day: string
  date: string
  status: string
}

interface Props {
  activity: ActivityItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [activity: ActivityItem]
  signUp: [activity: ActivityItem]
}>()

const handleClick = () => {
  emit('click', props.activity)
}

const handleSignUp = () => {
  emit('signUp', props.activity)
}
</script>

<style scoped lang="scss">
.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
  
  &:active {
    background-color: #f8f8f8;
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.activity-date {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.date-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.activity-location {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.location-icon {
  margin-right: 8rpx;
  flex-shrink: 0;
}

.location-text {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.activity-date-text {
  font-size: 24rpx;
  color: #999;
}

.meta-divider {
  width: 4rpx;
  height: 4rpx;
  background-color: #ddd;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background-color: #e8f5e8;
  color: #4caf50;
  flex-shrink: 0;
}

.signup-button {
  margin-left: 16rpx;
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
}

.signup-text {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
