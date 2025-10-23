<template>
    <view class="page-container">
        <!-- 自定义导航栏 - 仅在小程序环境下显示 -->
        <!-- #ifndef H5 -->
        <view class="navbar-container">
            <u-navbar title="共建" title-color="#fff" :isBack="false" :borderBottom="false"
                :background="{ backgroundColor: '#' }"></u-navbar>
        </view>
        <!-- #endif -->

        <!-- 内容区域 -->
        <view class="content-area">
            <scroll-view class="scroll-container" scrollY>
                <!-- 轮播图区域 -->
                <view class="card-container">
                    <u-swiper :list="bannerList" @click="onBannerClick" :autoplay="true" :interval="3000"
                        :duration="500" :circular="true" :height="300" :radius="12" :indicatorPos="'bottomRight'"
                        :indicatorActiveColor="'#ffffff'" :indicatorColor="'rgba(255, 255, 255, 0.5)'" :bgColor="'#f8f8f8'"
                        :keyName="'image'" />
                </view>

                <!-- 学习统计 -->
                <view class="stats-card">
                    <view class="section-header">
                        <view class="section-title">
                            <view class="title-decoration"></view>
                            <text class="title-text">学习统计</text>
                        </view>
                    </view>
                    <view class="stats-grid">
                        <view class="stat-item">
                            <text class="stat-number">15</text>
                            <text class="stat-label">学习天数</text>
                        </view>
                        <view class="stat-item">
                            <text class="stat-number">28</text>
                            <text class="stat-label">完成课程</text>
                        </view>
                        <view class="stat-item">
                            <text class="stat-number">3</text>
                            <text class="stat-label">获得证书</text>
                        </view>
                        <view class="stat-item">
                            <text class="stat-number">450</text>
                            <text class="stat-label">学习积分</text>
                        </view>
                    </view>
                </view>

                <!-- 学习资源 -->
                <view class="card-container">
                    <view class="section-header">
                        <view class="section-title">
                            <view class="title-decoration"></view>
                            <text class="title-text">学习资源</text>
                        </view>
                        <view class="view-all" @click="viewAllResources">
                            <text class="view-all-text">查看全部</text>
                        </view>
                    </view>
                    <view class="grid-container grid-4">
                        <view class="resource-item" v-for="(resource, index) in resourceList" :key="index"
                            @click="openResource(resource)">
                            <view class="resource-icon">
                                <u-icon :name="resource.icon" color="#ff6b6b" size="48"></u-icon>
                            </view>
                            <text class="resource-title">{{ resource.title }}</text>
                        </view>
                    </view>
                </view>

                <!-- 学习计划 -->
                <view class="card-container">
                    <view class="section-header">
                        <view class="section-title">
                            <view class="title-decoration"></view>
                            <text class="title-text">学习计划</text>
                        </view>
                        <view class="view-all" @click="viewAllPlans">
                            <text class="view-all-text">查看全部</text>
                        </view>
                    </view>
                    <view class="list-container">
                        <StudyPlanItem 
                            v-for="(plan, index) in planList" 
                            :key="index" 
                            :plan="plan"
                            @click="viewPlanDetail"
                        />
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
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import StudyPlanItem from "@/components/StudyPlanItem/index.vue";
// #ifdef H5
import H5TabBar from "@/components/H5TabBar/index.vue";
// #endif

// 轮播图数据
const bannerList = ref([
    {
        image: '/static/images/bg_hometop.png',
        title: '志愿服务基础培训',
        link: ''
    },
    {
        image: '/static/images/home_bg_coupon.png',
        title: '专业技能提升课程',
        link: ''
    }
])

// 学习资源数据
const resourceList = ref([
    {
        id: 1,
        title: '视频教程',
        icon: 'play-circle'
    },
    {
        id: 2,
        title: '文档资料',
        icon: 'file-text'
    },
    {
        id: 3,
        title: '在线直播',
        icon: 'camera'
    },
    {
        id: 4,
        title: '练习题库',
        icon: 'edit-pen'
    },
    {
        id: 5,
        title: '案例分析',
        icon: 'list'
    },
    {
        id: 6,
        title: '经验分享',
        icon: 'share'
    },
    {
        id: 7,
        title: '政策法规',
        icon: 'bookmark'
    },
    {
        id: 8,
        title: '心理疏导',
        icon: 'heart'
    }
])

// 学习计划数据
const planList = ref([
    {
        id: 1,
        title: '志愿服务基础入门',
        description: '学习志愿服务的基本概念和规范',
        progress: 75
    },
    {
        id: 2,
        title: '应急救护技能培训',
        description: '掌握基本的急救知识和技能',
        progress: 45
    },
    {
        id: 3,
        title: '青少年心理辅导',
        description: '学习青少年心理特点和辅导技巧',
        progress: 20
    }
])

// 轮播图点击事件
const onBannerClick = (index: number) => {
    uni.showToast({
        title: '查看培训详情',
        icon: 'none'
    })
}

// 打开学习资源
const openResource = (resource: any) => {
    uni.showToast({
        title: `打开${resource.title}`,
        icon: 'none'
    })
}

// 查看全部资源
const viewAllResources = () => {
    uni.showToast({
        title: '查看全部资源',
        icon: 'none'
    })
}

// 查看计划详情
const viewPlanDetail = (plan: any) => {
    uni.showToast({
        title: `查看${plan.title}`,
        icon: 'none'
    })
}

// 查看全部计划
const viewAllPlans = () => {
    uni.showToast({
        title: '查看全部计划',
        icon: 'none'
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
    // 页面加载时的初始化逻辑
    console.log('共建页面已加载')
})
</script>

<style scoped lang="scss">
.youpei-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 轮播图区域 */
.banner-section {
    padding: 20rpx;
}

/* 培训分类 */
.category-section {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
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

.category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30rpx;
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 10rpx;
    border-radius: 12rpx;
    transition: all 0.3s ease;
    
    &:active {
        background-color: #f8f8f8;
        transform: scale(0.95);
    }
}

.category-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
}

.category-name {
    font-size: 26rpx;
    color: #333333;
    font-weight: 500;
    margin-bottom: 8rpx;
    text-align: center;
}

.category-count {
    font-size: 22rpx;
    color: #999999;
    text-align: center;
}

/* 课程区域 */
.course-section {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
}

.view-all {
    display: flex;
    align-items: center;
    color: #ff6b6b;
}

.view-all-text {
    font-size: 28rpx;
    margin-right: 8rpx;
}

.course-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.course-card {
    display: flex;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx;
    transition: all 0.3s ease;
    
    &:active {
        background: #f0f0f0;
        transform: scale(0.98);
    }
}

.course-image {
    position: relative;
    width: 200rpx;
    height: 140rpx;
    border-radius: 8rpx;
    overflow: hidden;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.cover-image {
    width: 100%;
    height: 100%;
}

.course-duration {
    position: absolute;
    bottom: 8rpx;
    right: 8rpx;
    background: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    font-size: 20rpx;
    padding: 4rpx 8rpx;
    border-radius: 4rpx;
}

.course-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.course-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    line-height: 1.4;
    margin-bottom: 12rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.course-info {
    display: flex;
    gap: 20rpx;
    margin-bottom: 12rpx;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-text {
    color: #999999;
    font-size: 22rpx;
    margin-left: 6rpx;
}

.course-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.course-level {
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    
    &.level-basic {
        background: #E8F5E8;
        color: #4CAF50;
    }
    
    &.level-intermediate {
        background: #FFF3E0;
        color: #FF9800;
    }
    
    &.level-advanced {
        background: #F3E5F5;
        color: #9C27B0;
    }
}

.level-text {
    font-size: 20rpx;
    font-weight: 500;
}

.course-rating {
    display: flex;
    align-items: center;
}

.rating-text {
    color: #666666;
    font-size: 22rpx;
    margin-left: 6rpx;
}

/* 学习统计 */
.stats-section {
    background: #ffffff;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
}

.stat-item {
    text-align: center;
    padding: 20rpx 10rpx;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 142, 83, 0.05) 100%);
    border-radius: 12rpx;
    border: 1rpx solid rgba(255, 107, 107, 0.1);
}

.stat-number {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #ff6b6b;
    margin-bottom: 8rpx;
}

.stat-label {
    display: block;
    font-size: 22rpx;
    color: #666666;
}
</style>
