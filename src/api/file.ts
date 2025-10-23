import { post } from './request'
import { API_BASE_URL } from '@/config'
import { USER_TOKEN } from '@/constant'

/**
 * 文件上传相关API
 */

export const fileApi = {
    uploadImage: "/mini/file/uploadImage", // 上传图片
    uploadAvatar: "/mini/file/uploadAvatar", // 上传头像
};

// 小程序端上传图片（兼容uni-app）
export const uploadImageForMini = (filePath: string): Promise<{
    url: string
    size: number
    originalName: string
    contentType: string
}> => {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: `${API_BASE_URL}${fileApi.uploadImage}`,
            filePath: filePath,
            name: 'file',
            header: {
                'token': `${uni.getStorageSync(USER_TOKEN)}`
            },
            success: (uploadFileRes) => {
                try {
                    const data = JSON.parse(uploadFileRes.data)
                    if (data.code === 200) {
                        resolve(data.data)
                    } else {
                        reject(new Error(data.message || '上传失败'))
                    }
                } catch (error) {
                    reject(new Error('解析响应数据失败'))
                }
            },
            fail: (error) => {
                reject(new Error('上传请求失败'))
            }
        })
    })
}

// 小程序端上传头像（兼容uni-app）
export const uploadAvatarForMini = (filePath: string): Promise<{
    url: string
    size: number
    originalName: string
    contentType: string
}> => {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync(USER_TOKEN)
        console.log('上传头像 - 当前token:', token)
        console.log('上传头像 - API地址:', `${API_BASE_URL}${fileApi.uploadAvatar}`)
        
        if (!token) {
            console.error('上传头像失败 - 未找到token')
            reject(new Error('用户未登录，请先登录'))
            return
        }

        uni.uploadFile({
            url: `${API_BASE_URL}${fileApi.uploadAvatar}`,
            filePath: filePath,
            name: 'file',
            header: {
                'token': token
            },
            success: (uploadFileRes) => {
                try {
                    const data = JSON.parse(uploadFileRes.data)
                    if (data.code === 200) {
                        resolve(data.data)
                    } else {
                        reject(new Error(data.message || '上传失败'))
                    }
                } catch (error) {
                    reject(new Error('解析响应数据失败'))
                }
            },
            fail: (error) => {
                reject(new Error('上传请求失败'))
            }
        })
    })
}