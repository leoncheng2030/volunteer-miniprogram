<template>
    <view class="volunteer-detail-container">
        <!-- 自定义导航栏 -->
        <u-navbar title="小雷锋详情" :is-back="true" :border-bottom="false">
            <template #right>
                <text class="edit-btn" @click="goToEdit">编辑</text>
            </template>
        </u-navbar>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
            <u-loading mode="flower" size="40"></u-loading>
            <text class="loading-text">加载中...</text>
        </view>

        <!-- 详情内容 -->
        <view v-else>
            <!-- 头部信息卡片 -->
            <view class="header-card">
                <view class="avatar-section">
                    <image 
                        :src="volunteerInfo.avatar || defaultAvatar" 
                        class="avatar"
                        mode="aspectFill"
                    />
                    <view :class="['status-badge', getStatusClass(volunteerInfo)]">
                        {{ getStatusText(volunteerInfo) }}
                    </view>
                </view>
                <view class="name-section">
                    <text class="name">{{ volunteerInfo.name || '未知姓名' }}</text>
                    <text class="nickname" v-if="volunteerInfo.nickname">{{ volunteerInfo.nickname }}</text>
                </view>
            </view>

            <!-- 基本信息 -->
            <view class="info-section">
                <view class="section-title">基本信息</view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="label">性别</text>
                        <text class="value">{{ getGenderText(volunteerInfo.gender) }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">年龄</text>
                        <text class="value">{{ volunteerInfo.age || '-' }}岁</text>
                    </view>
                    <view class="info-item">
                        <text class="label">出生日期</text>
                        <text class="value">{{ volunteerInfo.birthday || '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">民族</text>
                        <text class="value">{{ volunteerInfo.nation || '-' }}</text>
                    </view>
                </view>
            </view>

            <!-- 学校信息 -->
            <view class="info-section">
                <view class="section-title">学校信息</view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="label">所在学校</text>
                        <text class="value">{{ volunteerInfo.school || '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">年级</text>
                        <text class="value">{{ volunteerInfo.grade || '-' }}</text>
                    </view>
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="info-section">
                <view class="section-title">联系方式</view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="label">手机号</text>
                        <text class="value">{{ volunteerInfo.phone || '-' }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getVolunteerDetail } from '@/api/user'
import type { IVolunteerInfo } from '@/types/user.d'

const loading = ref(true)
const volunteerId = ref('')
const defaultAvatar = '/static/images/default-avatar.png'

const volunteerInfo = ref<IVolunteerInfo>({
    id: '',
    name: '',
    nickname: '',
    gender: '',
    age: '',
    birthday: '',
    nation: '',
    school: '',
    grade: '',
    phone: '',
    avatar: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyAddress: '',
    homeAddress: '',
    mailingAddress: '',
    createTime: ''
})

// 获取性别文本
const getGenderText = (gender: string) => {
    if (!gender) return '未知'
    
    // 统一转为小写进行匹配
    const lowerGender = gender.toLowerCase()
    
    const genderMap: Record<string, string> = {
        '1': '男',
        '2': '女',
        '3': '保密',
        'male': '男',
        'female': '女',
        'unknown': '保密'
    }
    
    return genderMap[lowerGender] || '未知'
}

// 获取状态文本
const getStatusText = (volunteer: any) => {
    const status = volunteer.status?.toLowerCase().trim() || 
                  volunteer.userStatus?.toLowerCase().trim() || 
                  ''
    
    if (!status || status === 'active' || status === '1' || status === 'enable' || status === '启用') {
        return '活跃'
    } else {
        return '未激活'
    }
}

// 获取状态类名
const getStatusClass = (volunteer: any) => {
    const status = volunteer.status?.toLowerCase().trim() || 
                  volunteer.userStatus?.toLowerCase().trim() || 
                  ''
    
    if (!status || status === 'active' || status === '1' || status === 'enable' || status === '启用') {
        return 'active'
    } else {
        return 'inactive'
    }
}

// 跳转到编辑页面
const goToEdit = () => {
    // 只传递 ID，编辑页从接口获取数据
    uni.navigateTo({
        url: `/pages/user/edit-volunteer?id=${volunteerId.value}`
    })
}

// 加载志愿者详情
const loadVolunteerDetail = async () => {
    if (!volunteerId.value) {
        console.error('志愿者ID为空')
        return
    }
    
    loading.value = true
    try {
        console.log('开始获取志愿者详情, ID:', volunteerId.value)
        const response = await getVolunteerDetail(volunteerId.value)
        console.log('获取志愿者详情响应:', response)
        
        let data = response
        
        // 处理不同的响应结构
        if (response && response.data) {
            data = response.data
        }
        
        if (!data) {
            throw new Error('获取数据为空')
        }
        
        console.log('解析后的数据:', data)
        console.log('extJson:', data.extJson)
        console.log('college:', data.college)
        
        // 从 extJson 中解析 grade
        if (data.extJson) {
            try {
                const extData = typeof data.extJson === 'string' 
                    ? JSON.parse(data.extJson) 
                    : data.extJson
                data.grade = extData.grade || ''
                console.log('从 extJson 中解析到 grade:', data.grade)
            } catch (error) {
                console.error('解析 extJson 失败:', error)
            }
        }
        
        // 将 college 映射到 school
        if (data.college && !data.school) {
            data.school = data.college
            console.log('将 college 映射到 school:', data.school)
        }
        
        console.log('最终的 volunteerInfo:')
        console.log('  - school:', data.school)
        console.log('  - grade:', data.grade)
        
        volunteerInfo.value = data
    } catch (error) {
        console.error('加载志愿者详情失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

onLoad((options: any) => {
    console.log('接收到的参数:', options)
    
    if (options.id) {
        volunteerId.value = options.id
        // 直接加载数据
        loadVolunteerDetail()
    } else {
        uni.showToast({
            title: '缺少志愿者ID',
            icon: 'none'
        })
    }
})

// 页面显示时刷新数据
onShow(() => {
    console.log('志愿者详情页面显示，刷新数据')
    if (volunteerId.value) {
        loadVolunteerDetail()
    }
})
</script>

<style scoped lang="scss">
.volunteer-detail-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 40rpx;
}

.edit-btn {
    font-size: 28rpx;
    color: #ff6b6b;
    padding: 10rpx 20rpx;
}

/* 头部信息卡片 */
.header-card {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    padding: 60rpx 30rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-section {
    position: relative;
    margin-bottom: 20rpx;
}

.avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 6rpx solid rgba(255, 255, 255, 0.3);
    background-color: #ffffff;
}

.status-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    color: #ffffff;
    
    &.active {
        background: #52c41a;
    }
    
    &.inactive {
        background: #999999;
    }
}

.name-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.name {
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
}

.nickname {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
}

/* 信息区块 */
.info-section {
    background: #ffffff;
    margin: 20rpx 30rpx;
    border-radius: 16rpx;
    overflow: hidden;
}

.section-title {
    padding: 30rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    border-bottom: 1rpx solid #f0f0f0;
}

.info-list {
    padding: 0 30rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f8f9fa;
    
    &:last-child {
        border-bottom: none;
    }
}

.label {
    font-size: 28rpx;
    color: #666666;
}

.value {
    font-size: 28rpx;
    color: #333333;
    text-align: right;
    flex: 1;
    margin-left: 40rpx;
    word-break: break-all;
}

/* 加载状态 */
.loading-container {
    padding: 200rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999999;
}
</style>
