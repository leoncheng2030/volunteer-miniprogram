import { get, post } from './request'
import type { PageResult } from '@/types/common'

// 活动接口地址
export const activityApi = {
    // 获取活动分页列表
    page: '/mini/activity/page',
    // 获取活动详情
    detail: '/mini/activity/detail',
    // 获取热门活动
    hot: '/mini/activity/hot',
    // 获取最新活动
    latest: '/mini/activity/latest',
    // 根据状态获取活动
    status: '/mini/activity/status',
    // 获取活动状态枚举
    statusEnum: '/mini/activity/statusEnum',
    // 立即报名
    signup: '/mini/activity/signup',
    // 批量报名
    batchSignup: '/mini/activity/batchSignup',
    // 检查报名状态
    checkSignup: '/mini/activity/checkSignup'
}

// 活动相关类型定义
export interface ActivityPageParams {
    current?: number
    size?: number
    status?: string
    searchKey?: string
}

export interface ActivityDetailParams {
    id: string
}

export interface ActivityLimitParams {
    limit?: number
}

export interface ActivityStatusParams {
    status: 'DRAFT' | 'RECRUITING' | 'ONGOING' | 'ENDED' | 'CANCELLED'
    limit?: number
}

export interface UserActivityParams {
    current?: number
    size?: number
    userId?: string
    status?: string
}
export interface ActivityItem {
    id: string
    title: string
    coverImage?: string
    content?: string
    description?: string
    activityDate: string
    startTime: string
    endTime: string
    location: string
    recruitCount: number
    signedCount: number
    serviceHours: number
    signupDeadline: string
    contactPerson: string
    contactPhone: string
    status: string
    orgId?: string
    createTime: string
    // 计算字段
    isFull: boolean
    remainingCount: number
    signupProgress: number
}

export interface ActivityDetail extends ActivityItem {
    content: string
    // 格式化后的显示字段
    date?: string
    time?: string
    deadline?: string
    image?: string
    description?: string
    // 活动配置
    allowResignup?: boolean
    peerCountOccupiesQuota?: boolean // 同行人数是否占用招募名额
    activityPoints?: number // 活动可获得积分
}


// API函数
export const getActivityPage = (params: ActivityPageParams): Promise<PageResult<ActivityItem>> => {
    return get<PageResult<ActivityItem>>(activityApi.page, params)
}

export const getActivityDetail = (params: ActivityDetailParams): Promise<ActivityDetail> => {
    return get<ActivityDetail>(activityApi.detail, params)
}

export const getHotActivities = (params?: ActivityLimitParams): Promise<ActivityItem[]> => {
    return get<ActivityItem[]>(activityApi.hot, params)
}

export const getLatestActivities = (params?: ActivityLimitParams): Promise<ActivityItem[]> => {
    return get<ActivityItem[]>(activityApi.latest, params)
}

export const getActivitiesByStatus = (params: ActivityStatusParams): Promise<ActivityItem[]> => {
    return get<ActivityItem[]>(activityApi.status, params)
}

export const getActivityStatusEnum = (): Promise<Record<string, string>> => {
    return get<Record<string, string>>(activityApi.statusEnum)
}

// 立即报名
export const signupActivity = (params: {
    activityId: string
    signupUserId: string
    actualUserId?: string
}): Promise<string> => {
    return post<string>(activityApi.signup, params)
}

// 批量报名
export const batchSignupActivity = (params: {
    activityId: string
    signupUserId: string
    phone: string
    remark?: string
    needInsurance?: boolean
    insuranceType?: string
    peerNumber?: number
    actualUsers: Array<{
        userId: string
        userName?: string
        userType: string
    }>
}): Promise<{
    successCount: number
    failedCount: number
    successUserIds: string[]
    failedUsers: Array<{
        userId: string
        userName: string
        reason: string
    }>
}> => {
    return post(activityApi.batchSignup, params)
}

// 检查报名状态
export const checkSignupStatus = (params: {
    activityId: string
    userId: string
}): Promise<{
    isSignedUp: boolean
    signedVolunteerIds: string[]
    signupInfo: any
}> => {
    return get(activityApi.checkSignup, params)
}

// 获取用户活动列表
export const getUserActivities = (params: UserActivityParams): Promise<PageResult<ActivityItem>> => {
    return get<PageResult<ActivityItem>>('/mini/activity/userActivities', params)
}

// 取消报名
export const cancelSignup = (params: {
    activityId: string
    userId: string
}): Promise<string> => {
    return post<string>('/mini/activity/cancelSignup', params)
}