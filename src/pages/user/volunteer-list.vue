<template>
    <view class="volunteer-list-container">
        <!-- 搜索栏 -->
        <view class="search-section">
            <u-search 
                v-model="searchKeyword"
                placeholder="搜索小雷锋姓名或手机号"
                :show-action="false"
                bg-color="#f8f9fa"
                border-color="transparent"
                search-icon-color="#999"
                placeholder-color="#999"
                @search="handleSearch"
                @clear="handleClear"
            ></u-search>
        </view>

        <!-- 头部统计信息 -->
        <view class="header-stats">
            <view class="stats-card">
                <view class="stats-content">
                    <view class="stats-item">
                        <text class="stats-number">{{ volunteerList.length }}</text>
                        <text class="stats-label">小雷锋总数</text>
                    </view>
                    <view class="stats-divider"></view>
                    <view class="stats-item">
                        <text class="stats-number">{{ activeCount }}</text>
                        <text class="stats-label">活跃中</text>
                    </view>
                </view>
            </view>
        </view>
        <!-- 小雷锋列表 -->
        <view class="volunteer-list">
            <view 
                v-for="(volunteer, index) in filteredVolunteerList" 
                :key="volunteer.id"
                class="volunteer-card"
                @click="goToVolunteerDetail(volunteer)"
            >
                <view class="volunteer-content">
                    <view class="volunteer-avatar">
                        <view class="avatar-wrapper">
                            <image 
                                :src="volunteer.avatar || defaultAvatar" 
                                class="avatar-img"
                                mode="aspectFill"
                            />
                        </view>
                        <view :class="['status-badge', getStatusType(volunteer) === 'success' ? 'active' : 'inactive']">
                            {{ getStatusText(volunteer) }}
                        </view>
                    </view>
                    
                    <view class="volunteer-info">
                        <view class="volunteer-name">
                            <text class="name">{{ volunteer.name || volunteer.nickname || '未知姓名' }}</text>
                            <text class="nickname" v-if="volunteer.nickname && volunteer.name">（{{ volunteer.nickname }}）</text>
                        </view>
                        
                        <view class="info-tags">
                            <view class="info-tag">
                                <u-icon name="account" size="24" color="#ff6b6b"></u-icon>
                                <text class="tag-text">{{ volunteer.age }}岁</text>
                            </view>
                            <view class="info-tag">
                                <u-icon :name="volunteer.gender === 'male' ? 'man' : 'woman'" size="24" :color="volunteer.gender === 'male' ? '#1890ff' : '#ff6b9d'"></u-icon>
                                <text class="tag-text">{{ getGenderText(volunteer.gender) }}</text>
                            </view>
                            <view class="info-tag" v-if="volunteer.school">
                                <u-icon name="home" size="24" color="#52c41a"></u-icon>
                                <text class="tag-text">{{ volunteer.school }}</text>
                            </view>
                            <view class="info-tag" v-if="volunteer.grade">
                                <u-icon name="pushpin" size="24" color="#faad14"></u-icon>
                                <text class="tag-text">{{ volunteer.grade }}</text>
                            </view>
                        </view>
                        
                        <view class="volunteer-footer">
                            <text class="time-text">
                                <u-icon name="clock" size="20" color="#999"></u-icon>
                                {{ formatDate(volunteer.createTime) }}
                            </text>
                        </view>
                    </view>

                    <view class="volunteer-actions">
                        <u-icon name="arrow-right" size="32" color="#cccccc"></u-icon>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="filteredVolunteerList.length === 0 && !loading" class="empty-wrapper">
                <u-empty 
                    mode="data"
                    icon="/static/images/order_null.png"
                    :text="searchKeyword ? '未找到匹配的小雷锋' : '暂无小雷锋'"
                    :description="searchKeyword ? '请尝试其他搜索关键词' : '点击下方按钮添加第一个小雷锋'"
                ></u-empty>
            </view>

            <!-- 加载状态 -->
            <u-loadmore 
                v-if="loading" 
                status="loading" 
                :load-text="{ loading: '加载中...' }"
            ></u-loadmore>
        </view>

        <!-- 添加小雷锋按钮 -->
        <view class="add-button-container">
            <button 
                class="add-button"
                @click="goToAddVolunteer"
            >
                添加小雷锋
            </button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { getVolunteerList } from '@/api/user'
import type { IVolunteerInfo } from '@/types/user.d'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const volunteerList = ref<IVolunteerInfo[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const defaultAvatar = '/static/images/default-avatar.png'

// 计算活跃数量
const activeCount = computed(() => {
    // 处理不同的状态字段名
    return volunteerList.value.filter(v => {
        const status = v.status?.toLowerCase().trim() || 
                      v.userStatus?.toLowerCase().trim() || 
                      ''
        return !status || status === 'active' || status === '1' || status === 'enable' || status === '启用'
    }).length
})

// 过滤后的志愿者列表
const filteredVolunteerList = computed(() => {
    if (!searchKeyword.value.trim()) {
        return volunteerList.value
    }
    
    const keyword = searchKeyword.value.toLowerCase()
    return volunteerList.value.filter(volunteer => {
        const name = (volunteer.name || volunteer.nickname || '').toLowerCase()
        const phone = (volunteer.phone || '').toLowerCase()
        return name.includes(keyword) || phone.includes(keyword)
    })
})

// 搜索处理
const handleSearch = (value: string) => {
    searchKeyword.value = value
}

// 清除搜索
const handleClear = () => {
    searchKeyword.value = ''
}

// 获取小雷锋列表
const fetchVolunteerList = async () => {
    if (userInfo.value?.type !== 'guardian') {
        uni.showToast({
            title: '仅监护人可查看',
            icon: 'none'
        })
        return
    }

    loading.value = true
    try {
        const response = await getVolunteerList()
        console.log('获取小雷锋列表原始响应:', response)
        
        // 处理不同的数据结构
        let volunteerData = []
        if (response) {
            if (Array.isArray(response)) {
                // 直接返回数组
                volunteerData = response
            } else if (response.data && Array.isArray(response.data)) {
                // 包装在data字段中
                volunteerData = response.data
            } else if (response.list && Array.isArray(response.list)) {
                // 包装在list字段中
                volunteerData = response.list
            } else if (response.records && Array.isArray(response.records)) {
                // 分页数据结构
                volunteerData = response.records
            }
        }
        
        // 处理每个志愿者数据，从 extJson 中解析 grade
        volunteerData = volunteerData.map((volunteer: any) => {
            console.log(`处理志愿者: ${volunteer.name}, extJson:`, volunteer.extJson)
            
            if (volunteer.extJson) {
                try {
                    const extData = typeof volunteer.extJson === 'string' 
                        ? JSON.parse(volunteer.extJson) 
                        : volunteer.extJson
                    volunteer.grade = extData.grade || ''
                    console.log(`  解析到 grade: ${volunteer.grade}`)
                } catch (error) {
                    console.error(`  解析 extJson 失败:`, error)
                }
            }
            
            // 将 college 映射到 school
            if (volunteer.college && !volunteer.school) {
                volunteer.school = volunteer.college
                console.log(`  将 college 映射到 school: ${volunteer.school}`)
            }
            
            return volunteer
        })
        
        console.log('处理后的小雷锋数据:', volunteerData)
        volunteerList.value = volunteerData
        
        if (volunteerData.length === 0) {
            console.log('小雷锋列表为空')
        }
        
    } catch (error) {
        console.error('获取小雷锋列表失败:', error)
        uni.showToast({
            title: '获取数据失败',
            icon: 'none'
        })
        volunteerList.value = []
    } finally {
        loading.value = false
    }
}

// 获取性别文本
const getGenderText = (gender: string) => {
    const genderMap: Record<string, string> = {
        'male': '男',
        'female': '女',
        '1': '男',
        '2': '女'
    }
    return genderMap[gender] || '未知'
}

// 格式化日期
const formatDate = (dateString: string) => {
    if (!dateString) return '未知'
    try {
        const date = new Date(dateString)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    } catch {
        return dateString
    }
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

// 获取状态类型
const getStatusType = (volunteer: any) => {
    const status = volunteer.status?.toLowerCase().trim() || 
                  volunteer.userStatus?.toLowerCase().trim() || 
                  ''
    
    if (!status || status === 'active' || status === '1' || status === 'enable' || status === '启用') {
        return 'success'
    } else {
        return 'info'
    }
}

// 跳转到小雷锋详情
const goToVolunteerDetail = (volunteer: IVolunteerInfo) => {
    // 只传递 ID，详情页从接口获取最新数据
    uni.navigateTo({
        url: `/pages/user/volunteer-detail?id=${volunteer.id}`
    })
}

// 跳转到添加小雷锋页面
const goToAddVolunteer = () => {
    uni.navigateTo({
        url: '/pages/user/add-volunteer'
    })
}

onMounted(() => {
    fetchVolunteerList()
    
    // 设置下拉刷新
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
        currentPage.onPullDownRefresh = () => {
            fetchVolunteerList().finally(() => {
                uni.stopPullDownRefresh()
            })
        }
    }
})

// 页面显示时刷新数据
onShow(() => {
    console.log('志愿者列表页面显示，刷新数据')
    fetchVolunteerList()
})
</script>

<style scoped lang="scss">
.volunteer-list-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 120rpx;
}

/* 搜索栏 */
.search-section {
    padding: 20rpx 30rpx;
    background: #ffffff;
    border-bottom: 1rpx solid #f0f0f0;
}

/* 头部统计信息 */
.header-stats {
    padding: 30rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.stats-card {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 30rpx;
    backdrop-filter: blur(10rpx);
}

.stats-content {
    display: flex;
    align-items: center;
}

.stats-item {
    flex: 1;
    text-align: center;
}

.stats-number {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.stats-label {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.stats-divider {
    width: 2rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 40rpx;
}

/* 小雷锋列表 */
.volunteer-list {
    padding: 20rpx 30rpx;
}

.volunteer-card {
    background: #ffffff;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    }
}

.volunteer-content {
    display: flex;
    align-items: center;
    padding: 30rpx;
}

.volunteer-avatar {
    position: relative;
    margin-right: 24rpx;
    flex-shrink: 0;
}

.avatar-wrapper {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    padding: 6rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #f0f0f0;
    border: 4rpx solid #ffffff;
}

.status-badge {
    position: absolute;
    bottom: 0;
    right: -8rpx;
    color: white;
    font-size: 20rpx;
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
    line-height: 1;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
    font-weight: 500;
    
    &.active {
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    }
    
    &.inactive {
        background: linear-gradient(135deg, #999999 0%, #bfbfbf 100%);
    }
}

.volunteer-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.volunteer-name {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .name {
        font-size: 34rpx;
        font-weight: bold;
        color: #333333;
        line-height: 1.2;
    }
    
    .nickname {
        font-size: 24rpx;
        color: #999999;
        font-weight: normal;
    }
}

.info-tags {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
}

.info-tag {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 6rpx 12rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    
    .tag-text {
        font-size: 24rpx;
        color: #666666;
        line-height: 1;
    }
}

.volunteer-footer {
    display: flex;
    align-items: center;
    
    .time-text {
        font-size: 22rpx;
        color: #999999;
        display: flex;
        align-items: center;
        gap: 6rpx;
    }
}

.volunteer-actions {
    display: flex;
    align-items: center;
    padding-left: 20rpx;
}

/* 空状态包装器 */
.empty-wrapper {
    padding: 100rpx 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400rpx;
}

/* 添加按钮 */
.add-button-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30rpx;
    background: #ffffff;
    border-top: 1rpx solid #f0f0f0;
}

.add-button {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-button::after {
    border: none;
}

.add-button:active {
    opacity: 0.8;
}
</style>