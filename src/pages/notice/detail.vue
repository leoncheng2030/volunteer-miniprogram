<template>
    <view class="notice-detail">
        <!-- 通知公告头部信息 -->
        <view class="notice-header">
            <view class="notice-title">{{ noticeDetail.title }}</view>
            <view class="notice-meta">
                <view class="meta-item">
                    <u-icon name="bookmark" color="#666" size="24"></u-icon>
                    <text class="meta-text">{{ formatType(noticeDetail.type) }}</text>
                </view>
                <view class="meta-item">
                    <u-icon name="clock" color="#666" size="24"></u-icon>
                    <text class="meta-text">{{ formatDateTime(noticeDetail.createTime) }}</text>
                </view>
            </view>
        </view>

        <!-- 通知公告图片 -->
        <view class="notice-image" v-if="noticeDetail.image">
            <image :src="noticeDetail.image" mode="aspectFill" class="cover-image"></image>
        </view>

        <!-- 通知公告内容 -->
        <view class="notice-content">
            <!-- 通知公告摘要 -->
            <view class="content-section" v-if="noticeDetail.digest">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">内容摘要</text>
                </view>
                <view class="section-content">
                    <text class="digest-text">{{ noticeDetail.digest }}</text>
                </view>
            </view>

            <!-- 通知公告详情 -->
            <view class="content-section">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">详细内容</text>
                </view>
                <view class="section-content">
                    <rich-text :nodes="noticeDetail.content" class="rich-content"></rich-text>
                </view>
            </view>

            <!-- 发布信息 -->
            <view class="content-section">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">发布信息</text>
                </view>
                <view class="publish-info">
                    <view class="info-item">
                        <text class="info-label">发布时间：</text>
                        <text class="info-value">{{ formatDateTime(noticeDetail.createTime) }}</text>
                    </view>
                    <view class="info-item" v-if="noticeDetail.updateTime !== noticeDetail.createTime">
                        <text class="info-label">更新时间：</text>
                        <text class="info-value">{{ formatDateTime(noticeDetail.updateTime) }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-actions">
            <view class="share-btn" @click="shareNotice">
                <u-icon name="share" color="#666" size="24"></u-icon>
                <text class="share-text">分享</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNoticeDetail, type NoticeItem } from '@/api/notice'

// 通知公告详情数据
const noticeDetail = ref<NoticeItem>({
    id: '',
    title: '',
    image: '',
    content: '',
    digest: '',
    type: '',
    place: '',
    status: '',
    remark: '',
    sortCode: '',
    extJson: '',
    createTime: '',
    updateTime: '',
    createUser: '',
    updateUser: ''
})

// 加载状态
const loading = ref(false)
const noticeId = ref('')

// 获取通知公告详情
const loadNoticeDetail = async () => {
    if (!noticeId.value) return
    
    loading.value = true
    try {
        const data = await getNoticeDetail({ id: noticeId.value })
        noticeDetail.value = data
        
    } catch (error) {
        console.error('获取通知公告详情失败:', error)
        uni.showToast({
            title: '获取通知公告详情失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 获取类型样式类
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

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    if (isNaN(date.getTime())) return ''
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 页面加载时获取通知公告ID
onLoad((options?: any) => {
    if (options?.id) {
        noticeId.value = options.id
        loadNoticeDetail()
    } else {
        uni.showToast({
            title: '通知公告ID不能为空',
            icon: 'none'
        })
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }
})

// 分享通知公告
const shareNotice = () => {
    uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: '',
        title: noticeDetail.value.title,
        summary: noticeDetail.value.digest,
        imageUrl: noticeDetail.value.image,
        success: () => {
            uni.showToast({
                title: '分享成功',
                icon: 'success'
            })
        },
        fail: () => {
            uni.showToast({
                title: '分享失败',
                icon: 'none'
            })
        }
    })
}
</script>

<style lang="scss" scoped>
.notice-detail {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding-bottom: 120rpx;
}

/* 类型栏 */
.type-bar {
    padding: 20rpx 32rpx;
    text-align: center;
    
    &.type-notice {
        background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%);
    }
    
    &.type-announcement {
        background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
    }
    
    &.type-activity {
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    }
    
    &.type-system {
        background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
    }
    
    &.type-default {
        background: linear-gradient(135deg, #607D8B 0%, #90A4AE 100%);
    }
}

.type-text {
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: 600;
}

/* 通知公告头部 */
.notice-header {
    background-color: #FFFFFF;
    padding: 32rpx;
    margin-bottom: 16rpx;
}

.notice-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #212121;
    line-height: 1.4;
    margin-bottom: 24rpx;
}

.notice-meta {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.meta-item {
    display: flex;
    align-items: center;
}

.meta-text {
    color: #666666;
    font-size: 28rpx;
    margin-left: 12rpx;
}

/* 通知公告图片 */
.notice-image {
    margin-bottom: 16rpx;
}

.cover-image {
    width: 100%;
    height: 400rpx;
}

/* 通知公告内容 */
.notice-content {
    background-color: #FFFFFF;
}

.content-section {
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
}

.title-decoration {
    width: 6rpx;
    height: 32rpx;
    background: linear-gradient(to bottom, #FF6B6B, #FF8E53);
    border-radius: 3rpx;
    margin-right: 16rpx;
}

.title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #212121;
}

.section-content {
    color: #666666;
    font-size: 28rpx;
    line-height: 1.6;
}

.digest-text {
    color: #666666;
    font-size: 28rpx;
    line-height: 1.6;
}

.rich-content {
    color: #666666;
    font-size: 28rpx;
    line-height: 1.6;
}

/* 发布信息 */
.publish-info {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-label {
    color: #999999;
    font-size: 28rpx;
    width: 180rpx;
}

.info-value {
    color: #666666;
    font-size: 28rpx;
    font-weight: 500;
}

/* 底部操作栏 */
.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #FFFFFF;
    padding: 24rpx 32rpx;
    display: flex;
    align-items: center;
    gap: 24rpx;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.share-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 24rpx;
    border: 1rpx solid #E0E0E0;
    border-radius: 12rpx;
    min-width: 120rpx;
}

.share-text {
    color: #666666;
    font-size: 24rpx;
    margin-top: 8rpx;
}
</style>