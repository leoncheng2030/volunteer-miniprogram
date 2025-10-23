<template>
    <view class="notice-list">
        <!-- 筛选标签 -->
        <view class="filter-tabs">
            <view 
                class="tab-item" 
                :class="{ active: currentType === type.value }"
                v-for="type in typeTabs" 
                :key="type.value"
                @click="changeType(type.value)"
            >
                <text class="tab-text">{{ type.label }}</text>
            </view>
        </view>

        <!-- 通知公告列表 -->
        <view class="notice-container">
            <!-- 加载状态 -->
            <view v-if="loading" class="loading-container">
                <u-loading mode="flower" size="40"></u-loading>
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 通知公告卡片列表 -->
            <view v-else-if="noticeList.length > 0" class="notice-items">
                <view 
                    class="notice-card" 
                    v-for="notice in noticeList" 
                    :key="notice.id"
                    @click="goToDetail(notice.id)"
                >
                    <!-- 通知公告图片 -->
                    <view class="card-image">
                        <image :src="notice.image || '/static/images/bg_hometop.png'" mode="aspectFill" class="cover-image"></image>
                        <view class="type-badge" :class="getTypeClass(notice.type)">
                            <text class="type-text">{{ formatType(notice.type) }}</text>
                        </view>
                    </view>

                    <!-- 通知公告信息 -->
                    <view class="card-content">
                        <view class="notice-title">{{ notice.title }}</view>
                        
                        <view class="notice-info">
                            <view class="info-item">
                                <u-icon name="bookmark" color="#999" size="20"></u-icon>
                                <text class="info-text">{{ formatType(notice.type) }}</text>
                            </view>
                            <view class="info-item">
                                <u-icon name="clock" color="#999" size="20"></u-icon>
                                <text class="info-text">{{ formatDate(notice.createTime) }}</text>
                            </view>
                        </view>

                        <!-- 通知公告摘要 -->
                        <view class="notice-digest">
                            <text class="digest-text">{{ notice.digest || '暂无摘要' }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-else class="empty-container">
                <u-empty 
                    mode="data" 
                    icon="http://cdn.uviewui.com/uview/empty/data.png"
                    text="暂无通知公告"
                ></u-empty>
            </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="!loading && noticeList.length > 0 && hasMore" class="load-more">
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
import { getNoticePage, getNoticesByType, type NoticeItem, type NoticePageParams } from '@/api/notice'

// 响应式数据
const loading = ref(false)
const noticeList = ref<NoticeItem[]>([])
const currentType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = ref(true)

// 类型标签
const typeTabs = [
    { label: '全部', value: '' },
    { label: '通知', value: 'NOTICE' },
    { label: '公告', value: 'ANNOUNCEMENT' },
    { label: '活动通知', value: 'ACTIVITY' },
    { label: '系统通知', value: 'SYSTEM' }
]

// 加载更多状态
const loadMoreStatus = computed(() => {
    if (loading.value) return 'loading'
    if (!hasMore.value) return 'nomore'
    return 'loadmore'
})

// 获取通知公告列表
const loadNotices = async (reset = false) => {
    if (loading.value) return
    
    loading.value = true
    
    try {
        const params = {
            current: reset ? 1 : currentPage.value,
            size: pageSize.value,
            type: currentType.value || undefined
        }
        
        const result = await getNoticePage(params)
        
        if (reset) {
            noticeList.value = result.records
            currentPage.value = 1
        } else {
            noticeList.value = [...noticeList.value, ...result.records]
        }
        
        total.value = result.total
        currentPage.value++
        hasMore.value = noticeList.value.length < result.total
        
    } catch (error) {
        console.error('获取通知公告列表失败:', error)
        uni.showToast({
            title: '获取通知公告列表失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
        if (reset) {
            uni.stopPullDownRefresh()
        }
    }
}

// 切换类型
const changeType = (type: string) => {
    currentType.value = type
    loadNotices(true)
}

// 跳转到详情页
const goToDetail = (id: string) => {
    uni.navigateTo({
        url: `/pages/notice/detail?id=${id}`
    })
}

// 格式化类型样式
const getTypeClass = (type: string) => {
    switch (type) {
        case 'NOTICE':
            return 'type-notice'
        case 'ANNOUNCEMENT':
            return 'type-announcement'
        case 'ACTIVITY':
            return 'type-activity'
        case 'SYSTEM':
            return 'type-system'
        default:
            return 'type-default'
    }
}

// 格式化类型
const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
        'NOTICE': '通知',
        'ANNOUNCEMENT': '公告',
        'ACTIVITY': '活动通知',
        'SYSTEM': '系统通知'
    }
    return typeMap[type] || type
}

// 格式化位置
const formatPlace = (place: string) => {
    const placeMap: Record<string, string> = {
        'CLIENT_MOBILE': '小程序端',
        'ADMIN_WEB': '管理后台',
        'ALL': '全部'
    }
    return placeMap[place] || place
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return `${date.getMonth() + 1}/${date.getDate()}`
}

// 加载更多
const loadMore = () => {
    if (hasMore.value && !loading.value) {
        loadNotices(false)
    }
}

// 页面加载
onMounted(() => {
    loadNotices(true)
})

// 下拉刷新
onPullDownRefresh(() => {
    loadNotices(true)
})

// 触底加载更多
onReachBottom(() => {
    loadMore()
})
</script>

<style lang="scss" scoped>
.notice-list {
    background-color: #f5f5f5;
    min-height: 100vh;
}

/* 筛选标签 */
.filter-tabs {
    display: flex;
    background-color: #FFFFFF;
    padding: 0 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    position: sticky;
    top: 0;
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

/* 通知公告容器 */
.notice-container {
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

/* 通知公告卡片列表 */
.notice-items {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.notice-card {
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

.type-badge {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    
    &.type-notice {
        background-color: rgba(33, 150, 243, 0.9);
    }
    
    &.type-announcement {
        background-color: rgba(255, 152, 0, 0.9);
    }
    
    &.type-activity {
        background-color: rgba(76, 175, 80, 0.9);
    }
    
    &.type-system {
        background-color: rgba(156, 39, 176, 0.9);
    }
}

.type-text {
    color: #FFFFFF;
    font-size: 20rpx;
    font-weight: 600;
}

/* 卡片内容 */
.card-content {
    padding: 24rpx;
}

.notice-title {
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

.notice-info {
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

/* 通知公告摘要 */
.notice-digest {
    margin-bottom: 16rpx;
}

.digest-text {
    color: #666666;
    font-size: 28rpx;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
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