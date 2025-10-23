import { USER_TOKEN } from "@/constant";
import { getStorage, showToast } from "@/utils";

const whitelist = [
    "/pages/index/index",
    "/pages/youpei/index",
    "/pages/user/user",
    "/pages/login/login",
    "/pages/register/register",
    "/pages/activity/detail",
    "/pages/notice/detail",
];

const list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];

function hasPermission(url: string) {
    if (url == "/") return true;
    // return true;
    // 在白名单中或有token，直接跳转
    const find = whitelist.find((item) => url.includes(item));

    if (find) {
        return true;
    } else {
        return false;
    }
}

list.forEach((item) => {
    uni.addInterceptor(item, {
        // 页面跳转前进行拦截, invoke根据返回值进行判断是否继续执行跳转

        invoke(e) {
            const url = e.url;
            // 静默处理路由错误
            const token = getStorage(USER_TOKEN) ? true : false;
            if (hasPermission(e.url)) {
                return true;
            } else {
                if (token) {
                    return true;
                } else {
                    showToast('请先登录');
                    setTimeout(() => {
                        uni.navigateTo({
                            url: "/pages/login/login?redirect=" + encodeURIComponent(url),
                        });
                    }, 1000);
                    return false;
                }
            }
        },
    });
});
