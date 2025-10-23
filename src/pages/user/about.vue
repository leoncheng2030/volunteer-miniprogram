<template>
    <view class="about-container">
        <!-- Logo和名称 -->
        <view class="header-section">
            <view class="logo-container">
                <image class="logo" src="/static/images/default-avatar.png" mode="aspectFit"></image>
                <text class="app-name">小雷锋</text>
            </view>
            <text class="app-version">版本 1.0.0</text>
        </view>

        <!-- 应用介绍 -->
        <view class="content-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">应用介绍</text>
            </view>
            <view class="content-card">
                <text class="content-text">
                    小雷锋是一款专注于志愿服务的移动应用，致力于连接志愿者与服务需求，
                    让志愿服务变得更加便捷、高效。我们相信每个人的微小善举都能汇聚成巨大的社会正能量。
                </text>
            </view>
        </view>

        <!-- 核心功能 -->
        <view class="content-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">核心功能</text>
            </view>
            <view class="feature-list">
                <view class="feature-item">
                    <view class="feature-icon">
                        <u-icon name="calendar" color="#ff6b6b" size="32"></u-icon>
                    </view>
                    <view class="feature-content">
                        <text class="feature-title">活动管理</text>
                        <text class="feature-desc">发布、参与、管理志愿服务活动</text>
                    </view>
                </view>
                <view class="feature-item">
                    <view class="feature-icon">
                        <u-icon name="clock" color="#ff8e53" size="32"></u-icon>
                    </view>
                    <view class="feature-content">
                        <text class="feature-title">服务记录</text>
                        <text class="feature-desc">记录志愿服务时长和经历</text>
                    </view>
                </view>
                <view class="feature-item">
                    <view class="feature-icon">
                        <u-icon name="medal" color="#ff6b6b" size="32"></u-icon>
                    </view>
                    <view class="feature-content">
                        <text class="feature-title">志愿证书</text>
                        <text class="feature-desc">获得志愿服务认证和奖励</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 联系我们 -->
        <view class="content-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">联系我们</text>
            </view>
            <view class="contact-list">
                <view class="contact-item" @click="makePhoneCall">
                    <u-icon name="phone" color="#ff6b6b" size="32"></u-icon>
                    <text class="contact-text">客服热线：400-123-4567</text>
                    <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                </view>
                <view class="contact-item" @click="copyEmail">
                    <u-icon name="email" color="#ff8e53" size="32"></u-icon>
                    <text class="contact-text">邮箱：service@xiaoleifeng.com</text>
                    <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                </view>
                <view class="contact-item" @click="openLocation">
                    <u-icon name="map-pin" color="#ff6b6b" size="32"></u-icon>
                    <text class="contact-text">地址：北京市朝阳区xx街道xx号</text>
                    <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                </view>
            </view>
        </view>

        <!-- 版权信息 -->
        <view class="footer-section">
            <text class="copyright">© 2024 小雷锋 版权所有</text>
            <text class="icp">京ICP备12345678号</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 拨打电话
const makePhoneCall = () => {
    uni.makePhoneCall({
        phoneNumber: '4001234567',
        fail: (err) => {
            console.error('拨打电话失败:', err)
            uni.showToast({
                title: '拨打电话失败',
                icon: 'none'
            })
        }
    })
}

// 复制邮箱
const copyEmail = () => {
    uni.setClipboardData({
        data: 'service@xiaoleifeng.com',
        success: () => {
            uni.showToast({
                title: '邮箱已复制',
                icon: 'success'
            })
        },
        fail: () => {
            uni.showToast({
                title: '复制失败',
                icon: 'none'
            })
        }
    })
}

// 打开地图
const openLocation = () => {
    uni.openLocation({
        latitude: 39.9042,
        longitude: 116.4074,
        name: '小雷锋志愿服务中心',
        address: '北京市朝阳区xx街道xx号',
        fail: (err) => {
            console.error('打开地图失败:', err)
            uni.showToast({
                title: '打开地图失败',
                icon: 'none'
            })
        }
    })
}
</script>

<style scoped lang="scss">
.about-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 头部Logo区域 */
.header-section {
    background: #ffffff;
    padding: 60rpx 0 80rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
}

.logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
}

.logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 24rpx;
    margin-bottom: 20rpx;
}

.app-name {
    font-size: 40rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 10rpx;
}

.app-version {
    font-size: 26rpx;
    color: #999999;
}

/* 内容区域 */
.content-section {
    margin-top: 20rpx;
    background: #ffffff;
    padding: 0 30rpx;
}

.section-title {
    display: flex;
    align-items: center;
    padding: 30rpx 0 20rpx;
}

.title-icon {
    width: 6rpx;
    height: 36rpx;
    background: linear-gradient(to bottom, #ff6b6b, #ff8e53);
    border-radius: 3rpx;
    margin-right: 20rpx;
}

.title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.content-card {
    padding: 30rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
}

.content-text {
    font-size: 28rpx;
    line-height: 1.8;
    color: #666666;
}

/* 功能列表 */
.feature-list {
    padding: 0 0 30rpx;
}

.feature-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
}

.feature-icon {
    width: 64rpx;
    height: 64rpx;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
}

.feature-content {
    flex: 1;
}

.feature-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 8rpx;
}

.feature-desc {
    display: block;
    font-size: 26rpx;
    color: #999999;
}

/* 联系方式 */
.contact-list {
    padding: 0 0 30rpx;
}

.contact-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:active {
        background-color: #f8f8f8;
    }
}

.contact-text {
    flex: 1;
    margin-left: 20rpx;
    font-size: 28rpx;
    color: #333333;
}

/* 底部版权 */
.footer-section {
    background: #ffffff;
    padding: 40rpx 0 60rpx;
    text-align: center;
    margin-top: 20rpx;
}

.copyright {
    display: block;
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 8rpx;
}

.icp {
    display: block;
    font-size: 22rpx;
    color: #cccccc;
}
</style>