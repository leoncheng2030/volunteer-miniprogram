<template>
    <view class="zh-loading  flex  items-center justify-center" :style="{ width, height }">
        <u-loading :text="text" mode="circle" textSize="14"></u-loading>
    </view>

</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
const props = withDefaults(defineProps<{ loading: boolean, text?: string, width?: string, height?: string }>(), { loading: true, text: '玩命加载中...', width: '100%', height: '100%' })
const { text, width, height } = toRefs(props)

</script>
<style scoped lang="scss">
.zh-loading {
    flex: 1;
    height: 100%;
    width: 100%;
}
</style>