/**
 * 小雷锋志愿者主题色彩配置
 * 统一管理整个应用的色彩风格
 */

export const theme = {
  // 主色调 - 小雷锋红色主题
  primary: {
    main: '#ff6b6b',      // 主红色
    light: '#ff8e53',     // 橙红色
    dark: '#e55555',      // 深红色
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
  },

  // 功能色彩
  functional: {
    success: '#4CAF50',   // 成功 - 绿色
    warning: '#FF9800',   // 警告 - 橙色
    error: '#F44336',     // 错误 - 红色
    info: '#2196F3'       // 信息 - 蓝色
  },

  // 中性色彩
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    }
  },

  // 背景色彩
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#f5f5f5',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },

  // 文字色彩
  text: {
    primary: '#212121',    // 主要文字
    secondary: '#666666',  // 次要文字
    tertiary: '#999999',   // 辅助文字
    placeholder: '#cccccc', // 占位符文字
    inverse: '#ffffff'     // 反色文字
  },

  // 边框色彩
  border: {
    light: '#f0f0f0',
    medium: '#e0e0e0',
    dark: '#cccccc'
  },

  // 阴影
  shadow: {
    small: '0 2rpx 8rpx rgba(0, 0, 0, 0.06)',
    medium: '0 4rpx 20rpx rgba(0, 0, 0, 0.08)',
    large: '0 8rpx 30rpx rgba(0, 0, 0, 0.12)',
    colored: '0 4rpx 20rpx rgba(255, 107, 107, 0.15)'
  },

  // 圆角
  borderRadius: {
    small: '8rpx',
    medium: '12rpx',
    large: '16rpx',
    round: '50rpx'
  },

  // 间距
  spacing: {
    xs: '8rpx',
    sm: '16rpx',
    md: '24rpx',
    lg: '32rpx',
    xl: '48rpx'
  }
}

// 主题相关的CSS变量
export const cssVariables = {
  '--primary-color': theme.primary.main,
  '--primary-light': theme.primary.light,
  '--primary-dark': theme.primary.dark,
  '--primary-gradient': theme.primary.gradient,
  '--success-color': theme.functional.success,
  '--warning-color': theme.functional.warning,
  '--error-color': theme.functional.error,
  '--info-color': theme.functional.info,
  '--text-primary': theme.text.primary,
  '--text-secondary': theme.text.secondary,
  '--text-tertiary': theme.text.tertiary,
  '--bg-primary': theme.background.primary,
  '--bg-secondary': theme.background.secondary,
  '--bg-tertiary': theme.background.tertiary,
  '--border-light': theme.border.light,
  '--border-medium': theme.border.medium,
  '--shadow-small': theme.shadow.small,
  '--shadow-medium': theme.shadow.medium,
  '--shadow-large': theme.shadow.large
}

// 导出主题相关的SCSS混合器
export const themeMixins = {
  // 主色渐变背景
  primaryGradient: `
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  `,
  
  // 主色按钮样式
  primaryButton: `
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: #ffffff;
    border: none;
    border-radius: 44rpx;
    font-weight: bold;
  `,
  
  // 标题装饰条
  titleDecoration: `
    width: 6rpx;
    height: 36rpx;
    background: linear-gradient(to bottom, #ff6b6b, #ff8e53);
    border-radius: 3rpx;
  `,
  
  // 卡片阴影
  cardShadow: `
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  `,
  
  // 彩色阴影
  coloredShadow: `
    box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.15);
  `
}

export default theme
