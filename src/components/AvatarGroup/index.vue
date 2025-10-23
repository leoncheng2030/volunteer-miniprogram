<template>
  <view class="avatar-group">
    <view 
      v-for="(user, index) in userList" 
      :key="user.id"
      class="avatar-item"
      :class="{ active: activeIds?.includes(user.id) }"
      @click="handleClick(user, index)"
    >
      <view class="avatar-container">
        <image 
          :src="user.avatar || defaultAvatar" 
          class="avatar-img"
          mode="aspectFill"
        />
        <!-- 选中状态指示器 -->
        <view v-if="activeIds?.includes(user.id)" class="active-indicator">
          <view class="active-dot"></view>
        </view>
      </view>
      <view class="nickname">{{ user.name || user.nickname || '未知用户' }}</view>
    </view>
    
    <!-- 空状态 -->
    <view v-if="userList.length === 0" class="empty-state">
      <image src="/static/images/default-avatar.png" class="empty-avatar" />
      <text class="empty-text">暂无用户</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 用户信息接口
interface IUser {
  id: string
  name?: string
  nickname?: string
  avatar?: string
}

// 组件属性
interface Props {
  userList: IUser[] // 用户列表
  activeIds?: string[] // 激活状态的用户ID数组
  maxShow?: number // 最大显示数量，超出显示省略
  size?: 'small' | 'medium' | 'large' // 头像尺寸
  clickable?: boolean // 是否可点击
}

// 组件事件
interface Emits {
  (e: 'click', user: IUser, index: number): void
}

const props = withDefaults(defineProps<Props>(), {
  activeIds: () => [],
  maxShow: 5,
  size: 'medium',
  clickable: true
})

const emit = defineEmits<Emits>()

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png'

// 显示的用户列表（考虑maxShow限制）
const displayUserList = computed(() => {
  if (props.maxShow && props.userList.length > props.maxShow) {
    return props.userList.slice(0, props.maxShow)
  }
  return props.userList
})

// 剩余未显示的用户数量
const remainingCount = computed(() => {
  if (props.maxShow && props.userList.length > props.maxShow) {
    return props.userList.length - props.maxShow
  }
  return 0
})

// 点击处理
const handleClick = (user: IUser, index: number) => {
  if (props.clickable) {
    emit('click', user, index)
  }
}
</script>

<style lang="scss" scoped>
.avatar-group {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 24rpx;
  padding: 16rpx 0;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.active {
    transform: scale(1.05);
    
    .avatar-container {
      border-color: #FF6B6B;
      box-shadow: 0 0 0 4rpx rgba(255, 107, 107, 0.2);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.avatar-container {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
  
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .active-indicator {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 24rpx;
    height: 24rpx;
    background-color: #FF6B6B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #FFFFFF;
    
    .active-dot {
      width: 8rpx;
      height: 8rpx;
      background-color: #FFFFFF;
      border-radius: 50%;
    }
  }
}

.nickname {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666666;
  text-align: center;
  max-width: 100rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

// 尺寸变体
.avatar-group.size-small {
  .avatar-container {
    width: 60rpx;
    height: 60rpx;
  }
  
  .nickname {
    font-size: 22rpx;
    max-width: 80rpx;
  }
}

.avatar-group.size-large {
  .avatar-container {
    width: 100rpx;
    height: 100rpx;
  }
  
  .nickname {
    font-size: 26rpx;
    max-width: 120rpx;
  }
}

// 更多指示器
.more-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background-color: #F5F5F5;
  border-radius: 50%;
  color: #999999;
  font-size: 24rpx;
  font-weight: 500;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  
  .empty-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    opacity: 0.5;
    margin-bottom: 16rpx;
  }
  
  .empty-text {
    font-size: 24rpx;
    color: #999999;
  }
}

// 不可点击状态
.avatar-item:not(.clickable) {
  cursor: default;
  
  &:active {
    transform: none;
  }
}
</style>