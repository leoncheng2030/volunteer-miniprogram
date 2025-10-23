import { createPinia } from "pinia";
import { useConfigStore, useTabbarStore } from "./modules/config";
import { useUserStore } from "./modules/user";

const pinia = createPinia();

export { useConfigStore, pinia, useUserStore, useTabbarStore };

export default pinia;
