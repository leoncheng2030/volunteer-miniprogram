<template>
    <view class="volunteer-register-form">
        <u-form :model="form" ref="formRef" :rules="rules" label-width="200">
            <!-- 基本信息 -->
            <view class="form-section">
                <view class="section-title">基本信息</view>
                
                <u-form-item prop="username" label="用户名">
                    <u-input 
                        v-model="form.username" 
                        placeholder="请输入用户名"
                        :clearable="true"
                    />
                </u-form-item>
                
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
                    <u-picker 
                        :show="showIdCardTypePicker"
                        :columns="idCardTypeOptions"
                        key-name="label"
                        @confirm="onIdCardTypeConfirm"
                        @cancel="showIdCardTypePicker = false"
                    >
                        <u-input 
                            v-model="form.idCardTypeText" 
                            placeholder="请选择证件类型"
                            :clearable="false"
                            readonly
                            @click="showIdCardTypePicker = true"
                        />
                    </u-picker>
                </u-form-item>
                
                <u-form-item prop="idCardNumber" label="证件号码">
                    <u-input 
                        v-model="form.idCardNumber" 
                        placeholder="请输入证件号码"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="age" label="年龄">
                    <u-input 
                        v-model="form.age" 
                        placeholder="请输入年龄"
                        :clearable="true"
                        type="number"
                    />
                </u-form-item>
            </view>
            
            <!-- 学校信息 -->
            <view class="form-section">
                <view class="section-title">学校信息</view>
                
                <u-form-item prop="school" label="所在学校">
                    <u-input 
                        v-model="form.school" 
                        placeholder="请输入所在学校"
                        :clearable="true"
                    />
                </u-form-item>
                
                <u-form-item prop="grade" label="年级">
                    <u-input 
                        v-model="form.grade" 
                        placeholder="请输入年级"
                        :clearable="true"
                    />
                </u-form-item>
            </view>
            
            <!-- 账号安全 -->
            <view class="form-section">
                <view class="section-title">账号安全</view>
                
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
import { ref, reactive } from 'vue'

const formRef = ref()
const captchaRef = ref()

// 表单数据
const form = reactive({
    username: '',
    realName: '',
    phone: '',
    idCardType: '',
    idCardTypeText: '',
    idCardNumber: '',
    age: '',
    school: '',
    grade: '',
    password: '',
    confirmPassword: ''
})

const captchaValid = ref(false)
const captchaCode = ref('')

// 证件类型选择器
const showIdCardTypePicker = ref(false)
const idCardTypeOptions = ref([
    { label: '身份证', value: 'IDENTITY_CARD' },
    { label: '护照', value: 'PASSPORT' },
    { label: '军官证', value: 'MILITARY_OFFICER_CERTIFICATE' },
    { label: '港澳台通行证', value: 'HK_MACAU_TAIWAN_PASS' },
    { label: '其他', value: 'OTHER' }
])

// 证件类型选择确认
const onIdCardTypeConfirm = (e: any) => {
    const selected = e.value[0]
    form.idCardType = selected.value
    form.idCardTypeText = selected.label
    showIdCardTypePicker.value = false
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
        { required: true, message: '请选择证件类型', trigger: 'change' }
    ],
    idCardNumber: [
        { required: true, message: '请输入证件号码', trigger: 'blur' },
        { 
            validator: (rule: any, value: string, callback: Function) => {
                if (!value) {
                    callback(new Error('请输入证件号码'))
                    return
                }
                
                // 根据证件类型进行不同的验证
                switch (form.idCardType) {
                    case 'IDENTITY_CARD':
                        // 身份证验证
                        const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
                        if (!idCardPattern.test(value)) {
                            callback(new Error('请输入正确的身份证号'))
                        } else {
                            callback()
                        }
                        break
                    case 'PASSPORT':
                        // 护照验证（简单验证）
                        const passportPattern = /^[A-Za-z0-9]{6,20}$/
                        if (!passportPattern.test(value)) {
                            callback(new Error('请输入正确的护照号码'))
                        } else {
                            callback()
                        }
                        break
                    case 'MILITARY_OFFICER_CERTIFICATE':
                        // 军官证验证（简单验证）
                        const militaryPattern = /^[A-Za-z0-9]{8,20}$/
                        if (!militaryPattern.test(value)) {
                            callback(new Error('请输入正确的军官证号码'))
                        } else {
                            callback()
                        }
                        break
                    case 'HK_MACAU_TAIWAN_PASS':
                        // 港澳台通行证验证（简单验证）
                        const hkPattern = /^[A-Za-z0-9]{8,20}$/
                        if (!hkPattern.test(value)) {
                            callback(new Error('请输入正确的港澳台通行证号码'))
                        } else {
                            callback()
                        }
                        break
                    default:
                        // 其他证件类型，简单验证长度
                        if (value.length < 6 || value.length > 30) {
                            callback(new Error('证件号码长度应在6-30位之间'))
                        } else {
                            callback()
                        }
                        break
                }
            }, 
            trigger: 'blur' 
        }
    ],
    age: [
        { required: true, message: '请输入年龄', trigger: 'blur' },
        { pattern: /^[1-9]\d*$/, message: '请输入正确的年龄', trigger: 'blur' }
    ],
    school: [
        { required: true, message: '请输入所在学校', trigger: 'blur' }
    ],
    grade: [
        { required: true, message: '请输入年级', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { 
            validator: (rule: any, value: string, callback: Function) => {
                if (value !== form.password) {
                    callback(new Error('两次输入密码不一致'))
                } else {
                    callback()
                }
            }, 
            trigger: 'blur' 
        }
    ]
}

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
    Object.keys(form).forEach(key => {
        form[key] = ''
    })
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
.volunteer-register-form {
    .form-section {
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
        border-left: 6rpx solid #ff8e53;
    }
}

/* 表单项样式调整 */
:deep(.u-form-item__body) {
    padding: 20rpx 0;
}

:deep(.u-input__content) {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
}
</style>