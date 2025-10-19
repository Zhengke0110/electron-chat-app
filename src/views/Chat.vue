<template>
    <div class="h-full flex flex-col bg-white">
        <!-- 聊天头部 -->
        <div class="border-b p-4 bg-gray-50">
            <h2 class="text-lg font-semibold text-gray-800">
                {{ conversationId ? `会话 #${conversationId}` : '新建聊天' }}
            </h2>
        </div>

        <!-- 消息区域 -->
        <div class="flex-1 overflow-y-auto p-4">
            <p class="text-gray-500 text-center">暂无消息</p>
        </div>

        <!-- 输入区域 -->
        <div class="border-t p-4 bg-gray-50">
            <div class="flex gap-2">
                <input v-model="messageInput" @keyup.enter="sendMessage" type="text" placeholder="输入消息..."
                    class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button @click="sendMessage" class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    发送
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const messageInput = ref('');

const conversationId = computed(() => route.params.id);

const sendMessage = () => {
    if (messageInput.value.trim()) {
        console.log('发送消息:', messageInput.value);
        // 在这里添加发送消息的逻辑
        messageInput.value = '';
    }
};
</script>
