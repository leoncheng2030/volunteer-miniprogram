<template>
    <view class="loading pb-10">
        <u-loadmore :status="status" :line="true" :loading-text="loadingText" :loadmore-text="loadmoreText"
            :nomore-text="nomoreText" />
    </view>
</template>

<script setup lang="ts" name="PageLoading">
import { ref, toRefs } from "vue";
interface Props {
    status?: "loadmore" | "loading" | "nomore";
    nomoreText?: string;
    loadingText?: string;
    loadmoreText?: string;
}
const props = withDefaults(defineProps<Props>(), {
    status: "loadmore",
    nomoreText: "我可是有底线的～",
    loadingText: "努力加载中...",
    loadmoreText: "轻轻上拉加载～",
});
const { status, nomoreText, loadingText } = toRefs(props);
</script>
<style scoped lang="scss"></style>
