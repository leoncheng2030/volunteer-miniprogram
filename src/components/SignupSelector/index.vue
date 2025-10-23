<template>
    <view class="signup-selector">

        <!-- 可滚动的内容区域 -->
        <scroll-view class="scroll-content" scroll-y>
            <!-- 为小雷锋报名选项 -->
            <view v-if="userInfo?.type === 'guardian' && filteredVolunteerList.length > 0" class="volunteer-section">
                <view 
                    v-for="volunteer in filteredVolunteerList" 
                    :key="volunteer.id"
                    class="signup-option"
                    @click="selectVolunteer(volunteer)"
                >
                    <view class="option-left">
                        <view class="user-avatar">
                            <image :src="volunteer.avatar || '/static/images/default-avatar.png'" class="avatar-img"></image>
                        </view>
                        <view class="user-info">
                            <view class="user-name">{{ volunteer.name || volunteer.nickname }}</view>
                            <view class="user-type">小雷锋</view>
                        </view>
                    </view>
                    <view class="option-right">
                        <view class="checkbox" :class="{ checked: selectedUserIds.includes(volunteer.id) }">
                            <view class="checkbox-inner" v-if="selectedUserIds.includes(volunteer.id)">✓</view>
                        </view>
                    </view>
                </view>
            </view>
            
            <!-- 空状态 -->
            <view v-else class="empty-state">
                <view class="empty-icon">
                    <u-icon name="heart" color="#ccc" size="64"></u-icon>
                </view>
                <text class="empty-text">暂无可选择的小雷锋</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useUserInfo } from '@/hooks/user'
import { getVolunteerList } from '@/api/user'
import type { IVolunteerInfo } from '@/types/user.d'

interface Props {
    modelValue?: string[] // 选中的用户ID数组（多选）
    signedVolunteerIds?: string[] // 已报名的小雷锋ID列表
}

interface Emits {
    (e: 'update:modelValue', value: string[]): void
    (e: 'select', user: { id: string; name: string; type: 'self' | 'volunteer' }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { userInfo } = useUserInfo()
const volunteerList = ref<IVolunteerInfo[]>([])
const selectedUserIds = ref<string[]>(props.modelValue || [])

// 过滤后的小雷锋列表（排除已报名的）
const filteredVolunteerList = computed(() => {
    if (!props.signedVolunteerIds || props.signedVolunteerIds.length === 0) {
        return volunteerList.value
    }
    return volunteerList.value.filter(volunteer => 
        !props.signedVolunteerIds!.includes(volunteer.id)
    )
})

// 加载小雷锋列表
const loadVolunteerList = async () => {
    if (userInfo.value?.type === 'guardian') {
        try {
            const list = await getVolunteerList()
            volunteerList.value = list || []
            console.log('加载小雷锋列表:', volunteerList.value.length, '个')
        } catch (error) {
            console.error('获取小雷锋列表失败:', error)
            volunteerList.value = []
        }
    }
}

// 移除了自己报名功能

// 选择小雷锋报名
const selectVolunteer = (volunteer: IVolunteerInfo) => {
    console.log('选择小雷锋:', volunteer)
    
    // 多选模式
    const index = selectedUserIds.value.indexOf(volunteer.id)
    if (index > -1) {
        // 取消选择
        selectedUserIds.value.splice(index, 1)
    } else {
        // 添加选择
        selectedUserIds.value.push(volunteer.id)
    }
    emit('update:modelValue', selectedUserIds.value)
    
    emit('select', {
        id: volunteer.id,
        name: volunteer.name || volunteer.nickname,
        type: 'volunteer'
    })
}

// 移除了添加小雷锋的功能

// 监听props变化，重新加载数据
watch(() => props.modelValue, (newValue) => {
    console.log('modelValue变化:', newValue)
    selectedUserIds.value = newValue ? [...newValue] : []
    if (newValue && newValue.length > 0 && userInfo.value?.type === 'guardian') {
        loadVolunteerList()
    }
})

onMounted(() => {
    loadVolunteerList()
})
</script>

<style lang="scss" scoped>
.signup-selector {
    background-color: #FFFFFF;
    border-radius: 16rpx;
    padding: 32rpx;
    margin: 24rpx;
    display: flex;
    flex-direction: column;
    height: 60vh; // 固定高度
}

.scroll-content {
    flex: 1;
    height: 0; // 重要：让flex子元素正确计算高度
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; // iOS滚动优化
}

.selector-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #212121;
    margin-bottom: 24rpx;
}

.signup-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
        border-bottom: none;
    }
}

.option-left {
    display: flex;
    align-items: center;
    flex: 1;
}

.user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 24rpx;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-info {
    flex: 1;
}

.user-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #212121;
    margin-bottom: 8rpx;
}

.user-type {
    font-size: 24rpx;
    color: #999999;
}

.option-right {
    display: flex;
    align-items: center;
}

.checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #E0E0E0;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &.checked {
        border-color: #FF6B6B;
        background-color: #FF6B6B;
    }
}

.checkbox-inner {
    color: #FFFFFF;
    font-size: 24rpx;
    font-weight: bold;
}

.volunteer-section {
    // 移除了上边距，因为现在只有小雷锋选项
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 32rpx;
    text-align: center;
}

.empty-icon {
    margin-bottom: 24rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

.add-volunteer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    margin-top: 32rpx;
    border: 2rpx dashed #FF6B6B;
    border-radius: 12rpx;
    background-color: #FFF5F5;
}

.add-text {
    color: #FF6B6B;
    font-size: 28rpx;
    margin-left: 12rpx;
}
</style>