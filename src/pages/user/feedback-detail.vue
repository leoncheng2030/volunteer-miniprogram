<template>
    <view class="feedback-detail-container">
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-wrapper">
            <u-loading mode="circle" color="#ff6b6b" size="40"></u-loading>
            <text class="loading-text">加载中...</text>
        </view>

        <!-- 详情内容 -->
        <template v-else-if="feedbackInfo.id">
            <!-- 反馈信息卡片 -->
            <view class="info-card">
                <view class="card-header">
                    <view class="type-tag" :style="{ background: getTypeColor(feedbackInfo.type) }">
                        <u-icon :name="getTypeIcon(feedbackInfo.type)" color="#ffffff" size="20"></u-icon>
                        <text class="type-text">{{ getTypeText(feedbackInfo.type) }}</text>
                    </view>
                    <view class="status-tag" :style="{ background: getStatusColor(feedbackInfo.status) }">
                        <u-icon :name="getStatusIcon(feedbackInfo.status)" color="#ffffff" size="20"></u-icon>
                        <text class="status-text">{{ getStatusText(feedbackInfo.status) }}</text>
                    </view>
                </view>

                <view class="card-content">
                    <view class="content-title">反馈内容</view>
                    <text class="content-text">{{ feedbackInfo.content }}</text>
                </view>

                <!-- 附件图片 -->
                <view v-if="attachmentImages.length > 0" class="attachment-section">
                    <view class="section-title">附件图片</view>
                    <view class="image-list">
                        <image
                            v-for="(img, index) in attachmentImages"
                            :key="index"
                            class="attachment-image"
                            :src="img"
                            mode="aspectFill"
                            @click="previewImage(index)"
                        ></image>
                    </view>
                </view>

                <view class="info-footer">
                    <text class="create-time">{{ formatTime(feedbackInfo.createTime) }}</text>
                </view>
            </view>

            <!-- 处理结果(如果已解决) -->
            <view v-if="feedbackInfo.status === 'RESOLVED' && feedbackInfo.resolveResult" class="result-card">
                <view class="result-header">
                    <view class="header-left">
                        <u-icon name="checkmark-circle" color="#52c41a" size="24"></u-icon>
                        <text class="result-title">处理结果</text>
                    </view>
                    <text v-if="feedbackInfo.resolveTime" class="result-time">{{ formatDateTime(feedbackInfo.resolveTime) }}</text>
                </view>
                <text class="result-content">{{ feedbackInfo.resolveResult }}</text>
            </view>

            <!-- 回复列表 -->
            <view class="reply-section">
                <view class="section-header">
                    <view class="section-title">
                        <u-icon name="chat" color="#ff6b6b" size="24"></u-icon>
                        <text class="title-text">管理员回复</text>
                    </view>
                    <text class="reply-count">{{ replyList.length }}条</text>
                </view>

                <!-- 回复列表 -->
                <view v-if="replyList.length > 0" class="reply-list">
                    <view class="reply-item" v-for="item in replyList" :key="item.id">
                        <view class="reply-header">
                            <view class="replier-info">
                                <view class="avatar">
                                    <u-icon name="account" color="#ffffff" size="20"></u-icon>
                                </view>
                                <text class="replier-name">{{ item.replyUserName || '管理员' }}</text>
                            </view>
                            <text class="reply-time">{{ formatDateTime(item.createTime) }}</text>
                        </view>
                        <text class="reply-content">{{ item.content }}</text>
                    </view>
                </view>

                <!-- 暂无回复 -->
                <view v-else class="empty-reply">
                    <image class="empty-icon" src="/static/images/news_null.png" mode="aspectFit"></image>
                    <text class="empty-text">暂无回复,请耐心等待</text>
                </view>
            </view>

            <!-- 满意度评价 -->
            <view v-if="feedbackInfo.status === 'RESOLVED' && !feedbackInfo.satisfaction" class="satisfaction-card">
                <view class="satisfaction-header">
                    <text class="satisfaction-title">请对本次处理进行评价</text>
                </view>
                <view class="star-rating">
                    <view
                        v-for="star in 5"
                        :key="star"
                        class="star-item"
                        @click="selectStar(star)"
                    >
                        <u-icon
                            :name="star <= selectedStar ? 'star-fill' : 'star'"
                            :color="star <= selectedStar ? '#ffca3a' : '#dddddd'"
                            size="48"
                        ></u-icon>
                    </view>
                </view>
                <view class="evaluation-input">
                    <textarea
                        v-model="evaluation"
                        placeholder="请输入您的评价（选填）"
                        :maxlength="200"
                        class="evaluation-textarea"
                    ></textarea>
                </view>
                <u-button
                    type="primary"
                    @click="submitEvaluation"
                    :loading="submitLoading"
                    :disabled="selectedStar === 0"
                    class="submit-btn"
                >
                    提交评价
                </u-button>
            </view>

            <!-- 已评价显示 -->
            <view v-else-if="feedbackInfo.satisfaction" class="evaluated-card">
                <view class="evaluated-header">
                    <u-icon name="star-fill" color="#ffca3a" size="24"></u-icon>
                    <text class="evaluated-title">您的评价</text>
                </view>
                <view class="star-display">
                    <u-icon
                        v-for="star in 5"
                        :key="star"
                        name="star-fill"
                        :color="star <= feedbackInfo.satisfaction ? '#ffca3a' : '#dddddd'"
                        size="32"
                    ></u-icon>
                    <text class="score-text">{{ feedbackInfo.satisfaction }}分</text>
                </view>
                <text v-if="feedbackInfo.evaluation" class="evaluation-text">{{ feedbackInfo.evaluation }}</text>
            </view>
        </template>

        <!-- 空状态 -->
        <view v-else class="empty-state">
            <image class="empty-icon" src="/static/images/news_null.png" mode="aspectFit"></image>
            <text class="empty-text">反馈不存在</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFeedbackDetail, submitSatisfaction, type FeedbackRecord } from '@/api/feedback'
import { getFeedbackReplyList, type FeedbackReply } from '@/api/feedbackReply'
import { showToast } from '@/utils'

// 反馈类型配置
const feedbackTypes = [
    { label: '功能建议', value: 'FEATURE_SUGGESTION', icon: 'star', color: '#ff6b6b' },
    { label: '问题反馈', value: 'BUG_REPORT', icon: 'warning', color: '#ff8e53' },
    { label: '活动咨询', value: 'ACTIVITY_INQUIRY', icon: 'question-circle', color: '#1890ff' },
    { label: '投诉建议', value: 'COMPLAINT', icon: 'chat', color: '#52c41a' },
    { label: '其他', value: 'OTHER', icon: 'more-dot-fill', color: '#999999' }
]

// 页面数据
const feedbackId = ref('')
const loading = ref(false)
const feedbackInfo = ref<FeedbackRecord>({} as FeedbackRecord)
const replyList = ref<FeedbackReply[]>([])

// 满意度评价
const selectedStar = ref(0)
const evaluation = ref('')
const submitLoading = ref(false)

// 附件图片列表
const attachmentImages = computed(() => {
    if (!feedbackInfo.value.attachmentUrl) return []
    return feedbackInfo.value.attachmentUrl.split(',').filter(url => url.trim())
})

// 页面加载
onLoad((options: any) => {
    if (options.id) {
        feedbackId.value = options.id
        loadDetail()
    } else {
        showToast('参数错误')
    }
})

// 加载详情
const loadDetail = async () => {
    loading.value = true
    try {
        // 加载反馈详情
        feedbackInfo.value = await getFeedbackDetail(feedbackId.value)
        
        // 加载回复列表
        const replyData = await getFeedbackReplyList(feedbackId.value)
        replyList.value = replyData
    } catch (err) {
        console.error('加载详情失败:', err)
        showToast('加载失败，请重试')
    } finally {
        loading.value = false
    }
}

// 获取类型文本
const getTypeText = (type: string) => {
    const item = feedbackTypes.find(t => t.value === type)
    return item ? item.label : '其他'
}

// 获取类型图标
const getTypeIcon = (type: string) => {
    const item = feedbackTypes.find(t => t.value === type)
    return item ? item.icon : 'more-dot-fill'
}

// 获取类型颜色
const getTypeColor = (type: string) => {
    const item = feedbackTypes.find(t => t.value === type)
    return item ? item.color : '#999999'
}

// 获取状态图标
const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
        PENDING: 'clock',
        PROCESSING: 'reload',
        RESOLVED: 'checkmark-circle',
        CLOSED: 'close-circle'
    }
    return iconMap[status] || 'clock'
}

// 获取状态颜色
const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
        PENDING: '#ff8e53',
        PROCESSING: '#1890ff',
        RESOLVED: '#52c41a',
        CLOSED: '#999999'
    }
    return colorMap[status] || '#ff8e53'
}

// 获取状态文本
const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
        PENDING: '待处理',
        PROCESSING: '处理中',
        RESOLVED: '已解决',
        CLOSED: '已关闭'
    }
    return textMap[status] || '待处理'
}

// 格式化时间（相对时间）
const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
        return '今天'
    } else if (days === 1) {
        return '昨天'
    } else if (days < 7) {
        return `${days}天前`
    } else {
        return time.split(' ')[0]
    }
}

// 格式化时间（完整时间）
const formatDateTime = (time: string) => {
    if (!time) return '-'
    return time.replace('T', ' ').substring(0, 16)
}

// 预览图片
const previewImage = (index: number) => {
    uni.previewImage({
        current: index,
        urls: attachmentImages.value
    })
}

// 选择星级
const selectStar = (star: number) => {
    selectedStar.value = star
}

// 提交评价
const submitEvaluation = async () => {
    if (selectedStar.value === 0) {
        showToast('请选择评分')
        return
    }
    
    submitLoading.value = true
    try {
        await submitSatisfaction({
            id: feedbackId.value,
            satisfaction: selectedStar.value,
            evaluation: evaluation.value.trim() || undefined
        })
        
        showToast('评价成功', 'success')
        
        // 刷新详情
        await loadDetail()
    } catch (err) {
        console.error('提交评价失败:', err)
        showToast('提交失败，请重试')
    } finally {
        submitLoading.value = false
    }
}
</script>

<style scoped lang="scss">
.feedback-detail-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20rpx;
}

/* 加载状态 */
.loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    gap: 20rpx;
}

.loading-text {
    font-size: 28rpx;
    color: #999999;
}

/* 反馈信息卡片 */
.info-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}

.type-tag,
.status-tag {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
}

.type-text,
.status-text {
    font-size: 24rpx;
    color: #ffffff;
}

.card-content {
    margin-bottom: 24rpx;
}

.content-title {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 12rpx;
}

.content-text {
    font-size: 30rpx;
    color: #333333;
    line-height: 1.6;
}

.attachment-section {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
}

.section-title {
    font-size: 28rpx;
    color: #666666;
    margin-bottom: 16rpx;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.attachment-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
}

.info-footer {
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;
}

.create-time {
    font-size: 24rpx;
    color: #999999;
}

/* 处理结果卡片 */
.result-card {
    background: linear-gradient(135deg, #f6ffed, #d9f7be);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.result-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #52c41a;
}

.result-time {
    font-size: 24rpx;
    color: #52c41a;
}

.result-content {
    display: block;
    font-size: 28rpx;
    color: #333333;
    line-height: 1.6;
}

/* 回复区域 */
.reply-section {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.reply-count {
    font-size: 24rpx;
    color: #999999;
}

.reply-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.reply-item {
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.replier-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.avatar {
    width: 48rpx;
    height: 48rpx;
    background: #1890ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.replier-name {
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
}

.reply-time {
    font-size: 24rpx;
    color: #999999;
}

.reply-content {
    font-size: 28rpx;
    color: #333333;
    line-height: 1.6;
}

.empty-reply {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
}

.empty-icon {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

/* 满意度评价卡片 */
.satisfaction-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.satisfaction-header {
    text-align: center;
    margin-bottom: 24rpx;
}

.satisfaction-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.star-rating {
    display: flex;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.star-item {
    padding: 8rpx;
}

.evaluation-input {
    margin-bottom: 24rpx;
}

.evaluation-textarea {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333333;
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
}

/* 已评价卡片 */
.evaluated-card {
    background: linear-gradient(135deg, #fff7e6, #ffe7ba);
    border-radius: 16rpx;
    padding: 30rpx;
}

.evaluated-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
}

.evaluated-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #faad14;
}

.star-display {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.score-text {
    font-size: 28rpx;
    font-weight: bold;
    color: #faad14;
    margin-left: 16rpx;
}

.evaluation-text {
    font-size: 28rpx;
    color: #333333;
    line-height: 1.6;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 200rpx 0;
}
</style>
