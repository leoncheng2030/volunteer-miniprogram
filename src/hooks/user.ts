import { useUserStore } from "@/store";
import { storeToRefs } from "pinia";
import { onShareAppMessage, onShareTimeline, onShow } from "@dcloudio/uni-app";
import { computed, onMounted, ref } from "vue";
import { getStorage, removeStorage, setStorage } from "@/utils";
import { USER_INFO, USER_TOKEN } from "@/constant";
import useRequest from "vue-hooks-plus/es/useRequest";
import { get } from "@/api/request";
import { loginApi } from "@/api/user";

export const currentPage = () => {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    return currentPage || {};
};

// 获取登录凭证（code）
export const getWxCode = () => {
    return new Promise((resolve, reject) => {
        uni.login({
            success(res) {
                resolve(res.code);
            },
            fail(res) {
                reject(res);
            },
        });
    });
};

export const userGetUserInfo = (options = { manual: false }) => {
    const manual = { ...options };
    const data = useRequest(async () => {
        const userStore = useUserStore();
        const result = await get<IUserInfo>(loginApi.getLoginUser);

        if (result) {
            setStorage(USER_INFO, result);
            userStore.setUserInfo(result);
        } else {
            removeStorage(USER_INFO);
            userStore.setUserInfo(null);
        }
    }, manual);

    return data;
};

//分享
export const useShareAppMessage = () => {
    // #ifdef  MP-WEIXIN
    const config = ref();
    wx.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
    });
    onMounted(() => {
        let routes = getCurrentPages(); // 获取当前打开过的页面路由数组
        const current = routes[routes.length - 1];

        const path = current.route;
        const options = (current as any)?.options ?? {}; //获取当前页面路由参数
        let parmas = Object.keys(options)
            .map((key) => {
                const value = options[key];
                return `${key}=${value}`;
            })
            .join("&");
        const obj = {
            path: parmas ? path + "?" + parmas : path,
            title: "",
            imageUrl: "",
        };
        config.value = obj;
    });
    onShareAppMessage(() => {
        return config.value;
    });
    onShareTimeline(() => {
        return config.value;
    });
    // #endif
};

//用户是否登录
export const useIsLogin = () => {
    const token = getStorage(USER_TOKEN);

    const isLogin = computed(() => {
        return token ? true : false;
    });
    return isLogin;
};

//获取用户信息
export const useGetUser = () => {
    const { run } = userGetUserInfo({ manual: true });
    onShow(() => {
        const token = getStorage(USER_TOKEN);

        if (token) run();
    });
};
export const useUserInfo = () => {
    const userStore = useUserStore();
    const { userInfo } = storeToRefs(userStore);
    const setUserInfo = userStore.setUserInfo;
    return { userInfo, setUserInfo };
};
