<template>
  <view 
    class="status-stamp" 
    :class="[stampClass, sizeClass]"
    :style="{ transform: `rotate(${rotation}deg)`, opacity: opacity }"
    v-if="text"
  >
    <text class="stamp-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 状态值
  status: string
  // 状态类型：order(订单状态) | profit(分账状态) | custom(自定义)
  type?: 'order' | 'profit' | 'custom'
  // 自定义文本（当type为custom时使用）
  text?: string
  // 自定义颜色（当type为custom时使用）
  color?: string
  // 尺寸：small | medium | large
  size?: 'small' | 'medium' | 'large'
  // 旋转角度
  rotation?: number
  // 透明度
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'order',
  text: '',
  color: '#999',
  size: 'medium',
  rotation: -15,
  opacity: 0.15
})

// 获取状态文本
const text = computed(() => {
  if (props.type === 'custom') {
    return props.text
  }
  
  if (props.type === 'order') {
    return getOrderStatusText(props.status)
  }
  
  if (props.type === 'profit') {
    return getProfitStatusText(props.status)
  }
  
  return ''
})

// 获取印章样式类
const stampClass = computed(() => {
  if (props.type === 'custom') {
    return 'stamp-custom'
  }
  
  if (props.type === 'order') {
    return getOrderStampClass(props.status)
  }
  
  if (props.type === 'profit') {
    return getProfitStampClass(props.status)
  }
  
  return 'stamp-gray'
})

// 获取尺寸样式类
const sizeClass = computed(() => {
  return `stamp-${props.size}`
})

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'WAIT_PAY': '待付款',
    'WAIT_DELIVER': '待取酒',
    'DELIVERING': '取酒中',
    'TRADE_SUCCESS': '交易完成',
    'REFUNDING': '退款中',
    'TRADE_CLOSED': '交易关闭',
    'pending': '待付款',
    'paid': '待取酒',
    'dispensing': '取酒中',
    'completed': '交易完成',
    'refunding': '退款中',
    'cancelled': '交易关闭'
  }
  
  return statusMap[status] || '未知状态'
}

// 获取分账状态文本
const getProfitStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': '待分账',
    'PROCESSING': '分账中',
    'SUCCESS': '分账成功',
    'FAILED': '分账失败',
    'NO_NEED': '无需分账'
  }
  
  return statusMap[status] || '未知状态'
}

// 获取订单状态印章样式
const getOrderStampClass = (status: string) => {
  const classMap: Record<string, string> = {
    'WAIT_PAY': 'stamp-orange',
    'WAIT_DELIVER': 'stamp-blue',
    'DELIVERING': 'stamp-green',
    'TRADE_SUCCESS': 'stamp-green',
    'REFUNDING': 'stamp-red',
    'TRADE_CLOSED': 'stamp-gray',
    'pending': 'stamp-orange',
    'paid': 'stamp-blue',
    'dispensing': 'stamp-green',
    'completed': 'stamp-green',
    'refunding': 'stamp-red',
    'cancelled': 'stamp-gray',
    'unknown': 'stamp-gray'
  }
  
  return classMap[status] || 'stamp-gray'
}

// 获取分账状态印章样式
const getProfitStampClass = (status: string) => {
  const classMap: Record<string, string> = {
    'PENDING': 'stamp-orange',
    'PROCESSING': 'stamp-blue',
    'SUCCESS': 'stamp-green',
    'FAILED': 'stamp-red',
    'NO_NEED': 'stamp-gray'
  }
  
  return classMap[status] || 'stamp-gray'
}
</script>

<style lang="scss" scoped>
.status-stamp {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid;
  
  .stamp-text {
    font-weight: bold;
    text-align: center;
    line-height: 1.2;
    white-space: nowrap;
  }
  
  // 尺寸样式
  &.stamp-small {
    width: 80rpx;
    height: 80rpx;
    border-width: 3rpx;
    
    .stamp-text {
      font-size: 20rpx;
      transform: scale(0.7);
    }
  }
  
  &.stamp-medium {
    width: 100rpx;
    height: 100rpx;
    border-width: 4rpx;
    
    .stamp-text {
      font-size: 22rpx;
      transform: scale(0.7);
    }
  }
  
  &.stamp-large {
    width: 120rpx;
    height: 120rpx;
    border-width: 6rpx;
    
    .stamp-text {
      font-size: 28rpx;
      transform: scale(0.8);
    }
  }
  
  // 颜色样式 - 小雷锋红色主题
  &.stamp-orange {
    color: #ff8e53;
    border-color: #ff8e53;
    background: rgba(255, 142, 83, 0.1);
  }
  
  &.stamp-blue {
    color: #ff6b6b;
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
  
  &.stamp-green {
    color: #52c41a;
    border-color: #52c41a;
    background: rgba(82, 196, 26, 0.1);
  }
  
  &.stamp-red {
    color: #ff6b6b;
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
  
  &.stamp-gray {
    color: #999;
    border-color: #999;
    background: rgba(153, 153, 153, 0.1);
  }
  
  &.stamp-custom {
    border-color: var(--stamp-color, #ff6b6b);
    color: var(--stamp-color, #ff6b6b);
    background: var(--stamp-bg, rgba(255, 107, 107, 0.1));
  }
}
</style>