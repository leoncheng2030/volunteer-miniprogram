import { CONFIG } from "@/constant";
import { getStorage } from "@/utils";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore("useConfigStore", () => {
    const config = ref<IConfig | null>(getStorage(CONFIG));
    const setConfig = (data: IConfig) => {
        config.value = data;
    };
    return { config, setConfig };
});

export const useTabbarStore = defineStore("useTabbarStore", () => {
    const show = ref(true);
    const setShow = (data: boolean) => {
        show.value = data;
    };
    return { show, setShow };
});
