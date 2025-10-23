import { get, post } from './request'
import type { PageResult } from '@/types/common'

// 通知公告接口地址
export const noticeApi = {
    // 获取通知公告分页列表
    page: '/mini/notice/page',
    // 获取通知公告详情
    detail: '/mini/notice/detail',
    // 获取最新通知公告
    latest: '/mini/notice/latest',
    // 根据类型获取通知公告
    type: '/mini/notice/type',
    // 获取通知公告类型枚举
    typeEnum: '/mini/notice/typeEnum',
    // 获取发布位置枚举
    placeEnum: '/mini/notice/placeEnum'
}

// 通知公告相关类型定义
export interface NoticePageParams {
    current?: number
    size?: number
    title?: string
    type?: string
    place?: string
    status?: string
    sortField?: string
    sortOrder?: string
}

export interface NoticeDetailParams {
    id: string
}

export interface NoticeLimitParams {
    limit?: number
}

export interface NoticeTypeParams {
    type: string
    limit?: number
}

export interface NoticeItem {
    id: string
    title: string
    image?: string
    content?: string
    digest?: string
    type: string
    place: string
    status: string
    remark?: string
    sortCode?: string
    extJson?: string
    createTime: string
    updateTime: string
    createUser?: string
    updateUser?: string
}

export interface NoticeDetail extends NoticeItem {
    content: string
    digest: string
}


// API函数
export const getNoticePage = (params: NoticePageParams): Promise<PageResult<NoticeItem>> => {
    return get<PageResult<NoticeItem>>(noticeApi.page, params)
}

export const getNoticeDetail = (params: NoticeDetailParams): Promise<NoticeDetail> => {
    return get<NoticeDetail>(noticeApi.detail, params)
}

export const getLatestNotices = (params?: NoticeLimitParams): Promise<NoticeItem[]> => {
    return get<NoticeItem[]>(noticeApi.latest, params)
}

export const getNoticesByType = (params: NoticeTypeParams): Promise<NoticeItem[]> => {
    return get<NoticeItem[]>(noticeApi.type, params)
}

export const getNoticeTypeEnum = (): Promise<Record<string, string>> => {
    return get<Record<string, string>>(noticeApi.typeEnum)
}

export const getPlaceEnum = (): Promise<Record<string, string>> => {
    return get<Record<string, string>>(noticeApi.placeEnum)
}