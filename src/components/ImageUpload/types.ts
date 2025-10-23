/**
 * 图片上传组件相关类型定义
 */

export interface ImageUploadProps {
  /** v-model 绑定的图片URL */
  modelValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 提示信息 */
  tip?: string
  /** 图标名称 */
  icon?: string
  /** 图标大小 */
  iconSize?: number | string
  /** 图标颜色 */
  iconColor?: string
  /** 组件宽度 */
  width?: number | string
  /** 组件高度 */
  height?: number | string
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 最大选择数量 */
  maxCount?: number
  /** 接受的文件类型 */
  acceptTypes?: string[]
  /** 是否可删除 */
  deletable?: boolean
  /** 图片来源 */
  sourceType?: ('album' | 'camera')[]
  /** 上传类型 */
  uploadType?: 'image' | 'avatar'
  /** 是否支持全屏预览 */
  previewFullImage?: boolean
}

export interface ImageUploadEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'success', result: any): void
  (e: 'error', error: any): void
  (e: 'delete'): void
  (e: 'beforeUpload', file: FileInfo): boolean | Promise<boolean>
}

export interface FileInfo {
  /** 文件路径 */
  path: string
  /** 文件大小 */
  size: number
  /** 文件类型 */
  type: string
}

export interface UploadResult {
  /** 文件URL */
  url: string
  /** 文件大小 */
  size: number
  /** 原始文件名 */
  originalName: string
  /** 文件类型 */
  contentType: string
}
