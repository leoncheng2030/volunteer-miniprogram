<template>
    <view class="page-container">
        <!-- 自定义导航栏 - 仅在小程序环境下显示 -->
        <!-- #ifndef H5 -->
        <view class="navbar-container">
            <u-navbar title="首页" title-color="#fff" :isBack="false" :borderBottom="false"
                :background="{ backgroundColor: '#' }"></u-navbar>
        </view>
        <!-- #endif -->

        <!-- 内容区域 -->
        <view class="content-area">
            <scroll-view class="scroll-container" scrollY>
                <!-- 轮播图区域 -->
                <view class="card-container">
                    <u-swiper :list="bannerList" @click="onBannerClick" :autoplay="true" :interval="3000"
                        :duration="500" :circular="true" :height="300" :radius="12" :indicatorPos="'bottomRight'"
                        :indicatorActiveColor="'#ffffff'" :indicatorColor="'rgba(255, 255, 255, 0.5)'" :bgColor="'#f8f8f8'"
                        :keyName="'image'" />
                </view>

                <!-- 通知公告区域 -->
                <view class="card-container">
                    <view class="section-header">
                        <view class="section-title">
                            <view class="title-decoration"></view>
                            <text class="title-text">通知公告</text>
                        </view>
                        <view class="view-all" @click="viewAllNotices">
                            <text class="view-all-text">查看全部</text>
                        </view>
                    </view>

                    <!-- 通知公告列表 -->
                    <view class="list-container">
                        <view v-if="noticeList.length > 0" class="notice-list">
                            <view class="notice-item" v-for="notice in noticeList" :key="notice.id"
                                @click="viewNoticeDetail(notice)">
                                <view class="notice-icon">
                                    <u-icon name="volume-fill" color="#ff6b6b" size="32"></u-icon>
                                </view>
                                <view class="notice-content">
                                    <view class="notice-title-row">
                                        <text class="notice-title">{{ notice.title }}</text>
                                    </view>
                                    <view class="notice-meta">
                                        <text class="notice-time">{{ formatNoticeTime(notice.createTime) }}</text>
                                    </view>
                                </view>
                                <view class="notice-arrow">
                                    <u-icon name="arrow-right" color="#BDBDBD" size="24"></u-icon>
                                </view>
                            </view>
                        </view>
                        <view v-else class="empty-state">
                            <view class="empty-icon">
                                <u-icon name="volume" color="#BDBDBD" size="64"></u-icon>
                            </view>
                            <text class="empty-text">暂无通知公告</text>
                        </view>
                    </view>
                </view>

                <!-- 近期活动列表 -->
                <view class="card-container">
                    <view class="section-header">
                        <view class="section-title">
                            <view class="title-decoration"></view>
                            <text class="title-text">近期活动</text>
                        </view>
                        <view class="view-all" @click="viewAllActivities">
                            <text class="view-all-text">查看全部</text>
                        </view>
                    </view>
                    
                    <view class="list-container">
                        <ActivityItem 
                            v-for="(activity, index) in activityList" 
                            :key="index" 
                            :activity="activity"
                            @click="viewActivityDetail"
                            @sign-up="handleSignUp"
                        />
                        
                        <view v-if="activityList.length === 0" class="empty-state">
                            <view class="empty-icon">
                                <u-icon name="calendar" color="#BDBDBD" size="64"></u-icon>
                            </view>
                            <text class="empty-text">暂无活动</text>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
    
    <AndPrivacy v-if="config" />
    <!-- H5专用TabBar -->
    <!-- #ifdef H5 -->
    <H5TabBar />
    <!-- #endif -->
</template>

<script setup lang="ts">
import { useConfigStore } from "@/store";
import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import { computed, reactive, toRefs, ref, onMounted } from "vue";
import { throttle } from "lodash-es";
import AndPrivacy from "@/components/andPrivacy/index.vue";
import ActivityItem from "@/components/ActivityItem/index.vue";
import { useGetConfig, useGetBanner } from "@/hooks";
import { getLatestActivities, type ActivityItem as ActivityItemType } from "@/api/activity";
import { getLatestNotices, type NoticeItem } from "@/api/notice";
// #ifdef H5
import H5TabBar from "@/components/H5TabBar/index.vue";
// #endif

// 导入用户store用于登录检查
import { useUserStore } from "@/store";

// 页面生命周期
onLoad(() => {
    // #ifdef H5
    // 延迟隐藏原生TabBar，避免在非TabBar页面调用时的错误
    setTimeout(() => {
        uni.hideTabBar().catch(err => {
            console.log('隐藏TabBar失败:', err);
        });
    }, 100);
    // #endif

    // 加载最新活动数据
    loadLatestActivities();
})

// 获取配置和轮播图
const { data: configData } = useGetConfig();
const { data: bannerData } = useGetBanner();

const configStore = useConfigStore();
const { config } = storeToRefs(configStore);

// 轮播图数据处理
const bannerList = computed(() => {
    console.log('轮播图原始数据:', bannerData.value);
    if (bannerData.value?.length) {
        const list = bannerData.value.map(item => ({
            image: item.image,
            title: item.title || '',
            link: item.pathDetails?.url || ''
        }));
        console.log('处理后的轮播图列表:', list);
        return list;
    }
    console.log('没有轮播图数据');
    return [];
});

// 轮播图点击事件
const onBannerClick = (index: number) => {
    if (bannerData.value && bannerData.value[index]) {
        const banner = bannerData.value[index];
        const pathDetails = banner.pathDetails;

        if (pathDetails?.whetherToClick === '1') {
            // 根据跳转模式处理
            switch (pathDetails.skipMode) {
                case '1': // 内部页面
                    uni.navigateTo({
                        url: pathDetails.url
                    });
                    break;
                case '2': // 外部链接
                    // #ifdef H5
                    window.open(pathDetails.url);
                    // #endif
                    // #ifndef H5
                    uni.showToast({
                        title: '请在小程序中打开',
                        icon: 'none'
                    });
                    // #endif
                    break;
                default:
                    break;
            }
        }
    }
};
const defaultData = reactive({
    navBg: true,
    disabled: false,
    scrollTops: 0,
});
const pageScroll = throttle((e: Page.PageScrollOption) => {
    const top = uni.upx2px(80);
    const { scrollTop } = e;
    defaultData.scrollTops = scrollTop;

    if (defaultData.disabled) return;
    defaultData.navBg = scrollTop < top;
}, 500);

onPageScroll(pageScroll);

// 通知公告数据
const noticeList = ref<NoticeItem[]>([]);

// 获取最新通知公告
const loadLatestNotices = async () => {
    try {
        const notices = await getLatestNotices({ limit: 5 });
        // 确保只显示前5条
        noticeList.value = notices.slice(0, 5);
        console.log('首页通知公告列表:', noticeList.value.length, '条');
    } catch (error) {
        console.error('获取最新通知公告失败:', error);
        noticeList.value = [];
    }
};

// 活动数据
const activityList = ref<any[]>([]);
const loading = ref(false);

// 获取最新活动
const loadLatestActivities = async () => {
    loading.value = true;
    try {
        const activities = await getLatestActivities({ limit: 5 });
        // 按活动时间倒序排序（最新的活动在前）
        const sortedActivities = activities.sort((a, b) => {
            const dateA = new Date(a.activityDate.replace(/-/g, '/')).getTime();
            const dateB = new Date(b.activityDate.replace(/-/g, '/')).getTime();
            return dateB - dateA; // 倒序：新的在前
        });
        // 确保只显示前5条
        activityList.value = sortedActivities.slice(0, 5).map(activity => formatActivityForHome(activity));
        console.log('首页活动列表:', activityList.value.length, '条（已按时间倒序排列）');
    } catch (error) {
        console.error('获取最新活动失败:', error);
        activityList.value = [];
    } finally {
        loading.value = false;
    }
};

// 格式化活动数据用于首页显示
const formatActivityForHome = (activity: ActivityItemType) => {
    // 修复iOS日期格式兼容性问题
    // 将 "YYYY-MM-DD HH:mm:ss" 格式转换为 "YYYY/MM/DD HH:mm:ss"
    const formattedActivityDate = activity.activityDate.replace(/-/g, '/')

    const date = new Date(formattedActivityDate);
    const day = date.getDate();
    const formattedDate = `${date.getMonth() + 1}月${day}日 ${getWeekDay(date.getDay())}`;

    return {
        id: activity.id,
        title: activity.title,
        location: activity.location,
        day: day.toString(),
        date: formattedDate,
        status: formatStatus(activity.status)
    };
};

// 格式化状态
const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        'DRAFT': '草稿',
        'RECRUITING': '报名中',
        'ONGOING': '进行中',
        'ENDED': '已结束',
        'CANCELLED': '已取消'
    };
    return statusMap[status] || status;
};

// 获取星期几
const getWeekDay = (day: number) => {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[day];
};


// 通知公告相关事件
const viewAllNotices = () => {
    uni.navigateTo({
        url: '/pages/notice/index'
    });
};

const viewNoticeDetail = (notice: any) => {
    uni.navigateTo({
        url: `/pages/notice/detail?id=${notice.id}`
    });
};

// 通知公告格式化函数
const getTypeClass = (type: string) => {
    switch (type) {
        case 'NOTICE':
            return 'type-notice'
        case 'ANNOUNCEMENT':
            return 'type-announcement'
        case 'ACTIVITY':
            return 'type-activity'
        case 'SYSTEM':
            return 'type-system'
        default:
            return 'type-default'
    }
};

const formatNoticeType = (type: string) => {
    const typeMap: Record<string, string> = {
        'NOTICE': '通知',
        'ANNOUNCEMENT': '公告',
        'ACTIVITY': '活动通知',
        'SYSTEM': '系统通知'
    }
    return typeMap[type] || type
};

const formatNoticeTime = (timeStr: string) => {
    if (!timeStr) return ''

    // 修复iOS日期格式兼容性问题
    // 将 "YYYY-MM-DD HH:mm:ss" 格式转换为 "YYYY/MM/DD HH:mm:ss"
    const formattedTimeStr = timeStr.replace(/-/g, '/')

    const date = new Date(formattedTimeStr)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60))
            return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
        }
        return `${hours}小时前`
    } else if (days === 1) {
        return '昨天'
    } else if (days < 7) {
        return `${days}天前`
    } else {
        return `${date.getMonth() + 1}/${date.getDate()}`
    }
};

// 活动相关事件
const viewAllActivities = () => {
    uni.navigateTo({
        url: '/pages/activity/index'
    });
};

const viewActivityDetail = (activity: any) => {
    uni.navigateTo({
        url: `/pages/activity/detail?id=${activity.id}`
    });
};

// 立即报名事件
const handleSignUp = (activity: any) => {
    // 检查用户是否已登录
    const userStore = useUserStore();
    const { userInfo } = storeToRefs(userStore);

    if (!userInfo.value) {
        // 未登录，跳转到登录页面
        uni.navigateTo({
            url: '/pages/login/login'
        });
        return;
    }

    // 已登录，跳转到活动详情页面
    uni.navigateTo({
        url: `/pages/activity/detail?id=${activity.id}`
    });
};


// 页面显示时刷新数据
onMounted(() => {
    loadLatestActivities();
    loadLatestNotices();
})


</script>

<style lang="scss" scoped>
// 首页特定样式补充
// 基础样式已在 layout.scss 中统一定义

/* 通知公告样式 - 简洁美观版 */
.notice-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.notice-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: #FFFFFF;
    border-radius: 12rpx;
    transition: all 0.3s;
    
    &:active {
        background: #F5F5F5;
        transform: scale(0.98);
    }
}

.notice-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%);
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.notice-content {
    flex: 1;
    min-width: 0;
}

.notice-title-row {
    margin-bottom: 8rpx;
}

.notice-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notice-meta {
    display: flex;
    align-items: center;
}

.notice-time {
    font-size: 24rpx;
    color: #999999;
}

.notice-arrow {
    display: flex;
    align-items: center;
    margin-left: 12rpx;
    flex-shrink: 0;
}

// 活动和通知的基础样式已在 layout.scss 中统一定义
</style>
