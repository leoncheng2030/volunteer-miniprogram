<template>
    <view class="register-container">
        <!-- 注册类型选择 -->
        <view class="type-selector">
            <view class="type-title">选择注册类型</view>
            <view class="type-options">
                <view 
                    class="type-option" 
                    :class="{ active: registerType === 'guardian' }"
                    @click="selectType('guardian')"
                >
                    <text class="type-name">监护人</text>
                    <text class="type-desc">为孩子注册，管理志愿服务</text>
                </view>
                <view 
                    class="type-option" 
                    :class="{ active: registerType === 'volunteer' }"
                    @click="selectType('volunteer')"
                >
                    <text class="type-name">小雷锋</text>
                    <text class="type-desc">志愿者注册，参与志愿服务</text>
                </view>
            </view>
        </view>
        <!-- 注册表单 -->
        <view class="register-form">
            <!-- 监护人注册表单 -->
            <view v-if="registerType === 'guardian'" class="form-content">
                <GuardianRegisterForm ref="guardianFormRef" />
            </view>

            <!-- 小雷锋注册表单 -->
            <view v-if="registerType === 'volunteer'" class="form-content">
                <VolunteerRegisterForm ref="volunteerFormRef" />
            </view>

            <!-- 注册按钮 -->
            <view class="register-actions">
                <u-button 
                    type="primary" 
                    @click="handleRegister"
                    :loading="loading"
                    class="register-btn"
                >
                    注册
                </u-button>
                
                <view class="register-links">
                    <text class="link-text" @click="goToLogin">已有账号？去登录</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { authApi } from '@/api/auth'
import { post } from '@/api/request'
import sm2CryptoUtil from '@/utils/smCrypto'

const loading = ref(false)
const registerType = ref('guardian')
const guardianFormRef = ref()
const volunteerFormRef = ref()
const userStore = useUserStore()

// 选择注册类型
const selectType = (type: string) => {
    registerType.value = type
}

// 处理注册
const handleRegister = async () => {
    try {
        // 表单验证
        if (registerType.value === 'guardian') {
            await guardianFormRef.value.validate()
        } else {
            await volunteerFormRef.value.validate()
        }

        // 检查验证码是否输入
        let captchaCode = ''
        let captchaId = ''
        
        if (registerType.value === 'guardian') {
            // 直接访问验证码组件获取值
            const guardianForm = guardianFormRef.value
            if (guardianForm && guardianForm.captchaRef) {
                captchaCode = guardianForm.captchaRef.getValue() || ''
                captchaId = guardianForm.captchaRef.getCaptchaId?.() || ''
            }
        } else {
            // 直接访问验证码组件获取值
            const volunteerForm = volunteerFormRef.value
            if (volunteerForm && volunteerForm.captchaRef && volunteerForm.captchaRef.value) {
                captchaCode = volunteerForm.captchaRef.value.getValue() || ''
                captchaId = volunteerForm.captchaRef.value.getCaptchaId?.() || ''
            }
        }

        if (!captchaCode) {
            uni.showToast({
                title: '请输入验证码',
                icon: 'none'
            })
            return
        }

        if (!captchaId) {
            uni.showToast({
                title: '验证码信息无效，请刷新验证码',
                icon: 'none'
            })
            return
        }

        loading.value = true

        // 获取表单数据
        let formData: any
        if (registerType.value === 'guardian') {
            formData = guardianFormRef.value.getFormData()
        } else {
            formData = volunteerFormRef.value.getFormData()
        }

        // 使用SM2加密密码
        const encryptedPassword = sm2CryptoUtil.doSm2Encrypt(formData.password)
        
        // 构建注册数据，包含验证码信息
        const registerData = {
            type: registerType.value,           // 账号类型
            realName: formData.realName,        // 真实姓名
            phone: formData.phone,              // 手机号
            idCardType: formData.idCardType,    // 证件类型
            idCardNumber: formData.idCardNumber,// 证件号码
            password: encryptedPassword,        // SM2加密后的密码
            validCode: captchaCode,             // 验证码
            validCodeReqNo: captchaId           // 验证码请求号
        }
        
        // 如果是志愿者注册，添加额外字段
        if (registerType.value === 'volunteer') {
            registerData.username = formData.username
            registerData.age = formData.age
            registerData.school = formData.school
            registerData.grade = formData.grade
        }
        
        // 如果是监护人注册，添加工作单位
        if (registerType.value === 'guardian') {
            registerData.workUnit = formData.workUnit
        }
        console.log(registerData)
        // 调用真实的注册API
        const response = await post(authApi.register, registerData)

        // 注册成功，保存用户信息到store
        if (response) {
            userStore.setUserInfo(response)

            uni.showToast({
                title: '注册成功',
                icon: 'success'
            })

            // 跳转到登录页面
            setTimeout(() => {
                uni.redirectTo({
                    url: '/pages/login/login'
                })
            }, 1500)
        }

    } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({
            title: '注册失败，请检查信息',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 跳转到登录页面
const goToLogin = () => {
    uni.navigateBack()
}
</script>

<style scoped lang="scss">
.register-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    padding: 20rpx 20rpx;
    box-sizing: border-box;
}

/* 注册类型选择 */
.type-selector {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.type-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    text-align: center;
    margin-bottom: 40rpx;
}

.type-options {
    display: flex;
    gap: 30rpx;
}

.type-option {
    flex: 1;
    padding: 20rpx 20rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 16rpx;
    text-align: center;
    transition: all 0.3s ease;
    
    &.active {
        border-color: #ff6b6b;
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%);
        transform: translateY(-4rpx);
        box-shadow: 0 8rpx 25rpx rgba(255, 107, 107, 0.3);
    }
}

.type-name {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin: 20rpx 0 12rpx 0;
}

.type-desc {
    display: block;
    font-size: 24rpx;
    color: #999999;
    line-height: 1.4;
}

/* 注册表单 */
.register-form {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 20rpx;
    box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-content {
    margin-bottom: 20rpx;
}

.child-section {
    margin-top: 40rpx;
    padding-top: 30rpx;
    border-top: 1rpx solid #f0f0f0;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 30rpx;
    padding-left: 20rpx;
    border-left: 6rpx solid #667eea;
}

/* 注册操作 */
.register-actions {
    margin-top: 60rpx;
}

.register-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: #ffffff;
    border: none;
}

.register-links {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
}

.link-text {
    font-size: 28rpx;
    color: #ff6b6b;
    padding: 10rpx 20rpx;
    
    &:active {
        opacity: 0.7;
    }
}

/* 表单项样式调整 */
:deep(.u-form-item__body) {
    padding: 0;
}

:deep(.u-input__content) {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
}
</style>