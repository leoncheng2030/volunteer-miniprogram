<template>
  <view class="status-stamp" :class="getStatusClass()">
    <view class="stamp-inner">
      <text class="stamp-text">{{ status }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  status: string
}

const props = withDefaults(defineProps<Props>(), {
  status: ''
})

// 获取状态对应的样式类
const getStatusClass = () => {
  const statusMap: Record<string, string> = {
    '报名中': 'status-recruiting',
    '进行中': 'status-ongoing', 
    '已结束': 'status-ended',
    '草稿': 'status-draft',
    '已取消': 'status-cancelled'
  }
  return statusMap[props.status] || 'status-default'
}
</script>

<style lang="scss" scoped>
.status-stamp {
  position: relative;
  display: inline-block;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  transform: rotate(-15deg);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  // 印章背景样式
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    border: 6rpx solid currentColor;
    opacity: 0.8;
  }
  
  // 内圈装饰
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    border: 2rpx solid currentColor;
    opacity: 0.6;
  }
}

.stamp-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
}

.stamp-text {
  font-size: 20rpx;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
}

// 不同状态的颜色样式
.status-recruiting {
  color: #FF6B6B;
  
  .stamp-text {
    color: #FF6B6B;
  }
}

.status-ongoing {
  color: #4CAF50;
  
  .stamp-text {
    color: #4CAF50;
  }
}

.status-ended {
  color: #9E9E9E;
  
  .stamp-text {
    color: #9E9E9E;
  }
}

.status-draft {
  color: #2196F3;
  
  .stamp-text {
    color: #2196F3;
  }
}

.status-cancelled {
  color: #F44336;
  
  .stamp-text {
    color: #F44336;
  }
}

.status-default {
  color: #666666;
  
  .stamp-text {
    color: #666666;
  }
}

// 动画效果
.status-stamp {
  animation: stampAppear 0.6s ease-out;
}

@keyframes stampAppear {
  0% {
    transform: rotate(-15deg) scale(0);
    opacity: 0;
  }
  50% {
    transform: rotate(-18deg) scale(1.1);
  }
  100% {
    transform: rotate(-15deg) scale(1);
    opacity: 1;
  }
}
</style>