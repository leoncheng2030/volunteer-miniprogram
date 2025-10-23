import { createSSRApp } from "vue";
import App from "./App.vue";
import uviewPro from "uview-pro";
import "uno.css";
import "@unocss-applet/reset/uni-app/tailwind.css";
import "./uni.scss";
import "@/static/css/index.scss";
import { createPinia } from "pinia";
import StatusBar from "@/components/statusBar/index.vue";
import CustomDivider from "@/components/customDivder/index.vue";
import AndPrivacy from "@/components/andPrivacy/index.vue";
import "@/router/index";
import EmptyState from "@/components/EmptyState/index.vue";
import CustomLoading from "@/components/CustomLoading/index.vue";
import CustomEmpty from "@/components/customEmpty/index.vue";
import PageLoading from "@/components/PageLoading/index.vue";
import CustomTabBar from "@/components/CustomTabBar/index.vue";
import VolunteerRegisterForm from "./components/VolunteerRegisterForm/index.vue";
import GuardianRegisterForm from "./components/GuardianRegisterForm/index.vue";
import ImageCaptcha from "./components/ImageCaptcha/index.vue";
import ImageUpload from "./components/ImageUpload/index.vue";
import { showToast } from "@/utils";
// #ifdef H5
import H5TabBar from "./components/H5TabBar/index.vue";
// #endif

// 全局挂载 showToast
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $toast: typeof showToast;
    }
}

export function createApp() {
    const app = createSSRApp(App);
    app.use(createPinia());
    app.use(uviewPro);
    
    // 全局挂载 toast 方法
    app.config.globalProperties.$toast = showToast;
    // 覆盖 uview-pro 的 toast
    if (uni.$u) {
        (uni.$u as any).toast = showToast;
    }
    
    app.component("CustomTabBar", CustomTabBar);
    app.component("PageLoading", PageLoading);
    app.component("CustomEmpty", CustomEmpty);
    app.component("CustomLoading", CustomLoading);
    app.component("StatusBar", StatusBar);
    app.component("CustomDivider", CustomDivider);
    app.component("AndPrivacy", AndPrivacy);
    app.component("EmptyState", EmptyState);
    app.component("VolunteerRegisterForm", VolunteerRegisterForm);
    app.component("GuardianRegisterForm", GuardianRegisterForm);
    app.component("ImageCaptcha", ImageCaptcha);
    app.component("ImageUpload", ImageUpload);
    // #ifdef H5
    app.component("H5TabBar", H5TabBar);
    // #endif
    return {
        app,
    };
}
