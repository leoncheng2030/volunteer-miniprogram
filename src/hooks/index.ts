import { indexApi } from "@/api";
import { get } from "@/api/request";
import { CONFIG, DEV, USER_TOKEN } from "@/constant";
import { useUserStore } from "@/store";
import { useConfigStore } from "@/store/modules/config";
import { removeStorage, setStorage } from "@/utils";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import useRequest from "vue-hooks-plus/es/useRequest";

//获取配置
export const useGetConfig = () => {
    const data = useRequest(async () => {
        const result = await get<IConfig>(indexApi.config);
        if (result) {
            // 设置配置到store
            const configStore = useConfigStore();
            configStore.setConfig(result);
            setStorage(CONFIG, result);
        }
        return result;
    });
    return data;
};
// 获取轮播图
export const useGetBanner = () => {
    const data = useRequest(async () => {
        const result = await get<IBanner[]>(indexApi.banner);
        return result;
    });
    return data;
};
//获取窗口高度
export const useGetWindowHeight = () => {
    const info = uni.getWindowInfo();
    const windowHeight = info.windowHeight;
    return windowHeight;
};

// 空的购物车数量设置函数，保持兼容性
export const useSetCartCount = () => {
    // 空实现，保持兼容性
    return { data: null, loading: false, error: null };
};

// 导出认证相关hooks

export const useAuth = () => {
    const userStore = useUserStore();
    const logout = () => {
        return new Promise((resolve, reject) => {
            userStore.setUserInfo(null);
            removeStorage(USER_TOKEN);
            resolve(true);
        });
    };
    return { logout };
};

export const useIsTest = () => {
    const userStore = useUserStore();
    const { userInfo } = storeToRefs(userStore);
    const isTest = computed(() => {
        // if (DEV === "release") {
        //     return false;
        // }
        if (userInfo.value) {
            const { roleCodeList = [] } = userInfo.value;
            if (roleCodeList.includes("PLATFORM_TESTER")) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
    return isTest;
};
