<template>
  <view class="profile-container">
    <!-- 自定义导航栏 -->
    <u-navbar title="编辑资料" :is-back="true" :border-bottom="false">
    </u-navbar>
    
    <!-- 头像部分 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="changeAvatar">
        <image 
          :src="userInfo?.avatar || defaultAvatar" 
          class="avatar"
          mode="aspectFill"
        />
        <view class="avatar-edit">
          <u-icon name="camera" color="#ffffff" size="24"></u-icon>
        </view>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>

    <!-- 个人资料表单 -->
    <view class="form-section">
      <view class="section-title">个人资料</view>
      <u-form :model="form" ref="uFormRef">
        <!-- 基本信息 - 所有用户 -->
        <u-form-item label="姓名" prop="name" label-width="160">
          <u-input 
            v-model="form.name"
            placeholder="请输入姓名"
            :maxlength="20"
            input-align="right"
          />
        </u-form-item>

        <!-- 昵称 - 只有小雷锋显示 -->
        <u-form-item v-if="userInfo?.type === 'volunteer'" label="昵称" prop="nickname" label-width="160">
          <u-input 
            v-model="form.nickname"
            placeholder="请输入昵称"
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

        <!-- 学校信息 - 只有小雷锋显示 -->
        <template v-if="userInfo?.type === 'volunteer'">
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
              placeholder="请输入年级"
              :maxlength="20"
              input-align="right"
            />
          </u-form-item>
        </template>

        <!-- 监护人信息 - 只有监护人显示 -->
        <template v-if="userInfo?.type === 'guardian'">
          <u-form-item label="家庭住址" prop="homeAddress" label-width="160">
            <u-input 
              v-model="form.homeAddress"
              placeholder="请输入家庭住址"
              :maxlength="100"
              input-align="right"
            />
          </u-form-item>
          <u-form-item label="家庭电话" prop="homeTel" label-width="160">
            <u-input 
              v-model="form.homeTel"
              placeholder="请输入家庭电话"
              :maxlength="20"
              input-align="right"
            />
          </u-form-item>
          
          <u-form-item label="工作单位" prop="workUnit" label-width="160">
            <u-input 
              v-model="form.workUnit"
              placeholder="请输入工作单位"
              :maxlength="100"
              input-align="right"
            />
          </u-form-item>
        </template>

        <!-- 紧急联系人 - 所有用户 -->
        <u-form-item label="紧急联系人" prop="emergencyContact" label-width="160">
          <u-input 
            v-model="form.emergencyContact"
            placeholder="请输入紧急联系人姓名"
            :maxlength="20"
            input-align="right"
          />
        </u-form-item>

        <u-form-item label="联系人电话" prop="emergencyPhone" label-width="160">
          <u-input 
            v-model="form.emergencyPhone"
            placeholder="请输入紧急联系人电话"
            :maxlength="20"
            input-align="right"
          />
        </u-form-item>

        <u-form-item label="联系人地址" prop="emergencyAddress" label-width="160">
          <u-input 
            v-model="form.emergencyAddress"
            placeholder="请输入紧急联系人地址"
            :maxlength="100"
            input-align="right"
          />
        </u-form-item>
      </u-form>
    </view>

    <!-- 选择器 -->
    <u-action-sheet 
      :show="showGenderPicker" 
      :actions="genderOptions"
      title="选择性别"
      @select="onGenderSelect"
      @close="showGenderPicker = false"
    ></u-action-sheet>

    <u-picker 
      :show="showDatePicker"
      mode="time"
      :params="datePickerParams"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
      @close="showDatePicker = false"
    ></u-picker>

    <!-- 保存按钮 -->
    <view class="save-section">
      <u-button 
        type="primary" 
        @click="saveProfile"
        :loading="saveLoading"
        class="save-btn"
      >
        保存资料
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { post, get } from '@/api/request'
import { userApi, authApi } from '@/api'
import { uploadAvatarForMini } from '@/api/file'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const saveLoading = ref(false)

// 表单引用
const uFormRef = ref()

// 选择器显示状态
const showGenderPicker = ref(false)
const showDatePicker = ref(false)

// 日期选择器值
const datePickerValue = ref(Date.now())

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png'

// 表单数据
const form = reactive({
  id: '',
  name: '',
  nickname: '',
  gender: '',
  age: '',
  birthday: '',
  nation: '',
  homeAddress: '',
  mailingAddress: '',
  homeTel: '',
  workUnit: '',  // 工作单位（监护人）
  school: '',    // 所在学校（小雷锋）
  grade: '',     // 年级（小雷锋）
  emergencyContact: '',
  emergencyPhone: '',
  emergencyAddress: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  age: [
    { pattern: /^\d{1,3}$/, message: '请输入正确的年龄', trigger: 'blur' }
  ],
  homeTel: [
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  officeTel: [
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  emergencyPhone: [
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ]
}

// 性别选项
const genderOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
  { label: '保密', value: '3' }
]

// 日期选择器参数
const datePickerParams = {
  year: true,
  month: true,
  day: true
}

// 选中的性别
const selectedGender = computed(() => {
  return genderOptions.find(option => option.value === form.gender) || {}
})

// 初始化表单数据
const initFormData = () => {
  if (userInfo.value) {
    Object.keys(form).forEach(key => {
      if (userInfo.value[key] !== undefined) {
        form[key] = userInfo.value[key] || ''
      }
    })
    form.id = userInfo.value.id || ''
  }
}

// 调试日志函数
const debugLog = (message: string, data?: any) => {
  console.log(`[Profile Debug] ${message}`, data || '')
}

// 性别点击处理
const handleGenderClick = () => {
  debugLog('性别选择器被点击', { 
    currentShow: showGenderPicker.value,
    genderOptions: genderOptions 
  })
  showGenderPicker.value = true
  debugLog('性别选择器状态已设置', { newShow: showGenderPicker.value })
}

// 日期点击处理
const handleDateClick = () => {
  debugLog('日期选择器被点击', { 
    currentShow: showDatePicker.value,
    datePickerParams: datePickerParams 
  })
  showDatePicker.value = true
  debugLog('日期选择器状态已设置', { newShow: showDatePicker.value })
}

// 性别选择变化
const onGenderChange = (e: any) => {
  debugLog('性别选择变化', { selectedIndex: e.detail.value })
  const index = e.detail.value
  form.gender = genderOptions[index].value
  debugLog('性别选择完成', { 
    selectedGender: form.gender,
    selectedLabel: genderOptions[index].label
  })
}

// 出生日期选择变化
const onBirthdayChange = (e: any) => {
  debugLog('出生日期选择变化', { selectedDate: e.detail.value })
  form.birthday = e.detail.value
  debugLog('出生日期选择完成', { 
    selectedBirthday: form.birthday
  })
}

// 日期选择确认
const onDateConfirm = (e: any) => {
  debugLog('日期选择确认', { selectedData: e })
  const date = new Date(e.value)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  form.birthday = `${year}-${month}-${day}`
  showDatePicker.value = false
  debugLog('日期选择完成', { 
    selectedBirthday: form.birthday,
    pickerClosed: showDatePicker.value 
  })
}

// 更换头像
const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 这里可以上传头像到服务器
      uploadAvatar(tempFilePath)
    }
  })
}

// 上传头像
const uploadAvatar = async (filePath: string) => {
  try {
    uni.showLoading({
      title: '上传中...'
    })
    
    // 调用头像上传接口
    const uploadResult = await uploadAvatarForMini(filePath)
    
    // 更新表单中的头像URL
    form.avatar = uploadResult.url
    
    // 更新本地用户信息中的头像
    if (userInfo.value) {
      userInfo.value.avatar = uploadResult.url
      userStore.setUserInfo(userInfo.value)
    }
    
    uni.hideLoading()
    
    uni.showToast({
      title: '头像上传成功',
      icon: 'success'
    })
    
    console.log('头像上传成功:', uploadResult)
    
  } catch (error) {
    uni.hideLoading()
    console.error('头像上传失败:', error)
    
    uni.showToast({
      title: '头像上传失败',
      icon: 'none'
    })
  }
}

// 保存个人资料
const saveProfile = async () => {
  // 验证表单
  try {
    await uFormRef.value.validate()
  } catch (error) {
    console.log('表单验证失败:', error)
    return
  }

  if (!form.id) {
    uni.showToast({
      title: '用户信息获取失败',
      icon: 'none'
    })
    return
  }

  saveLoading.value = true
  
  try {
    await post(userApi.updateUserInfo, form)
    
    // 更新本地用户信息
    await fetchUserInfo()
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    
  } catch (error) {
    console.error('保存个人资料失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    saveLoading.value = false
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const userResponse = await get(authApi.getLoginUser)
    if (userResponse) {
      userStore.setUserInfo(userResponse)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  // 初始化表单数据
  initFormData()
})
</script>

<style scoped lang="scss">
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 头像部分 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 30rpx 40rpx;
  background: #ffffff;
  margin-bottom: 20rpx;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50rpx;
  height: 50rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-tip {
  font-size: 26rpx;
  color: #999999;
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
}

/* 选择器占位文字样式 */
.select-text:empty::before,
.select-text:not(:empty) {
  color: #333333;
}

/* 强制选择器内容靠右对齐 */
:deep(.u-form-item__body__right) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 针对 picker 包裹的内容也强制右对齐 */
:deep(.u-form-item__body) {
  picker {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
}

/* 确保所有输入区域都靠右 */
.form-section :deep(.u-form-item) {
  .u-form-item__body {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  
  picker {
    width: 100%;
    display: block;
    text-align: right;
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
  z-index: 100;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>