import { get, post } from './request'

// 签到接口地址
export const checkinApi = {
    // 获取签到候选人列表
    candidates: '/mini/checkin/candidates',
    // 批量签到
    batch: '/mini/checkin/batch',
    // 查询签到状态
    checkStatus: '/mini/checkin/checkStatus'
}

// 签到候选人类型
export interface CheckinCandidate {
    signupId: string
    userId: string
    userName: string
    avatar: string
    isCheckedIn: boolean
    checkInTime?: string
}

// 活动基本信息
export interface ActivityInfo {
    id: string
    title: string
    activityDate: string
    startTime: string
    endTime: string
    location: string
    serviceHours: number
}

// 获取签到候选人参数
export interface GetCandidatesParams {
    activityId: string
    operatorId: string
}

// 获取签到候选人响应
export interface GetCandidatesResponse {
    activity: ActivityInfo
    candidates: CheckinCandidate[]
}

// 批量签到参数
export interface BatchCheckinParams {
    activityId: string
    operatorId: string
    signupIds: string[]
    location?: {
        latitude: number
        longitude: number
        address: string
    }
}

// 批量签到结果
export interface BatchCheckinResult {
    signupId: string
    success: boolean
    message: string
}

// 批量签到响应
export interface BatchCheckinResponse {
    successCount: number
    failedCount: number
    results: BatchCheckinResult[]
}

/**
 * 获取签到候选人(该监护人为哪些人报名了此活动)
 */
export const getCheckinCandidates = (params: GetCandidatesParams): Promise<GetCandidatesResponse> => {
    return get<GetCandidatesResponse>(checkinApi.candidates, params)
}

/**
 * 批量签到
 */
export const batchCheckin = (params: BatchCheckinParams): Promise<BatchCheckinResponse> => {
    return post<BatchCheckinResponse>(checkinApi.batch, params)
}

/**
 * 查询签到状态
 */
export const checkCheckinStatus = (params: {
    activityId: string
    userId: string
}): Promise<{
    isCheckedIn: boolean
    checkInTime?: string
}> => {
    return get(checkinApi.checkStatus, params)
}
