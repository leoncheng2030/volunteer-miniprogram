<template>
    <view class="signup-container">
        <!-- 活动信息卡片 -->
        <view class="activity-card">
            <view class="activity-title">{{ activityInfo.title }}</view>
            <view class="activity-info">
                <view class="info-item">
                    <u-icon name="calendar" color="#666" size="20"></u-icon>
                    <text class="info-text">{{ activityInfo.date }}</text>
                </view>
                <view class="info-item">
                    <u-icon name="clock" color="#666" size="20"></u-icon>
                    <text class="info-text">{{ activityInfo.time }}</text>
                </view>
                <view class="info-item">
                    <u-icon name="map" color="#666" size="20"></u-icon>
                    <text class="info-text">{{ activityInfo.location }}</text>
                </view>
            </view>
        </view>

        <!-- 报名表单 -->
        <view class="form-section">
            <view class="section-title">报名信息</view>
            
            <!-- 选择报名类型 - 监护人只能为小雷锋报名 -->
            <view class="form-item" v-if="userInfo?.type !== 'guardian'">
                <view class="item-label-inline">报名类型</view>
                <view class="radio-group">
                    <view 
                        class="radio-item"
                        :class="{ active: signupType === 'self' }"
                        @click="selectSignupType('self')"
                    >
                        <view class="radio-dot">
                            <view class="radio-inner" v-if="signupType === 'self'"></view>
                        </view>
                        <text class="radio-text">自己报名</text>
                    </view>
                </view>
            </view>

            <!-- 选择具体人员（为小雷锋报名时显示） -->
            <view class="form-item" v-if="signupType === 'volunteer'">
                <view class="item-label-inline">选择小雷锋</view>
                <view class="user-selector" @click="showUserSelector">
                    <view class="selected-users" v-if="selectedUsers.length > 0">
                        <AvatarGroup 
                            :userList="selectedUsers"
                            :activeIds="selectedUserIds"
                            size="small"
                            @click="handleSelectedUserClick"
                        />
                        <text class="selected-count">已选择{{ selectedUsers.length }}位</text>
                    </view>
                    <view class="placeholder" v-else>
                        <text class="placeholder-text">请选择小雷锋</text>
                    </view>
                    <u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
                </view>
            </view>

            <!-- 联系电话 -->
            <view class="form-item">
                <view class="item-label-inline">联系电话</view>
                <u-input 
                    v-model="formData.phone"
                    placeholder="请输入联系电话"
                    type="number"
                    :maxlength="11"
                    input-align="right"
                />
            </view>

            <view class="form-item">
                <view class="item-label-inline">同行人数</view>
                <view class="peer-input-container">
                    <u-input 
                        v-model="formData.peerNumber"
                        placeholder="请输入同行人数"
                        type="number"
                        :maxlength="11"
                        input-align="right"
                    />
                    <view class="peer-hint">
                        <text class="hint-text">
                            {{ activityInfo.peerCountOccupiesQuota ? '占用招募名额' : '不占用招募名额' }}
                        </text>
                    </view>
                </view>
            </view>

            <!-- 备注信息 -->
            <view class="form-item remark-item">
                <view class="item-label-inline">备注信息</view>
                <u-input 
                    v-model="formData.remark"
                    placeholder="请输入备注信息（选填）"
                    :maxlength="200"
                    height="120"
                />
            </view>
        </view>

        <!-- 保险信息 -->
        <view class="form-section">
            <view class="section-title">保险信息</view>
            <!-- 是否需要保险 -->
            <view class="form-item">
                <view class="item-label-inline">需要保险</view>
                <view class="radio-group">
                    <view 
                        class="radio-item"
                        :class="{ active: formData.needInsurance === true }"
                        @click="formData.needInsurance = true"
                    >
                        <view class="radio-dot">
                            <view class="radio-inner" v-if="formData.needInsurance === true"></view>
                        </view>
                        <text class="radio-text">是</text>
                    </view>
                    <view 
                        class="radio-item"
                        :class="{ active: formData.needInsurance === false }"
                        @click="formData.needInsurance = false"
                    >
                        <view class="radio-dot">
                            <view class="radio-inner" v-if="formData.needInsurance === false"></view>
                        </view>
                        <text class="radio-text">否</text>
                    </view>
                </view>
            </view>

            <!-- 保险类型（如果需要保险） -->
            <view class="form-item" v-if="formData.needInsurance">
                <view class="item-label-inline">保险类型</view>
                <view class="select-container" @click.stop="showInsuranceActionSheet">
                    <text class="select-text">{{ selectedInsuranceType.label || '请选择保险类型' }}</text>
                    <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                </view>
            </view>

        </view>

        <!-- 提交按钮 -->
        <view class="submit-section">
            <button 
                class="submit-btn"
                @click="handleSubmit"
                :disabled="submitLoading"
            >
                {{ submitLoading ? '提交中...' : '提交报名' }}
            </button>
        </view>

        <!-- 小雷锋选择弹窗 -->
        <view v-if="showUserModal" class="user-modal" @click="closeUserModal">
            <view class="modal-content" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">选择小雷锋</text>
                    <view class="close-btn" @click="closeUserModal">
                        <u-icon name="close" color="#666" size="32"></u-icon>
                    </view>
                </view>
                <SignupSelector 
                    v-model="selectedUserIds" 
                    :signed-volunteer-ids="signedVolunteerIds"
                    @select="handleUserSelect"
                />
                <view class="modal-footer">
                    <view class="confirm-btn" @click="confirmUserSelect">
                        <text class="confirm-text">确定</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 保险类型选择弹窗 -->
        <view v-if="showInsuranceSheet" class="insurance-modal" @click="closeInsuranceSheet">
            <view class="insurance-content" @click.stop>
                <view class="insurance-header">
                    <text class="insurance-title">选择保险类型</text>
                    <view class="insurance-close" @click="closeInsuranceSheet">
                        <u-icon name="close" color="#666" size="32"></u-icon>
                    </view>
                </view>
                <view class="insurance-list">
                    <view 
                        v-for="(type, index) in insuranceTypes" 
                        :key="index"
                        class="insurance-item"
                        @click="selectInsuranceType(type)"
                    >
                        <text class="insurance-name">{{ type.label }}</text>
                        <view class="insurance-radio" :class="{ active: selectedInsuranceType.value === type.value }">
                            <view class="radio-dot" v-if="selectedInsuranceType.value === type.value"></view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { checkLoginAndRedirect } from '@/utils/auth'
import { getActivityDetail, signupActivity, batchSignupActivity, checkSignupStatus as checkSignupStatusApi } from '@/api/activity'
import { getVolunteerList } from '@/api/user'
import SignupSelector from '@/components/SignupSelector/index.vue'
import AvatarGroup from '@/components/AvatarGroup/index.vue'
import { useUserInfo } from '@/hooks/user'
import { showToast } from '@/utils'

// 活动信息
const activityInfo = ref({
    id: '',
    title: '',
    date: '',
    time: '',
    location: '',
    recruitCount: 0,
    signedCount: 0,
    peerCountOccupiesQuota: true // 默认占用名额
})

// 用户信息
const { userInfo } = useUserInfo()

// 表单数据
const formData = ref({
    phone: '',
    remark: '',
    needInsurance: false,
    insuranceType: '',
    peerNumber:'0'
})

// 保险类型选项
const insuranceTypes = ref([
    { label: '意外伤害保险', value: 'accident' },
    { label: '医疗保险', value: 'medical' },
    { label: '综合保险', value: 'comprehensive' }
])

// 选中的保险类型
const selectedInsuranceType = ref({} as any)

// 报名类型（监护人默认为小雷锋报名，其他用户默认自己报名）
const signupType = ref<'self' | 'volunteer'>('self')

// 用户选择相关
const showUserModal = ref(false)
const selectedUserIds = ref<string[]>([])
const selectedUsers = ref<any[]>([])
const volunteerList = ref([])
const signedVolunteerIds = ref<string[]>([])

// 提交状态
const submitLoading = ref(false)
const activityId = ref('')

// 页面加载
onLoad((options?: any) => {
    if (options?.activityId) {
        activityId.value = options.activityId
        
        // 监护人默认为小雷锋报名模式
        if (userInfo.value?.type === 'guardian') {
            signupType.value = 'volunteer'
        }
        
        loadActivityInfo()
        loadVolunteerList()
        checkSignedStatus()
        // 设置默认信息
        setDefaultInfo()
    } else {
        showToast('活动ID不能为空')
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }
})

// 设置默认信息
const setDefaultInfo = () => {
    console.log('用户信息:', userInfo.value)
    
    if (userInfo.value?.phone) {
        formData.value.phone = userInfo.value.phone
        console.log('设置默认联系电话:', userInfo.value.phone)
    } else {
        console.log('用户信息中没有电话号码')
    }
    
    console.log('表单数据:', formData.value)
}

// 加载活动信息
const loadActivityInfo = async () => {
    try {
        const data = await getActivityDetail({ id: activityId.value })
        
        // 解析活动扩展信息
        let peerCountOccupiesQuota = true // 默认占用名额
        if (data.extJson) {
            try {
                const extInfo = JSON.parse(data.extJson)
                peerCountOccupiesQuota = extInfo.peerCountOccupiesQuota !== false // 明确设置为false才不占用
            } catch (e) {
                console.warn('解析活动扩展信息失败:', e)
            }
        }
        
        activityInfo.value = {
            id: data.id,
            title: data.title,
            date: formatDate(data.activityDate),
            time: formatTimeRange(data.startTime, data.endTime),
            location: data.location,
            recruitCount: data.recruitCount,
            signedCount: data.signedCount,
            peerCountOccupiesQuota
        }
    } catch (error) {
        console.error('获取活动信息失败:', error)
        showToast('获取活动信息失败')
    }
}

// 加载小雷锋列表
const loadVolunteerList = async () => {
    if (userInfo.value?.type === 'guardian') {
        try {
            volunteerList.value = await getVolunteerList()
        } catch (error) {
            console.error('获取小雷锋列表失败:', error)
        }
    }
}

// 检查已报名状态
const checkSignedStatus = async () => {
    if (!userInfo.value?.id) return
    
    try {
        const status = await checkSignupStatusApi({
            activityId: activityId.value,
            userId: userInfo.value.id
        })
        signedVolunteerIds.value = status.signedVolunteerIds || []
    } catch (error) {
        console.error('检查报名状态失败:', error)
    }
}

// 选择报名类型
const selectSignupType = (type: 'self' | 'volunteer') => {
    signupType.value = type
    if (type === 'self') {
        // 自己报名时，直接设置选中用户为自己
        selectedUsers.value = [{
            id: userInfo.value!.id,
            name: userInfo.value!.name || userInfo.value!.nickname || '我',
            type: 'self',
            avatar: userInfo.value!.avatar
        }]
        selectedUserIds.value = [userInfo.value!.id]
    } else {
        // 为小雷锋报名时，清空选中状态
        selectedUsers.value = []
        selectedUserIds.value = []
    }
}

// 显示用户选择器
const showUserSelector = () => {
    if (signupType.value === 'volunteer') {
        showUserModal.value = true
    }
}

// 关闭用户选择弹窗
const closeUserModal = () => {
    showUserModal.value = false
}

// 处理用户选择
const handleUserSelect = (user: any) => {
    console.log('选择用户:', user)
}

// 处理已选中用户点击
const handleSelectedUserClick = (user: any, index: number) => {
    console.log('点击已选中用户:', user, '索引:', index)
    // 可以在这里添加取消选择的逻辑
    uni.showActionSheet({
        itemList: ['取消选择'],
        success: (res) => {
            if (res.tapIndex === 0) {
                // 取消选择该用户
                const idx = selectedUserIds.value.indexOf(user.id)
                if (idx > -1) {
                    selectedUserIds.value.splice(idx, 1)
                    selectedUsers.value.splice(index, 1)
                }
            }
        }
    })
}

// 确认用户选择
const confirmUserSelect = () => {
    if (selectedUserIds.value.length === 0) {
        showToast('请选择小雷锋')
        return
    }

    // 找到选中的小雷锋信息
    const volunteers = volunteerList.value.filter((v: any) => selectedUserIds.value.includes(v.id))
    selectedUsers.value = volunteers.map(v => ({
        id: v.id,
        name: v.name || v.nickname,
        type: 'volunteer',
        avatar: v.avatar
    }))

    closeUserModal()
}

// 保险类型相关
const showInsuranceSheet = ref(false)

// 显示保险类型选择弹窗
const showInsuranceActionSheet = () => {
    console.log('显示保险类型选择弹窗', insuranceTypes.value)
    showInsuranceSheet.value = true
}

// 关闭保险类型选择弹窗
const closeInsuranceSheet = () => {
    console.log('关闭保险类型选择弹窗')
    showInsuranceSheet.value = false
}

// 选择保险类型
const selectInsuranceType = (type: any) => {
    console.log('选择保险类型:', type)
    selectedInsuranceType.value = {
        label: type.label,
        value: type.value
    }
    formData.value.insuranceType = type.value
    closeInsuranceSheet()
}

// 提交报名
const handleSubmit = async () => {
    // 验证表单
    if (userInfo.value?.type === 'guardian') {
        // 监护人必须为小雷锋报名
        if (selectedUsers.value.length === 0) {
            showToast('请选择小雷锋')
            return
        }
    } else if (signupType.value === 'self') {
        // 非监护人自己报名时，设置选中用户为自己
        selectedUsers.value = [{
            id: userInfo.value!.id,
            name: userInfo.value!.name || userInfo.value!.nickname || '我',
            type: 'self',
            avatar: userInfo.value!.avatar
        }]
    } else if (selectedUsers.value.length === 0) {
        showToast('请选择小雷锋')
        return
    }

    if (!formData.value.phone) {
        showToast('请输入联系电话')
        return
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
        showToast('请输入正确的手机号')
        return
    }

    // 如果需要保险，验证相关信息
    if (formData.value.needInsurance) {
        if (!formData.value.insuranceType) {
            showToast('请选择保险类型')
            return
        }
    }

    submitLoading.value = true

    try {
        uni.showLoading({
            title: '提交中...'
        })

        // 使用批量报名接口
        const params = {
            activityId: activityId.value,
            signupUserId: userInfo.value!.id,
            phone: formData.value.phone,
            remark: formData.value.remark,
            needInsurance: formData.value.needInsurance,
            insuranceType: formData.value.insuranceType,
            peerNumber: parseInt(formData.value.peerNumber) || 0,
            actualUsers: selectedUsers.value.map(user => ({
                userId: user.id,
                userName: user.name,
                userType: user.type
            }))
        }

        console.log('=== 开始提交报名 ===')
        console.log('报名参数:', JSON.stringify(params, null, 2))
        console.log('选中用户:', selectedUsers.value)

        const result = await batchSignupActivity(params)

        console.log('=== 报名结果 ===')
        console.log('返回数据:', JSON.stringify(result, null, 2))

        uni.hideLoading()
        
        if (result.failedCount === 0) {
            // 全部成功
            const successMessage = selectedUsers.value.length > 1 
                ? `成功为${result.successCount}位小雷锋报名！`
                : '报名成功！'
            
            showToast(successMessage, 'success')
        } else if (result.successCount === 0) {
            // 全部失败
            console.error('所有用户报名失败')
            console.error('失败用户详情:', result.failedUsers)
            
            // 显示具体失败原因
            if (result.failedUsers && result.failedUsers.length > 0) {
                const firstFailReason = result.failedUsers[0].reason
                showToast(`报名失败: ${firstFailReason}`)
            } else {
                showToast('报名失败')
            }
            return // 不跳转，让用户查看错误信息
        } else {
            // 部分成功
            console.warn('部分用户报名失败:', result.failedUsers)
            showToast(`${result.successCount}位报名成功，${result.failedCount}位失败`)
        }

        // 延迟返回上一页
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)

    } catch (error: any) {
        console.error('=== 报名异常 ===')
        console.error('错误信息:', error)
        console.error('错误详情:', JSON.stringify(error, null, 2))
        
        uni.hideLoading()
        showToast(error.message || '报名失败')
    } finally {
        submitLoading.value = false
    }
}

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化时间范围
const formatTimeRange = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return ''
    const start = startTime.split(' ')[1] || startTime
    const end = endTime.split(' ')[1] || endTime
    return `${start.substring(0, 5)} - ${end.substring(0, 5)}`
}
</script>

<style lang="scss" scoped>
.signup-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 180rpx;
}

/* 活动信息卡片 */
.activity-card {
    background: #ffffff;
    margin: 24rpx;
    padding: 32rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.activity-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #212121;
    margin-bottom: 16rpx;
}

.activity-info {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
}

.info-item {
    display: flex;
    align-items: center;
    min-width: 180rpx;
}

.info-text {
    color: #666666;
    font-size: 26rpx;
    margin-left: 8rpx;
}

/* 表单部分 */
.form-section {
    background: #ffffff;
    margin: 24rpx;
    padding: 32rpx;
    border-radius: 16rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #212121;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.form-item {
    margin-bottom: 32rpx;
    display: flex;
    align-items: center;
    
    &:last-child {
        margin-bottom: 0;
    }
    
    .u-input {
        flex: 1;
    }
}

.item-label {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 16rpx;
    font-weight: 500;
}

.item-label-inline {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    margin-right: 24rpx;
    min-width: 140rpx;
    display: flex;
    align-items: center;
    height: 80rpx;
    line-height: 80rpx;
}

/* 单选组 */
.radio-group {
    display: flex;
    gap: 32rpx;
    flex: 1;
}

.radio-item {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
        border-color: #FF6B6B;
        background-color: #FFF5F5;
    }
}

.radio-dot {
    width: 32rpx;
    height: 32rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 50%;
    margin-right: 12rpx;
    position: relative;
    transition: all 0.3s ease;
    
    .radio-item.active & {
        border-color: #FF6B6B;
    }
}

.radio-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16rpx;
    height: 16rpx;
    background-color: #FF6B6B;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.radio-text {
    font-size: 28rpx;
    color: #333333;
    transition: all 0.3s ease;
    
    .radio-item.active & {
        color: #FF6B6B;
        font-weight: 500;
    }
}

/* 用户选择器 */
.user-selector {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    cursor: pointer;
}

.selected-users {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.selected-user-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 8rpx;
}

.selected-count {
    font-size: 24rpx;
    color: #FF6B6B;
    font-weight: 500;
}

.placeholder {
    flex: 1;
}

.placeholder-text {
    color: #999999;
    font-size: 28rpx;
}

/* 单选组 */
.radio-group {
    display: flex;
    gap: 32rpx;
}

.radio-item {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    cursor: pointer;
    
    &.active {
        border-color: #FF6B6B;
        background-color: #FFF5F5;
    }
}

.radio-dot {
    width: 32rpx;
    height: 32rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 50%;
    margin-right: 12rpx;
    position: relative;
    
    .radio-item.active & {
        border-color: #FF6B6B;
        
        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 16rpx;
            height: 16rpx;
            background-color: #FF6B6B;
            border-radius: 50%;
        }
    }
}

.radio-text {
    font-size: 28rpx;
    color: #333333;
    
    .radio-item.active & {
        color: #FF6B6B;
        font-weight: 500;
    }
}

/* 选择器 */
.select-container {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    cursor: pointer;
}

.select-text {
    font-size: 28rpx;
    color: #333333;
}

/* 提交按钮 */
.submit-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30rpx;
    background: #ffffff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: #ffffff;
    border: none;
}

.submit-btn::after {
    border: none;
}

.submit-btn:active {
    opacity: 0.8;
}

/* 用户选择弹窗 */
.user-modal {
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
    padding: 32rpx;
    border-top: 1rpx solid #f0f0f0;
}

.confirm-btn {
    flex: 1;
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

/* 保险类型选择弹窗 */
.insurance-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom);
}

.insurance-content {
    background-color: #FFFFFF;
    border-radius: 32rpx 32rpx 0 0;
    width: 100%;
    max-height: 70vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.insurance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
}

.insurance-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #212121;
}

.insurance-close {
    padding: 16rpx;
    min-width: 64rpx;
    min-height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #f8f8f8;
    
    &:active {
        background-color: #e8e8e8;
    }
}

.insurance-list {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.insurance-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    cursor: pointer;
    min-height: 100rpx;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:active {
        background-color: #f8f8f8;
    }
}

.insurance-name {
    font-size: 32rpx;
    color: #333333;
    flex: 1;
    margin-right: 24rpx;
}

.insurance-radio {
    width: 44rpx;
    height: 44rpx;
    border: 2rpx solid #E0E0E0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.active {
        border-color: #FF6B6B;
        background-color: #FF6B6B;
    }
}

.insurance-radio .radio-dot {
    width: 18rpx;
    height: 18rpx;
    background-color: #FFFFFF;
    border-radius: 50%;
}

/* 同行人数输入容器 */
.peer-input-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .u-input {
        margin-bottom: 8rpx;
    }
}

.peer-hint {
    display: flex;
    align-items: center;
    padding-left: 8rpx;
}

.hint-text {
    font-size: 22rpx;
    color: #999999;
}

/* 备注信息特殊处理 */
.remark-item {
    align-items: flex-start !important;
    
    .item-label-inline {
        height: 120rpx;
        line-height: 120rpx;
    }
}
</style>
