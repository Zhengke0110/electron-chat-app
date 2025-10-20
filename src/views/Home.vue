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

const handleCreateConversation = async (message: string) => {
    try {
        // 获取默认模型配置
        const defaultModel = await dbStore.getDefaultModelConfig();

        if (!defaultModel) {
            alert('⚠️ 未找到默认模型配置，请先在设置中配置模型');
            router.push('/settings');
            return;
        }

        // 1. 创建新会话
        const now = new Date().toISOString();
        const modelDisplayName = `${defaultModel.name} (${defaultModel.provider})`;
        const conversationId = await dbStore.createConversation({
            title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
            selectedModel: modelDisplayName,
            createdAt: now,
            updatedAt: now,
            providerId: defaultModel.id
        });

        // 2. 创建用户消息（question 类型）
        await dbStore.addMessage({
            conversationId: conversationId as number,
            role: 'user',
            content: message,
            type: 'question',
            status: 'success',
            createdAt: now
        });

        // 3. 跳转到会话页面，携带 query 参数
        router.push({
            path: `/chat/${conversationId}`,
            query: { q: message }
        });
    } catch (error) {
        console.error('[创建会话] 失败:', error);
        alert('创建会话失败，请重试');
    }
};
</script>
