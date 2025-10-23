<template>
    <view class="page-container">
        <!-- 自定义导航栏 - 仅在小程序环境下显示 -->
        <!-- #ifndef H5 -->
        <view class="navbar-container">
            <u-navbar title="我的" title-color="#fff" :isBack="false" :borderBottom="false"
                :background="{ backgroundColor: '#' }"></u-navbar>
        </view>
        <!-- #endif -->

        <!-- 内容区域 -->
        <view class="content-area">
            <scroll-view class="scroll-container" scrollY>
                <!-- 用户信息卡片 -->
                <view class="card-container user-info-card">
                    <view class="user-info-section">
                        <view class="user-avatar">
                            <image :src="userInfo?.avatar || defaultAvatar" mode="aspectFill"></image>
                        </view>
                        <view class="user-details">
                            <text class="user-name">{{ userInfo?.name || '未登录' }}</text>
                            <text class="user-id">ID: {{ userInfo?.id || '------' }}</text>
                        </view>
                        <view class="user-actions">
                            <view class="action-btn edit-btn" @click="editProfile">
                                <u-icon name="edit" color="#fff" size="28"></u-icon>
                            </view>
                        </view>
                    </view>

                    <!-- 用户统计 -->
                    <view class="stats-grid">
                        <view class="stat-item">
                            <text class="stat-number">{{ userStats.totalActivities || 0 }}</text>
                            <text class="stat-label">参与活动</text>
                        </view>
                        <view class="stat-item">
                            <text class="stat-number">{{ userStats.totalHours || 0 }}</text>
                            <text class="stat-label">服务时长</text>
                        </view>
                        <view class="stat-item">
                            <text class="stat-number">{{ userStats.totalCredits || 0 }}</text>
                            <text class="stat-label">获得积分</text>
                        </view>
                    </view>
                </view>

                <!-- 功能菜单 -->
                <view class="card-container">
                    <view class="list-container">
                        <view class="list-item menu-item" @click="navigateTo('/pages/user/profile')">
                            <view class="menu-icon">
                                <u-icon name="account" color="#ff6b6b" size="32"></u-icon>
                            </view>
                            <text class="menu-text">个人资料</text>
                            <u-icon name="arrow-right" color="#ccc" size="24" class="menu-arrow"></u-icon>
                        </view>
                        <view class="list-item menu-item" @click="navigateTo('/pages/user/my-activities')">
                            <view class="menu-icon">
                                <u-icon name="calendar" color="#ff6b6b" size="32"></u-icon>
                            </view>
                            <text class="menu-text">我的活动</text>
                            <u-icon name="arrow-right" color="#ccc" size="24" class="menu-arrow"></u-icon>
                        </view>
                        <view class="list-item menu-item" @click="navigateTo('/pages/user/service-record')">
                            <view class="menu-icon">
                                <u-icon name="clock" color="#ff6b6b" size="32"></u-icon>
                            </view>
                            <text class="menu-text">服务记录</text>
                            <u-icon name="arrow-right" color="#ccc" size="24" class="menu-arrow"></u-icon>
                        </view>
                        <view class="list-item menu-item" @click="navigateTo('/pages/user/volunteer-list')">
                            <view class="menu-icon">
                                <u-icon name="heart" color="#ff6b6b" size="32"></u-icon>
                            </view>
                            <text class="menu-text">志愿者管理</text>
                            <u-icon name="arrow-right" color="#ccc" size="24" class="menu-arrow"></u-icon>
                        </view>
                        <view class="list-item menu-item" @click="navigateTo('/pages/user/feedback')">
                            <view class="menu-icon">
                                <u-icon name="chat-fill" color="#ff6b6b" size="32"></u-icon>
                            </view>
                            <text class="menu-text">意见反馈</text>
                            <u-icon name="arrow-right" color="#ccc" size="24" class="menu-arrow"></u-icon>
                        </view>
                        <view class="list-item menu-item" @click="navigateTo('/pages/user/about')">
                            <view class="menu-icon">
                                <u-icon name="info-circle" color="#ff6b6b" size="32"></u-icon>
                            </view>
                            <text class="menu-text">关于我们</text>
                            <u-icon name="arrow-right" color="#ccc" size="24" class="menu-arrow"></u-icon>
                        </view>
                    </view>
                </view>

                <!-- 退出登录按钮 -->
                <view class="card-container">
                    <view class="btn-secondary logout-btn" @click="logout">
                        <text class="logout-text">退出登录</text>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
    
    <!-- H5专用TabBar -->
    <!-- #ifdef H5 -->
    <H5TabBar />
    <!-- #endif -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { get } from '@/api/request'
import { authApi } from '@/api/auth'
import { getVolunteerList, getUserStats, type UserStats } from '@/api/user'
// #ifdef H5
import H5TabBar from "@/components/H5TabBar/index.vue";
// #endif

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const logoutLoading = ref(false)

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png'

// 用户统计数据
const userStats = ref<UserStats>({
    totalHours: 0,
    totalActivities: 0,
    totalCredits: 0
})

// 待处理数量
const pendingCount = ref(3)

// 小雷锋数量
const volunteerCount = ref(0)

// 获取用户角色文本
const getUserRoleText = () => {
    // 根据后台实际返回的字段判断用户类型
    // 可能的字段：type, userType, role 等
    // 先使用一个通用的显示，等看到实际返回数据后再调整
    return userInfo.value?.type === 'guardian' ? '监护人' : '志愿者'
}

// 获取用户数据
const fetchUserData = async () => {
    try {
        const userResponse = await get(authApi.getLoginUser)
        if (userResponse) {
            userStore.setUserInfo(userResponse)
            console.log('用户数据已更新:', userResponse)
            
            // 获取用户统计数据
            await fetchUserStats(userResponse.id)
            
            // 如果是监护人，获取小雷锋数量
            if (userResponse.type === 'guardian') {
                await fetchVolunteerCount()
            }
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
        // 静默处理错误，不影响用户体验
    }
}

// 获取用户统计数据
const fetchUserStats = async (userId: string) => {
    try {
        const stats = await getUserStats(userId)
        userStats.value = stats
        console.log('用户统计数据已更新:', stats)
    } catch (error) {
        console.error('获取用户统计数据失败:', error)
        // 使用默认值
        userStats.value = {
            totalActivities: 0,
            totalHours: 0,
            totalCredits: 0
        }
    }
}

// 获取小雷锋数量
const fetchVolunteerCount = async () => {
    try {
        const volunteerList = await getVolunteerList()
        if (volunteerList && Array.isArray(volunteerList)) {
            volunteerCount.value = volunteerList.length
        }
    } catch (error) {
        console.error('获取小雷锋数量失败:', error)
        volunteerCount.value = 0
    }
}

// 退出登录
const handleLogout = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                logoutLoading.value = true
                
                // 模拟退出登录
                setTimeout(() => {
                    userStore.logout()
                    uni.reLaunch({
                        url: '/pages/login/login'
                    })
                    logoutLoading.value = false
                }, 1000)
            }
        }
    })
}

// 页面跳转方法
const navigateTo = (url: string) => {
    uni.navigateTo({
        url: url
    })
}

const editProfile = () => {
    uni.navigateTo({
        url: '/pages/user/profile'
    })
}

const logout = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                userStore.logout()
                uni.reLaunch({
                    url: '/pages/login/login'
                })
            }
        }
    })
}

// #ifdef H5
onLoad(() => {
    setTimeout(() => {
        uni.hideTabBar().catch(err => {
            console.log('隐藏TabBar失败:', err);
        });
    }, 100);
})
// #endif

onMounted(() => {

    // 页面加载时获取用户数据
    fetchUserData()
    
    // 监听页面显示
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
        currentPage.onShow = () => {
            console.log('用户页面显示，开始获取用户数据')
            fetchUserData()
        }
    }
    
    // 设置下拉刷新功能
    setupPullDownRefresh()
})

// 添加下拉刷新功能
const setupPullDownRefresh = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
        currentPage.onPullDownRefresh = () => {
            console.log('下拉刷新，开始获取用户数据')
            fetchUserData().finally(() => {
                uni.stopPullDownRefresh()
            })
        }
    }
}
</script>


<style scoped lang="scss">
.screen-full {
    padding: 20rpx;
    padding-top: 0;
    height: 100vh;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}
/* 布局类 */
.flex-col {
    display: flex;
    flex-direction: column;
}

/* 用户信息头部 */
.user-header {
    position: relative;
    padding: 40rpx 30rpx 60rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    overflow: hidden;
}

.user-bg {
    position: absolute;
    top: -50%;
    right: -20%;
    width: 80%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
}

.user-info {
    position: relative;
    z-index: 1;
}

.avatar-section {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
}

.user-details {
    margin-left: 30rpx;
    flex: 1;
}

.username {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
}

.user-role {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.2);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    display: inline-block;
}

/* 用户统计区域 */
.stats-grid {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    margin-top: 30rpx;
    backdrop-filter: blur(10rpx);
}

.stats-grid .stat-item {
    flex: 1;
    text-align: center;
    position: relative;
    
    &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2rpx;
        height: 40rpx;
        background: rgba(255, 255, 255, 0.3);
    }
}

.stats-grid .stat-number {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
}

.stats-grid .stat-label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

.user-stats {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 30rpx;
    backdrop-filter: blur(10rpx);
}

.stat-item {
    flex: 1;
    text-align: center;
    position: relative;
    
    &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2rpx;
        height: 40rpx;
        background: rgba(255, 255, 255, 0.3);
    }
}

.stat-number {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
}

.stat-label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
}

/* 删除不再需要的 stat-divider */
.stat-divider {
    display: none;
}

/* 功能菜单 */
.menu-section {
    padding: 10rpx;
}

.menu-group {
    background: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.menu-title {
    display: flex;
    align-items: center;
    padding: 30rpx 30rpx 20rpx;
}

.title-decoration {
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

.menu-list {
    padding: 0 30rpx 20rpx;
}

.menu-item {
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

.menu-text {
    flex: 1;
    margin-left: 20rpx;
    font-size: 30rpx;
    color: #333333;
}

.menu-badge {
    background: #ff6b6b;
    color: #ffffff;
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    margin-right: 20rpx;
}

/* 退出登录 */
.logout-section {
    padding: 30rpx;
    padding-bottom: 60rpx;
}

.logout-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
}
</style>
