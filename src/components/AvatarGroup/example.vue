<template>
  <view class="example-page">
    <view class="example-section">
      <view class="section-title">基础用法</view>
      <AvatarGroup 
        :userList="basicUserList" 
        @click="handleUserClick"
      />
    </view>

    <view class="example-section">
      <view class="section-title">带激活状态</view>
      <AvatarGroup 
        :userList="userListWithActive" 
        :activeIds="activeIds"
        @click="handleUserClick"
      />
    </view>

    <view class="example-section">
      <view class="section-title">限制显示数量</view>
      <AvatarGroup 
        :userList="largeUserList" 
        :maxShow="3"
        @click="handleUserClick"
      />
    </view>

    <view class="example-section">
      <view class="section-title">不同尺寸</view>
      <view class="size-example">
        <view class="size-item">
          <text class="size-label">Small:</text>
          <AvatarGroup 
            :userList="basicUserList" 
            size="small"
            @click="handleUserClick"
          />
        </view>
        <view class="size-item">
          <text class="size-label">Medium:</text>
          <AvatarGroup 
            :userList="basicUserList" 
            size="medium"
            @click="handleUserClick"
          />
        </view>
        <view class="size-item">
          <text class="size-label">Large:</text>
          <AvatarGroup 
            :userList="basicUserList" 
            size="large"
            @click="handleUserClick"
          />
        </view>
      </view>
    </view>

    <view class="example-section">
      <view class="section-title">不可点击</view>
      <AvatarGroup 
        :userList="basicUserList" 
        :clickable="false"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AvatarGroup from './index.vue'
import type { IUser } from './types'

// 基础用户列表
const basicUserList = ref<IUser[]>([
  {
    id: '1',
    name: '张小三',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '2',
    nickname: '李四',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '3',
    name: '王五',
    avatar: '/static/images/default-avatar.png'
  }
])

// 带激活状态的用户列表
const userListWithActive = ref<IUser[]>([
  {
    id: '1',
    name: '张小三',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '2',
    nickname: '李四',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '3',
    name: '王五',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '4',
    name: '赵六',
    avatar: '/static/images/default-avatar.png'
  }
])

// 大量用户列表（用于测试maxShow）
const largeUserList = ref<IUser[]>([
  {
    id: '1',
    name: '张小三',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '2',
    nickname: '李四',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '3',
    name: '王五',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '4',
    name: '赵六',
    avatar: '/static/images/default-avatar.png'
  },
  {
    id: '5',
    name: '钱七',
    avatar: '/static/images/default-avatar.png'
  }
])

// 激活的用户ID列表
const activeIds = ref(['1', '3'])

// 用户点击处理
const handleUserClick = (user: IUser, index: number) => {
  console.log('点击用户:', user, '索引:', index)
  
  // 切换激活状态
  const idx = activeIds.value.indexOf(user.id)
  if (idx > -1) {
    activeIds.value.splice(idx, 1)
  } else {
    activeIds.value.push(user.id)
  }
}
</script>

<style lang="scss" scoped>
.example-page {
  padding: 32rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.example-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
}

.size-example {
  .size-item {
    margin-bottom: 32rpx;
    
    .size-label {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 16rpx;
      display: block;
    }
  }
}
</style>