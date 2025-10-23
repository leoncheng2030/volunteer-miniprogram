import { USER_INFO, USER_TOKEN } from "@/constant";
import { getStorage, removeStorage, setStorage } from "@/utils";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("useUserStore", () => {
    const userInfo = ref<IUserInfo | null>(getStorage(USER_INFO) ?? null);
    const token = ref<string | null>(getStorage(USER_TOKEN) ?? null);
    
    const setUserInfo = (data: IUserInfo | null) => {
        userInfo.value = data;
        if (data) {
            setStorage(USER_INFO, data);
        } else {
            removeStorage(USER_INFO);
        }
    };

    const setToken = (newToken: string | null) => {
        token.value = newToken;
        if (newToken) {
            setStorage(USER_TOKEN, newToken);
        } else {
            removeStorage(USER_TOKEN);
        }
    };

    const logout = () => {
        userInfo.value = null;
        token.value = null;
        removeStorage(USER_INFO);
        removeStorage(USER_TOKEN);
    };

    return { userInfo, token, setUserInfo, setToken, logout };
});
