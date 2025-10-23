<template>
    <view :style="style" :class="[customClass, 'empty', 'flex  flex-col items-center justify-center  p-50']">
        <image :src="icon" class="empty-icon mb-30" mode="aspectFit" />
        <slot>
            <view class="title muted">{{ title }}</view>
        </slot>
    </view>
</template>

<script setup lang="ts" name="CustomEmpty">
import { computed, ref, toRefs } from "vue";
import nodataIcon from "@/static/images/暂无数据.svg";
import addressIcon from "@/static/images/address_null.png";
import nonews from "@/static/images/news_null.png";
const icons = {
    nodata: nodataIcon,
    noaddress: addressIcon,
    nonews,
};
interface Props {
    customClass?: string;
    style?: any;
    title?: string;
    type?: "nodata" | "noaddress" | "nonews";
}
const props = withDefaults(defineProps<Props>(), {
    style: {},
    customClass: "",
    type: "nodata",
    title: "暂无数据",
});
const { customClass, style, type, title } = toRefs(props);
const icon = computed(() => {
    return icons[type.value];
});
</script>
<style scoped lang="scss">
.empty {
    width: 100%;
    height: 100%;
}
</style>
