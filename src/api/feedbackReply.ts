import { get } from './request'

/**
 * 反馈回复相关接口
 */
export const feedbackReplyApi = {
    // 获取反馈回复列表
    list: "/mini/feedback/reply/list"
}

/**
 * 反馈回复记录
 */
export interface FeedbackReply {
    id: string
    feedbackId: string // 反馈ID
    content: string // 回复内容
    replyType: string // 回复类型：REPLY-回复，NOTE-备注
    replyUserId?: string // 回复人ID
    replyUserName?: string // 回复人姓名
    isInternal: number // 是否内部回复（0-否，1-是）
    attachmentUrl?: string // 附件URL
    createTime: string // 创建时间
}

/**
 * 获取反馈回复列表
 * @param feedbackId 反馈ID
 */
export const getFeedbackReplyList = (feedbackId: string): Promise<FeedbackReply[]> => {
    return get<FeedbackReply[]>(feedbackReplyApi.list, { feedbackId })
}
