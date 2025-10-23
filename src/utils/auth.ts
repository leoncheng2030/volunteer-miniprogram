import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { showToast } from '@/utils'

/**
 * 检查用户是否已登录
 * @returns boolean 是否已登录
 */
export const isLoggedIn = (): boolean => {
    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)
    return !!userInfo.value
}

/**
 * 检查登录状态，如果未登录则跳转到登录页面
 * @param showMessage 是否显示未登录提示
 * @returns boolean 是否已登录
 */
export const checkLoginAndRedirect = (showMessage: boolean = true): boolean => {
    const loggedIn = isLoggedIn()
    
    if (!loggedIn) {
        if (showMessage) {
            console.log('显示登录提示')
            showToast('请先登录')
        }
        
        // 延迟跳转，确保提示能显示
        const delay = showMessage ? 2000 : 0
        setTimeout(() => {
            uni.navigateTo({
                url: '/pages/login/login',
                success: () => {
                    console.log('成功跳转到登录页面')
                },
                fail: (err) => {
                    console.error('跳转到登录页面失败:', err)
                }
            })
        }, delay)
        
        return false
    }
    return true
}

/**
 * 获取当前用户信息
 * @returns IUserInfo | null 用户信息
 */
export const getCurrentUser = () => {
    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)
    return userInfo.value
}

/**
 * 退出登录
 */
export const logout = () => {
    const userStore = useUserStore()
    userStore.logout()
    
    showToast('已退出登录', 'success')
    
    // 跳转到登录页面
    setTimeout(() => {
        uni.reLaunch({
            url: '/pages/login/login'
        })
    }, 1500)
}