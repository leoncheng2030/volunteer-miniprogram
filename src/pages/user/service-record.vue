<template>
    <view class="service-record-container">
        <!-- 统计卡片 -->
        <view class="stats-section">
            <view class="stats-card">
                <view class="stats-item">
                    <text class="stats-number">{{ totalStats.totalHours }}</text>
                    <text class="stats-label">总服务时长(小时)</text>
                </view>
                <view class="stats-divider"></view>
                <view class="stats-item">
                    <text class="stats-number">{{ totalStats.totalActivities }}</text>
                    <text class="stats-label">参与活动数</text>
                </view>
                <view class="stats-divider"></view>
                <view class="stats-item">
                    <text class="stats-number">{{ totalStats.totalCredits }}</text>
                    <text class="stats-label">获得积分</text>
                </view>
            </view>
        </view>

        <!-- 时间筛选 -->
        <view class="filter-section">
            <view class="filter-tabs">
                <view 
                    class="tab-item"
                    :class="{ active: timeFilter === item.value }"
                    v-for="item in timeFilters"
                    :key="item.value"
                    @click="switchTimeFilter(item.value)"
                >
                    <text class="tab-text">{{ item.label }}</text>
                </view>
            </view>
        </view>

        <!-- 服务记录列表 -->
        <scroll-view class="record-list" scroll-y @scrolltolower="loadMore">
            <view v-if="recordList.length > 0" class="record-items">
                <!-- 按月份分组 -->
                <view class="month-group" v-for="group in groupedRecords" :key="group.month">
                    <view class="month-header">
                        <text class="month-text">{{ group.month }}</text>
                        <text class="month-count">共{{ group.records.length }}条记录</text>
                    </view>
                    
                    <view 
                        class="record-card"
                        v-for="record in group.records"
                        :key="record.id"
                        @click="viewRecordDetail(record)"
                    >
                        <view class="record-header">
                            <view class="activity-info">
                                <text class="activity-title">{{ record.activityTitle }}</text>
                                <view class="record-status" :class="getStatusClass(record.status)">
                                    <text class="status-text">{{ getStatusText(record.status) }}</text>
                                </view>
                            </view>
                            <text class="record-date">{{ formatRecordDate(record.serviceDate) }}</text>
                        </view>
                        
                        <view class="record-content">
                            <view class="info-row">
                                <view class="info-item">
                                    <u-icon name="map" color="#757575" size="24"></u-icon>
                                    <text class="info-text">{{ record.location }}</text>
                                </view>
                                <view class="info-item">
                                    <u-icon name="clock" color="#757575" size="24"></u-icon>
                                    <text class="info-text">{{ record.serviceTime }}</text>
                                </view>
                            </view>
                            
                            <!-- 签到签退信息 -->
                            <view class="checkin-checkout-info">
                                <view class="time-item">
                                    <view class="time-label">
                                        <u-icon name="play-circle" color="#52c41a" size="20"></u-icon>
                                        <text class="label-text">签到</text>
                                    </view>
                                    <text class="time-value">{{ formatTime(record.checkinTime) }}</text>
                                </view>
                                <view class="time-divider"></view>
                                <view class="time-item">
                                    <view class="time-label">
                                        <u-icon name="checkmark-circle" color="#1890ff" size="20"></u-icon>
                                        <text class="label-text">签退</text>
                                    </view>
                                    <text class="time-value">{{ formatTime(record.checkoutTime) }}</text>
                                </view>
                            </view>
                            
                            <view class="service-info">
                                <view class="service-hours">
                                    <text class="hours-label">服务时长：</text>
                                    <text class="hours-value">{{ record.actualHours || record.serviceHours }}小时</text>
                                    <!-- 签退类型标签 -->
                                    <view class="checkout-badge" :class="record.checkoutType === 'AUTO' ? 'badge-auto' : 'badge-manual'">
                                        <text class="badge-text">{{ record.checkoutType === 'AUTO' ? '自动签退' : '手动签退' }}</text>
                                    </view>
                                    <!-- 提前离开标签 -->
                                    <view v-if="record.isEarlyLeave" class="early-leave-badge">
                                        <u-icon name="info-circle" color="#ff8e53" size="16"></u-icon>
                                        <text class="badge-text">提前离开</text>
                                    </view>
                                </view>
                                <view class="credits-info">
                                    <text class="credits-label">获得积分：</text>
                                    <text class="credits-value">+{{ record.credits }}</text>
                                </view>
                            </view>
                            
                            <view class="record-description" v-if="record.description">
                                <text class="description-text">{{ record.description }}</text>
                            </view>
                        </view>
                        
                        <view class="record-footer">
                            <view class="verify-info" v-if="record.verifyStatus">
                                <u-icon :name="getVerifyIcon(record.verifyStatus)" :color="getVerifyColor(record.verifyStatus)" size="20"></u-icon>
                                <text class="verify-text" :style="{ color: getVerifyColor(record.verifyStatus) }">
                                    {{ getVerifyText(record.verifyStatus) }}
                                </text>
                            </view>
                            <view class="action-btn" @click.stop="downloadCertificate(record)" v-if="record.canDownload">
                                <u-icon name="download" color="#ff6b6b" size="20"></u-icon>
                                <text class="action-text">下载证书</text>
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
            <view v-else-if="!loading && recordList.length === 0" class="empty-state">
                <image class="empty-icon" src="/static/images/news_null.png" mode="aspectFit"></image>
                <text class="empty-text">暂无服务记录</text>
                <text class="empty-desc">参与志愿活动后将显示服务记录</text>
            </view>
            
            <!-- 没有更多数据 -->
            <view v-if="!loading && recordList.length > 0 && !hasMore" class="no-more">
                <text class="no-more-text">没有更多数据了</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { getServiceRecordPage, getServiceRecordStats, downloadServiceCertificate } from '@/api/service-record'
import type { ServiceRecordItem, ServiceRecordStats } from '@/api/service-record'
import type { PageResult } from '@/types/common'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 时间筛选选项
const timeFilters = [
    { label: '全部', value: 'all' },
    { label: '本月', value: 'month' },
    { label: '近三月', value: 'quarter' },
    { label: '本年', value: 'year' }
]

// 当前时间筛选
const timeFilter = ref('all')

// 服务记录列表
const recordList = ref<any[]>([])

// 分页参数
const pageParams = ref({
    current: 1,
    size: 10,
    total: 0
})

// 加载状态
const loading = ref(false)
const hasMore = ref(true)

// 总统计数据
const totalStats = ref({
    totalHours: 0,
    totalActivities: 0,
    totalCredits: 0
})

// 按月份分组的记录
const groupedRecords = computed(() => {
    const groups: Record<string, any[]> = {}
    
    recordList.value.forEach(record => {
        const month = formatMonth(record.serviceDate)
        if (!groups[month]) {
            groups[month] = []
        }
        groups[month].push(record)
    })
    
    return Object.keys(groups).map(month => ({
        month,
        records: groups[month].sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    })).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
})

// 切换时间筛选
const switchTimeFilter = (filter: string) => {
    if (timeFilter.value === filter) return
    
    timeFilter.value = filter
    pageParams.value.current = 1
    recordList.value = []
    hasMore.value = true
    loadServiceRecords()
    loadStatsData()
}

// 加载服务记录
const loadServiceRecords = async () => {
    if (loading.value || !hasMore.value) return
    
    loading.value = true
    
    try {
        const params = {
            current: pageParams.value.current,
            size: pageParams.value.size,
            userId: userInfo.value?.id
        }
        
        // 根据时间筛选添加参数
        if (timeFilter.value !== 'all') {
            Object.assign(params, getTimeRangeParams(timeFilter.value))
        }
        
        // 调用真实的API
        const response = await getServiceRecordPage(params)
        
        if (response.records && response.records.length > 0) {
            recordList.value.push(...response.records)
            pageParams.value.total = response.total
            pageParams.value.current++
            
            // 判断是否还有更多数据
            hasMore.value = recordList.value.length < response.total
            
            // 更新统计数据
            updateLocalStats()
        } else {
            hasMore.value = false
        }
        
    } catch (error) {
        console.error('获取服务记录失败:', error)
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
    loadServiceRecords()
}

// 查看记录详情
const viewRecordDetail = (record: any) => {
    uni.navigateTo({
        url: `/pages/user/record-detail?id=${record.id}`
    })
}

// 下载证书
const downloadCertificate = async (record: any) => {
    try {
        uni.showLoading({
            title: '生成证书中...'
        })
        
        const result = await downloadServiceCertificate({
            recordId: record.id,
            userId: userInfo.value?.id
        })
        
        uni.hideLoading()
        
        if (result) {
            // 如果返回的是下载链接，可以打开下载
            if (result.startsWith('http')) {
                // 在小程序中可以预览或下载文件
                uni.downloadFile({
                    url: result,
                    success: (res) => {
                        if (res.statusCode === 200) {
                            uni.openDocument({
                                filePath: res.tempFilePath,
                                showMenu: true,
                                success: () => {
                                    uni.showToast({
                                        title: '证书下载成功',
                                        icon: 'success'
                                    })
                                },
                                fail: () => {
                                    uni.showToast({
                                        title: '打开证书失败',
                                        icon: 'none'
                                    })
                                }
                            })
                        }
                    },
                    fail: () => {
                        uni.showToast({
                            title: '下载失败',
                            icon: 'none'
                        })
                    }
                })
            } else {
                uni.showToast({
                    title: '证书生成成功',
                    icon: 'success'
                })
            }
        }
        
    } catch (error) {
        console.error('下载证书失败:', error)
        uni.hideLoading()
        uni.showToast({
            title: '下载证书失败',
            icon: 'none'
        })
    }
}

// 加载统计数据
const loadStatsData = async () => {
    try {
        const params = {
            userId: userInfo.value?.id
        }
        
        // 根据时间筛选添加参数
        if (timeFilter.value !== 'all') {
            Object.assign(params, getTimeRangeParams(timeFilter.value))
        }
        
        const stats = await getServiceRecordStats(params)
        totalStats.value = stats
        
    } catch (error) {
        console.error('获取统计数据失败:', error)
        // 如果获取统计数据失败，使用本地计算的数据
        updateLocalStats()
    }
}

// 更新本地统计数据（备用方案）
const updateLocalStats = () => {
    totalStats.value = {
        totalHours: recordList.value.reduce((sum, record) => sum + record.serviceHours, 0),
        totalActivities: new Set(recordList.value.map(record => record.activityId)).size,
        totalCredits: recordList.value.reduce((sum, record) => sum + record.credits, 0)
    }
}

// 获取时间范围参数
const getTimeRangeParams = (filter: string) => {
    const now = new Date()
    let startDate: Date
    
    switch (filter) {
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
        case 'quarter':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
            break
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        default:
            return {}
    }
    
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
    }
}

// 获取状态样式类
const getStatusClass = (status: string) => {
    const classMap = {
        'COMPLETED': 'status-completed',
        'PENDING': 'status-pending',
        'CANCELLED': 'status-cancelled'
    }
    return classMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status: string) => {
    const textMap = {
        'COMPLETED': '已完成',
        'PENDING': '待确认',
        'CANCELLED': '已取消'
    }
    return textMap[status] || '未知'
}

// 获取验证状态图标
const getVerifyIcon = (status: string) => {
    const iconMap = {
        'VERIFIED': 'check-circle',
        'PENDING': 'clock',
        'REJECTED': 'close-circle'
    }
    return iconMap[status] || 'clock'
}

// 获取验证状态颜色
const getVerifyColor = (status: string) => {
    const colorMap = {
        'VERIFIED': '#52c41a',
        'PENDING': '#ff8e53',
        'REJECTED': '#ff4d4f'
    }
    return colorMap[status] || '#ff8e53'
}

// 获取验证状态文本
const getVerifyText = (status: string) => {
    const textMap = {
        'VERIFIED': '已验证',
        'PENDING': '待验证',
        'REJECTED': '已拒绝'
    }
    return textMap[status] || '待验证'
}

// 格式化记录日期
const formatRecordDate = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, '/'))
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`
}

// 格式化月份
const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, '/'))
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

// 格式化时间（HH:mm）
const formatTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '--:--'
    const date = new Date(dateTimeStr.replace(/-/g, '/'))
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

// 模拟获取服务记录数据
const getMockServiceRecords = async (params: any) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockList = [
        {
            id: '1',
            activityId: 'act1',
            activityTitle: '社区志愿服务活动',
            location: '北京市朝阳区xx社区',
            serviceDate: '2024-01-20',
            serviceTime: '09:00-12:00',
            serviceHours: 3,
            credits: 30,
            status: 'COMPLETED',
            verifyStatus: 'VERIFIED',
            canDownload: true,
            description: '参与社区环境整治活动，负责垃圾分类宣传和现场指导工作。'
        },
        {
            id: '2',
            activityId: 'act2',
            activityTitle: '环保宣传活动',
            location: '北京市海淀区xx公园',
            serviceDate: '2024-01-18',
            serviceTime: '14:00-17:00',
            serviceHours: 3,
            credits: 25,
            status: 'COMPLETED',
            verifyStatus: 'VERIFIED',
            canDownload: true,
            description: '在公园开展环保知识宣传，向市民讲解垃圾分类和节能减排的重要性。'
        },
        {
            id: '3',
            activityId: 'act3',
            activityTitle: '敬老院慰问活动',
            location: '北京市西城区xx敬老院',
            serviceDate: '2024-01-10',
            serviceTime: '10:00-12:00',
            serviceHours: 2,
            credits: 20,
            status: 'COMPLETED',
            verifyStatus: 'PENDING',
            canDownload: false,
            description: '陪同老人聊天，帮助整理房间，表演文艺节目。'
        },
        {
            id: '4',
            activityId: 'act4',
            activityTitle: '图书馆志愿服务',
            location: '北京市东城区xx图书馆',
            serviceDate: '2023-12-25',
            serviceTime: '13:00-17:00',
            serviceHours: 4,
            credits: 35,
            status: 'COMPLETED',
            verifyStatus: 'VERIFIED',
            canDownload: true,
            description: '协助图书整理，引导读者查找书籍，维护阅览室秩序。'
        }
    ]
    
    // 根据时间范围筛选
    let filteredList = mockList
    if (params.startDate && params.endDate) {
        const startDate = new Date(params.startDate)
        const endDate = new Date(params.endDate)
        filteredList = mockList.filter(item => {
            const itemDate = new Date(item.serviceDate)
            return itemDate >= startDate && itemDate <= endDate
        })
    }
    
    // 分页处理
    const start = (params.current - 1) * params.size
    const end = start + params.size
    const paginatedList = filteredList.slice(start, end)
    
    return {
        records: paginatedList,
        total: filteredList.length,
        size: params.size,
        current: params.current,
        pages: Math.ceil(filteredList.length / params.size)
    }
}

onMounted(() => {
    loadServiceRecords()
    loadStatsData()
})
</script>

<style scoped lang="scss">
.service-record-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 统计卡片 */
.stats-section {
    padding: 20rpx;
}

.stats-card {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    border-radius: 16rpx;
    padding: 40rpx 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
}

.stats-item {
    flex: 1;
    text-align: center;
}

.stats-number {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
}

.stats-label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

.stats-divider {
    width: 2rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 20rpx;
}

/* 筛选区域 */
.filter-section {
    background: #ffffff;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.filter-tabs {
    display: flex;
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

/* 记录列表 */
.record-list {
    flex: 1;
    height: calc(100vh - 320rpx);
}

.record-items {
    padding: 20rpx;
}

.month-group {
    margin-bottom: 30rpx;
}

.month-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10rpx 20rpx;
}

.month-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.month-count {
    font-size: 24rpx;
    color: #999999;
}

.record-card {
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

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
}

.activity-info {
    flex: 1;
    margin-right: 20rpx;
}

.activity-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    line-height: 1.4;
    margin-bottom: 12rpx;
}

.record-status {
    display: inline-block;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    
    &.status-completed {
        background: rgba(76, 175, 80, 0.1);
        
        .status-text {
            color: #4CAF50;
        }
    }
    
    &.status-pending {
        background: rgba(255, 142, 83, 0.1);
        
        .status-text {
            color: #ff8e53;
        }
    }
}

.status-text {
    font-size: 22rpx;
    font-weight: 600;
}

.record-date {
    font-size: 24rpx;
    color: #999999;
    white-space: nowrap;
}

.record-content {
    margin-bottom: 20rpx;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
}

.info-item {
    display: flex;
    align-items: center;
    flex: 1;
}

.info-text {
    margin-left: 8rpx;
    font-size: 26rpx;
    color: #666666;
}

/* 签到签退信息 */
.checkin-checkout-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
    padding: 16rpx;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12rpx;
}

.time-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.time-label {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
}

.label-text {
    font-size: 22rpx;
    color: #666666;
    margin-left: 4rpx;
}

.time-value {
    font-size: 28rpx;
    font-weight: bold;
    color: #333333;
}

.time-divider {
    width: 2rpx;
    height: 40rpx;
    background: #dee2e6;
    margin: 0 20rpx;
}

.service-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.service-hours, .credits-info {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8rpx;
}

.hours-label, .credits-label {
    font-size: 24rpx;
    color: #666666;
}

.hours-value {
    font-size: 28rpx;
    font-weight: bold;
    color: #ff6b6b;
    margin-left: 8rpx;
}

.credits-value {
    font-size: 28rpx;
    font-weight: bold;
    color: #52c41a;
    margin-left: 8rpx;
}

/* 签退类型标签 */
.checkout-badge {
    display: inline-flex;
    align-items: center;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    margin-left: 12rpx;
    
    &.badge-auto {
        background: rgba(24, 144, 255, 0.1);
        
        .badge-text {
            color: #1890ff;
        }
    }
    
    &.badge-manual {
        background: rgba(82, 196, 26, 0.1);
        
        .badge-text {
            color: #52c41a;
        }
    }
}

.early-leave-badge {
    display: inline-flex;
    align-items: center;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    background: rgba(255, 142, 83, 0.1);
    margin-left: 8rpx;
    
    .badge-text {
        color: #ff8e53;
        margin-left: 4rpx;
    }
}

.badge-text {
    font-size: 20rpx;
    font-weight: 600;
}

.record-description {
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.description-text {
    font-size: 26rpx;
    color: #666666;
    line-height: 1.6;
}

.record-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.verify-info {
    display: flex;
    align-items: center;
}

.verify-text {
    font-size: 24rpx;
    margin-left: 8rpx;
}

.action-btn {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 20rpx;
}

.action-text {
    font-size: 24rpx;
    color: #ff6b6b;
    margin-left: 6rpx;
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
    margin-bottom: 12rpx;
}

.empty-desc {
    font-size: 24rpx;
    color: #cccccc;
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