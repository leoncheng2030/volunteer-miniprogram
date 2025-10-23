<template>
    <view class="image-captcha">
        <view class="captcha-input-group">
            <u-input 
                v-model="inputCode"
                placeholder="请输入验证码"
                :clearable="true"
                maxlength="6"
                @input="onInput"
            />
            <view class="captcha-image-wrapper" @click="refreshCaptcha">
                <image 
                    :src="captchaImage" 
                    class="captcha-image"
                    mode="aspectFit"
                    @error="onImageError"
                />
                <view class="refresh-icon">
                    <u-icon name="refresh" size="20" color="#999999"></u-icon>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/auth'
import { get } from '@/api/request'
import { showToast } from '@/utils'

// 组件props（现在使用API，不需要额外参数）
// interface Props {}
// const props = defineProps<Props>()

const emit = defineEmits<{
    input: [value: string]
    refresh: []
}>()

// 输入的验证码
const inputCode = ref('')
// 验证码图片
const captchaImage = ref('')
// 验证码ID
const captchaId = ref('')
// 从API获取验证码
const fetchCaptcha = async () => {
    try {
        const response = await get(authApi.getPicCaptcha)
        if (response) {
            // 根据实际API返回格式处理数据
            // API直接返回数据对象，不是包裹在data字段中
            captchaImage.value = response.validCodeBase64 || ''
            captchaId.value = response.validCodeReqNo || ''
            console.log('验证码获取成功:', {
                imageLength: captchaImage.value.length,
                captchaId: captchaId.value
            })
        } else {
            console.error('验证码API返回数据为空:', response)
            showToast('验证码数据为空')
        }
    } catch (error) {
        console.error('获取验证码失败:', error)
        showToast('获取验证码失败')
    }
}

// 刷新验证码
const refreshCaptcha = async () => {
    inputCode.value = ''
    emit('refresh')
    await fetchCaptcha()
}

// 验证码验证由后端接口处理，组件只负责获取和输入
// const validate = async () => {
//     // 验证逻辑移至后端接口
// }

// 获取验证码值
const getValue = () => {
    return inputCode.value
}

// 设置验证码值
const setValue = (value: string) => {
    inputCode.value = value
}

// 清空验证码
const clear = () => {
    inputCode.value = ''
}

// 输入事件
const onInput = (value: string) => {
    emit('input', value)
    // 验证逻辑移至后端接口，组件只负责输入
}

// 图片加载错误
const onImageError = () => {
    console.warn('验证码图片加载失败，尝试重新生成')
    setTimeout(() => {
        refreshCaptcha()
    }, 100)
}

onMounted(() => {
    refreshCaptcha()
})

// 暴露方法给父组件
defineExpose({
    getValue,
    setValue,
    clear,
    refreshCaptcha,
    getCaptchaId: () => captchaId.value
})
</script>

<style scoped lang="scss">
.image-captcha {
    .captcha-input-group {
        display: flex;
        align-items: center;
        gap: 16rpx;
    }
    
    .captcha-image-wrapper {
        position: relative;
        width: 240rpx;
        height: 80rpx;
        border-radius: 8rpx;
        overflow: hidden;
        border: 2rpx solid #e0e0e0;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:active {
            transform: scale(0.95);
            border-color: #2196F3;
        }
        
        .captcha-image {
            width: 100%;
            height: 100%;
            display: block;
        }
        
        .refresh-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            width: 40rpx;
            height: 40rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        &:hover .refresh-icon {
            opacity: 1;
        }
    }
}

/* 输入框样式调整 */
:deep(.u-input__content) {
    flex: 1;
}
</style>