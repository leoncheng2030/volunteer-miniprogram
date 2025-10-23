<template>
    <view class="guardian-register-form">
        <u-form :model="form" ref="formRef" label-width="200">
            <!-- 基本信息 -->
            <view class="form-section">
                <view class="section-title">基本信息</view> 
                <u-form-item prop="realName" label="真实姓名">
                    <u-input 
                        v-model="form.realName" 
                        placeholder="请输入真实姓名"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="phone" label="手机号">
                    <u-input 
                        v-model="form.phone" 
                        placeholder="请输入手机号"
                        :clearable="true"
                        type="number"
                    />
                </u-form-item>

                <u-form-item prop="idCardType" label="证件类型">
                    <picker 
                        mode="selector" 
                        :range="idCardTypeOptions" 
                        range-key="label"
                        @change="onIdCardTypeChange"
                    >
                        <view class="select-container">
                            <text class="select-text" :class="{ 'placeholder': !form.idCardTypeText }">{{ form.idCardTypeText || '请选择证件类型' }}</text>
                            <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                        </view>
                    </picker>
                </u-form-item>

                <u-form-item prop="idCardNumber" label="证件号码">
                    <u-input 
                        v-model="form.idCardNumber" 
                        placeholder="请输入身份证号"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="workUnit" label="工作单位">
                    <u-input 
                        v-model="form.workUnit" 
                        placeholder="请输入工作单位"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="password" label="密码">
                    <u-input 
                        v-model="form.password" 
                        type="password"
                        placeholder="请输入密码"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="confirmPassword" label="确认密码">
                    <u-input 
                        v-model="form.confirmPassword" 
                        type="password"
                        placeholder="请确认密码"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="captcha" label="验证码">
                    <ImageCaptcha 
                        ref="captchaRef"
                        @input="onCaptchaInput"
                    />
                </u-form-item>
            </view>
        </u-form>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const formRef = ref()
const captchaRef = ref()

// 表单数据
const form = reactive({
    realName: '',
    phone: '',
    idCardType: '',       // 证件类型值
    idCardTypeText: '',   // 证件类型文本
    idCardNumber: '',     // 证件号码
    workUnit: '',         // 工作单位
    password: '',
    confirmPassword: '',
})

const captchaValid = ref(false)
const captchaCode = ref('')

// 证件类型选项
const idCardTypeOptions = ref([
    { label: '身份证', value: 'IDENTITY_CARD' },
    { label: '护照', value: 'PASSPORT' },
    { label: '军官证', value: 'MILITARY_OFFICER_CERTIFICATE' },
    { label: '港澳台通行证', value: 'HK_MACAU_TAIWAN_PASS' },
    { label: '其他', value: 'OTHER' }
])

// 证件类型选择变化
const onIdCardTypeChange = (e: any) => {
    const index = e.detail.value
    const selected = idCardTypeOptions.value[index]
    form.idCardType = selected.value
    form.idCardTypeText = selected.label
}

// 表单验证规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
    ],
    realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    idCardType: [
        { required: true, message: '证件类型不能为空', trigger: 'blur' }
    ],
    idCardNumber: [
        { required: true, message: '请输入证件号码', trigger: 'blur' },
        { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { 
            validator: (rule: any, value: string) => {
                if (value !== form.password) {
                    return Promise.reject(new Error('两次输入密码不一致'))
                }
                return Promise.resolve()
            }, 
            trigger: 'blur' 
        }
    ]
}
onMounted(() => {
	formRef.value?.setRules(rules);
});
// 表单验证
const validate = () => {
    return formRef.value?.validate()
}

// 获取表单数据
const getFormData = () => {
    return { ...form }
}

// 重置表单
const resetForm = () => {
    formRef.value?.resetFields()
    captchaValid.value = false
    captchaCode.value = ''
}

// 验证码输入事件
const onCaptchaInput = (value: string) => {
    captchaCode.value = value
    captchaValid.value = false
}

// 验证码验证由后端接口处理
// const onCaptchaSuccess = (value: string) => {
//     captchaValid.value = true
// }

// 暴露方法给父组件
defineExpose({
    validate,
    getFormData,
    resetForm,
    form,
    captchaValid,
    captchaRef  // 关键：暴露验证码组件引用
})
</script>

<style scoped lang="scss">
.guardian-register-form {
    .form-section {
        margin-bottom: 40rpx;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
    
    .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 30rpx;
        padding-left: 20rpx;
        border-left: 6rpx solid #ff6b6b;
    }
}

/* 选择器容器样式 */
.select-container {
    display: flex !important;
    align-items: center;
    justify-content: flex-end !important;
    flex: 1;
    width: 100%;
    padding: 20rpx 0;
    cursor: pointer;
    min-height: 60rpx;
}

.select-text {
    font-size: 30rpx;
    color: #333333;
    text-align: right !important;
    margin-right: 10rpx;
    flex-shrink: 0;
    
    &.placeholder {
        color: #cccccc;
    }
}

/* 表单项样式调整 */
:deep(.u-form-item__body) {
    padding: 20rpx 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

:deep(.u-input__content) {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
}

/* 强制 picker 内容右对齐 */
:deep(.u-form-item__body) {
    picker {
        flex: 1;
        display: flex;
        justify-content: flex-end;
    }
}
</style>