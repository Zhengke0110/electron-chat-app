<template>
    <div class="h-full flex flex-col bg-gray-50">
        <!-- 聊天头部 -->
        <div class="border-b bg-white px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0 mr-4">
                    <h2 class="text-xl font-semibold text-gray-800 truncate flex items-center gap-2">
                        <Icon icon="mdi:message-text" class="text-blue-500 flex-shrink-0" />
                        {{ currentConversation?.title || '新对话' }}
                    </h2>
                </div>

                <!-- 模型选择器 -->
                <ModelSelector v-model="selectedModelId" :configs="modelConfigs" :chat-model-id="selectedChatModelId"
                    :vision-model-id="selectedVisionModelId" :speech-model-id="selectedSpeechModelId"
                    @change="handleModelChange" />
            </div>
        </div>

        <!-- 消息列表区域 -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="currentMessages.length === 0" class="h-full flex items-center justify-center text-gray-400">
                暂无消息
            </div>
            <div v-else class="space-y-4 max-w-4xl mx-auto">
                <div v-for="msg in currentMessages" :key="msg.id" class="flex"
                    :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                    <div class="px-4 py-3 rounded-lg" :class="[
                        msg.role === 'user'
                            ? 'bg-indigo-500 text-white max-w-[70%]'
                            : 'bg-white border border-gray-200 w-[70%]'
                    ]">
                        <!-- 如果是 loading 状态且没有内容，显示加载动画 -->
                        <div v-if="msg.status === 'loading' && !msg.content" class="flex items-center gap-2">
                            <span class="text-gray-500">正在生成回答...</span>
                            <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        </div>
                        <!-- 显示内容 -->
                        <div v-else>
                            <!-- 用户消息 -->
                            <div v-if="msg.role === 'user'" class="space-y-2">
                                <!-- 图片附件（如果有） -->
                                <div v-if="msg.imageAttachments && msg.imageAttachments.length > 0" class="space-y-2">
                                    <div v-for="(img, idx) in msg.imageAttachments" :key="idx"
                                        class="relative rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
                                        <img v-if="img.thumbnail || img.fileUrl" :src="img.thumbnail || img.fileUrl"
                                            :alt="img.fileName"
                                            class="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            @click="handleImageClick(img)"
                                            style="max-height: 300px; object-fit: contain;" />
                                        <div class="text-xs text-white/80 mt-1 px-2 py-1 bg-black/20 rounded">
                                            📎 {{ img.fileName }} ({{ formatFileSize(img.fileSize) }})
                                        </div>
                                    </div>
                                </div>
                                <!-- 文本内容：使用 Markdown 渲染（用户消息样式） -->
                                <MarkdownRenderer :content="msg.content" variant="user" />
                            </div>
                            <!-- AI 消息：Markdown 渲染（默认样式） -->
                            <div v-else>
                                <MarkdownRenderer :content="msg.content" />
                                <!-- 打字机光标效果：只在正在流式输出时显示 -->
                                <span v-if="isStreaming && msg.status === 'loading'"
                                    class="inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 消息输入区域 -->
        <div class="border-t bg-white px-6 py-4">
            <MessageInput v-model="userInput" :message-history="userMessageHistory" placeholder="输入消息..."
                @create="handleSendMessage" @create-with-image="handleSendMessageWithImage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
import MessageInput from '@/components/MessageInput';
import ModelSelector from '@/components/ModelSelector';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useDbStore } from '@/store/db';
import { useAIStream } from '@/composables';
import { formatFileSize } from '@/utils/imageUtils';
import type { ModelConfig } from '@/types';
import type { MessageWithImage } from '@/components/MessageInput/src/types';
import type { ImageAttachment } from '@/db';
import type { ConversationProps } from '@/components/ConversationList';

const route = useRoute();
const router = useRouter();
const dbStore = useDbStore();

// 使用 AI Stream composable
const { isStreaming, sendStreamMessage, cancelStream } = useAIStream();

const conversationId = ref<number | null>(null);
const currentConversation = ref<ConversationProps | null>(null);
const userInput = ref('');
const selectedModelId = ref<number | undefined>(undefined);
const messagesContainer = ref<HTMLElement | null>(null); // 消息容器引用

// ✨ 为不同类型的模型分别记录选中状态
const selectedChatModelId = ref<number | undefined>(undefined);     // 对话模型
const selectedVisionModelId = ref<number | undefined>(undefined);   // 视觉模型
const selectedSpeechModelId = ref<number | undefined>(undefined);   // 语音模型

// ✨ 从 store 获取响应式数据
const { modelConfigs, currentMessages, conversations } = storeToRefs(dbStore);

// ✨ 计算用户消息历史（仅用户发送的消息，按时间倒序）
const userMessageHistory = computed(() => {
    return currentMessages.value
        .filter(msg => msg.role === 'user' && msg.status === 'success' && msg.content.trim())
        .map(msg => msg.content)
        .reverse(); // 最新的在前面
});

// 自动滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

// 使用 nextTick 确保 DOM 更新后滚动
const scrollToBottomSmooth = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTo({
                top: messagesContainer.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    });
};

// 初始化模型选择
const initializeModelSelection = async () => {
    console.log('🔧 [initializeModelSelection] 开始初始化模型选择');
    console.log('📋 [initializeModelSelection] 当前 selectedModelId:', selectedModelId.value);

    // 加载模型配置
    await dbStore.loadModelConfigs();

    // 检查是否有可用的模型配置
    const activeConfigs = modelConfigs.value.filter(c => c.isActive);
    console.log('📊 [initializeModelSelection] 可用模型数量:', activeConfigs.length);

    if (activeConfigs.length === 0) {
        // 没有可用模型,引导用户去配置
        const goToSettings = confirm(
            '⚠️ 未找到可用的模型配置\n\n' +
            '您需要先配置至少一个 AI 模型才能开始聊天。\n\n' +
            '是否现在前往设置页面进行配置？'
        );

        if (goToSettings) {
            router.push('/settings');
        }
        return false;
    }

    // ✅ 为每种类型的模型设置默认选中
    // 1. 对话模型
    if (!selectedChatModelId.value) {
        const chatConfigs = activeConfigs.filter(c => c.modelType === 'chat');
        const defaultChat = chatConfigs.find(c => c.isDefault) || chatConfigs[0];
        if (defaultChat) {
            selectedChatModelId.value = defaultChat.id;
            console.log('✅ [initializeModelSelection] 对话模型默认:', defaultChat.name);
        }
    }

    // 2. 视觉模型
    if (!selectedVisionModelId.value) {
        const visionConfigs = activeConfigs.filter(c => c.modelType === 'vision');
        const defaultVision = visionConfigs.find(c => c.isDefault) || visionConfigs[0];
        if (defaultVision) {
            selectedVisionModelId.value = defaultVision.id;
            console.log('✅ [initializeModelSelection] 视觉模型默认:', defaultVision.name);
        }
    }

    // 3. 语音模型
    if (!selectedSpeechModelId.value) {
        const speechConfigs = activeConfigs.filter(c => c.modelType === 'speech');
        const defaultSpeech = speechConfigs.find(c => c.isDefault) || speechConfigs[0];
        if (defaultSpeech) {
            selectedSpeechModelId.value = defaultSpeech.id;
            console.log('✅ [initializeModelSelection] 语音模型默认:', defaultSpeech.name);
        }
    }

    // 如果还没有选中模型，使用对话模型作为当前模型
    if (!selectedModelId.value) {
        console.log('🎯 [initializeModelSelection] 未选中模型，尝试设置默认模型');
        if (selectedChatModelId.value) {
            selectedModelId.value = selectedChatModelId.value;
            console.log('✅ [initializeModelSelection] 使用默认对话模型');
        } else if (activeConfigs.length > 0) {
            // 如果没有对话模型，选择第一个可用模型
            selectedModelId.value = activeConfigs[0].id;
            console.log('✅ [initializeModelSelection] 使用第一个可用模型:', activeConfigs[0].name);
        }
    } else {
        console.log('✅ [initializeModelSelection] 已有选中的模型，保持不变:', selectedModelId.value);
    }

    return true;
};

// 初始化：加载模型配置和设置默认模型
onMounted(async () => {
    await initializeModelSelection();

    // 注意: loadConversation 会在 watch 的 immediate: true 中自动调用
});

// 处理模型切换
const handleModelChange = async (config: ModelConfig) => {
    console.log('🔄 [handleModelChange] ============ 模型切换 ============');
    console.log('📋 [handleModelChange] 切换前模型ID:', selectedModelId.value);
    console.log('🎯 [handleModelChange] 切换后模型详情:', {
        id: config.id,
        name: config.name,
        type: config.modelType,
        provider: config.provider,
        model: config.model,
        isActive: config.isActive,
        isDefault: config.isDefault
    });

    // 更新选中的模型 ID（v-model 已自动更新，这里确保一致性）
    selectedModelId.value = config.id;

    // ✅ 根据模型类型，分别记录选中状态
    switch (config.modelType) {
        case 'chat':
            selectedChatModelId.value = config.id;
            console.log('💬 [handleModelChange] 对话模型已切换:', config.name);
            break;
        case 'vision':
            selectedVisionModelId.value = config.id;
            console.log('👁️ [handleModelChange] 视觉模型已切换:', config.name);
            break;
        case 'speech':
            selectedSpeechModelId.value = config.id;
            console.log('🔊 [handleModelChange] 语音模型已切换:', config.name);
            break;
    }

    // ✅ 只有对话模型才更新会话配置，视觉模型和语音模型不影响会话列表
    if (config.modelType !== 'chat') {
        console.log('ℹ️ [handleModelChange] 非对话模型（类型: ' + config.modelType + '），不更新会话配置');
        return;
    }

    // 如果当前有会话，更新会话的模型配置（仅对话模型）
    if (conversationId.value && currentConversation.value) {
        console.log('💾 [handleModelChange] 更新会话配置:', {
            conversationId: conversationId.value,
            oldModel: currentConversation.value.selectedModel,
            newModel: config.name,
            oldProviderId: currentConversation.value.providerId,
            newProviderId: config.id
        });

        await dbStore.updateConversation(conversationId.value, {
            selectedModel: config.name,
            providerId: config.id,
            updatedAt: new Date().toISOString()
        });

        // 更新本地会话对象
        currentConversation.value.selectedModel = config.name;
        currentConversation.value.providerId = config.id;

        console.log('✅ [handleModelChange] 会话模型已更新完成');
    } else {
        console.log('⚠️ [handleModelChange] 没有活动会话，仅更新选中的模型ID');
    }
};

// 处理图片点击（预览）
const handleImageClick = (image: ImageAttachment) => {
    console.log('🖼️ [Chat] 点击图片:', image.fileName);
    // TODO: 可以实现图片预览弹窗
    // 目前暂时在新窗口打开（如果有 fileUrl）
    if (image.fileUrl) {
        window.open(image.fileUrl, '_blank');
    } else {
        alert('图片预览暂不可用（已清理临时 URL）');
    }
};

// 生成 AI 回答
const generateAIResponse = async (userMessage: string) => {
    if (!conversationId.value || !selectedModelId.value) {
        console.error('无法生成回答：缺少会话ID或模型ID');
        return;
    }

    // 获取当前选中的模型配置
    const modelConfig = modelConfigs.value.find(c => c.id === selectedModelId.value);
    if (!modelConfig) {
        console.error('未找到模型配置');
        return;
    }

    // 🔍 日志：显示使用的模型和用户消息
    console.log('🤖 [generateAIResponse] ============ 开始生成回答 ============');
    console.log('📋 [generateAIResponse] 会话ID:', conversationId.value);
    console.log('🎯 [generateAIResponse] 使用模型:', {
        id: modelConfig.id,
        name: modelConfig.name,
        type: modelConfig.modelType,
        provider: modelConfig.provider,
        model: modelConfig.model,
        baseUrl: modelConfig.baseUrl
    });
    console.log('💬 [generateAIResponse] 用户消息:', userMessage.substring(0, 200) + (userMessage.length > 200 ? '...' : ''));
    console.log('📊 [generateAIResponse] 历史消息数量:', currentMessages.value.filter(m => m.status === 'success').length);

    const now = new Date().toISOString();

    // ✨ 创建一条 loading 状态的 answer 消息
    const answerId = await dbStore.addMessageToConversation({
        conversationId: conversationId.value,
        role: 'assistant',
        content: '',
        type: 'answer',
        status: 'loading',
        createdAt: now
    });

    // ✨ 找到刚创建的消息对象（保持引用）
    const streamingMessage = currentMessages.value.find(m => m.id === answerId);

    if (!streamingMessage) {
        console.error('未找到创建的消息');
        return;
    }

    // 滚动到底部
    scrollToBottomSmooth();

    try {
        // 准备消息历史
        const aiMessages = currentMessages.value
            .filter(m => m.id !== answerId && m.status === 'success')
            .map(m => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content
            }));

        // 🔍 日志：显示发送给AI的完整上下文
        console.log('📨 [generateAIResponse] 发送给AI的消息上下文:');
        aiMessages.forEach((msg, index) => {
            console.log(`  ${index + 1}. [${msg.role}]: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
        });

        let updateCounter = 0;
        const UPDATE_INTERVAL = 10; // 每10个chunk更新一次数据库

        // 使用 IPC 流式响应
        await sendStreamMessage(
            conversationId.value,
            answerId as number,
            modelConfig,
            aiMessages,
            {
                // 每次接收到新内容
                onChunk: (content, fullContent) => {
                    updateCounter++;

                    // 🎯 直接修改消息对象的属性，Vue 3 会自动追踪
                    streamingMessage.content = fullContent;
                    streamingMessage.updatedAt = new Date().toISOString();

                    // 每次内容更新时滚动到底部
                    scrollToBottom();

                    // 定期更新数据库（减少频繁写入）
                    if (updateCounter % UPDATE_INTERVAL === 0) {
                        dbStore.updateMessageInConversation(answerId as number, {
                            content: fullContent,
                            updatedAt: new Date().toISOString()
                        });
                    }
                },

                // 流式完成
                onDone: async ({ finishReason, totalTokens }) => {
                    console.log('✅ [generateAIResponse] ============ 回答生成完成 ============');
                    console.log('📊 [generateAIResponse] 完成原因:', finishReason);
                    console.log('📝 [generateAIResponse] 总字符数:', streamingMessage.content.length);
                    console.log('💬 [generateAIResponse] 回答内容预览:', streamingMessage.content.substring(0, 200) + (streamingMessage.content.length > 200 ? '...' : ''));

                    // 最终更新：标记为成功并保存完整内容到数据库
                    streamingMessage.status = 'success';
                    streamingMessage.updatedAt = new Date().toISOString();

                    await dbStore.updateMessageInConversation(answerId as number, {
                        content: streamingMessage.content,
                        status: 'success',
                        updatedAt: new Date().toISOString()
                    });
                },

                // 发生错误
                onError: async ({ message: errorMessage, code }) => {
                    console.error('[AI] 回答生成失败:', errorMessage);

                    const errorText = `生成回答失败: ${errorMessage}`;

                    // 更新本地消息显示错误
                    streamingMessage.content = errorText;
                    streamingMessage.status = 'error';
                    streamingMessage.updatedAt = new Date().toISOString();

                    // 标记为失败
                    await dbStore.updateMessageInConversation(answerId as number, {
                        content: errorText,
                        status: 'error',
                        updatedAt: new Date().toISOString()
                    });
                },
            }
        );
    } catch (error) {
        console.error('[AI] 发送消息异常:', error);

        const errorText = `发送消息失败: ${error instanceof Error ? error.message : String(error)}`;

        // 更新本地消息显示错误
        streamingMessage.content = errorText;
        streamingMessage.status = 'error';
        streamingMessage.updatedAt = new Date().toISOString();

        // 标记为失败
        await dbStore.updateMessageInConversation(answerId as number, {
            content: errorText,
            status: 'error',
            updatedAt: new Date().toISOString()
        });
    }
};

// 从路由获取会话 ID
const loadConversation = async () => {
    const id = route.params.id;

    if (id) {
        conversationId.value = Number(id);

        // ✨ 先加载会话信息（在初始化模型之前）
        currentConversation.value = conversations.value.find(c => c.id === conversationId.value) || null;

        // 如果在 conversations 中没找到，可能是刚创建的，重新加载
        if (!currentConversation.value) {
            await dbStore.loadConversations();
            currentConversation.value = conversations.value.find(c => c.id === conversationId.value) || null;
        }

        // 🔍 日志：会话加载信息
        console.log('📂 [loadConversation] 加载会话:', {
            id: conversationId.value,
            title: currentConversation.value?.title,
            selectedModel: currentConversation.value?.selectedModel,
            providerId: currentConversation.value?.providerId
        });

        // ✅ 优先从会话中恢复上次使用的模型（在 initializeModelSelection 之前）
        if (currentConversation.value?.providerId) {
            // 先确保模型配置已加载
            if (modelConfigs.value.length === 0) {
                await dbStore.loadModelConfigs();
            }

            // 验证该模型配置是否仍然存在且可用
            const savedModelConfig = modelConfigs.value.find(c => c.id === currentConversation.value!.providerId);
            if (savedModelConfig && savedModelConfig.isActive) {
                selectedModelId.value = currentConversation.value.providerId;

                // ✅ 同时更新对应类型的选中模型ID
                if (savedModelConfig.modelType === 'chat') {
                    selectedChatModelId.value = savedModelConfig.id;
                }

                console.log('✅ [loadConversation] 恢复会话模型:', {
                    id: savedModelConfig.id,
                    name: savedModelConfig.name,
                    type: savedModelConfig.modelType
                });
            } else {
                console.warn('⚠️ [loadConversation] 会话保存的模型不可用，将使用默认模型');
                selectedModelId.value = undefined; // 重置以便 initializeModelSelection 设置默认值
            }
        }

        // 确保模型已初始化（如果还没有选中模型）
        const hasModel = await initializeModelSelection();
        if (!hasModel) {
            return;
        }

        // ✨ 加载该会话的所有消息
        await dbStore.loadConversationMessages(conversationId.value);

        // 滚动到底部
        scrollToBottomSmooth();

        // 检查是否是新创建的会话（通过 query 参数）
        const query = route.query.q;

        if (query && currentMessages.value.length === 1 && currentMessages.value[0].type === 'question') {
            await generateAIResponse(currentMessages.value[0].content);
        }
    }
};

// 发送消息
const handleSendMessage = async (message: string) => {
    if (!conversationId.value) {
        return;
    }

    // 检查是否选择了模型
    if (!selectedModelId.value) {
        alert('⚠️ 请先选择一个 AI 模型');
        return;
    }

    // 检查选中的模型是否存在且启用
    const selectedConfig = modelConfigs.value.find(c => c.id === selectedModelId.value);
    if (!selectedConfig) {
        alert('⚠️ 选中的模型配置不存在，请重新选择');
        return;
    }

    if (!selectedConfig.isActive) {
        alert('⚠️ 选中的模型已被禁用，请选择其他模型或前往设置页面启用');
        return;
    }

    // 🔍 日志：发送消息前的状态
    console.log('📤 [handleSendMessage] ============ 发送消息 ============');
    console.log('🎯 [handleSendMessage] 当前使用模型:', {
        id: selectedConfig.id,
        name: selectedConfig.name,
        type: selectedConfig.modelType,
        isActive: selectedConfig.isActive
    });
    console.log('💬 [handleSendMessage] 消息内容:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    const now = new Date().toISOString();

    // ✨ 添加用户消息
    await dbStore.addMessageToConversation({
        conversationId: conversationId.value,
        role: 'user',
        content: message,
        type: 'question',
        status: 'success',
        createdAt: now
    });

    // 滚动到底部显示新消息
    scrollToBottomSmooth();

    // 生成 AI 回答
    await generateAIResponse(message);
};

// 发送带图片的消息
const handleSendMessageWithImage = async (data: MessageWithImage) => {
    console.log('📸 [Chat] 处理带图片的消息:', {
        hasText: !!data.text,
        hasImage: !!data.image,
        textLength: data.text?.length || 0,
        imageFileName: data.image?.attachment.fileName,
        imageSize: data.image?.attachment.fileSize,
        descriptionLength: data.image?.description?.length || 0
    });

    if (!conversationId.value) {
        console.warn('⚠️ [Chat] 没有会话ID，无法发送消息');
        return;
    }

    // 检查是否选择了模型
    if (!selectedModelId.value) {
        console.warn('⚠️ [Chat] 未选择模型');
        alert('⚠️ 请先选择一个 AI 模型');
        return;
    }

    const selectedConfig = modelConfigs.value.find(c => c.id === selectedModelId.value);
    if (!selectedConfig || !selectedConfig.isActive) {
        console.warn('⚠️ [Chat] 模型配置无效:', selectedConfig);
        alert('⚠️ 请选择一个有效的模型');
        return;
    }

    console.log('✅ [Chat] 使用模型:', selectedConfig.name, selectedConfig.modelType);

    const now = new Date().toISOString();

    // 构建消息内容：图片描述 + 用户文本
    let messageContent = data.image?.description || '发送了一张图片';
    if (data.text) {
        messageContent += `\n\n${data.text}`;
    }

    console.log('📝 [Chat] 消息内容:', {
        length: messageContent.length,
        preview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : '')
    });

    // 创建可序列化的附件（移除 Blob URL）
    const serializableAttachments = data.image ? [{
        id: data.image.attachment.id,
        fileName: data.image.attachment.fileName,
        filePath: data.image.attachment.filePath,
        fileUrl: '', // Blob URL 不能存储到 IndexedDB，清空
        mimeType: data.image.attachment.mimeType,
        fileSize: data.image.attachment.fileSize,
        width: data.image.attachment.width,
        height: data.image.attachment.height,
        thumbnail: data.image.attachment.thumbnail,
        uploadedAt: data.image.attachment.uploadedAt
    }] : undefined;

    console.log('📦 [Chat] 序列化后的附件:', serializableAttachments);

    // 添加用户消息（包含图片附件）
    const messageData = {
        conversationId: conversationId.value,
        role: 'user' as const,
        content: messageContent,
        type: 'question' as const,
        status: 'success' as const,
        imageAttachments: serializableAttachments,
        metadata: data.image ? {
            visionModel: data.image.description,
            hasImage: true
        } : undefined,
        createdAt: now
    };

    console.log('💾 [Chat] 保存消息到数据库:', messageData);

    await dbStore.addMessageToConversation(messageData);

    console.log('✅ [Chat] 消息已保存，当前消息数:', currentMessages.value.length);

    scrollToBottomSmooth();

    // 生成 AI 回答（基于图片描述和用户问题）
    console.log('🤖 [Chat] 开始生成 AI 回答...');
    await generateAIResponse(messageContent);
};

// 监听路由变化
watch(
    () => route.params.id,
    () => {
        loadConversation();
    },
    { immediate: true }
);
</script>
