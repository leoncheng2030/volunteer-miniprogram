import { API_BASE_URL } from "@/config";

// #ifdef   H5  || APP  || APP-PLUS
// @ts-ignore
export const DEV = import.meta.env.MODE === "development" ? "develop" : "release";
// #endif

// #ifdef   MP
// @ts-ignore
export const DEV = uni.getAccountInfoSync().miniProgram.envVersion;
// #endif

export const USER_TOKEN = "USER_TOKEN";
export const BASE_PATH = "/mobile";
export const BASE_URL = API_BASE_URL; // 使用统一配置
export const APPID = "APPID";
export const CONGIG = "CONFIG";
export const USER_INFO = "USER_INFO";
export const VERSION = "3.0.3";
export const CONFIG = "CONFIG";
export const BASE64 = "data:image/png;base64,";
export const SELECT_ADDRESS = "SELECT_ADDRESS";
export const SELECT_STORE = "SELECT_STORE";
export const REFRESH_ORDER = "refreshorder";

export const statusMap: { status: string; name: string; color: string; icon: string }[] = [
    { status: "online", name: "在线", color: "#52c41a", icon: "checkmark-circle" },
    { status: "offline", name: "离线", color: "#999", icon: "clock" },
    { status: "maintenance", name: "维护中", color: "#ff9500", icon: "error-circle" },
    { status: "unknown", name: "未知", color: "#ccc", icon: "question-circle" },
];
export enum LoadingType {
    loading = "loading",
    nomore = "nomore",
    loadmore = "loadmore",
}