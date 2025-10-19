<template>
    <div class="h-full flex flex-col bg-gray-50">
        <!-- 欢迎区域 -->
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center max-w-2xl px-8">
                <h2 class="text-4xl font-bold text-gray-800 mb-4">欢迎使用 Chat App</h2>
                <p class="text-gray-600 mb-8 text-lg">输入您的问题，开始新的对话</p>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="p-8 max-w-4xl mx-auto w-full">
            <MessageInput v-model="userQuestion" placeholder="输入您的问题..." @create="handleCreateConversation" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MessageInput from '@/components/MessageInput';
import { useDbStore } from '@/store/db';

const router = useRouter();
const route = useRoute();
const dbStore = useDbStore();
const userQuestion = ref('');

// 调试信息
onMounted(() => {
    console.log('=== Home 页面已加载 ===');
    console.log('当前路由路径:', route.path);
    console.log('当前路由名称:', route.name);
    console.log('路由完整信息:', route);
});

const handleCreateConversation = async (message: string) => {
    console.log('=== 开始创建会话 ===');
    console.log('用户输入:', message);
    try {
        // 1. 创建新会话
        const now = new Date().toISOString();
        const conversationId = await dbStore.createConversation({
            title: message.slice(0, 30) + (message.length > 30 ? '...' : ''), // 使用问题前30个字符作为标题
            selectedModel: 'gpt-4', // 默认模型
            createdAt: now,
            updatedAt: now,
            providerId: 1 // 默认 OpenAI
        });
        console.log('✓ 会话创建成功, ID:', conversationId);

        // 2. 创建用户消息（question 类型）
        await dbStore.addMessage({
            conversationId: conversationId as number,
            role: 'user',
            content: message,
            type: 'question',
            status: 'success',
            createdAt: now
        });
        console.log('✓ 用户消息创建成功');

        // 3. 跳转到会话页面，携带 query 参数
        const targetPath = `/chat/${conversationId}`;
        console.log('准备跳转到:', targetPath);
        console.log('携带 query 参数:', { q: message });
        
        router.push({
            path: targetPath,
            query: { q: message }
        });
        console.log('✓ 路由跳转已执行');
    } catch (error) {
        console.error('❌ 创建会话失败:', error);
        alert('创建会话失败，请重试');
    }
};
</script>
