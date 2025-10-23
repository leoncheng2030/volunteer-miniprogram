import { get, post } from './request'
import type { IVolunteerInfo, IAddVolunteerParams } from '@/types/user.d'

export const userApi = {
    detail: "/mini/clientAccount/detail",
    flow: "/mini/clientAccount/flow",
    updateUserInfo: "/auth/c/updateUserInfo",
    // 小雷锋管理相关接口
    volunteerList: "/mini/volunteer/list", // 获取监护人下的小雷锋列表
    volunteerDetail: "/mini/volunteer/detail", // 获取小雷锋详情
    addVolunteer: "/mini/volunteer/add", // 新增小雷锋
    deleteVolunteer: "/mini/volunteer/delete", // 删除小雷锋
    updateVolunteer: "/mini/volunteer/update", // 更新小雷锋信息
    // 用户统计数据
    userStats: "/mini/user/stats", // 获取用户统计数据
};

// 小雷锋管理API函数
export const getVolunteerList = (): Promise<IVolunteerInfo[]> => {
    return get<IVolunteerInfo[]>(userApi.volunteerList)
}

export const getVolunteerDetail = (id: string): Promise<any> => {
    return get(userApi.volunteerDetail, { id })
}

export const addVolunteer = (params: IAddVolunteerParams): Promise<any> => {
    return post(userApi.addVolunteer, params)
}

export const deleteVolunteer = (id: string): Promise<any> => {
    return post(userApi.deleteVolunteer, { id })
}

export const updateVolunteer = (params: Partial<IVolunteerInfo> & { id: string }): Promise<any> => {
    return post(userApi.updateVolunteer, params)
}

// 用户统计数据接口
export interface UserStats {
    totalActivities: number // 参与活动数
    totalHours: number // 服务时长
    totalCredits: number // 获得积分
}

export const getUserStats = (userId: string): Promise<UserStats> => {
    return get<UserStats>(userApi.userStats, { userId })
}

export const loginApi = {
    login: "/auth/c/doLoginByMini",
    getLoginUser: "/auth/c/getLoginUser",
    logins: "/auth/c/login",
};
