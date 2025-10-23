import type { App } from "vue";
import StatusBar from "./statusBar/index.vue";
import CustomDivider from "./customDivder/index.vue";
import AndPrivacy from "./andPrivacy/index.vue";
import ImageCaptcha from "./ImageCaptcha/index.vue";
import ImageUpload from "./ImageUpload/index.vue";
import EmptyState from "./EmptyState/index.vue";
import AvatarGroup from "./AvatarGroup/index.vue";

export default {
    install: (app: App) => {
        app.component("StatusBar", StatusBar);
        app.component("CustomDivider", CustomDivider);
        app.component("ImageCaptcha", ImageCaptcha);
        app.component("ImageUpload", ImageUpload);
        app.component("EmptyState", EmptyState);
        app.component("AvatarGroup", AvatarGroup);
    },
};

export { StatusBar, CustomDivider, AndPrivacy, EmptyState, ImageCaptcha, ImageUpload, AvatarGroup };
