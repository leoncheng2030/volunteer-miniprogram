import { get, post } from './request'

/**
 * 反馈相关接口
 */
export const feedbackApi = {
    // 提交反馈
    add: "/mini/feedback/add",
    // 反馈列表（用户自己的反馈记录）
    list: "/mini/feedback/page",
    // 反馈详情
    detail: "/mini/feedback/detail",
    // 满意度评价
    satisfaction: "/mini/feedback/satisfaction"
}

/**
 * 反馈类型
 */
export interface FeedbackType {
    label: string // 类型标签
    value: string // 类型值
    icon: string // 图标名称
    color: string // 颜色
}

/**
 * 提交反馈参数
 */
export interface AddFeedbackParams {
    type: string // 反馈类型：FEATURE_SUGGESTION-功能建议，BUG_REPORT-问题反馈，ACTIVITY_INQUIRY-活动咨询，COMPLAINT-投诉建议，OTHER-其他
    content: string // 反馈内容
    contactName?: string // 联系人姓名
    contactPhone?: string // 联系电话
    contactEmail?: string // 联系邮箱
    attachmentUrl?: string // 附件URL（多个用逗号分隔）
    title?: string // 反馈标题
}

/**
 * 反馈记录
 */
export interface FeedbackRecord {
    id: string
    type: string // 反馈类型
    title?: string // 反馈标题
    content: string // 反馈内容
    status: string // 处理状态：PENDING-待处理，PROCESSING-处理中，RESOLVED-已解决，CLOSED-已关闭
    contactName?: string
    contactPhone?: string
    contactEmail?: string
    attachmentUrl?: string
    createTime: string
    satisfaction?: number // 满意度评分（1-5分）
    evaluation?: string // 评价内容
    resolveResult?: string // 处理结果
    resolveTime?: string // 解决时间
    processTime?: string // 处理时间
}

/**
 * 分页查询参数
 */
export interface PageFeedbackParams {
    current?: number // 当前页码
    size?: number // 每页数量
    type?: string // 反馈类型筛选
    status?: string // 状态筛选
}

/**
 * 分页返回结果
 */
export interface PageResult<T> {
    records: T[] // 数据列表
    total: number // 总数
    current: number // 当前页
    size: number // 每页数量
}

/**
 * 满意度评价参数
 */
export interface SatisfactionParams {
    id: string // 反馈ID
    satisfaction: number // 满意度评分（1-5分）
    evaluation?: string // 评价内容
}

/**
 * 提交反馈
 */
export const addFeedback = (params: AddFeedbackParams): Promise<any> => {
    return post(feedbackApi.add, params)
}

/**
 * 获取反馈列表
 */
export const getFeedbackList = (params?: PageFeedbackParams): Promise<PageResult<FeedbackRecord>> => {
    return get<PageResult<FeedbackRecord>>(feedbackApi.list, params)
}

/**
 * 获取反馈详情
 */
export const getFeedbackDetail = (id: string): Promise<FeedbackRecord> => {
    return get<FeedbackRecord>(feedbackApi.detail, { id })
}

/**
 * 满意度评价
 */
export const submitSatisfaction = (params: SatisfactionParams): Promise<any> => {
    return post(feedbackApi.satisfaction, params)
}
