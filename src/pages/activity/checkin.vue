<template>
    <view class="checkin-container">
        <!-- 活动信息 -->
        <view class="activity-card">
            <view class="activity-header">
                <text class="activity-title">{{ activity.title }}</text>
                <view class="activity-status">
                    <u-icon name="checkbox-mark" color="#4CAF50" size="20"></u-icon>
                    <text class="status-text">扫码签到</text>
                </view>
            </view>
            
            <view class="activity-info">
                <view class="info-item">
                    <u-icon name="calendar" color="#757575" size="24"></u-icon>
                    <text class="info-text">{{ activity.activityDate }} {{ formatTimeOnly(activity.startTime) }}</text>
                </view>
                <view class="info-item">
                    <u-icon name="map" color="#757575" size="24"></u-icon>
                    <text class="info-text">{{ activity.location }}</text>
                </view>
                <view class="info-item">
                    <u-icon name="clock" color="#757575" size="24"></u-icon>
                    <text class="info-text">{{ activity.serviceHours }}小时</text>
                </view>
            </view>
        </view>

        <!-- 签到人员列表 -->
        <view class="candidates-section">
            <view class="section-header">
                <text class="section-title">请选择签到人员</text>
                <text class="section-tip">(可多选)</text>
            </view>
            
            <view v-if="loading" class="loading-status">
                <u-loading mode="flower" color="#ff6b6b" size="40"></u-loading>
                <text class="loading-text">加载中...</text>
            </view>
            
            <view v-else-if="candidates.length > 0" class="candidates-list">
                <view 
                    v-for="candidate in candidates"
                    :key="candidate.signupId"
                    class="candidate-item"
                    :class="{ 
                        checked: selectedIds.includes(candidate.signupId),
                        disabled: candidate.isCheckedIn 
                    }"
                    @click="toggleSelect(candidate)"
                >
                    <view class="candidate-avatar">
                        <image :src="candidate.avatar || '/static/default-avatar.png'" mode="aspectFill" />
                        <view v-if="candidate.isCheckedIn" class="checked-badge">
                            <u-icon name="checkmark" color="#fff" size="16"></u-icon>
                        </view>
                    </view>
                    
                    <view class="candidate-info">
                        <text class="name">{{ candidate.userName }}</text>
                        <text v-if="candidate.isCheckedIn" class="status checked-status">
                            已签到 {{ formatCheckInTime(candidate.checkInTime) }}
                        </text>
                        <text v-else class="status unchecked-status">未签到</text>
                    </view>
                    
                    <view class="checkbox">
                        <u-icon 
                            v-if="!candidate.isCheckedIn"
                            :name="selectedIds.includes(candidate.signupId) ? 'checkbox-mark' : 'checkbox'"
                            :color="selectedIds.includes(candidate.signupId) ? '#ff6b6b' : '#ccc'"
                            size="28"
                        />
                        <u-icon 
                            v-else
                            name="checkmark-circle-fill"
                            color="#4CAF50"
                            size="28"
                        />
                    </view>
                </view>
            </view>
            
            <view v-else class="empty-state">
                <image class="empty-icon" src="/static/images/news_null.png" mode="aspectFit"></image>
                <text class="empty-text">暂无可签到人员</text>
            </view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="bottom-actions">
            <view class="selected-info">
                <text class="selected-count">已选择 {{ selectedIds.length }} 人</text>
            </view>
            <view class="action-buttons">
                <button 
                    class="confirm-btn"
                    :class="{ disabled: selectedIds.length === 0 }"
                    :disabled="selectedIds.length === 0 || submitting"
                    :loading="submitting"
                    @click="submitCheckin"
                >
                    {{ submitting ? '签到中...' : '确认签到' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { getCheckinCandidates, batchCheckin } from '@/api/checkin'
import type { CheckinCandidate, ActivityInfo } from '@/api/checkin'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const activityId = ref('')
const activity = ref<ActivityInfo>({} as ActivityInfo)
const candidates = ref<CheckinCandidate[]>([])
const selectedIds = ref<string[]>([])
const loading = ref(false)
const submitting = ref(false)

onMounted(async () => {
    // 从路由参数获取activityId
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1] as any
    activityId.value = currentPage.options.activityId || ''
    
    if (activityId.value) {
        await loadCandidates()
    } else {
        uni.$u.toast('活动参数错误')
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }
})

// 加载候选人列表
const loadCandidates = async () => {
    loading.value = true
    
    try {
        const res = await getCheckinCandidates({
            activityId: activityId.value,
            operatorId: userInfo.value?.id || ''
        })
        
        activity.value = res.activity
        candidates.value = res.candidates
        
        // 自动选中未签到的人员
        selectedIds.value = candidates.value
            .filter(c => !c.isCheckedIn)
            .map(c => c.signupId)
            
    } catch (error) {
        console.error('加载候选人失败:', error)
        uni.$u.toast('加载失败')
    } finally {
        loading.value = false
    }
}

// 切换选择
const toggleSelect = (candidate: CheckinCandidate) => {
    if (candidate.isCheckedIn) {
        return  // 已签到不能再选
    }
    
    const index = selectedIds.value.indexOf(candidate.signupId)
    if (index > -1) {
        selectedIds.value.splice(index, 1)
    } else {
        selectedIds.value.push(candidate.signupId)
    }
}

// 提交签到
const submitCheckin = async () => {
    if (selectedIds.value.length === 0) {
        uni.$u.toast('请选择签到人员')
        return
    }
    
    submitting.value = true
    
    try {
        const res = await batchCheckin({
            activityId: activityId.value,
            operatorId: userInfo.value?.id || '',
            signupIds: selectedIds.value
        })
        
        if (res.successCount > 0) {
            uni.$u.toast(`签到成功 ${res.successCount} 人`)
            
            setTimeout(() => {
                uni.navigateBack()
            }, 2000)
        } else {
            uni.$u.toast('签到失败')
        }
        
    } catch (error) {
        console.error('签到失败:', error)
        uni.$u.toast('签到失败')
    } finally {
        submitting.value = false
    }
}

// 格式化时间（只显示时分）
const formatTimeOnly = (timeStr: string) => {
    if (!timeStr) return ''
    
    if (timeStr.includes(' ')) {
        timeStr = timeStr.split(' ')[1]
    }
    
    if (timeStr.split(':').length === 3) {
        const parts = timeStr.split(':')
        return `${parts[0]}:${parts[1]}`
    }
    
    return timeStr
}

// 格式化签到时间
const formatCheckInTime = (timeStr: string) => {
    if (!timeStr) return ''
    const date = new Date(timeStr.replace(/-/g, '/'))
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}
</script>

<style scoped lang="scss">
.checkin-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 140rpx;
}

/* 活动卡片 */
.activity-card {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    padding: 40rpx 30rpx;
    color: #ffffff;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}

.activity-title {
    font-size: 36rpx;
    font-weight: bold;
    flex: 1;
}

.activity-status {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
}

.status-text {
    font-size: 24rpx;
    font-weight: 600;
}

.activity-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.info-text {
    font-size: 28rpx;
    opacity: 0.95;
}

/* 签到人员列表 */
.candidates-section {
    margin: 20rpx;
}

.section-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 20rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.section-tip {
    font-size: 24rpx;
    color: #999;
    margin-left: 12rpx;
}

.candidates-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.candidate-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: #ffffff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s;
    
    &.checked {
        border: 2rpx solid #ff6b6b;
        box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.2);
    }
    
    &.disabled {
        opacity: 0.6;
    }
    
    &:active:not(.disabled) {
        transform: scale(0.98);
    }
}

.candidate-avatar {
    position: relative;
    width: 96rpx;
    height: 96rpx;
    margin-right: 24rpx;
    
    image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3rpx solid #fff;
    }
}

.checked-badge {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    width: 36rpx;
    height: 36rpx;
    background: #4CAF50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid #fff;
}

.candidate-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.status {
    font-size: 24rpx;
}

.checked-status {
    color: #4CAF50;
}

.unchecked-status {
    color: #999;
}

.checkbox {
    margin-left: 16rpx;
}

/* 加载状态 */
.loading-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
}

.loading-text {
    font-size: 26rpx;
    color: #999;
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
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}

/* 底部操作按钮 */
.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
    /* #ifdef H5 */
    padding-bottom: 80rpx;
    /* #endif */
    /* #ifndef H5 */
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    /* #endif */
}

.selected-info {
    margin-bottom: 16rpx;
}

.selected-count {
    font-size: 26rpx;
    color: #666;
}

.action-buttons {
    display: flex;
    gap: 20rpx;
}

.confirm-btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    border: none;
    border-radius: 44rpx;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
    transition: all 0.3s;
    
    &.disabled {
        background: #cccccc;
        box-shadow: none;
    }
    
    &:active:not(.disabled) {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.2);
    }
}
</style>
