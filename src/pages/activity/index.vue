<template>
    <view class="activity-list">
        <!-- 筛选标签 -->
        <view class="filter-tabs">
            <view 
                class="tab-item" 
                :class="{ active: currentStatus === status.value }"
                v-for="status in statusTabs" 
                :key="status.value"
                @click="changeStatus(status.value)"
            >
                <text class="tab-text">{{ status.label }}</text>
            </view>
        </view>

        <!-- 活动列表 -->
        <view class="activity-container">
            <!-- 加载状态 -->
            <view v-if="loading" class="loading-container">
                <u-loading mode="flower" size="40"></u-loading>
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 活动卡片列表 -->
            <view v-else-if="activityList.length > 0" class="activity-items">
                <view 
                    class="activity-card" 
                    v-for="activity in activityList" 
                    :key="activity.id"
                    @click="goToDetail(activity.id)"
                >
                    <!-- 活动图片 -->
                    <view class="card-image">
                        <image :src="activity.coverImage || '/static/images/bg_hometop.png'" mode="aspectFill" class="cover-image"></image>
                        <view class="status-badge" :class="getStatusClass(activity.status)">
                            <text class="status-text">{{ formatStatus(activity.status) }}</text>
                        </view>
                    </view>

                    <!-- 活动信息 -->
                    <view class="card-content">
                        <view class="activity-title">{{ activity.title }}</view>
                        
                        <view class="activity-info">
                            <view class="info-item">
                                <u-icon name="calendar" color="#999" size="20"></u-icon>
                                <text class="info-text">{{ formatDate(activity.activityDate) }}</text>
                            </view>
                            <view class="info-item">
                                <u-icon name="clock" color="#999" size="20"></u-icon>
                                <text class="info-text">{{ formatTimeRange(activity.startTime, activity.endTime) }}</text>
                            </view>
                            <view class="info-item">
                                <u-icon name="map-pin" color="#999" size="20"></u-icon>
                                <text class="info-text">{{ activity.location }}</text>
                            </view>
                        </view>

                        <!-- 报名进度 -->
                        <view class="signup-progress">
                            <view class="progress-info">
                                <text class="progress-text">已报名 {{ activity.signedCount }}/{{ activity.recruitCount }}人</text>
                                <text class="progress-percent">{{ activity.signupProgress }}%</text>
                            </view>
                            <view class="progress-bar">
                                <view class="progress-fill" :style="{ width: activity.signupProgress + '%' }"></view>
                            </view>
                        </view>

                        <!-- 活动标签 -->
                        <view class="activity-tags">
                            <text class="tag service-hours">{{ activity.serviceHours }}小时</text>
                            <text class="tag deadline">{{ formatDate(activity.signupDeadline) }}截止</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-else class="empty-container">
                <u-empty 
                    mode="data" 
                    icon="http://cdn.uviewui.com/uview/empty/data.png"
                    text="暂无活动数据"
                ></u-empty>
            </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="!loading && activityList.length > 0 && hasMore" class="load-more">
            <u-loadmore 
                :status="loadMoreStatus" 
                @loadmore="loadMore"
                margin-top="20"
                margin-bottom="20"
            ></u-loadmore>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getActivityPage, getHotActivities, getLatestActivities, type ActivityItem } from '@/api/activity'

// 响应式数据
const loading = ref(false)
const activityList = ref<ActivityItem[]>([])
const currentStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(true)

// 状态标签
const statusTabs = [
    { label: '全部', value: '' },
    { label: '报名中', value: 'RECRUITING' },
    { label: '进行中', value: 'ONGOING' },
    { label: '已结束', value: 'ENDED' }
]

// 加载更多状态
const loadMoreStatus = computed(() => {
    if (loading.value) return 'loading'
    if (!hasMore.value) return 'nomore'
    return 'loadmore'
})

// 获取活动列表
const loadActivities = async (reset = false) => {
    if (loading.value) return
    
    loading.value = true
    
    try {
        const params = {
            current: reset ? 1 : currentPage.value,
            size: pageSize.value,
            status: currentStatus.value || undefined
        }
        
        const result = await getActivityPage(params)
        
        if (reset) {
            activityList.value = result.records
            currentPage.value = 1
        } else {
            activityList.value = [...activityList.value, ...result.records]
        }
        
        total.value = result.total
        currentPage.value++
        hasMore.value = activityList.value.length < result.total
        
        // 格式化数据
        formatActivityList()
        
    } catch (error) {
        console.error('获取活动列表失败:', error)
        uni.$u.toast('获取活动列表失败')
    } finally {
        loading.value = false
        if (reset) {
            uni.stopPullDownRefresh()
        }
    }
}

// 格式化活动列表
const formatActivityList = () => {
    activityList.value.forEach(activity => {
        // 计算报名进度
        if (activity.recruitCount > 0) {
            activity.signupProgress = Math.round((activity.signedCount / activity.recruitCount) * 100)
        } else {
            activity.signupProgress = 0
        }
        
        // 计算剩余名额
        activity.remainingCount = Math.max(0, activity.recruitCount - activity.signedCount)
        
        // 判断是否满员
        activity.isFull = activity.signedCount >= activity.recruitCount
        
        // 确保进度不超过100%
        if (activity.signupProgress > 100) {
            activity.signupProgress = 100
        }
    })
}


// 切换状态
const changeStatus = (status: string) => {
    currentStatus.value = status
    loadActivities(true)
}

// 跳转到详情页
const goToDetail = (id: string) => {
    uni.navigateTo({
        url: `/pages/activity/detail?id=${id}`
    })
}

// 格式化状态样式
const getStatusClass = (status: string) => {
    switch (status) {
        case 'RECRUITING':
            return 'status-upcoming'
        case 'ONGOING':
            return 'status-ongoing'
        case 'ENDED':
            return 'status-completed'
        case 'CANCELLED':
            return 'status-cancelled'
        default:
            return 'status-default'
    }
}

// 格式化状态文本
const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        'DRAFT': '草稿',
        'RECRUITING': '报名中',
        'ONGOING': '进行中',
        'ENDED': '已结束',
        'CANCELLED': '已取消'
    }
    return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return `${date.getMonth() + 1}/${date.getDate()}`
}

// 格式化时间
const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    // 提取时间部分，格式为 "HH:mm"
    const timePart = timeStr.split(' ')[1] || timeStr
    return timePart.substring(0, 5)
}

// 格式化时间范围
const formatTimeRange = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return ''
    
    // 提取时间部分
    const startPart = startTime.split(' ')[1] || startTime
    const endPart = endTime.split(' ')[1] || endTime
    
    // 截取前5位
    const start = startPart.substring(0, 5)
    const end = endPart.substring(0, 5)
    
    return `${start} - ${end}`
}

// 加载更多
const loadMore = () => {
    if (hasMore.value && !loading.value) {
        loadActivities(false)
    }
}

// 页面加载
onMounted(() => {
    loadActivities(true)
})

// 下拉刷新
onPullDownRefresh(() => {
    loadActivities(true)
})

// 触底加载更多
onReachBottom(() => {
    loadMore()
})
</script>

<style lang="scss" scoped>
.activity-list {
    background-color: #f5f5f5;
    min-height: 100vh;
}

/* 搜索栏 */
.search-bar {
    padding: 20rpx 32rpx;
    background-color: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 100;
}

/* 筛选标签 */
.filter-tabs {
    display: flex;
    background-color: #FFFFFF;
    padding: 0 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    position: sticky;
    top: 0; /* 紧贴导航栏 */
    z-index: 99;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    position: relative;
    
    &.active {
        .tab-text {
            color: #FF6B6B;
            font-weight: 600;
        }
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background: linear-gradient(135deg, #FF6B6B, #FF8E53);
            border-radius: 2rpx;
        }
    }
}

.tab-text {
    font-size: 28rpx;
    color: #666666;
    transition: all 0.3s ease;
}

/* 活动容器 */
.activity-container {
    padding: 16rpx;
}

/* 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 0;
}

.loading-text {
    color: #999999;
    font-size: 28rpx;
    margin-top: 20rpx;
}

/* 活动卡片列表 */
.activity-items {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.activity-card {
    background-color: #FFFFFF;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
    
    &:active {
        transform: scale(0.98);
    }
}

/* 卡片图片 */
.card-image {
    position: relative;
    height: 300rpx;
}

.cover-image {
    width: 100%;
    height: 100%;
}

.status-badge {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    
    &.status-upcoming {
        background-color: rgba(33, 150, 243, 0.9);
    }
    
    &.status-ongoing {
        background-color: rgba(76, 175, 80, 0.9);
    }
    
    &.status-completed {
        background-color: rgba(158, 158, 158, 0.9);
    }
    
    &.status-cancelled {
        background-color: rgba(244, 67, 54, 0.9);
    }
}

.status-text {
    color: #FFFFFF;
    font-size: 20rpx;
    font-weight: 600;
}

/* 卡片内容 */
.card-content {
    padding: 24rpx;
}

.activity-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #212121;
    line-height: 1.4;
    margin-bottom: 16rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.activity-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-text {
    color: #999999;
    font-size: 24rpx;
    margin-left: 8rpx;
}

/* 报名进度 */
.signup-progress {
    margin-bottom: 16rpx;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
}

.progress-text {
    color: #666666;
    font-size: 24rpx;
}

.progress-percent {
    color: #FF6B6B;
    font-size: 24rpx;
    font-weight: 600;
}

.progress-bar {
    height: 8rpx;
    background-color: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    border-radius: 4rpx;
    transition: width 0.3s ease;
}

/* 活动标签 */
.activity-tags {
    display: flex;
    gap: 12rpx;
}

.tag {
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
    
    &.service-hours {
        background-color: rgba(255, 107, 107, 0.1);
        color: #FF6B6B;
    }
    
    &.deadline {
        background-color: rgba(255, 142, 83, 0.1);
        color: #FF8E53;
    }
}

/* 空状态 */
.empty-container {
    padding: 120rpx 0;
}

/* 加载更多 */
.load-more {
    padding: 20rpx 0;
}
</style>