<template>
    <view class="custom-tabbar">


        <!-- 导航项容器 -->
        <view class="tabbar-content">
            <!-- 首页 -->
            <view class="tab-item" :class="{ active: currentPage === 'pages/index/index' }"
                @click="switchPage('pages/index/index')">
                <image class="tab-icon"
                    :src="currentPage === 'pages/index/index' ? '/static/images/tab_home_s.png' : '/static/images/tab_home.png'"
                    mode="aspectFit" />
                <text class="tab-label">首页</text>
            </view>

            <!-- 我的 -->
            <view class="tab-item" :class="{ active: currentPage === 'pages/user/user' }"
                @click="switchPage('pages/user/user')">
                <image class="tab-icon"
                    :src="currentPage === 'pages/user/user' ? '/static/images/tab_user_s.png' : '/static/images/tab_user.png'"
                    mode="aspectFit" />
                <text class="tab-label">我的</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">

const pages = getCurrentPages()
const currentPage = pages[pages.length - 1].route;

const switchPage = (path: string) => {
    uni.switchTab({ url: "/" + path })
}
</script>

<style scoped lang="scss">
@import './index.scss'
</style>