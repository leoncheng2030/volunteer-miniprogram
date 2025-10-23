<template>
    <view class="feedback-container">
        
        <!-- 反馈类型选择 -->
        <view class="form-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">反馈类型</text>
            </view>
            <view class="type-list">
                <view 
                    class="type-item" 
                    :class="{ active: selectedType === item.value }"
                    v-for="item in feedbackTypes" 
                    :key="item.value"
                    @click="selectType(item.value)"
                >
                    <view class="type-icon">
                        <u-icon :name="item.icon" :color="selectedType === item.value ? '#ffffff' : item.color" size="32"></u-icon>
                    </view>
                    <text class="type-text">{{ item.label }}</text>
                </view>
            </view>
        </view>

        <!-- 反馈内容 -->
        <view class="form-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">反馈内容</text>
                <text class="required">*</text>
            </view>
            <view class="content-wrapper">
                <textarea
                    class="content-input"
                    v-model="feedbackContent"
                    placeholder="请详细描述您遇到的问题或建议,我们会认真对待每一条反馈"
                    :maxlength="500"
                    :show-confirm-bar="false"
                ></textarea>
                <text class="char-count">{{ feedbackContent.length }}/500</text>
            </view>
        </view>

        <!-- 联系方式 -->
        <view class="form-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">联系方式</text>
                <text class="required">*</text>
            </view>
            <view class="input-wrapper">
                <input 
                    class="contact-input"
                    v-model="contactInfo"
                    type="text"
                    placeholder="请输入手机号或邮箱，方便我们联系您"
                />
            </view>
        </view>

        <!-- 图片上传 -->
        <view class="form-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">上传图片</text>
                <text class="optional">（选填）</text>
            </view>
            <view class="upload-wrapper">
                <view class="image-list">
                    <view class="image-item" v-for="(image, index) in imageList" :key="index">
                        <image class="uploaded-image" :src="image" mode="aspectFill"></image>
                        <view class="delete-btn" @click="deleteImage(index)">
                            <u-icon name="close" color="#ffffff" size="24"></u-icon>
                        </view>
                    </view>
                    <view class="upload-btn" @click="chooseImage" v-if="imageList.length < 3">
                        <u-icon name="plus" color="#cccccc" size="48"></u-icon>
                        <text class="upload-text">添加图片</text>
                    </view>
                </view>
                <text class="upload-tip">最多上传3张图片，每张不超过5MB</text>
            </view>
        </view>

        <!-- 历史反馈 -->
        <view class="form-section">
            <view class="section-title">
                <view class="title-icon"></view>
                <text class="title-text">历史反馈</text>
            </view>
            <!-- 加载中 -->
            <view v-if="historyLoading" class="loading-wrapper">
                <u-loading mode="circle" color="#ff6b6b" size="40"></u-loading>
                <text class="loading-text">加载中...</text>
            </view>
            <!-- 历史记录列表 -->
            <view v-else-if="historyList.length > 0" class="history-list">
                <view class="history-item" v-for="item in historyList" :key="item.id" @click="viewDetail(item.id)">
                    <view class="history-header">
                        <view class="history-type-wrapper">
                            <u-icon :name="getTypeIcon(item.type)" :color="getTypeColor(item.type)" size="20"></u-icon>
                            <text class="history-type" :style="{ color: getTypeColor(item.type) }">{{ getHistoryTypeText(item.type) }}</text>
                        </view>
                        <text class="history-time">{{ formatTime(item.createTime) }}</text>
                    </view>
                    <text class="history-content">{{ item.content }}</text>
                    <view class="history-status" :class="item.status">
                        <u-icon :name="getStatusIcon(item.status)" :color="getStatusColor(item.status)" size="20"></u-icon>
                        <text class="status-text">{{ getStatusText(item.status) }}</text>
                    </view>
                    <u-icon class="arrow-icon" name="arrow-right" color="#cccccc" size="20"></u-icon>
                </view>
            </view>
            <!-- 空状态 -->
            <view v-else class="empty-history">
                <image class="empty-icon" src="/static/images/news_null.png" mode="aspectFit"></image>
                <text class="empty-text">暂无反馈记录</text>
            </view>
        </view>

        <!-- 提交按钮 -->
        <view class="submit-section">
            <u-button 
                type="primary" 
                @click="submitFeedback"
                :loading="submitLoading"
                :disabled="!canSubmit"
                class="submit-btn"
            >
                提交反馈
            </u-button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { addFeedback, getFeedbackList, type AddFeedbackParams, type FeedbackRecord } from '@/api/feedback'
import { uploadImageForMini } from '@/api/file'
import { showToast } from '@/utils'

// 反馈类型（使用uview-pro官方图标）
const feedbackTypes = [
    { label: '功能建议', value: 'FEATURE_SUGGESTION', icon: 'star', color: '#ff6b6b' },
    { label: '问题反馈', value: 'BUG_REPORT', icon: 'warning', color: '#ff8e53' },
    { label: '活动咨询', value: 'ACTIVITY_INQUIRY', icon: 'question-circle', color: '#1890ff' },
    { label: '投诉建议', value: 'COMPLAINT', icon: 'chat', color: '#52c41a' },
    { label: '其他', value: 'OTHER', icon: 'more-dot-fill', color: '#999999' }
]

// 表单数据
const selectedType = ref('FEATURE_SUGGESTION')
const feedbackContent = ref('')
const contactInfo = ref('')
const imageList = ref<string[]>([])
const submitLoading = ref(false)
const historyLoading = ref(false)

// 历史反馈数据
const historyList = ref<FeedbackRecord[]>([])

// 是否可以提交
const canSubmit = computed(() => {
    return feedbackContent.value.trim() && contactInfo.value.trim() && !submitLoading.value
})

// 选择反馈类型
const selectType = (type: string) => {
    selectedType.value = type
}

// 选择图片
const chooseImage = () => {
    uni.chooseImage({
        count: 3 - imageList.value.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const tempFilePaths = res.tempFilePaths
            
            // 上传图片到服务器
            uni.showLoading({ title: '上传中...' })
            try {
                for (const filePath of tempFilePaths) {
                    const result = await uploadImageForMini(filePath)
                    if (result && result.url) {
                        imageList.value.push(result.url)
                    }
                }
                uni.hideLoading()
                showToast('上传成功', 'success')
            } catch (err) {
                console.error('上传图片失败:', err)
                uni.hideLoading()
                showToast('上传失败,请重试')
            }
        },
        fail: (err) => {
            console.error('选择图片失败:', err)
            showToast('选择图片失败')
        }
    })
}

// 删除图片
const deleteImage = (index: number) => {
    imageList.value.splice(index, 1)
}

// 提交反馈
const submitFeedback = async () => {
    if (!canSubmit.value) return
    
    // 验证联系方式
    const phoneReg = /^1[3-9]\d{9}$/
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!phoneReg.test(contactInfo.value) && !emailReg.test(contactInfo.value)) {
        showToast('请输入正确的手机号或邮箱')
        return
    }
    
    submitLoading.value = true
    
    try {
        const params: AddFeedbackParams = {
            type: selectedType.value,
            content: feedbackContent.value.trim(),
            title: feedbackContent.value.trim().substring(0, 50) // 取前50个字符作为标题
        }
        
        // 判断是手机号还是邮箱
        if (phoneReg.test(contactInfo.value)) {
            params.contactPhone = contactInfo.value
        } else {
            params.contactEmail = contactInfo.value
        }
        
        // 添加图片附件
        if (imageList.value.length > 0) {
            params.attachmentUrl = imageList.value.join(',')
        }
        
        await addFeedback(params)
        
        showToast('提交成功', 'success')
        
        // 重置表单
        feedbackContent.value = ''
        contactInfo.value = ''
        imageList.value = []
        selectedType.value = 'FEATURE_SUGGESTION'
        
        // 刷新历史记录
        loadHistory()
    } catch (err) {
        console.error('提交反馈失败:', err)
        showToast('提交失败，请重试')
    } finally {
        submitLoading.value = false
    }
}

// 加载历史反馈
const loadHistory = async () => {
    historyLoading.value = true
    try {
        const result = await getFeedbackList({ current: 1, size: 10 })
        historyList.value = result.records || []
    } catch (err) {
        console.error('加载历史反馈失败:', err)
    } finally {
        historyLoading.value = false
    }
}

// 获取历史类型文本
const getHistoryTypeText = (type: string) => {
    const item = feedbackTypes.find(item => item.value === type)
    return item ? item.label : '其他'
}

// 获取类型图标
const getTypeIcon = (type: string) => {
    const item = feedbackTypes.find(item => item.value === type)
    return item ? item.icon : 'more-dot-fill'
}

// 获取类型颜色
const getTypeColor = (type: string) => {
    const item = feedbackTypes.find(item => item.value === type)
    return item ? item.color : '#999999'
}

// 格式化时间
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

// 查看反馈详情
const viewDetail = (id: string) => {
    uni.navigateTo({
        url: `/pages/user/feedback-detail?id=${id}`
    })
}

// 页面加载时获取历史记录
onMounted(() => {
    loadHistory()
})
</script>

<style scoped lang="scss">
.feedback-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 120rpx;
}

/* 表单区域 */
.form-section {
    background: #ffffff;
    margin-bottom: 20rpx;
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

.required {
    color: #ff4d4f;
    font-size: 28rpx;
    margin-left: 8rpx;
}

.optional {
    color: #999999;
    font-size: 26rpx;
    margin-left: 8rpx;
}

/* 反馈类型 */
.type-list {
    display: flex;
    justify-content: space-between;
    padding: 0 0 30rpx;
    gap: 10rpx;
}

.type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 20rpx 8rpx;
    border: 2rpx solid #f0f0f0;
    border-radius: 16rpx;
    transition: all 0.3s;
    
    &.active {
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        border-color: transparent;
        
        .type-text {
            color: #ffffff;
        }
        
        .type-icon {
            background: rgba(255, 255, 255, 0.2);
        }
    }
}

.type-icon {
    width: 64rpx;
    height: 64rpx;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
}

.type-text {
    font-size: 26rpx;
    color: #333333;
}

/* 内容输入 */
.content-wrapper {
    position: relative;
    padding: 0 0 30rpx;
}

.content-input {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    font-size: 28rpx;
    line-height: 1.6;
    color: #333333;
    border: none;
    resize: none;
}

.char-count {
    position: absolute;
    right: 20rpx;
    bottom: 40rpx;
    font-size: 24rpx;
    color: #999999;
}

/* 联系方式输入 */
.input-wrapper {
    padding: 0 0 30rpx;
}

.contact-input {
    width: 100%;
    height: 88rpx;
    padding: 0 20rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #333333;
    border: none;
}

/* 图片上传 */
.upload-wrapper {
    padding: 0 0 30rpx;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
}

.image-item {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    border-radius: 16rpx;
    overflow: hidden;
}

.uploaded-image {
    width: 100%;
    height: 100%;
}

.delete-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: #ff4d4f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 160rpx;
    height: 160rpx;
    background: #f8f9fa;
    border: 2rpx dashed #dddddd;
    border-radius: 16rpx;
}

.upload-text {
    font-size: 24rpx;
    color: #999999;
    margin-top: 8rpx;
}

.upload-tip {
    font-size: 24rpx;
    color: #999999;
}

/* 历史反馈 */
.loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
    gap: 20rpx;
}

.loading-text {
    font-size: 28rpx;
    color: #999999;
}

.history-list {
    padding: 0 0 30rpx;
}

.history-item {
    position: relative;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    transition: all 0.3s;
    
    &:last-child {
        margin-bottom: 0;
    }
    
    &:active {
        background: #e9ecef;
        transform: scale(0.98);
    }
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.history-type-wrapper {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.history-type {
    font-size: 26rpx;
    font-weight: 500;
}

.history-time {
    font-size: 24rpx;
    color: #999999;
}

.history-content {
    font-size: 28rpx;
    color: #333333;
    line-height: 1.6;
    margin-bottom: 16rpx;
}

.history-status {
    display: flex;
    align-items: center;
    
    .status-text {
        font-size: 24rpx;
        margin-left: 8rpx;
    }
    
    &.pending {
        .status-text {
            color: #ff8e53;
        }
    }
    
    &.processing {
        .status-text {
            color: #1890ff;
        }
    }
    
    &.resolved {
        .status-text {
            color: #52c41a;
        }
    }
}

.arrow-icon {
    position: absolute;
    right: 24rpx;
    bottom: 24rpx;
}

.empty-history {
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

/* 提交按钮 */
.submit-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    padding: 30rpx;
    border-top: 1rpx solid #f0f0f0;
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
}
</style>