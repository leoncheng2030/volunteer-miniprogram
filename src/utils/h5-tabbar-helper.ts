/**
 * H5 TabBar 辅助工具
 * 用于处理H5环境下的TabBar显示和交互
 */

// #ifdef H5
export class H5TabBarHelper {
    private static instance: H5TabBarHelper;
    private isInitialized = false;

    static getInstance(): H5TabBarHelper {
        if (!H5TabBarHelper.instance) {
            H5TabBarHelper.instance = new H5TabBarHelper();
        }
        return H5TabBarHelper.instance;
    }

    /**
     * 初始化H5 TabBar
     */
    init() {
        if (this.isInitialized) return;
        
        // 延迟隐藏原生TabBar，避免在非TabBar页面调用时的错误
        setTimeout(() => {
            uni.hideTabBar().catch(err => {
                console.log('隐藏TabBar失败:', err);
            });
        }, 100);
        
        // 监听路由变化
        this.setupRouteListener();
        
        // 设置页面样式
        this.setupPageStyles();
        
        this.isInitialized = true;
    }

    /**
     * 设置路由监听
     */
    private setupRouteListener() {
        // 监听页面显示事件
        const originalOnShow = uni.onAppShow;
        uni.onAppShow = (options: any) => {
            // 确保TabBar在页面切换时正确显示
            this.ensureTabBarVisible();
            if (originalOnShow) {
                originalOnShow(options);
            }
        };
    }

    /**
     * 设置页面样式
     */
    private setupPageStyles() {
        // 添加全局样式
        const style = document.createElement('style');
        style.textContent = `
            /* H5 TabBar 全局样式 */
            body {
                padding-bottom: 70px !important;
            }
            
            .uni-page-wrapper {
                padding-bottom: 70px !important;
            }
            
            /* 确保TabBar在最上层 */
            .h5-tabbar {
                z-index: 9999 !important;
                height: 50px !important;
            }
            
            /* 防止页面内容被TabBar遮挡 */
            .uni-page-body {
                padding-bottom: 70px !important;
            }
            
            /* 确保scroll-view有足够的底部空间 */
            scroll-view {
                padding-bottom: 70px !important;
            }
            
            /* 特定页面容器的底部间距 */
            .screen-full {
                padding-bottom: 70px !important;
            }
            
            .home-bg {
                padding-bottom: 70px !important;
            }
            
            .youpei-container {
                padding-bottom: 70px !important;
            }
            
            .user-container {
                padding-bottom: 70px !important;
            }
            
            /* 修复iOS Safari的安全区域问题 */
            @supports (padding: max(0px)) {
                .h5-tabbar {
                    padding-bottom: max(0px, env(safe-area-inset-bottom)) !important;
                    height: calc(50px + max(0px, env(safe-area-inset-bottom))) !important;
                }
                
                body, .uni-page-wrapper, .uni-page-body {
                    padding-bottom: calc(70px + max(0px, env(safe-area-inset-bottom))) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 确保TabBar可见
     */
    private ensureTabBarVisible() {
        // 检查当前页面是否需要显示TabBar
        const pages = getCurrentPages();
        if (pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            const route = currentPage.route;
            
            // 检查是否是TabBar页面
            const tabBarPages = [
                'pages/index/index',
                'pages/youpei/index',
                'pages/user/user'
            ];
            
            if (tabBarPages.includes(route)) {
                // 确保TabBar显示
                setTimeout(() => {
                    const tabBar = document.querySelector('.h5-tabbar');
                    if (tabBar) {
                        (tabBar as HTMLElement).style.display = 'flex';
                    }
                }, 100);
            }
        }
    }

    /**
     * 切换到指定TabBar页面
     */
    switchTab(pagePath: string) {
        uni.switchTab({
            url: `/${pagePath}`,
            success: () => {
                this.ensureTabBarVisible();
            },
            fail: (error) => {
                console.error('切换TabBar页面失败:', error);
            }
        });
    }

    /**
     * 更新当前激活的Tab
     */
    updateActiveTab(currentRoute: string) {
        // 更新TabBar组件的激活状态
        const event = new CustomEvent('tabbar-update', {
            detail: { currentRoute }
        });
        document.dispatchEvent(event);
    }
}

// 导出单例实例
export const h5TabBarHelper = H5TabBarHelper.getInstance();

// 自动初始化
export const initH5TabBar = () => {
    h5TabBarHelper.init();
};
// #endif

// 非H5环境下的空实现
// #ifndef H5
export const initH5TabBar = () => {
    // 非H5环境不做处理
};
// #endif