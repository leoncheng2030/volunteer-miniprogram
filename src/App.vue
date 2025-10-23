<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
// #ifdef H5
import { initH5TabBar } from '@/utils/h5-tabbar-helper';
// #endif

// 应用启动
onLaunch(() => {
    console.log('🚀 应用启动');
    
    // #ifdef H5
    // 初始化H5 TabBar
    initH5TabBar();
    // #endif
});

onShow(() => {
    // 应用显示
});

onHide(() => {
    // 应用隐藏
});
</script>
<style lang="scss">
@import "uview-pro/index.scss";
@import '@/static/css/fonts/iconfont.css';
@import '@/static/css/h5-tabbar.scss';
@import '@/styles/layout.scss';

uni-page-body,
html,
body {
    height: 100%;
}

page {
    width: 100%; 
    min-height: 100%;  
    font-size: 26rpx;
    color: #303133;  
    background-color: #f6f6f6;   
}

/* H5环境下的页面内容间距调整 */
/* #ifdef H5 */
/* 确保页面内容不被TabBar遮挡 */
.uni-page-wrapper {
    padding-bottom: 60px !important;
}

.uni-page-body {
    padding-bottom: 60px !important;
}

/* 确保所有页面容器都有足够的底部间距 */
page {
    min-height: 100vh;
    padding-bottom: 60px !important;
    box-sizing: border-box !important;
}

/* 修复H5环境下可能的滚动问题 */
body {
    padding-bottom: 60px !important;
}

/* 隐藏原生TabBar，使用自定义H5 TabBar */
.uni-tabbar {
    display: none !important;
}
/* #endif */

/* 小程序环境下的样式保持原有逻辑 */
/* #ifndef H5 */
page {
    padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
</style>
