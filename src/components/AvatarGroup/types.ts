// 用户信息接口
export interface IUser {
  id: string
  name?: string
  nickname?: string
  avatar?: string
}

// 组件属性接口
export interface IAvatarGroupProps {
  userList: IUser[] // 用户列表
  activeIds?: string[] // 激活状态的用户ID数组
  maxShow?: number // 最大显示数量，超出显示省略
  size?: 'small' | 'medium' | 'large' // 头像尺寸
  clickable?: boolean // 是否可点击
}

// 组件事件接口
export interface IAvatarGroupEmits {
  (e: 'click', user: IUser, index: number): void
}
