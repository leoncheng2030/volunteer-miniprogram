<template>
  <view class="login-container">
    <view class="login-header">
      <text class="login-title">小雷锋志愿团</text>
      <text class="login-subtitle">志愿服务管理系统</text>
    </view>
    
    <view class="login-form">
      <u-form :model="loginForm" ref="loginFormRef">
        <u-form-item prop="username">
          <u-input 
            v-model="loginForm.username" 
            placeholder="请输入手机号"
            :clearable="true"
          />
        </u-form-item>
        
        <u-form-item prop="password">
          <u-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码"
            :clearable="true"
          />
        </u-form-item>
        
        <u-form-item prop="captcha">
          <ImageCaptcha 
            ref="captchaRef"
            @input="onCaptchaInput"
          />
        </u-form-item>
      </u-form>
      
      <view class="login-actions">
        <u-button 
          type="primary" 
          @click="handleLogin"
          :loading="loading"
          class="login-btn"
        >
          登录
        </u-button>
        
        <view class="login-links">
          <text class="link-text" @click="goToRegister">注册账号</text>
          <text class="link-divider">|</text>
          <text class="link-text" @click="goToForget">忘记密码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { authApi } from '@/api/auth'
import { post, get } from '@/api/request'
import sm2CryptoUtil from '@/utils/smCrypto'

const loading = ref(false)
const loginFormRef = ref()
const captchaRef = ref()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const loginForm = reactive({
  username: '',
  password: ''
})

const captchaValid = ref(false)
const captchaCode = ref('')

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none'
    })
    return
  }
  
  // 获取验证码值
  const captchaValue = captchaRef.value?.getValue()
  if (!captchaValue) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  
  try {
    // 获取验证码ID
    const captchaId = captchaRef.value?.getCaptchaId()
    if (!captchaId) {
      uni.showToast({
        title: '验证码信息无效，请刷新验证码',
        icon: 'none'
      })
      return
    }
    
    // 使用SM2加密密码
    const encryptedPassword = sm2CryptoUtil.doSm2Encrypt(loginForm.password)
    
    // 调用真实的登录API，包含验证码信息
    const loginData = {
      account: loginForm.username,      // 账号
      password: encryptedPassword,      // SM2加密后的密码
      device: 'MINI',            // 设备类型
      validCode: captchaValue,          // 验证码
      validCodeReqNo: captchaId         // 验证码请求号
    }
    const loginResponse = await post(authApi.doLogin, loginData)
    
    // 登录成功，获取token
    if (loginResponse) {
      // 保存token到store
      userStore.setToken(loginResponse)
      
      // 调用getLoginUser获取用户信息
      try {
        const userResponse = await get(authApi.getLoginUser)
        if (userResponse) {
          userStore.setUserInfo(userResponse)
        }
      } catch (userError) {
        console.error('获取用户信息失败:', userError)
        // 即使获取用户信息失败，也继续登录流程
      }
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      throw new Error('登录失败，未获取到token')
    }
  } catch (error) {
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
    // 登录失败时刷新验证码
    captchaRef.value?.refreshCaptcha()
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

const goToForget = () => {
  // TODO: 跳转到忘记密码页面
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none'
  })
}

// 验证码输入事件
const onCaptchaInput = (value: string) => {
    captchaCode.value = value
    captchaValid.value = false
}

// 验证码验证由后端接口处理
// const onCaptchaSuccess = (value: string) => {
//     captchaValid.value = true
//     uni.showToast({
//         title: '验证码正确',
//         icon: 'success',
//         duration: 1000
//     })
// }
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  padding: 100rpx 60rpx;
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 120rpx;
  
  .login-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 20rpx;
  }
  
  .login-subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.login-actions {
  margin-top: 60rpx;
  
  .login-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
  }
  
  .login-links {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40rpx;
    
    .link-text {
      font-size: 28rpx;
      color: #ff6b6b;
      padding: 10rpx 20rpx;
      
      &:active {
        opacity: 0.7;
      }
    }
    
    .link-divider {
      color: #cccccc;
      margin: 0 20rpx;
    }
  }
}
</style>