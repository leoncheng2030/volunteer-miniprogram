# 志愿者服务小程序

一个基于 uni-app 框架开发的志愿者服务小程序，提供志愿活动管理、报名签到、服务记录等功能。

## 项目概述

本项目是一个志愿者服务管理平台，支持多端部署（微信小程序、H5、App等），旨在为志愿者组织和个人提供便捷的活动管理和服务记录功能。

## 主要功能

### 🏠 首页
- 轮播图展示
- 通知公告
- 志愿活动推荐
- 快捷入口

### 📋 志愿活动
- 活动列表浏览
- 活动详情查看
- 活动报名功能
- 活动签到打卡
- 我的活动管理

### 📢 通知公告
- 公告列表展示
- 公告详情查看
- 实时通知推送

### 👤 个人中心
- 个人资料管理
- 志愿者信息维护
- 服务记录查询
- 意见反馈
- 关于我们

### 🎯 特色功能
- 多平台支持（微信小程序、H5、App）
- 响应式设计，适配各种设备
- 实时消息通知
- 地理位置服务
- 图片上传处理

## 技术栈

### 核心框架
- **uni-app** - 跨平台开发框架
- **Vue 3** - 前端框架
- **TypeScript** - 类型支持
- **Vite** - 构建工具

### UI 组件
- **uView Plus** - UI 组件库
- **uni-ui** - 官方组件库
- **UnoCSS** - 原子化CSS框架

### 状态管理
- **Pinia** - 状态管理

### 工具库
- **lodash-es** - 工具函数库
- **miniprogram-sm-crypto** - 加密库
- **vue-request** - 请求库
- **await-to-js** - 异步错误处理

### 图形处理
- **leafer-ui** - 2D图形渲染引擎

## 项目结构

```
src/
├── api/                    # API接口
│   ├── activity.ts        # 活动相关接口
│   ├── auth.ts           # 认证接口
│   ├── notice.ts         # 通知接口
│   └── user.ts           # 用户接口
├── components/            # 公共组件
│   ├── ActivityItem/     # 活动项组件
│   ├── customEmpty/      # 空状态组件
│   ├── CustomNavBar/     # 自定义导航栏
│   ├── ImageUpload/      # 图片上传组件
│   └── ...
├── pages/                # 页面
│   ├── index/           # 首页
│   ├── activity/        # 活动相关页面
│   ├── user/            # 用户中心页面
│   ├── login/           # 登录页面
│   ├── register/        # 注册页面
│   └── notice/          # 通知页面
├── router/              # 路由配置
├── store/               # 状态管理
├── styles/              # 样式文件
├── types/               # 类型定义
├── utils/               # 工具函数
├── static/              # 静态资源
└── App.vue             # 应用入口
```

## 开发环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0
- 微信开发者工具（开发微信小程序）

## 安装与运行

### 1. 克隆项目
```bash
git clone [项目地址]
cd volunteer-miniprogram
```

### 2. 安装依赖
```bash
# 使用 pnpm 安装（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3. 开发模式

#### 微信小程序开发
```bash
pnpm dev:mp-weixin
```
然后在微信开发者工具中导入 `dist/dev/mp-weixin` 目录

#### H5开发
```bash
pnpm dev:h5
```

#### 其他平台
```bash
# 支付宝小程序
pnpm dev:mp-alipay

# 百度小程序
pnpm dev:mp-baidu

# QQ小程序
pnpm dev:mp-qq
```

### 4. 构建生产版本

```bash
# 微信小程序
pnpm build:mp-weixin

# H5
pnpm build:h5

# 其他平台
pnpm build:mp-alipay
pnpm build:mp-baidu
pnpm build:mp-qq
```

## 开发规范

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 规范
- 使用 ESLint + Prettier 进行代码格式化

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 热修复分支

## 配置说明

### 环境配置
项目支持多环境配置，相关配置文件：
- `src/config/` - 项目配置
- `vite.config.ts` - Vite构建配置
- `unocss.config.ts` - UnoCSS配置

### API配置
API接口配置在 `src/api/request.ts` 中，可根据不同环境配置不同的baseURL。

## 部署说明

### 微信小程序
1. 运行 `pnpm build:mp-weixin`
2. 在微信开发者工具中上传代码
3. 提交审核并发布

### H5部署
1. 运行 `pnpm build:h5`
2. 将 `dist/build/h5` 目录部署到服务器

## 常见问题

### Q: 如何添加新的页面？
A: 在 `src/pages/` 目录下创建页面文件，然后在 `src/pages.json` 中注册页面路由。

### Q: 如何添加新的API接口？
A: 在 `src/api/` 目录下创建对应的接口文件，使用统一的request方法。

### Q: 如何自定义主题？
A: 修改 `src/config/theme.ts` 文件中的主题配置。

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至：[your-email@example.com]

## 更新日志

### v1.0.0
- 初始版本发布
- 实现基础功能模块
- 支持多端部署
