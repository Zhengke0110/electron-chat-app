<template>
    <div class="h-full overflow-y-auto p-6 bg-gray-50">
        <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded shadow p-8 text-center">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">关于</h2>
                <p class="text-gray-600 mb-4">Chat App v1.0.0</p>
                <p class="text-sm text-gray-500">基于 Electron + Vue 3 + Vue Router + Pinia</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 调试信息
onMounted(() => {
    console.log('=== About 页面已加载 ===');
    console.log('当前路由路径:', route.path);
    console.log('当前路由名称:', route.name);
    console.log('路由完整信息:', route);
});
</script>
