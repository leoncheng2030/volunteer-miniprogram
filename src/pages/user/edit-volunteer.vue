<template>
    <view class="edit-volunteer-container">
        <!-- 自定义导航栏 -->
        <u-navbar title="编辑小雷锋" :is-back="true" :border-bottom="false"></u-navbar>

        <!-- 个人资料表单 -->
        <view class="form-section">
            <!-- 头像上传区域（单独处理） -->
            <view class="avatar-upload-section">
                <view class="avatar-label">证件照片</view>
                <view class="avatar-upload-wrapper">
                    <!-- 已上传头像预览 -->
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
                        
                        <!-- 浮动按钮 -->
                        <view class="avatar-overlay">
                            <u-icon name="camera" size="40" color="#ffffff"></u-icon>
                        </view>
                    </view>
                    
                    <!-- 删除按钮 -->
                    <view 
                        v-if="form.avatar" 
                        class="avatar-delete-btn" 
                        @click.stop="deleteAvatar"
                    >
                        <u-icon name="close-circle-fill" size="48" color="#ff4757"></u-icon>
                    </view>
                </view>
                
                <!-- 提示信息 -->
                <view class="avatar-tip">
                    <u-icon name="info-circle" size="28" color="#ff9800"></u-icon>
                    <text class="tip-text">请上传本人2寸免冠蓝底证件照，用于活动报名审核</text>
                </view>
            </view>
            
            <u-form :model="form" ref="formRef" :rules="rules">
                <!-- 移除原有的头像 form-item -->
                
                <u-form-item label="姓名" prop="name" label-width="160">
                    <u-input 
                        v-model="form.name"
                        placeholder="请输入姓名"
                        :maxlength="20"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="昵称" prop="nickname" label-width="160">
                    <u-input 
                        v-model="form.nickname"
                        placeholder="请输入昵称（可选）"
                        :maxlength="20"
                        input-align="right"
                    />
                </u-form-item>

                <u-form-item label="性别" prop="gender" label-width="160">
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
                    <picker 
                        mode="date" 
                        :value="form.birthday"
                        @change="onBirthdayChange"
                    >
                        <view class="select-container">
                            <text class="select-text">{{ form.birthday || '请选择出生日期' }}</text>
                            <u-icon name="arrow-right" color="#cccccc" size="24"></u-icon>
                        </view>
                    </picker>
                </u-form-item>

                <u-form-item label="民族" prop="nation" label-width="160">
                    <u-input 
                        v-model="form.nation"
                        placeholder="请输入民族"
                        :maxlength="20"
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

                <u-form-item label="手机号" prop="phone" label-width="160">
                    <u-input 
                        v-model="form.phone"
                        placeholder="请输入手机号（可选）"
                        type="number"
                        :maxlength="11"
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
                {{ submitLoading ? '保存中...' : '保存修改' }}
            </button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { updateVolunteer, getVolunteerDetail } from '@/api/user'
import { uploadAvatarForMini } from '@/api/file'
import type { IVolunteerInfo } from '@/types/user.d'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const formRef = ref()
const submitLoading = ref(false)
const volunteerId = ref('')
const volunteerData = ref<IVolunteerInfo | null>(null)

// 表单数据
const form = reactive({
    name: '',
    nickname: '',
    age: '',
    gender: '',
    phone: '',
    avatar: '',
    birthday: '',
    nation: '',
    school: '',
    grade: ''
})

// 性别选项
const genderOptions = [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
]

// 选中的性别
const selectedGender = computed(() => {
    return genderOptions.find(option => option.value === form.gender) || {}
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

// 头像上传相关方法
const chooseAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const tempFilePath = res.tempFilePaths[0]
            await handleAvatarUpload(tempFilePath)
        },
        fail: (error) => {
            console.error('选择图片失败:', error)
            uni.showToast({
                title: '选择图片失败',
                icon: 'none'
            })
        }
    })
}

const handleAvatarUpload = async (filePath: string) => {
    try {
        // 验证文件大小
        const fileInfo = await uni.getFileInfo({ filePath })
        const maxSize = 2 * 1024 * 1024 // 2MB
        if (fileInfo.size > maxSize) {
            uni.showToast({
                title: '图片大小不能超过2MB',
                icon: 'none'
            })
            return
        }
        
        // 验证文件类型
        const ext = filePath.toLowerCase().split('.').pop()
        if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
            uni.showToast({
                title: '只支持 JPG、PNG 格式',
                icon: 'none'
            })
            return
        }
        
        uni.showLoading({ title: '上传中...' })
        
        const result = await uploadAvatarForMini(filePath)
        form.avatar = result.url
        
        uni.hideLoading()
        uni.showToast({
            title: '上传成功',
            icon: 'success'
        })
    } catch (error) {
        console.error('头像上传失败:', error)
        uni.hideLoading()
        uni.showToast({
            title: '上传失败，请重试',
            icon: 'none'
        })
    }
}

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

// 性别选择变化
const onGenderChange = (e: any) => {
    const index = e.detail.value
    form.gender = genderOptions[index].value
}

// 出生日期选择变化
const onBirthdayChange = (e: any) => {
    form.birthday = e.detail.value
}

// 初始化表单数据
const initFormData = (data: IVolunteerInfo) => {
    form.name = data.name || ''
    form.nickname = data.nickname || ''
    form.age = data.age?.toString() || ''
    form.gender = data.gender || ''
    form.phone = data.phone || ''
    form.avatar = data.avatar || ''
    form.birthday = data.birthday || ''
    form.nation = data.nation || ''
    form.school = (data as any).school || (data as any).college || ''
    
    // 从 extJson 中读取 grade
    try {
        const extJson = (data as any).extJson
        if (extJson) {
            const extData = typeof extJson === 'string' ? JSON.parse(extJson) : extJson
            form.grade = extData.grade || ''
        }
    } catch (error) {
        console.error('解析 extJson 失败:', error)
        form.grade = ''
    }
}

// 提交表单
const handleSubmit = async () => {
    console.log('===== 开始提交表单 =====')
    console.log('formRef:', formRef.value)
    
    // 验证表单
    try {
        if (formRef.value) {
            await formRef.value.validate()
            console.log('表单验证通过')
        } else {
            console.warn('formRef 不存在，跳过验证')
        }
    } catch (error) {
        console.error('表单验证失败:', error)
        uni.showToast({
            title: '请填写完整信息',
            icon: 'none'
        })
        return
    }

    submitLoading.value = true
    console.log('开始准备提交数据...')
    
    try {
        // 准备 extJson 数据
        let extJsonData: any = {}
        try {
            const existingExtJson = (volunteerData.value as any)?.extJson
            if (existingExtJson) {
                extJsonData = typeof existingExtJson === 'string' 
                    ? JSON.parse(existingExtJson) 
                    : existingExtJson
            }
        } catch (error) {
            console.error('解析原始 extJson 失败:', error)
        }
        
        // 将 grade 存入 extJson
        extJsonData.grade = form.grade
        
        // 准备提交数据，保留原始数据中的必要字段
        const submitData = {
            ...volunteerData.value, // 先应用原始数据（包含 account 等后端必需字段）
            ...form,                // 再用表单数据覆盖
            college: form.school,   // 将 school 映射到后端的 college 字段
            extJson: JSON.stringify(extJsonData), // 将 grade 存入 extJson
            id: volunteerId.value
        }
        
        // 删除前端特有的字段，避免传给后端
        delete (submitData as any).school
        delete (submitData as any).grade
        
        console.log('原始志愿者数据:', volunteerData.value)
        console.log('表单数据:', form)
        console.log('extJson 数据:', extJsonData)
        console.log('最终提交数据:', submitData)
        console.log('提交数据的 account:', submitData.account)
        console.log('提交数据的 name:', submitData.name)
        console.log('提交数据的 college:', submitData.college)
        console.log('提交数据的 extJson:', submitData.extJson)
        
        console.log('===== 开始调用 updateVolunteer API =====')
        console.log('API URL: /mini/volunteer/update')
        console.log('请求参数:', JSON.stringify(submitData))
        
        // 调用更新接口
        const response = await updateVolunteer(submitData)
        
        console.log('===== API 调用完成 =====')
        console.log('后端响应:', response)
        
        if (response !== undefined) {
            uni.showToast({
                title: '保存成功',
                icon: 'success'
            })
            
            // 返回到详情页（delta: 1），详情页的 onShow 会自动刷新
            setTimeout(() => {
                uni.navigateBack({
                    delta: 1
                })
            }, 1000)
        } else {
            throw new Error('保存失败：响应为空')
        }
    } catch (error) {
        console.error('===== 保存失败 =====')
        console.error('错误详情:', error)
        console.error('错误消息:', error instanceof Error ? error.message : String(error))
        uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
        })
    } finally {
        submitLoading.value = false
        console.log('===== 提交流程结束 =====')
    }
}

// 页面加载时接收参数
onLoad(async (options: any) => {
    console.log('页面参数:', options)
    
    if (options.id) {
        volunteerId.value = options.id
        
        // 从接口获取志愿者数据
        try {
            console.log('开始获取志愿者数据, ID:', volunteerId.value)
            const response = await getVolunteerDetail(volunteerId.value)
            console.log('获取志愿者数据响应:', response)
            
            let data = response
            if (response && response.data) {
                data = response.data
            }
            
            if (data) {
                volunteerData.value = data
                initFormData(data)
                console.log('初始化表单完成')
            }
        } catch (error) {
            console.error('获取志愿者数据失败:', error)
            uni.showToast({
                title: '获取数据失败',
                icon: 'none'
            })
        }
    } else {
        uni.showToast({
            title: '缺少志愿者ID',
            icon: 'none'
        })
    }
})
</script>

<style scoped lang="scss">
.edit-volunteer-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 120rpx;
}

/* 头像上传区域 */
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
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.avatar-upload-wrapper {
    position: relative;
    margin-bottom: 20rpx;
}

.avatar-container {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;
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
    background: #ffffff;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* 添加脉冲动画 */
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
    bottom: 0;
    left: 0;
    right: 0;
    height: 60rpx;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10rpx);
}

.avatar-delete-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: transform 0.2s ease;
    
    &:active {
        transform: scale(0.9);
    }
}

.avatar-tip {
    display: flex;
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10rpx);
    padding: 20rpx 24rpx;
    border-radius: 16rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    max-width: 640rpx;
}

.tip-text {
    flex: 1;
    font-size: 24rpx;
    color: #ffffff;
    line-height: 1.6;
    margin-left: 12rpx;
}

/* 表单部分 */
.form-section {
    background: #ffffff;
    margin-bottom: 20rpx;
}

/* u-form 内边距 */
:deep(.u-form) {
    padding: 30rpx;
}

/* 选择器样式 */

.select-container {
    display: flex !important;
    align-items: center;
    justify-content: flex-end !important;
    flex: 1;
    width: 100%;
    padding: 20rpx 0;
    cursor: pointer;
}

.select-text {
    font-size: 30rpx !important;
    color: #333333 !important;
    text-align: right !important;
    margin-right: 10rpx;
    flex: 1;
}

:deep(.u-form-item__body__right) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
}

:deep(.u-form-item__body) {
    picker {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
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
