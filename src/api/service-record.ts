import { get, post } from './request'
import type { PageResult } from '@/types/common'

// 服务记录接口地址
export const serviceRecordApi = {
    // 获取服务记录分页列表
    page: '/mini/serviceRecord/page',
    // 获取服务记录详情
    detail: '/mini/serviceRecord/detail',
    // 获取服务统计数据
    stats: '/mini/serviceRecord/stats',
    // 下载服务证书
    downloadCert: '/mini/serviceRecord/downloadCert'
}

// 服务记录相关类型定义
export interface ServiceRecordPageParams {
    current?: number
    size?: number
    userId?: string
    activityId?: string
    startDate?: string
    endDate?: string
    status?: string
}

export interface ServiceRecordDetailParams {
    id: string
}

export interface ServiceRecordStatsParams {
    userId?: string
    startDate?: string
    endDate?: string
}

export interface ServiceRecordItem {
    id: string
    activityId: string
    activityTitle: string
    location: string
    serviceDate: string
    serviceTime: string
    serviceHours: number
    actualHours: number // 实际服务时长
    checkinTime: string // 签到时间
    checkoutTime: string // 签退时间
    checkoutType: 'AUTO' | 'MANUAL' // 签退类型
    isEarlyLeave: boolean // 是否提前离开
    credits: number
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
    verifyStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    canDownload: boolean
    description?: string
    createTime: string
    updateTime?: string
}

export interface ServiceRecordDetail extends ServiceRecordItem {
    content: string
    images?: string[]
    verifyTime?: string
    verifyUser?: string
    verifyRemark?: string
}

export interface ServiceRecordStats {
    totalHours: number
    totalActivities: number
    totalCredits: number
    monthlyHours: number
    monthlyActivities: number
    monthlyCredits: number
}

// API函数
export const getServiceRecordPage = (params: ServiceRecordPageParams): Promise<PageResult<ServiceRecordItem>> => {
    return get<PageResult<ServiceRecordItem>>(serviceRecordApi.page, params)
}

export const getServiceRecordDetail = (params: ServiceRecordDetailParams): Promise<ServiceRecordDetail> => {
    return get<ServiceRecordDetail>(serviceRecordApi.detail, params)
}

export const getServiceRecordStats = (params: ServiceRecordStatsParams): Promise<ServiceRecordStats> => {
    return get<ServiceRecordStats>(serviceRecordApi.stats, params)
}

export const downloadServiceCertificate = (params: {
    recordId: string
    userId: string
}): Promise<string> => {
    return post<string>(serviceRecordApi.downloadCert, params)
}