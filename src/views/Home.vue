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
            <MessageInput v-model="userQuestion" placeholder="输入您的问题..." @create="handleCreateConversation"
                @create-with-image="handleCreateConversationWithImage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MessageInput from '@/components/MessageInput';
import type { MessageWithImage } from '@/components/MessageInput/src/types';
import { useDbStore } from '@/store/db';

const router = useRouter();
const route = useRoute();
const dbStore = useDbStore();
const userQuestion = ref('');

const handleCreateConversation = async (message: string) => {
    console.log('💬 [Home] 创建纯文本会话:', message.substring(0, 50));
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

        console.log('✅ [Home] 会话已创建，ID:', conversationId);

        // 2. 创建用户消息（question 类型）
        await dbStore.addMessageToConversation({
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

// 处理带图片的会话创建
const handleCreateConversationWithImage = async (data: MessageWithImage) => {
    console.log('📸 [Home] 创建带图片的会话:', {
        hasText: !!data.text,
        hasImage: !!data.image,
        textLength: data.text?.length || 0,
        descriptionLength: data.image?.description?.length || 0
    });

    try {
        // 获取默认模型配置
        const defaultModel = await dbStore.getDefaultModelConfig();

        if (!defaultModel) {
            alert('⚠️ 未找到默认模型配置，请先在设置中配置模型');
            router.push('/settings');
            return;
        }

        // 构建消息内容：图片描述 + 用户文本
        let messageContent = data.image?.description || '发送了一张图片';
        if (data.text) {
            messageContent += `\n\n${data.text}`;
        }

        console.log('📝 [Home] 完整消息内容:', {
            length: messageContent.length,
            preview: messageContent.substring(0, 100)
        });

        // 1. 创建新会话
        const now = new Date().toISOString();
        const modelDisplayName = `${defaultModel.name} (${defaultModel.provider})`;

        // 会话标题优先使用用户文本，否则使用图片描述的前30字
        const titleText = data.text || data.image?.description || '图片对话';

        const conversationId = await dbStore.createConversation({
            title: titleText.slice(0, 30) + (titleText.length > 30 ? '...' : ''),
            selectedModel: modelDisplayName,
            createdAt: now,
            updatedAt: now,
            providerId: defaultModel.id
        });

        console.log('✅ [Home] 会话已创建，ID:', conversationId);

        // 2. 创建用户消息（带图片附件）
        // 注意：需要创建一个可序列化的 attachment 副本（移除 Blob URL）
        const serializableAttachments = data.image ? [{
            id: data.image.attachment.id,
            fileName: data.image.attachment.fileName,
            filePath: data.image.attachment.filePath,
            fileUrl: '', // Blob URL 不能存储，清空
            mimeType: data.image.attachment.mimeType,
            fileSize: data.image.attachment.fileSize,
            width: data.image.attachment.width,
            height: data.image.attachment.height,
            thumbnail: data.image.attachment.thumbnail,
            uploadedAt: data.image.attachment.uploadedAt
        }] : undefined;

        console.log('📦 [Home] 序列化后的附件:', serializableAttachments);

        await dbStore.addMessageToConversation({
            conversationId: conversationId as number,
            role: 'user',
            content: messageContent,
            type: 'question',
            status: 'success',
            imageAttachments: serializableAttachments,
            metadata: data.image ? {
                visionModel: data.image.description,
                hasImage: true
            } : undefined,
            createdAt: now
        });

        console.log('✅ [Home] 消息已创建，跳转到会话页面');

        // 3. 跳转到会话页面，携带 query 参数
        router.push({
            path: `/chat/${conversationId}`,
            query: { q: messageContent }
        });
    } catch (error) {
        console.error('❌ [Home] 创建会话失败:', error);
        alert('创建会话失败，请重试');
    }
};
</script>
