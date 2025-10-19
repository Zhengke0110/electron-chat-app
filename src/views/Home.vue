<template>
    <div class="h-full flex items-center justify-center bg-gray-50">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">欢迎使用 Chat App</h2>
            <p class="text-gray-600 mb-6">选择左侧的会话或创建新的聊天</p>
            <RouterLink to="/chat">
                <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    开始聊天
                </button>
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>
