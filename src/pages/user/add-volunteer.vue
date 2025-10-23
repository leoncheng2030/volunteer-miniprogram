<template>
    <view class="add-volunteer-container">
        <!-- 证件照上传区域 -->
        <view class="avatar-upload-section">
            <view class="avatar-label">证件照片</view>
            <view class="avatar-upload-wrapper">
                <view class="avatar-container" @click="chooseAvatar">
                    <image 
                        v-if="form.avatar"
                        :src="form.avatar" 
                        class="avatar-image"
                        mode="aspectFill"
                    />
                    <view v-else class="avatar-placeholder">
                        <u-icon name="camera-fill" size="80" color="#ff6b6b"></u-icon>
                    </view>
                    
                    <view class="avatar-overlay">
                        <u-icon name="camera" size="40" color="#ffffff"></u-icon>
                    </view>
                </view>
                
                <view 
                    v-if="form.avatar" 
                    class="avatar-delete-btn" 
                    @click.stop="deleteAvatar"
                >
                    <u-icon name="close-circle-fill" size="48" color="#ff4757"></u-icon>
                </view>
            </view>
            
            <view class="avatar-tip">
                <u-icon name="info-circle" size="28" color="#ff9800"></u-icon>
                <text class="tip-text">请上传本人2寸免冠蓝底证件照，用于活动报名审核</text>
            </view>
        </view>

        <!-- 个人资料表单 -->
        <view class="form-section">
            <u-form :model="form" ref="formRef" :rules="rules">
                <u-form-item label="姓名" prop="name" label-width="160">
                    <u-input 
                        v-model="form.name"
                        placeholder="请输入姓名"
                        :maxlength="20"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="性别" prop="gender" label-width="160">
                    <view class="form-item-right">
                        <picker 
                            mode="selector" 
                            :range="genderOptions" 
                            range-key="label"
                            @change="onGenderChange"
                        >
                            <view class="select-container">
                                <text class="select-text">{{ selectedGender.label || '请选择性别' }}</text>
                                <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                            </view>
                        </picker>
                    </view>
                </u-form-item>

                <u-form-item label="年龄" prop="age" label-width="160">
                    <u-input 
                        v-model="form.age"
                        placeholder="请输入年龄"
                        type="number"
                        :maxlength="3"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="出生日期" prop="birthday" label-width="160">
                    <view class="form-item-right">
                        <picker 
                            mode="date" 
                            @change="onBirthdayChange"
                        >
                            <view class="select-container">
                                <text class="select-text">{{ form.birthday || '请选择出生日期' }}</text>
                                <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                            </view>
                        </picker>
                    </view>
                </u-form-item>

                <u-form-item label="民族" prop="nation" label-width="160">
                    <u-input 
                        v-model="form.nation"
                        placeholder="请输入民族"
                        :maxlength="20"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="家庭住址" prop="homeAddress" label-width="160">
                    <u-input 
                        v-model="form.homeAddress"
                        placeholder="请输入家庭住址"
                        :maxlength="100"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="手机号" prop="phone" label-width="160">
                    <u-input 
                        v-model="form.phone"
                        placeholder="请输入手机号（可选）"
                        type="number"
                        :maxlength="11"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="所在学校" prop="school" label-width="160">
                    <u-input 
                        v-model="form.school"
                        placeholder="请输入所在学校"
                        :maxlength="50"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="年级" prop="grade" label-width="160">
                    <u-input 
                        v-model="form.grade"
                        placeholder="请输入年级（如：三年级）"
                        :maxlength="20"
                        input-align="right"
                    />
                </u-form-item>
                </u-form>
        </view>

        <!-- 保存按钮 -->
        <view class="save-section">
            <button 
                class="save-btn"
                @click="handleSubmit"
                :disabled="submitLoading"
            >
                {{ submitLoading ? '添加中...' : '立即添加' }}
            </button>
        </view>

    </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { addVolunteer } from '@/api/user'
import { uploadAvatarForMini } from '@/api/file'
import type { IAddVolunteerParams } from '@/types/user.d'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const formRef = ref()
const submitLoading = ref(false)

// 表单数据
const form = reactive<IAddVolunteerParams>({
    name: '',
    nickname: '',
    age: '',
    gender: '',
    phone: '',
    avatar: '',
    birthday: '',
    nation: '',
    homeAddress: '',
    mailingAddress: '',
    homeTel: '',
    cultureLevel: '',
    college: '',
    education: '',
    degree: '',
    school: '',
    grade: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyAddress: ''
})

// 性别选项
const genderOptions = [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
]

// 文化程度选项
const educationOptions = [
    { label: '小学', value: 'primary' },
    { label: '初中', value: 'junior' },
    { label: '高中', value: 'senior' },
    { label: '中专', value: 'secondary' },
    { label: '大专', value: 'college' },
    { label: '本科', value: 'bachelor' },
    { label: '硕士', value: 'master' },
    { label: '博士', value: 'doctor' }
]

// 选中的性别
const selectedGender = computed(() => {
    return genderOptions.find(option => option.value === form.gender) || {}
})

// 选中的文化程度
const selectedEducation = computed(() => {
    return educationOptions.find(option => option.value === form.cultureLevel) || {}
})

// 表单验证规则
const rules = {
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在2到20个字符', trigger: 'blur' }
    ],
    gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
    ],
    age: [
        { required: true, message: '请输入年龄', trigger: 'blur' },
        { 
            validator: (rule: any, value: string, callback: Function) => {
                const age = parseInt(value)
                if (isNaN(age) || age < 1 || age > 120) {
                    callback(new Error('请输入有效的年龄（1-120）'))
                } else {
                    callback()
                }
            }, 
            trigger: 'blur' 
        }
    ],
    phone: [
        { 
            pattern: /^1[3-9]\d{9}$/, 
            message: '请输入正确的手机号', 
            trigger: 'blur' 
        }
    ]
}

// 性别选择变化
const onGenderChange = (e: any) => {
    const index = e.detail.value
    form.gender = genderOptions[index].value
}

// 出生日期选择变化
const onBirthdayChange = (e: any) => {
    form.birthday = e.detail.value
}

// 文化程度选择变化
const onEducationChange = (e: any) => {
    const index = e.detail.value
    form.cultureLevel = educationOptions[index].value
}

// 选择证件照
const chooseAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const tempFilePath = res.tempFilePaths[0]
            await handleAvatarUpload(tempFilePath)
        }
    })
}

// 处理证件照上传
const handleAvatarUpload = async (filePath: string) => {
    try {
        // 验证文件大小（2MB）
        const fileInfo = await uni.getFileInfo({ filePath })
        const maxSize = 2 * 1024 * 1024 // 2MB
        if (fileInfo.size > maxSize) {
            return uni.showToast({
                title: '图片大小不能超过2MB',
                icon: 'none'
            })
        }
        
        // 验证文件类型
        const ext = filePath.toLowerCase().split('.').pop()
        if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
            return uni.showToast({
                title: '只支持 JPG、PNG 格式',
                icon: 'none'
            })
        }
        
        uni.showLoading({ title: '上传中...' })
        
        const result = await uploadAvatarForMini(filePath)
        
        if (result && result.url) {
            form.avatar = result.url
            uni.hideLoading()
            uni.showToast({
                title: '上传成功',
                icon: 'success'
            })
        } else {
            throw new Error('上传失败')
        }
    } catch (error) {
        uni.hideLoading()
        console.error('证件照上传失败:', error)
        uni.showToast({
            title: '上传失败，请重试',
            icon: 'none'
        })
    }
}

// 删除证件照
const deleteAvatar = () => {
    uni.showModal({
        title: '提示',
        content: '确定要删除证件照吗？',
        success: (res) => {
            if (res.confirm) {
                form.avatar = ''
                uni.showToast({
                    title: '已删除',
                    icon: 'success'
                })
            }
        }
    })
}

// 提交表单
const handleSubmit = async () => {
    // 验证表单
    try {
        await formRef.value.validate()
    } catch (error) {
        console.log('表单验证失败:', error)
        return
    }

    // 检查用户类型
    if (userInfo.value?.type !== 'guardian') {
        uni.showToast({
            title: '仅监护人可添加小雷锋',
            icon: 'none'
        })
        return
    }

    submitLoading.value = true
    
    try {
        // 准备 extJson 数据
        let extJsonData: any = {}
        
        // 将 grade 存入 extJson
        if (form.grade) {
            extJsonData.grade = form.grade
        }
        
        // 准备提交数据
        const submitData: any = {
            ...form,
            college: form.school || form.college, // 使用 school 映射到 college
            extJson: Object.keys(extJsonData).length > 0 ? JSON.stringify(extJsonData) : '',
            parentId: userInfo.value.id // 设置监护人ID
        }
        
        // 删除前端自定义字段
        delete submitData.school
        delete submitData.grade
        
        console.log('提交数据:', submitData)
        
        // 调用添加接口
        const response = await addVolunteer(submitData)
        
        if (response) {
            uni.showToast({
                title: '添加成功',
                icon: 'success'
            })
            
            // 延迟返回上一页
            setTimeout(() => {
                uni.navigateBack()
            }, 1500)
        } else {
            throw new Error('添加失败')
        }
    } catch (error) {
        console.error('添加小雷锋失败:', error)
        uni.showToast({
            title: '添加失败，请重试',
            icon: 'none'
        })
    } finally {
        submitLoading.value = false
    }
}
</script>

<style scoped lang="scss">
.add-volunteer-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 120rpx;
}

/* 表单部分 */
.form-section {
    background: #ffffff;
    margin-bottom: 20rpx;
    padding: 30rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    padding: 30rpx 30rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.select-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    padding: 20rpx 0;
    cursor: pointer;
}

.select-text {
    font-size: 30rpx;
    color: #333333;
    text-align: right;
    margin-right: 10rpx;
}

/* 表单选择器容器靠右对齐 */
.form-item-right {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

/* 证件照上传区域 */
.avatar-upload-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 50rpx 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-label {
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 30rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.avatar-upload-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-container {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    padding: 8rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    
    &:active {
        transform: scale(0.95);
    }
}

.avatar-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.avatar-container:active .avatar-overlay {
    opacity: 1;
}

.avatar-delete-btn {
    position: absolute;
    top: 0;
    right: -60rpx;
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.avatar-tip {
    margin-top: 30rpx;
    padding: 20rpx 30rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10rpx);
}

.tip-text {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.6;
    flex: 1;
}

/* 保存按钮 */
.save-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30rpx;
    background: #ffffff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.save-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: #ffffff;
    border: none;
}

.save-btn::after {
    border: none;
}

.save-btn:active {
    opacity: 0.8;
}
</style>