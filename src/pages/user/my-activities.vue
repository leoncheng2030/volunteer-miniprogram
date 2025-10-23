<template>
    <view class="my-activities-container">

        <!-- 状态筛选标签 -->
        <view class="filter-tabs">
            <view 
                class="tab-item"
                :class="{ active: currentTab === item.value }"
                v-for="item in tabList"
                :key="item.value"
                @click="switchTab(item.value)"
            >
                <text class="tab-text">{{ item.label }}</text>
            </view>
        </view>

        <!-- 监护人提示 -->
        <view v-if="userInfo?.type === 'guardian'" class="guardian-tip">
            <u-icon name="info-circle" color="#ff6b6b" size="28"></u-icon>
            <text class="tip-text">以下是您为小雷锋报名的活动</text>
        </view>

        <!-- 活动列表 -->
        <scroll-view class="activity-list" scroll-y @scrolltolower="loadMore">
            <view v-if="activityList.length > 0" class="activity-items">
                <view 
                    class="activity-card"
                    v-for="activity in activityList"
                    :key="activity.id"
                    @click="viewActivityDetail(activity)"
                >
                    <view class="activity-header">
                        <view class="activity-status" :class="getStatusClass(activity.status)">
                            <text class="status-text">{{ getStatusText(activity.status) }}</text>
                        </view>
                        <text class="activity-time">{{ formatTime(activity.createTime) }}</text>
                    </view>
                    
                    <view class="activity-content">
                        <text class="activity-title">{{ activity.title }}</text>
                        <view class="activity-info">
                            <view class="info-item">
                                <u-icon name="map" color="#757575" size="24"></u-icon>
                                <text class="info-text">{{ activity.location }}</text>
                            </view>
                            <view class="info-item">
                                <u-icon name="calendar" color="#757575" size="24"></u-icon>
                                <text class="info-text">{{ activity.activityDate }}</text>
                            </view>
                            <view class="info-item">
                                <u-icon name="clock" color="#757575" size="24"></u-icon>
                                <text class="info-text">{{ formatTimeOnly(activity.startTime) }} - {{ formatTimeOnly(activity.endTime) }}</text>
                            </view>
                        </view>
                    </view>
                    
                    <view class="activity-footer">
                        <!-- 顶部：服务时长和按钮 -->
                        <view class="footer-top">
                            <view class="service-hours">
                                <text class="hours-label">服务时长：</text>
                                <text class="hours-value">{{ activity.serviceHours }}小时</text>
                            </view>
                            
                            <view class="action-btn" v-if="showActionBtn(activity)" @click.stop="handleAction(activity)">
                                <text class="action-text">{{ getActionText(activity) }}</text>
                            </view>
                        </view>
                        
                        <!-- 底部：报名志愿者列表 -->
                        <view v-if="getSignedVolunteers(activity).length > 0" class="signed-volunteers">
                            <view class="volunteers-label">
                                <u-icon name="account" color="#ff6b6b" size="24"></u-icon>
                                <text class="label-text">报名人员：</text>
                            </view>
                            <view class="volunteers-list">
                                <view 
                                    v-for="(volunteer, index) in getSignedVolunteers(activity)" 
                                    :key="volunteer.userId"
                                    class="volunteer-item"
                                >
                                    <text class="volunteer-name">{{ volunteer.userName }}</text>
                                    <text v-if="index < getSignedVolunteers(activity).length - 1" class="separator">、</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            
            <!-- 加载状态 -->
            <view v-if="loading" class="loading-status">
                <u-loading mode="flower" color="#ff6b6b" size="40"></u-loading>
                <text class="loading-text">加载中...</text>
            </view>
            
            <!-- 空状态 -->
            <view v-else-if="!loading && activityList.length === 0" class="empty-state">
                <image class="empty-icon" src="/static/images/news_null.png" mode="aspectFit"></image>
                <text class="empty-text">暂无{{ getCurrentTabText() }}活动</text>
            </view>
            
            <!-- 没有更多数据 -->
            <view v-if="!loading && activityList.length > 0 && !hasMore" class="no-more">
                <text class="no-more-text">没有更多数据了</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { getUserActivities, cancelSignup } from '@/api/activity'
import type { ActivityItem } from '@/api/activity'
import type { PageResult } from '@/types/common'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 状态标签列表
const tabList = [
    { label: '全部', value: 'all' },
    { label: '报名中', value: 'RECRUITING' },
    { label: '进行中', value: 'ONGOING' },
    { label: '已结束', value: 'ENDED' }
]

// 当前选中的标签
const currentTab = ref('all')

// 活动列表
const activityList = ref<any[]>([])

// 分页参数
const pageParams = ref({
    current: 1,
    size: 10,
    total: 0
})

// 加载状态
const loading = ref(false)
const hasMore = ref(true)

// 切换标签
const switchTab = (tabValue: string) => {
    if (currentTab.value === tabValue) return
    
    currentTab.value = tabValue
    pageParams.value.current = 1
    activityList.value = []
    hasMore.value = true
    loadActivities()
}

// 加载活动列表
const loadActivities = async () => {
    if (loading.value || !hasMore.value) return
    
    loading.value = true
    
    try {
        const params = {
            current: pageParams.value.current,
            size: pageParams.value.size,
            userId: userInfo.value?.id
        }
        
        // 如果不是全部，添加状态筛选
        if (currentTab.value !== 'all') {
            Object.assign(params, { status: currentTab.value })
        }
        
        // 调用真实的API
        const response = await getUserActivities(params)
        
        if (response.records && response.records.length > 0) {
            activityList.value.push(...response.records)
            pageParams.value.total = response.total
            pageParams.value.current++
            
            // 判断是否还有更多数据
            hasMore.value = activityList.value.length < response.total
        } else {
            hasMore.value = false
        }
        
    } catch (error) {
        console.error('获取活动列表失败:', error)
        uni.showToast({
            title: '获取数据失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 加载更多
const loadMore = () => {
    loadActivities()
}

// 查看活动详情
const viewActivityDetail = (activity: any) => {
    uni.navigateTo({
        url: `/pages/activity/detail?id=${activity.id}`
    })
}

// 处理操作按钮点击
const handleAction = (activity: any) => {
    if (activity.status === 'RECRUITING') {
        // 取消报名
        handleCancelSignup(activity)
    } else if (activity.status === 'ENDED') {
        // 查看服务记录
        viewServiceRecord(activity)
    }
}

// 取消报名
const handleCancelSignup = async (activity: any) => {
    const signedVolunteers = getSignedVolunteers(activity)
    
    // 如果是监护人且有多个志愿者，显示选择列表
    if (userInfo.value?.type === 'guardian' && signedVolunteers.length > 1) {
        // 构建志愿者名单
        const itemList = signedVolunteers.map(v => v.userName)
        itemList.push('取消全部')
        
        uni.showActionSheet({
            itemList: itemList,
            success: async (res) => {
                if (res.tapIndex === itemList.length - 1) {
                    // 取消全部
                    confirmCancelAll(activity, signedVolunteers)
                } else {
                    // 取消单个志愿者
                    const volunteer = signedVolunteers[res.tapIndex]
                    confirmCancelSingle(activity, volunteer)
                }
            }
        })
    } else if (signedVolunteers.length === 1) {
        // 只有一个志愿者，直接取消
        const volunteer = signedVolunteers[0]
        confirmCancelSingle(activity, volunteer)
    } else {
        uni.showToast({
            title: '未找到报名记录',
            icon: 'none'
        })
    }
}

// 确认取消单个志愿者报名
const confirmCancelSingle = async (activity: any, volunteer: any) => {
    uni.showModal({
        title: '提示',
        content: `确定要取消 ${volunteer.userName} 的报名吗？`,
        success: async (res) => {
            if (res.confirm) {
                await performCancel(activity, volunteer.userId)
            }
        }
    })
}

// 确认取消全部报名
const confirmCancelAll = async (activity: any, volunteers: any[]) => {
    const names = volunteers.map(v => v.userName).join('、')
    uni.showModal({
        title: '提示',
        content: `确定要取消 ${names} 的报名吗？`,
        success: async (res) => {
            if (res.confirm) {
                // 依次取消每个志愿者的报名
                let successCount = 0
                let failCount = 0
                
                uni.showLoading({ title: '取消中...' })
                
                for (const volunteer of volunteers) {
                    try {
                        await cancelSignup({
                            activityId: activity.id,
                            userId: volunteer.userId
                        })
                        successCount++
                    } catch (error) {
                        console.error(`取消 ${volunteer.userName} 报名失败:`, error)
                        failCount++
                    }
                }
                
                uni.hideLoading()
                
                if (failCount === 0) {
                    uni.showToast({
                        title: '全部取消成功',
                        icon: 'success'
                    })
                } else {
                    uni.showToast({
                        title: `成功${successCount}个，失败${failCount}个`,
                        icon: 'none'
                    })
                }
                
                // 刷新列表
                setTimeout(() => {
                    refreshList()
                }, 1500)
            }
        }
    })
}

// 执行取消报名
const performCancel = async (activity: any, userId: string) => {
    try {
        uni.showLoading({ title: '取消中...' })
        
        await cancelSignup({
            activityId: activity.id,
            userId: userId
        })
        
        uni.hideLoading()
        uni.showToast({
            title: '取消报名成功',
            icon: 'success'
        })
        
        // 刷新列表
        setTimeout(() => {
            refreshList()
        }, 1500)
        
    } catch (error) {
        console.error('取消报名失败:', error)
        uni.hideLoading()
        uni.showToast({
            title: '取消报名失败',
            icon: 'none'
        })
    }
}

// 查看服务记录
const viewServiceRecord = (activity: any) => {
    uni.navigateTo({
        url: `/pages/user/service-record?activityId=${activity.id}`
    })
}

// 刷新列表
const refreshList = () => {
    pageParams.value.current = 1
    activityList.value = []
    hasMore.value = true
    loadActivities()
}

// 获取状态样式类
const getStatusClass = (status: string) => {
    const classMap = {
        'RECRUITING': 'status-recruiting',
        'ONGOING': 'status-ongoing',
        'ENDED': 'status-ended',
        'CANCELLED': 'status-cancelled'
    }
    return classMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status: string) => {
    const textMap = {
        'RECRUITING': '报名中',
        'ONGOING': '进行中',
        'ENDED': '已结束',
        'CANCELLED': '已取消'
    }
    return textMap[status] || '未知'
}

// 格式化时间（只显示时分）
const formatTimeOnly = (timeStr: string) => {
    if (!timeStr) return ''
    
    // 如果包含日期部分，提取时间部分
    if (timeStr.includes(' ')) {
        timeStr = timeStr.split(' ')[1]
    }
    
    // 如果包含秒，去掉秒
    if (timeStr.split(':').length === 3) {
        const parts = timeStr.split(':')
        return `${parts[0]}:${parts[1]}`
    }
    
    return timeStr
}

// 格式化时间
const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const date = new Date(timeStr.replace(/-/g, '/'))
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取当前标签文本
const getCurrentTabText = () => {
    const tab = tabList.find(item => item.value === currentTab.value)
    return tab ? tab.label : ''
}

// 判断是否显示操作按钮
const showActionBtn = (activity: any) => {
    return activity.status === 'RECRUITING' || activity.status === 'ENDED'
}

// 获取操作按钮文本
const getActionText = (activity: any) => {
    if (activity.status === 'RECRUITING') {
        return '取消报名'
    } else if (activity.status === 'ENDED') {
        return '查看记录'
    }
    return ''
}

// 获取报名的志愿者列表
const getSignedVolunteers = (activity: any) => {
    if (!activity.extJson) return []
    
    try {
        const extInfo = typeof activity.extJson === 'string' 
            ? JSON.parse(activity.extJson) 
            : activity.extJson
        return extInfo.signedVolunteers || []
    } catch (error) {
        console.error('解析活动扩展信息失败:', error)
        return []
    }
}

// 模拟获取活动数据
const getMockActivities = async (params: any) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockList = [
        {
            id: '1',
            title: '社区志愿服务活动',
            location: '北京市朝阳区xx社区',
            activityDate: '2024-01-20',
            startTime: '09:00',
            endTime: '12:00',
            serviceHours: 3,
            status: 'RECRUITING',
            createTime: '2024-01-15 10:00:00'
        },
        {
            id: '2',
            title: '环保宣传活动',
            location: '北京市海淀区xx公园',
            activityDate: '2024-01-18',
            startTime: '14:00',
            endTime: '17:00',
            serviceHours: 3,
            status: 'ONGOING',
            createTime: '2024-01-10 09:00:00'
        },
        {
            id: '3',
            title: '敬老院慰问活动',
            location: '北京市西城区xx敬老院',
            activityDate: '2024-01-10',
            startTime: '10:00',
            endTime: '12:00',
            serviceHours: 2,
            status: 'ENDED',
            createTime: '2024-01-05 14:00:00'
        }
    ]
    
    // 根据状态筛选
    let filteredList = mockList
    if (params.status && params.status !== 'all') {
        filteredList = mockList.filter(item => item.status === params.status)
    }
    
    return {
        records: filteredList,
        total: filteredList.length,
        size: params.size,
        current: params.current,
        pages: Math.ceil(filteredList.length / params.size)
    }
}

onMounted(() => {
    loadActivities()
})
</script>

<style scoped lang="scss">
.my-activities-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 监护人提示 */
.guardian-tip {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    background: #fff5f5;
    border-left: 4rpx solid #ff6b6b;
    margin: 20rpx;
    border-radius: 8rpx;
}

.tip-text {
    margin-left: 12rpx;
    font-size: 26rpx;
    color: #666;
}

/* 筛选标签 */
.filter-tabs {
    display: flex;
    background: #ffffff;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    position: relative;
    
    &.active {
        .tab-text {
            color: #ff6b6b;
            font-weight: bold;
        }
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background: #ff6b6b;
            border-radius: 2rpx;
        }
    }
}

.tab-text {
    font-size: 28rpx;
    color: #666666;
    transition: all 0.3s;
}

/* 活动列表 */
.activity-list {
    flex: 1;
    height: calc(100vh - 200rpx);
}

.activity-items {
    padding: 20rpx;
}

.activity-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    
    &:active {
        transform: scale(0.98);
        transition: transform 0.1s;
    }
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.activity-status {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    
    &.status-recruiting {
        background: rgba(76, 175, 80, 0.1);
        
        .status-text {
            color: #4CAF50;
        }
    }
    
    &.status-ongoing {
        background: rgba(33, 150, 243, 0.1);
        
        .status-text {
            color: #2196F3;
        }
    }
    
    &.status-ended {
        background: rgba(158, 158, 158, 0.1);
        
        .status-text {
            color: #9E9E9E;
        }
    }
}

.status-text {
    font-size: 22rpx;
    font-weight: 600;
}

.activity-time {
    font-size: 24rpx;
    color: #999999;
}

.activity-content {
    margin-bottom: 20rpx;
}

.activity-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    line-height: 1.4;
    margin-bottom: 16rpx;
}

.activity-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-text {
    margin-left: 12rpx;
    font-size: 26rpx;
    color: #666666;
}

.activity-footer {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.service-hours {
    display: flex;
    align-items: baseline;
}

.hours-label {
    font-size: 26rpx;
    color: #666666;
}

.hours-value {
    font-size: 28rpx;
    font-weight: bold;
    color: #ff6b6b;
    margin-left: 8rpx;
}

/* 报名志愿者信息 */
.signed-volunteers {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 12rpx 16rpx;
    background: #fff5f5;
    border-radius: 8rpx;
    border-left: 4rpx solid #ff6b6b;
}

.volunteers-label {
    display: flex;
    align-items: center;
    gap: 6rpx;
}

.label-text {
    font-size: 24rpx;
    color: #666;
    font-weight: 600;
}

.volunteers-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding-left: 30rpx;
}

.volunteer-item {
    display: flex;
    align-items: center;
}

.volunteer-name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
}

.separator {
    font-size: 26rpx;
    color: #999;
    margin: 0 4rpx;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12rpx 28rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.25);
    transition: all 0.2s ease;
    min-width: 120rpx;
    
    &:active {
        transform: translateY(1rpx);
        box-shadow: 0 1rpx 4rpx rgba(255, 107, 107, 0.2);
    }
}

.action-text {
    font-size: 24rpx;
    color: #ffffff;
    font-weight: 500;
    white-space: nowrap;
    letter-spacing: 1rpx;
}

/* 加载状态 */
.loading-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
}

.loading-text {
    font-size: 26rpx;
    color: #999999;
    margin-top: 20rpx;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 0;
}

.empty-icon {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

/* 没有更多数据 */
.no-more {
    text-align: center;
    padding: 30rpx 0;
}

.no-more-text {
    font-size: 24rpx;
    color: #cccccc;
}
</style>