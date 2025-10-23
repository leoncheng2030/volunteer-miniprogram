<template>
  <view v-if="isH5" class="h5-tabbar">
    <!-- 导航项容器 -->
    <view class="tabbar-content">
      <!-- 首页 -->
      <view 
        class="tab-item" 
        :class="{ active: currentPage === 'pages/index/index' }"
        @click="switchPage('pages/index/index')"
      >
        <image 
          class="tab-icon"
          :src="currentPage === 'pages/index/index' ? '/static/images/tab_home_s.png' : '/static/images/tab_home.png'"
          mode="aspectFit" 
        />
        <text class="tab-label">首页</text>
      </view>

      <!-- 共建 -->
      <view 
        class="tab-item" 
        :class="{ active: currentPage === 'pages/youpei/index' }"
        @click="switchPage('pages/youpei/index')"
      >
        <image 
          class="tab-icon"
          :src="currentPage === 'pages/youpei/index' ? '/static/images/tab_home_s.png' : '/static/images/tab_home.png'"
          mode="aspectFit" 
        />
        <text class="tab-label">共建</text>
      </view>

      <!-- 我的 -->
      <view 
        class="tab-item" 
        :class="{ active: currentPage === 'pages/user/user' }"
        @click="switchPage('pages/user/user')"
      >
        <image 
          class="tab-icon"
          :src="currentPage === 'pages/user/user' ? '/static/images/tab_user_s.png' : '/static/images/tab_user.png'"
          mode="aspectFit" 
        />
        <text class="tab-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isH5 = process.env.UNI_PLATFORM === 'h5'

const currentPage = ref('')

const getCurrentPage = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    currentPage.value = pages[pages.length - 1].route
  }
}

const switchPage = (path: string) => {
  uni.switchTab({ url: "/" + path })
}

onMounted(() => {
  getCurrentPage()
  
  // 监听页面显示事件
  const app = getApp()
  if (app) {
    app.globalData = app.globalData || {}
    app.globalData.tabbarCallback = getCurrentPage
  }
})

onUnmounted(() => {
  // 清理监听
  const app = getApp()
  if (app && app.globalData) {
    app.globalData.tabbarCallback = null
  }
})
</script>

<style scoped lang="scss">
.h5-tabbar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 9999 !important;
  background-color: #ffffff !important;
  border-top: 1px solid #e5e5e5 !important;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
  height: 50px !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-around !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;

  // 导航项容器
  .tabbar-content {
    display: flex !important;
    height: 100% !important;
    width: 100% !important;
    align-items: center !important;
    justify-content: space-around !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  // 导航项
  .tab-item {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 6px 0 !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    height: 100% !important;
    min-width: 0 !important;

    &:hover {
      background-color: rgba(255, 107, 107, 0.1) !important;
    }

    .tab-icon {
      width: 24px !important;
      height: 24px !important;
      margin-bottom: 2px !important;
      transition: transform 0.3s ease !important;
      flex-shrink: 0 !important;
      display: block !important;
    }

    .tab-label {
      font-size: 12px !important;
      color: #666 !important;
      line-height: 1 !important;
      transition: color 0.3s ease !important;
      text-align: center !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 100% !important;
    }

    &.active {
      .tab-label {
        color: #ff6b6b !important;
      }
      
      .tab-icon {
        transform: scale(1.1) !important;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .h5-tabbar {
    height: 50px !important;
    
    .tab-item {
      .tab-icon {
        width: 22px !important;
        height: 22px !important;
      }
      
      .tab-label {
        font-size: 11px !important;
      }
    }
  }
}

@media (max-width: 480px) {
  .h5-tabbar {
    height: 45px !important;
    
    .tab-item {
      .tab-icon {
        width: 20px !important;
        height: 20px !important;
      }
      
      .tab-label {
        font-size: 10px !important;
      }
    }
  }
}

// iOS安全区域适配
@supports (padding: max(0px)) {
  .h5-tabbar {
    padding-bottom: max(0px, env(safe-area-inset-bottom)) !important;
    height: calc(50px + max(0px, env(safe-area-inset-bottom))) !important;
  }
}
</style>