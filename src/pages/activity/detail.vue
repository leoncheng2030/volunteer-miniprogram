<template>
    <view class="activity-detail">
        <!-- 活动头部信息 -->
        <view class="activity-header">
            <view class="activity-title">{{ activityDetail.title }}</view>
            <view class="activity-meta">
                <!-- 第一行：时间信息 + 印章 -->
                <view class="meta-row">
                    <view class="time-location-group">
                        <view class="meta-item">
                            <u-icon name="calendar" color="#666" size="24"></u-icon>
                            <text class="meta-text">{{ activityDetail.date }}</text>
                        </view>
                        <view class="meta-item">
                            <u-icon name="clock" color="#666" size="24"></u-icon>
                            <text class="meta-text">{{ activityDetail.time }}</text>
                        </view>
                        <view class="meta-item">
                            <u-icon name="map" color="#666" size="24"></u-icon>
                            <text class="meta-text">{{ activityDetail.location }}</text>
                        </view>
                    </view>
                    <!-- 印章组件 -->
                    <StatusStamp :status="activityDetail.status" />
                </view>
            </view>
        </view>

        <!-- 活动图片 -->
        <view class="activity-image" v-if="activityDetail.image">
            <image :src="activityDetail.image" mode="aspectFill" class="cover-image"></image>
        </view>

        <!-- 活动详细信息 -->
        <view class="activity-content">
            <!-- 活动简介 -->
            <view class="content-section">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">活动简介</text>
                </view>
                <view class="section-content">
                    <text class="description-text">{{ activityDetail.description }}</text>
                </view>
            </view>

            <!-- 活动详情 -->
            <view class="content-section">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">活动详情</text>
                </view>
                <view class="section-content">
                    <rich-text :nodes="activityDetail.content" class="rich-content"></rich-text>
                </view>
            </view>

            <!-- 招募信息 -->
            <view class="content-section">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">招募信息</text>
                </view>
                <view class="recruitment-info">
                    <view class="info-item">
                        <text class="info-label">招募人数：</text>
                        <text class="info-value">{{ activityDetail.recruitCount }}人</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">已报名人数：</text>
                        <text class="info-value">{{ activityDetail.signedCount }}人</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">服务时长：</text>
                        <text class="info-value">{{ activityDetail.serviceHours }}小时</text>
                    </view>
                    <view class="info-item" v-if="activityDetail.activityPoints && activityDetail.activityPoints > 0">
                        <text class="info-label">可获得积分：</text>
                        <text class="info-value points-highlight">{{ activityDetail.activityPoints }}分</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">报名截止：</text>
                        <text class="info-value">{{ activityDetail.deadline }}</text>
                    </view>
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="content-section">
                <view class="section-title">
                    <view class="title-decoration"></view>
                    <text class="title-text">联系方式</text>
                </view>
                <view class="contact-info">
                    <view class="contact-item">
                        <u-icon name="phone" color="#666" size="24"></u-icon>
                        <text class="contact-text">{{ activityDetail.contactPhone }}</text>
                    </view>
                    <view class="contact-item">
                        <u-icon name="account" color="#666" size="24"></u-icon>
                        <text class="contact-text">{{ activityDetail.contactPerson }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-actions">
            <!-- 已全部报名状态 -->
            <view v-if="shouldShowFullySignedStatus" class="signed-up-btn" @click="showSignupDetail">
                <u-icon name="checkmark-circle" color="#4CAF50" size="24"></u-icon>
                <text class="signed-up-text">已全部报名</text>
            </view>
            
            <!-- 部分报名状态 -->
            <view v-else-if="shouldShowPartialSignedStatus" class="partial-signed-container">
                <view class="partial-signed-btn" @click="showSignupDetail">
                    <u-icon name="info-circle" color="#FF9800" size="24"></u-icon>
                    <text class="partial-signed-text">已报名{{ signupStatus.signedVolunteerIds.length }}/{{ totalVolunteerCount }}人</text>
                </view>
                <view class="continue-signup-btn" @click="handleSignUp">
                    <text class="continue-signup-text">继续报名</text>
                </view>
            </view>
            
            <!-- 立即报名按钮 -->
            <view v-else-if="shouldShowSignupButton" class="signup-btn" @click="handleSignUp">
                <text class="signup-text">立即报名</text>
            </view>
            
            <!-- 其他状态按钮 -->
            <view v-else-if="activityDetail.status === '已结束'" class="disabled-btn">
                <text class="disabled-text">活动已结束</text>
            </view>
            <view v-else-if="activityDetail.status === '进行中'" class="disabled-btn">
                <text class="disabled-text">活动进行中</text>
            </view>
            <view v-else-if="activityDetail.isFull" class="disabled-btn">
                <text class="disabled-text">活动已满员</text>
            </view>
            <view v-else class="disabled-btn">
                <text class="disabled-text">报名未开始</text>
            </view>
        </view>

        <!-- 报名明细弹窗 -->
        <view v-if="showSignupDetailModal" class="signup-detail-modal" @click="closeSignupDetail">
            <view class="modal-content" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">我的报名状态</text>
                    <view class="close-btn" @click="closeSignupDetail">
                        <u-icon name="close" color="#666" size="32"></u-icon>
                    </view>
                </view>
                <view class="modal-body">
                    <view v-if="volunteerSignupList.length > 0" class="volunteer-list">
                        <view 
                            v-for="volunteer in volunteerSignupList" 
                            :key="volunteer.id"
                            class="volunteer-item"
                        >
                            <view class="volunteer-info">
                                <image 
                                    v-if="volunteer.avatar" 
                                    :src="volunteer.avatar" 
                                    class="volunteer-avatar"
                                    mode="aspectFill"
                                ></image>
                                <view v-else class="volunteer-avatar-placeholder">
                                    <text class="avatar-text">{{ volunteer.name?.charAt(0) || '志' }}</text>
                                </view>
                                <text class="volunteer-name">{{ volunteer.name }}</text>
                            </view>
                            <view v-if="volunteer.isSignedUp" class="status-signed">
                                <u-icon name="checkmark-circle-fill" color="#4CAF50" size="24"></u-icon>
                                <text class="status-text">已报名</text>
                            </view>
                            <view v-else class="status-unsigned">
                                <u-icon name="close-circle" color="#E0E0E0" size="24"></u-icon>
                                <text class="status-text">未报名</text>
                            </view>
                        </view>
                    </view>
                    <view v-else class="empty-state">
                        <text class="empty-text">暂无小雷锋</text>
                    </view>
                </view>
                <view class="modal-footer" v-if="hasUnsignedVolunteers && activityDetail.status === '报名中' && !activityDetail.isFull">
                    <view class="footer-btn continue-btn" @click="handleContinueSignup">
                        <text class="footer-btn-text">继续报名</text>
                    </view>
                </view>
            </view>
        </view>

    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { checkLoginAndRedirect } from '@/utils/auth'
import { getActivityDetail, signupActivity, checkSignupStatus as checkSignupStatusApi, type ActivityDetail } from '@/api/activity'
import StatusStamp from '@/components/StatusStamp/index.vue'
import { useUserInfo } from '@/hooks/user'
import { computed } from 'vue'

// 活动详情数据
const activityDetail = ref<ActivityDetail>({
    id: '',
    title: '',
    coverImage: '',
    content: '',
    description: '',
    activityDate: '',
    startTime: '',
    endTime: '',
    location: '',
    recruitCount: 0,
    signedCount: 0,
    serviceHours: 0,
    signupDeadline: '',
    status: '',
    contactPerson: '',
    contactPhone: '',
    orgId: '',
    createTime: '',
    isFull: false,
    remainingCount: 0,
    signupProgress: 0,
    // 格式化后的显示字段
    date: '',
    time: '',
    deadline: '',
    image: ''
})

// 加载状态
const loading = ref(false)
const activityId = ref('')

// 用户信息
const { userInfo } = useUserInfo()

// 移除了报名弹窗相关状态

// 报名状态
const signupStatus = ref<{
    isSignedUp: boolean
    signedVolunteerIds: string[]
    signupInfo: any
}>({
    isSignedUp: false,
    signedVolunteerIds: [],
    signupInfo: null
})

// 报名明细弹窗
const showSignupDetailModal = ref(false)

// 志愿者列表（用于监护人）
const volunteerList = ref<any[]>([])

// 总志愿者数量
const totalVolunteerCount = computed(() => {
    if (userInfo.value?.type === 'guardian') {
        return volunteerList.value.length
    }
    return 1 // 非监护人只有自己
})

// 志愿者报名列表（带状态）
const volunteerSignupList = computed(() => {
    if (userInfo.value?.type === 'guardian') {
        return volunteerList.value.map(volunteer => ({
            id: volunteer.id,
            name: volunteer.name || volunteer.nickname,
            avatar: volunteer.avatar,
            isSignedUp: signupStatus.value.signedVolunteerIds.includes(volunteer.id)
        }))
    } else {
        // 非监护人，显示自己的状态
        return [{
            id: userInfo.value?.id || '',
            name: userInfo.value?.name || userInfo.value?.nickname || '我',
            avatar: userInfo.value?.avatar,
            isSignedUp: signupStatus.value.isSignedUp
        }]
    }
})

// 是否有未报名的志愿者
const hasUnsignedVolunteers = computed(() => {
    return volunteerSignupList.value.some(v => !v.isSignedUp)
})

// 获取活动状态样式类
const getActivityStatusClass = () => {
    const status = activityDetail.value.status
    switch (status) {
        case '报名中':
            return 'status-recruiting'
        case '进行中':
            return 'status-ongoing'
        case '已结束':
            return 'status-ended'
        default:
            return 'status-default'
    }
}

// 获取活动详情
const loadActivityDetail = async () => {
    if (!activityId.value) return
    
    loading.value = true
    try {
        const data = await getActivityDetail({ id: activityId.value })
        activityDetail.value = data
        
        // 格式化数据显示
        formatActivityData()
        
        // 加载志愿者列表（监护人）
        if (userInfo.value?.type === 'guardian') {
            await loadVolunteerList()
        }
        
        // 检查报名状态
        if (userInfo.value?.id) {
            await checkSignupStatus()
        }
    } catch (error) {
        console.error('获取活动详情失败:', error)
        uni.$u.toast('获取活动详情失败')
    } finally {
        loading.value = false
    }
}

// 加载志愿者列表（监护人）
const loadVolunteerList = async () => {
    if (userInfo.value?.type !== 'guardian') return
    
    try {
        const { getVolunteerList } = await import('@/api/user')
        volunteerList.value = await getVolunteerList()
    } catch (error) {
        console.error('获取小雷锋列表失败:', error)
    }
}

// 检查报名状态
const checkSignupStatus = async () => {
    if (!userInfo.value?.id || !activityId.value) {
        console.log('检查报名状态：缺少必要参数', {
            userId: userInfo.value?.id,
            activityId: activityId.value
        })
        return
    }
    
    try {
        console.log('开始检查报名状态:', {
            activityId: activityId.value,
            userId: userInfo.value.id,
            userType: userInfo.value.type
        })
        
        const status = await checkSignupStatusApi({
            activityId: activityId.value,
            userId: userInfo.value.id
        })
        
        console.log('报名状态检查结果:', status)
        signupStatus.value = status
        
        // 验证状态更新
        console.log('报名状态已更新:', {
            isSignedUp: signupStatus.value.isSignedUp,
            signedVolunteerIds: signupStatus.value.signedVolunteerIds,
            signupInfo: signupStatus.value.signupInfo
        })
    } catch (error) {
        console.error('检查报名状态失败:', error)
    }
}

// 显示报名明细弹窗
const showSignupDetail = () => {
    showSignupDetailModal.value = true
}

// 关闭报名明细弹窗
const closeSignupDetail = () => {
    showSignupDetailModal.value = false
}

// 继续报名
const handleContinueSignup = () => {
    closeSignupDetail()
    handleSignUp()
}

// 格式化活动数据
const formatActivityData = () => {
    // 格式化日期时间
    if (activityDetail.value.activityDate) {
        activityDetail.value.date = formatDate(activityDetail.value.activityDate)
    }
    
    // 格式化时间
    if (activityDetail.value.startTime && activityDetail.value.endTime) {
        // 提取时间部分，格式为 "HH:mm"
        const startTime = activityDetail.value.startTime.split(' ')[1] || activityDetail.value.startTime
        const endTime = activityDetail.value.endTime.split(' ')[1] || activityDetail.value.endTime
        activityDetail.value.time = `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`
    }
    
    // 格式化报名截止时间
    if (activityDetail.value.signupDeadline) {
        activityDetail.value.deadline = formatDateTime(activityDetail.value.signupDeadline)
    }
    
    // 格式化状态显示
    activityDetail.value.status = formatStatus(activityDetail.value.status)
    
    // 设置图片
    if (!activityDetail.value.coverImage) {
        activityDetail.value.image = '/static/images/bg_hometop.png'
    } else {
        activityDetail.value.image = activityDetail.value.coverImage
    }
    
    // 设置描述信息（如果没有description，则使用content的前100个字符）
    if (!activityDetail.value.description && activityDetail.value.content) {
        // 去除HTML标签，提取纯文本
        const plainText = activityDetail.value.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        activityDetail.value.description = plainText.length > 100 
            ? plainText.substring(0, 100) + '...' 
            : plainText
    }
    
    // 计算是否已满员
    activityDetail.value.isFull = activityDetail.value.signedCount >= activityDetail.value.recruitCount
    
    // 计算剩余名额
    activityDetail.value.remainingCount = Math.max(0, activityDetail.value.recruitCount - activityDetail.value.signedCount)
    
    // 计算报名进度
    activityDetail.value.signupProgress = activityDetail.value.recruitCount > 0 
        ? Math.round((activityDetail.value.signedCount / activityDetail.value.recruitCount) * 100)
        : 0
    
    // 解析扩展信息中的配置
    if (activityDetail.value.extJson) {
        try {
            const extInfo = JSON.parse(activityDetail.value.extJson)
            activityDetail.value.allowResignup = extInfo.allowResignup || false
            activityDetail.value.peerCountOccupiesQuota = extInfo.peerCountOccupiesQuota !== false
            activityDetail.value.activityPoints = extInfo.activityPoints || 0 // 解析活动积分
        } catch (e) {
            activityDetail.value.allowResignup = false
            activityDetail.value.peerCountOccupiesQuota = true
            activityDetail.value.activityPoints = 0
        }
    } else {
        activityDetail.value.allowResignup = false
        activityDetail.value.peerCountOccupiesQuota = true
        activityDetail.value.activityPoints = 0
    }
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化时间
const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    return timeStr.substring(0, 5)
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    if (isNaN(date.getTime())) return ''
    const timePart = dateTimeStr.split(' ')[1] || ''
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${timePart.substring(0, 5)}`
}

// 格式化状态
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

// 页面加载时获取活动ID
onLoad((options?: any) => {
    if (options?.id) {
        activityId.value = options.id
        loadActivityDetail()
    } else {
        uni.$u.toast('活动ID不能为空')
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }
})

// 页面显示时刷新报名状态（从报名页面返回时）
onShow(() => {
    console.log('=== 页面显示，刷新报名状态 ===')
    if (userInfo.value?.id && activityId.value) {
        // 重新检查报名状态
        checkSignupStatus()
        // 刷新活动详情（更新已报名人数）
        loadActivityDetail()
    }
})

// 立即报名
const handleSignUp = () => {
    // 检查登录状态
    if (!checkLoginAndRedirect()) {
        console.log('用户未登录，应该跳转到登录页面')
        return
    }
    
    // 跳转到报名填写表单页面
    uni.navigateTo({
        url: `/pages/activity/signup?activityId=${activityId.value}`
    })
}

// 判断是否显示已全部报名状态
const shouldShowFullySignedStatus = computed(() => {
    // 活动状态必须是报名中
    if (activityDetail.value.status !== '报名中') {
        console.log('shouldShowFullySignedStatus: 活动状态不是报名中', activityDetail.value.status)
        return false
    }
    
    // 用户未登录，不显示
    if (!userInfo.value?.id) {
        console.log('shouldShowFullySignedStatus: 用户未登录')
        return false
    }
    
    if (userInfo.value.type === 'guardian') {
        // 监护人：所有小雷锋都已报名
        const result = volunteerList.value.length > 0 && 
               signupStatus.value.signedVolunteerIds.length === volunteerList.value.length
        console.log('shouldShowFullySignedStatus (监护人):', {
            volunteerCount: volunteerList.value.length,
            signedCount: signupStatus.value.signedVolunteerIds.length,
            result
        })
        return result
    } else {
        // 非监护人：自己已报名
        const result = signupStatus.value.isSignedUp
        console.log('shouldShowFullySignedStatus (非监护人):', {
            isSignedUp: signupStatus.value.isSignedUp,
            result
        })
        return result
    }
})

// 判断是否显示部分报名状态（仅监护人）
const shouldShowPartialSignedStatus = computed(() => {
    // 活动状态必须是报名中
    if (activityDetail.value.status !== '报名中') {
        return false
    }
    
    // 只有监护人才有部分报名状态
    if (userInfo.value?.type !== 'guardian') {
        return false
    }
    
    // 有小雷锋，且部分已报名（不是全部，也不是0个）
    const signedCount = signupStatus.value.signedVolunteerIds.length
    const totalCount = volunteerList.value.length
    
    return totalCount > 0 && signedCount > 0 && signedCount < totalCount
})

// 判断是否应该显示报名按钮
const shouldShowSignupButton = computed(() => {
    // 活动状态不是报名中，不显示
    if (activityDetail.value.status !== '报名中') {
        console.log('shouldShowSignupButton: 活动状态不是报名中')
        return false
    }
    
    // 用户未登录，显示（会引导登录）
    if (!userInfo.value?.id) {
        console.log('shouldShowSignupButton: 用户未登录，显示报名按钮')
        return true
    }
    
    // 活动已满员，不显示
    if (activityDetail.value.isFull) {
        console.log('shouldShowSignupButton: 活动已满员')
        return false
    }
    
    if (userInfo.value.type === 'guardian') {
        // 监护人：没有小雷锋或所有小雷锋都已报名，不显示
        if (volunteerList.value.length === 0) {
            console.log('shouldShowSignupButton: 监护人无小雷锋')
            return false
        }
        const result = signupStatus.value.signedVolunteerIds.length < volunteerList.value.length
        console.log('shouldShowSignupButton (监护人):', {
            volunteerCount: volunteerList.value.length,
            signedCount: signupStatus.value.signedVolunteerIds.length,
            result
        })
        return result
    } else {
        // 非监护人：自己未报名时显示
        const result = !signupStatus.value.isSignedUp
        console.log('shouldShowSignupButton (非监护人):', {
            isSignedUp: signupStatus.value.isSignedUp,
            result
        })
        return result
    }
})
</script>

<style lang="scss" scoped>
.activity-detail {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding-bottom: 150rpx;
}

/* 状态栏 */
.status-bar {
    padding: 20rpx 32rpx;
    text-align: center;
    
    &.status-recruiting {
        background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    }
    
    &.status-ongoing {
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    }
    
    &.status-ended {
        background: linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%);
    }
    
    &.status-default {
        background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%);
    }
}

.status-text {
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: 600;
}

/* 活动头部 */
.activity-header {
    background-color: #FFFFFF;
    padding: 32rpx;
    margin-bottom: 16rpx;
}

.activity-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #212121;
    line-height: 1.4;
    margin-bottom: 16rpx;
}

.activity-meta {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16rpx;
}

.time-location-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    flex: 1;
    align-items: center;
}

.meta-item {
    display: flex;
    align-items: center;
    min-width: 180rpx;
}

.meta-text {
    color: #666666;
    font-size: 28rpx;
    margin-left: 12rpx;
}

/* 活动图片 */
.activity-image {
    margin-bottom: 16rpx;
}

.cover-image {
    width: 100%;
    height: 400rpx;
}

/* 活动内容 */
.activity-content {
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

.description-text {
    color: #666666;
    font-size: 28rpx;
    line-height: 1.6;
}

.rich-content {
    color: #666666;
    font-size: 28rpx;
    line-height: 1.6;
}

/* 招募信息 */
.recruitment-info {
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

.points-highlight {
    color: #FF6B6B;
    font-weight: bold;
    font-size: 32rpx;
}

/* 联系方式 */
.contact-info {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.contact-item {
    display: flex;
    align-items: center;
}

.contact-text {
    color: #666666;
    font-size: 28rpx;
    margin-left: 12rpx;
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
    z-index: 100;
}

/* 报名选择弹窗 */
.signup-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 1000;
}

.modal-content {
    background-color: #FFFFFF;
    border-radius: 32rpx 32rpx 0 0;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #212121;
}

.close-btn {
    padding: 8rpx;
}

.modal-footer {
    display: flex;
    gap: 24rpx;
    padding: 32rpx;
    border-top: 1rpx solid #f0f0f0;
}

.cancel-btn {
    flex: 1;
    padding: 24rpx;
    background-color: #F5F5F5;
    border-radius: 12rpx;
    text-align: center;
}

.cancel-text {
    color: #666666;
    font-size: 32rpx;
    font-weight: 500;
}

.confirm-btn {
    flex: 2;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    border-radius: 12rpx;
    text-align: center;
}

.confirm-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}

.signup-btn {
    flex: 1;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    border-radius: 12rpx;
    text-align: center;
}

.signup-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}

.signed-up-btn {
    flex: 1;
    padding: 24rpx;
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    border-radius: 12rpx;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.signed-up-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}

.disabled-btn {
    flex: 1;
    padding: 24rpx;
    background-color: #F5F5F5;
    border-radius: 12rpx;
    text-align: center;
}

.disabled-text {
    color: #999999;
    font-size: 32rpx;
    font-weight: 600;
}

/* 部分报名状态 */
.partial-signed-container {
    flex: 1;
    display: flex;
    gap: 12rpx;
}

.partial-signed-btn {
    flex: 1;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.partial-signed-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}

.continue-signup-btn {
    flex: 1;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    border-radius: 12rpx;
    text-align: center;
}

.continue-signup-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}

/* 报名明细弹窗 */
.signup-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 1000;
}

.modal-content {
    background-color: #FFFFFF;
    border-radius: 32rpx 32rpx 0 0;
    width: 100%;
    max-height: 70vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
}

.modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #212121;
}

.close-btn {
    padding: 8rpx;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24rpx 32rpx;
}

.volunteer-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.volunteer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background-color: #F8F8F8;
    border-radius: 16rpx;
    transition: all 0.3s ease;
}

.volunteer-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex: 1;
}

.volunteer-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: #E0E0E0;
}

.volunteer-avatar-placeholder {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}

.volunteer-name {
    font-size: 32rpx;
    color: #212121;
    font-weight: 500;
}

.status-signed {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background-color: #E8F5E9;
    border-radius: 20rpx;
}

.status-unsigned {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background-color: #F5F5F5;
    border-radius: 20rpx;
}

.status-text {
    font-size: 28rpx;
    color: #666666;
}

.status-signed .status-text {
    color: #4CAF50;
    font-weight: 500;
}

.empty-state {
    padding: 80rpx 0;
    text-align: center;
}

.empty-text {
    color: #999999;
    font-size: 28rpx;
}

.modal-footer {
    padding: 24rpx 32rpx;
    border-top: 1rpx solid #f0f0f0;
    flex-shrink: 0;
}

.footer-btn {
    width: 100%;
    padding: 24rpx;
    border-radius: 12rpx;
    text-align: center;
}

.continue-btn {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

.footer-btn-text {
    color: #FFFFFF;
    font-size: 32rpx;
    font-weight: 600;
}
</style>