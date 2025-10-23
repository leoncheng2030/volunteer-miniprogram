# H5 TabBar 组件

## 概述

H5 TabBar 组件是为了解决 uni-app 在 H5 环境下原生 TabBar 显示问题而开发的专用组件。该组件提供了与小程序原生 TabBar 相同的功能和视觉体验。

## 功能特性

- ✅ 完全兼容 H5 环境
- ✅ 支持三个主要页面：首页、共建、我的
- ✅ 响应式设计，适配不同屏幕尺寸
- ✅ 支持安全区域适配（iOS 刘海屏）
- ✅ 平滑的切换动画效果
- ✅ 自动隐藏原生 TabBar
- ✅ 路由状态同步

## 文件结构

```
src/components/H5TabBar/
├── index.vue          # 主组件文件
├── README.md          # 说明文档
└── types.ts           # 类型定义（可选）
```

## 使用方法

### 1. 在页面中引入组件

```vue
<template>
  <view>
    <!-- 页面内容 -->
    <view>页面内容</view>
    
    <!-- H5专用TabBar -->
    <!-- #ifdef H5 -->
    <H5TabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// #ifdef H5
import H5TabBar from "@/components/H5TabBar/index.vue";
// #endif
</script>
```

### 2. 在页面生命周期中隐藏原生TabBar

```javascript
// #ifdef H5
onLoad(() => {
  uni.hideTabBar()
})
// #endif
```

### 3. 全局初始化（在 App.vue 中）

```vue
<script setup lang="ts">
// #ifdef H5
import { initH5TabBar } from '@/utils/h5-tabbar-helper';
// #endif

onLaunch(() => {
  console.log('🚀 应用启动');
  
  // #ifdef H5
  // 初始化H5 TabBar
  initH5TabBar();
  // #endif
});
</script>
```

## 配置说明

### TabBar 页面配置

组件默认支持以下页面：

- `pages/index/index` - 首页
- `pages/youpei/index` - 共建页面
- `pages/user/user` - 我的页面

### 图标配置

图标使用项目中的静态资源：

- 首页：`/static/images/tab_home.png`（默认）、`/static/images/tab_home_s.png`（激活）
- 共建：`/static/images/tab_home.png`（默认）、`/static/images/tab_home_s.png`（激活）
- 我的：`/static/images/tab_user.png`（默认）、`/static/images/tab_user_s.png`（激活）

## 样式定制

### 全局样式

主要的样式文件位于：
- `src/static/css/h5-tabbar.scss` - H5 TabBar 专用样式
- `src/App.vue` - 全局样式配置

### 主题颜色

```scss
// 主要颜色
$tabbar-active-color: #ff6b6b;
$tabbar-default-color: #666;
$tabbar-bg-color: #ffffff;
$tabbar-border-color: #e5e5e5;
```

## 兼容性

- ✅ H5 环境
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 字节跳动小程序

## 注意事项

1. **条件编译**：组件使用 uni-app 的条件编译，只在 H5 环境下生效
2. **页面路径**：确保 TabBar 页面路径在 `pages.json` 中正确配置
3. **安全区域**：自动适配 iOS 设备的安全区域
4. **路由同步**：组件会自动监听路由变化并更新激活状态

## 故障排除

### TabBar 不显示

1. 检查是否正确引入组件
2. 确认使用了条件编译 `<!-- #ifdef H5 -->`
3. 检查 `onLoad` 中是否调用了 `uni.hideTabBar()`

### 页面跳转异常

1. 确认页面路径在 `pages.json` 中配置正确
2. 检查是否使用了 `uni.switchTab` 方法
3. 验证页面是否配置为 TabBar 页面

### 样式问题

1. 检查样式文件是否正确引入
2. 确认 z-index 设置是否正确
3. 验证页面底部是否有足够的 padding

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 H5 环境下的 TabBar 功能
- 实现基本的页面切换和状态管理
- 添加响应式设计和安全区域适配

## 贡献

如有问题或建议，请联系开发团队。